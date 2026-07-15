---
name: pagination
layer: agnostic
when_to_read: Building any list surface - admin tables, audit logs, feeds - on server or client
---

# Paginated list pages (admin + feed surfaces)

> The PATTERN here is the standard (offset paging server-side, incremental loading with three client guards); the code shapes below are one operator's stack (.NET Minimal API, React Native FlatList) kept as worked illustrations - translate them to your toolkit and keep the guards.

**Standard**: Offset pagination with `?limit&offset` on the server endpoint; FlatList + `onEndReached` on the mobile client with a `hasMore = page.length === PAGE_SIZE` heuristic for end-of-list detection. Default page size 50 (mobile), 100 (web tables); server caps with `Math.Clamp`. Pull-to-refresh resets to offset 0. Same shape applies to any admin list, audit log, or future user-facing feed.

**Server shape** (.NET Minimal API, copy-paste-grade):

```csharp
private static async Task<IResult> GetFoosAsync(
	int? limit, int? offset,
	HttpContext context, AppDbContext db, CancellationToken ct
) {
	// optional: gate (RequireAdminAsync / GetUserIdAsync)
	var take = Math.Clamp(limit ?? 100, 1, 500);
	var skip = Math.Max(offset ?? 0, 0);
	var items = await db.Foos.AsNoTracking()
		.OrderByDescending(f => f.CreatedAt)
		.Skip(skip).Take(take)
		.ToListAsync(ct);
	return Results.Ok(items);
}
```

**Client shape** (React Native FlatList):

```tsx
const PAGE_SIZE = 50;
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);

const FetchPageAsync = async (offset: number) => {
	try {
		const res = await ApiClient.GetAsync<Item[]>(`/foos?limit=${PAGE_SIZE}&offset=${offset}`);
		return res.data ?? [];
	} catch (e: any) { /* log + toast */; return null; }
};

const RefreshFromTopAsync = async () => {
	const page = await FetchPageAsync(0);
	if (page === null) return;
	setItems(page);
	setHasMore(page.length === PAGE_SIZE);
};

const HandleLoadMoreAsync = async () => {
	if (loadingMore || refreshing || !hasMore) return;  // critical guards
	setLoadingMore(true);
	const page = await FetchPageAsync(items.length);
	if (page !== null) {
		setItems(prev => [...prev, ...page]);
		setHasMore(page.length === PAGE_SIZE);
	}
	setLoadingMore(false);
};

<FlatList
	data={items}
	renderItem={renderItem}
	keyExtractor={i => i.id}
	onEndReached={HandleLoadMoreAsync}
	onEndReachedThreshold={0.4}
	ListFooterComponent={loadingMore ? <Spinner /> : (!hasMore && items.length > 0 ? <EndMarker /> : null)}
	refreshControl={<RefreshControl refreshing={refreshing} onRefresh={HandlePullRefresh} />}
/>
```

**NOT**:

- **Cursor pagination at MVP**. Right for high-write live streams (chat feeds with concurrent inserts) but the complexity is not justified for admin / feed surfaces at MVP scale. Switch when "items shifted under me during scroll" becomes a real bug, not before.
- **Loading the whole list upfront** even when "it's small now." Future-you ships at 10x scale and the page hangs for 4 seconds on cold open.
- **`onEndReached` without the three guards** (`loadingMore || refreshing || !hasMore`). FlatList fires it repeatedly during scroll and will double-fetch the same page.
- **Returning a wrapper object** like `{ items: [...], total: N }` from the server. The `hasMore = page.length === PAGE_SIZE` heuristic does not need a total, and adding a count(*) query doubles the DB hit per page. Flat array response is the simpler standard.

**Why**: One pattern across every admin list and every future feed. The server query is one EF line. The client logic is bounded by the three guards. No infinite-scroll library needed; FlatList already does it. Plug-and-play.
