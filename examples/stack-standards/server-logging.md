> Example of a Layer-1 domain standard; replace the vendor choices with yours.

---
name: server-logging
layer: server
when_to_read: Configuring logging on any .NET server - single-line HH:mm:ss | LEVEL | category format
---

# Server Logging

The server console matters as much as the client console. Default framework formatters fight the developer: multi-line layouts, two-line wraps with category-then-message, per-request firehose logs at Information by default. The result is a wall of framework chatter that buries the app's own log lines.

This doc codifies the "make server logs as readable as the client console" pattern. The worked implementation below is ASP.NET Core; the goals port to any stack.

**Apply at scaffold time, not later.** Adding a custom formatter once an app has dozens of categories is fine; adding it after the first prod incident when you needed clean logs is too late.

---

## Goals

1. **Single-line layout.** Match the client's `HH:mm:ss | LEVEL | category: message` shape so server logs look like client logs and a developer's eye does not have to switch modes.
2. **App categories stand out.** Logs from `<YourApp>.*` namespaces render in a brighter color than framework noise so you can scan for "what did MY code do" without reading every line.
3. **Framework noise muted.** Per-request HTTP diagnostics, SQL command stream, hosting-internal warmth; all dropped to Warning unless something's wrong.
4. **No colors in piped output.** ANSI escapes only when stdout is a real terminal; piping to a file or log aggregator gets clean text.

---

## .NET ASP.NET Core pattern

### `CompactConsoleFormatter.cs`

Drop this file under your API project root (same level as `Program.cs`). Rename the namespace + the `IsAppCategory` check to your project's root namespace.

```csharp
using System.Globalization;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging.Console;

namespace YourApp.Api;

public class CompactConsoleFormatter : ConsoleFormatter {
	public const string FormatterName = "compact";

	private const string Reset = "\x1b[0m";
	private const string Dim = "\x1b[90m";
	private const string App = "\x1b[36m";
	private const string WarnColor = "\x1b[33m";
	private const string ErrorColor = "\x1b[31m";

	private static readonly bool UseColors = !Console.IsOutputRedirected;

	public CompactConsoleFormatter() : base(FormatterName) {}

	public override void Write<TState>(
		in LogEntry<TState> logEntry,
		IExternalScopeProvider? scopeProvider,
		TextWriter textWriter
	) {
		var message = logEntry.Formatter(logEntry.State, logEntry.Exception);
		if (string.IsNullOrEmpty(message) && logEntry.Exception is null) {
			return;
		}

		var ts = DateTime.Now.ToString("HH:mm:ss", CultureInfo.InvariantCulture);
		var level = LevelLabel(logEntry.LogLevel);
		var category = ShortCategory(logEntry.Category);
		var color = PickColor(logEntry.LogLevel, logEntry.Category);
		var open = UseColors ? color : "";
		var close = UseColors ? Reset : "";

		textWriter.WriteLine($"{open}{ts} | {level} | {category}: {message}{close}");
		if (logEntry.Exception is not null) {
			textWriter.WriteLine(logEntry.Exception);
		}
	}

	private static string LevelLabel(LogLevel level) => level switch {
		LogLevel.Trace => "TRC ",
		LogLevel.Debug => "DBG ",
		LogLevel.Information => "INFO",
		LogLevel.Warning => "WARN",
		LogLevel.Error => "ERR ",
		LogLevel.Critical => "CRIT",
		_ => "?   ",
	};

	private static string PickColor(LogLevel level, string category) {
		if (level >= LogLevel.Error) return ErrorColor;
		if (level == LogLevel.Warning) return WarnColor;
		return IsAppCategory(category) ? App : Dim;
	}

	// Rename the prefix to your project's root namespace. "Program" stays because
	// Program.cs logs land under category "Program" regardless of namespace.
	private static bool IsAppCategory(string category) =>
		category.StartsWith("YourApp", StringComparison.Ordinal)
		|| category.Equals("Program", StringComparison.Ordinal);

	// Keep only the final dotted segment so wide categories like
	// "Microsoft.EntityFrameworkCore.Database.Command" don't blow up line length.
	private static string ShortCategory(string category) {
		var lastDot = category.LastIndexOf('.');
		return lastDot >= 0 && lastDot < category.Length - 1
			? category[(lastDot + 1)..]
			: category;
	}
}
```

### `Program.cs` wire-up

Register the formatter right after `WebApplication.CreateBuilder(args)`, before any services. The using statement at the top of the file pulls in `Microsoft.Extensions.Logging.Console`.

```csharp
using Microsoft.Extensions.Logging.Console;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsoleFormatter<CompactConsoleFormatter, ConsoleFormatterOptions>();
builder.Logging.AddConsole(options => options.FormatterName = CompactConsoleFormatter.FormatterName);
```

The existing console provider added by `CreateBuilder` is reused; setting `FormatterName` swaps which formatter it uses. Don't `ClearProviders()` - other providers (App Insights, etc.) stay registered for production.

### `appsettings.Development.json` log levels

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "YourApp": "Debug",
      "Program": "Debug",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information",
      "Microsoft.EntityFrameworkCore.Migrations": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning",
      "Microsoft.AspNetCore.Hosting.Diagnostics": "Warning",
      "System": "Warning"
    }
  }
}
```

Filter logic:

- `Default: Information` - sensible floor.
- `YourApp: Debug` + `Program: Debug` - your code is verbose during local dev.
- `Microsoft: Warning` - silences everything else from the framework by default.
- Three specific carve-outs back to `Information`: `Hosting.Lifetime` (so "Now listening on..." prints), `EntityFrameworkCore.Migrations` (so "Applying migration..." prints), and any other category you specifically want.
- Explicit overrides at `Warning` for the two worst noise sources: `Hosting.Diagnostics` (the per-request firehose) and `EntityFrameworkCore.Database.Command` (the SQL stream).
- `System: Warning` - third-party library default floor.

`appsettings.Staging.json` and `appsettings.Production.json` typically use the same shape with `YourApp: Information` (production verbosity, not debug).

### Expected output

```
00:48:55 | INFO | Lifetime: Now listening on: http://[::]:5109
00:48:55 | INFO | Lifetime: Application started. Press Ctrl+C to shut down.
00:48:55 | INFO | Migrations: Applying migration '20260515195240_AddSomething'
00:49:12 | INFO | OrdersService: order 1042 accepted -> confirmation queued
00:49:13 | WARN | JwtBearer: Bearer was forbidden for /admin/...
```

App-category lines render bright; framework lines render dim; warnings render yellow; errors render red. Per-request and SQL-command lines do not appear.

### To temporarily see request logs

Bump `Microsoft.AspNetCore.Hosting.Diagnostics` back to `Information` in `appsettings.Development.json` while debugging a specific 4xx. Revert when done.

---

## Maintenance

When a framework category becomes consistently noisy across multiple projects (a Microsoft package's verbose default, a new EF telemetry firehose), add it to the default filter list in this doc so future scaffolds inherit the suppression.

When new ANSI-aware terminals become standard enough that the `Console.IsOutputRedirected` guard is overkill, the .NET formatter can drop the conditional and always emit colors. Until then, keep the guard so piped output stays clean.
