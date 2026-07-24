#Requires -Version 5.1
<#
.SYNOPSIS
  One-command setup for this governance layer on Windows (PowerShell).

.DESCRIPTION
  Does the mechanical parts of the quickstart so you do not have to copy paths
  by hand. It copies the template into your root, initializes git, installs the
  ~/.claude pieces, and writes a settings.json with your paths already filled
  in (forward slashes, so the JSON is valid). It changes nothing that only you
  decide, so your craft rules and your git-gate hard lines stay yours.
  Re-runnable and careful with an existing ~/.claude: anything it replaces is
  backed up first to a timestamped folder, and an existing settings.json is
  MERGED (your settings kept, Forge entries added, every change printed;
  where a value truly conflicts the Forge value wins and says so).

.PARAMETER Root
  The workspace root to create or set up (for example C:/Workspace). Forward
  or back slashes both work.

.PARAMETER Force
  Allow setup into a folder that already has files but is not a Forge root.

.EXAMPLE
  .\template\tools\setup.ps1 -Root C:/Workspace
#>
param(
	[Parameter(Mandatory = $true)]
	[string]$Root,
	[switch]$Force
)

$ErrorActionPreference = "Stop"

function Say([string]$m) { Write-Host $m }
function Step([string]$m) { Write-Host "  $m" }
function Warn([string]$m) { Write-Host "WARNING: $m" -ForegroundColor Yellow }
function Die([string]$m) { Write-Host "STOPPED: $m" -ForegroundColor Red; exit 1 }

# 1. Resolve the template dir (the parent of this tools/ folder) and the root.
$TemplateDir = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $TemplateDir "CLAUDE.md"))) {
	Die "cannot find the template next to this script (expected $TemplateDir/CLAUDE.md). Run this script from where you extracted the download."
}
if (-not [System.IO.Path]::IsPathRooted($Root)) {
	$Root = Join-Path (Get-Location).Path $Root
}
$RootAbs = [System.IO.Path]::GetFullPath($Root)
$RootFwd = $RootAbs -replace "\\", "/"
$HubFwd = "$RootFwd/Claude"
# The deny paths key on the profile-folder name (C:\Users\<leaf>), which is not
# always the login name; prefer the profile leaf, with fallbacks.
$User = if ($env:USERPROFILE) { Split-Path -Leaf $env:USERPROFILE } elseif ($env:USERNAME) { $env:USERNAME } else { "user" }

Say "Forge setup"
Say "  template: $TemplateDir"
Say "  root:     $RootAbs"
Say ""

# 2. Guard the root. An existing Forge root is fine (we re-install and refresh
#    settings); a non-empty non-Forge folder needs -Force so nothing is buried.
$RootExists = Test-Path -LiteralPath $RootAbs
# A real Forge root carries several markers, not just any CLAUDE.md, so an
# unrelated project that happens to have a CLAUDE.md is not mistaken for one
# (which would skip the copy and leave a half-installed workspace).
$AlreadyForge = $RootExists `
	-and (Test-Path -LiteralPath (Join-Path $RootAbs "CLAUDE.md")) `
	-and (Test-Path -LiteralPath (Join-Path $RootAbs "STANDARDS/INDEX.md")) `
	-and (Test-Path -LiteralPath (Join-Path $RootAbs ".claude-settings-template.json"))
if (-not $RootExists) {
	New-Item -ItemType Directory -Force -Path $RootAbs | Out-Null
} elseif (-not $AlreadyForge) {
	$hasFiles = (Get-ChildItem -Force -LiteralPath $RootAbs | Measure-Object).Count -gt 0
	if ($hasFiles -and -not $Force) {
		Die "$RootAbs is not empty and has no Forge constitution. Re-run with -Force to set up here anyway, or pick an empty folder."
	}
}

# 3. Copy the template contents into the root (constitution lands at the root).
if ($AlreadyForge) {
	Step "root is already a Forge, refreshing the harness pieces and settings without re-copying (your filled-in files stay)"
} else {
	Step "copying the template into the root"
	Get-ChildItem -Force -LiteralPath $TemplateDir | ForEach-Object {
		Copy-Item -LiteralPath $_.FullName -Destination $RootAbs -Recurse -Force
	}
}

# 4. Initialize git and make the first commit (best effort; a missing git or an
#    unset identity is a warning, never a stop).
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
	Warn "git was not found, skipping repo init. Install git, then run 'git init -b main' in your root."
} elseif (Test-Path -LiteralPath (Join-Path $RootAbs ".git")) {
	Step "git repo already present, leaving it as is"
} else {
	Step "initializing the git repo"
	# git writes progress to stderr, which under the Stop preference would wrap as
	# a terminating error and abort setup. Relax it for this block and read exit codes.
	$prevEap = $ErrorActionPreference
	$ErrorActionPreference = "Continue"
	git -C $RootAbs init -b main *> $null
	if ($LASTEXITCODE -ne 0) {
		# Older git without -b: fall back to init then rename the branch.
		git -C $RootAbs init *> $null
		git -C $RootAbs branch -M main *> $null
	}
	git -C $RootAbs add -A *> $null
	git -C $RootAbs commit -m "Initial Forge workspace" *> $null
	$commitFailed = $LASTEXITCODE -ne 0
	$ErrorActionPreference = $prevEap
	if ($commitFailed) {
		Warn "could not create the first commit (is your git user.name and user.email set?). Commit yourself later with: git -C `"$RootAbs`" commit -m `"Initial Forge workspace`""
	}
}

# The enforcement hooks are Node scripts, so warn now if Node is missing rather
# than let every gate silently no-op at session time.
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Warn "Node.js was not found on your PATH. The enforcement hooks are small Node scripts, so install Node.js (nodejs.org) before your next session or they will not run."
}

# 5. Install the harness pieces into ~/.claude (the front door, the routing
#    seats, and the switch). Source mirrors stay at your root. Never blind:
#    identical files are skipped, and anything replaced is backed up first.
$ClaudeDir = Join-Path $HOME ".claude"
$script:BackupDir = Join-Path $ClaudeDir ("forge-setup-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$script:BackedUp = $false
function BackupTarget([string]$path, [string]$rel) {
	$dest = Join-Path $script:BackupDir $rel
	New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
	Copy-Item -LiteralPath $path -Destination $dest -Recurse -Force
	$script:BackedUp = $true
}
function FileHash([string]$path) { (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash }
function TreeSig([string]$path) {
	(Get-ChildItem -Recurse -File -LiteralPath $path | Sort-Object FullName | ForEach-Object {
		"$($_.FullName.Substring($path.Length))=$(FileHash $_.FullName)"
	}) -join ";"
}
function InstallDir([string]$srcRel, [string]$destSub, [string]$label) {
	$src = Join-Path $RootAbs $srcRel
	if (-not (Test-Path -LiteralPath $src)) {
		Warn "expected $src but it is missing, skipping $label"
		return
	}
	$dest = Join-Path $ClaudeDir $destSub
	New-Item -ItemType Directory -Force -Path $dest | Out-Null
	$target = Join-Path $dest (Split-Path -Leaf $src)
	if (Test-Path -LiteralPath $target) {
		if ((TreeSig $src) -eq (TreeSig $target)) {
			Step "$label already current"
			return
		}
		BackupTarget $target "$destSub/$(Split-Path -Leaf $src)"
		Remove-Item -Recurse -Force -LiteralPath $target
		Copy-Item -LiteralPath $src -Destination $dest -Recurse -Force
		Step "replaced $label (your version is backed up)"
		return
	}
	Copy-Item -LiteralPath $src -Destination $dest -Recurse -Force
	Step "installed $label to $dest"
}
function InstallFiles([string]$srcRel, [string]$destSub, [string]$label) {
	$srcDir = Join-Path $RootAbs $srcRel
	if (-not (Test-Path -LiteralPath $srcDir)) {
		Warn "expected $srcDir but it is missing, skipping $label"
		return
	}
	$dest = Join-Path $ClaudeDir $destSub
	New-Item -ItemType Directory -Force -Path $dest | Out-Null
	$new = 0
	$current = 0
	$replaced = 0
	Get-ChildItem -LiteralPath $srcDir -Filter *.md | ForEach-Object {
		$destFile = Join-Path $dest $_.Name
		if (Test-Path -LiteralPath $destFile) {
			if ((FileHash $destFile) -eq (FileHash $_.FullName)) {
				$current += 1
				return
			}
			BackupTarget $destFile "$destSub/$($_.Name)"
			Copy-Item -LiteralPath $_.FullName -Destination $destFile -Force
			Step "replaced $($_.Name) in $dest (your version is backed up)"
			$replaced += 1
			return
		}
		Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
		$new += 1
	}
	Step "$label to ${dest}: $new installed, $current already current, $replaced replaced"
}
Say ""
Say "Installing the harness pieces into $ClaudeDir"
InstallDir   "skills/forge-onboard" "skills"   "the onboarding skill"
InstallFiles "subagents"            "agents"   "the model-routing seats"
InstallFiles "commands"             "commands" "the /model-routing command"

# 6. Pre-fill the settings file with your paths (forward slashes keep the JSON
#    valid) and your OS user. Written to the root as settings.generated.json;
#    also written to ~/.claude/settings.json only if you do not have one yet.
Say ""
Say "Preparing your settings"
$tpl = Join-Path $RootAbs ".claude-settings-template.json"
if (-not (Test-Path -LiteralPath $tpl)) {
	Warn "settings template missing at $tpl, skipping the settings step"
} else {
	$text = Get-Content -Raw -LiteralPath $tpl
	$text = $text.Replace("<ROOT>", $RootFwd)
	$text = $text.Replace("<YOUR-TRACKER-HUB-PATH>", $HubFwd)
	$text = $text.Replace("<YOUR-USER>", $User)
	$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
	$generated = Join-Path $RootAbs "settings.generated.json"
	[System.IO.File]::WriteAllText($generated, $text, $utf8NoBom)
	Step "wrote $generated (paths and user filled in)"
	$globalSettings = Join-Path $ClaudeDir "settings.json"
	if (Test-Path -LiteralPath $globalSettings) {
		# Merge, never clobber: your settings survive, Forge entries are added,
		# and a real conflict resolves Forge-wins with a printed CONFLICT line.
		if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
			Warn "node is missing, so the settings merge was skipped. Merge the hooks, permissions, and env blocks from $generated into $globalSettings by hand."
		} else {
			$mergeTool = Join-Path $RootAbs "tools/merge-settings.mjs"
			$tmp = Join-Path $RootAbs "settings.merged.tmp.json"
			$prevEap = $ErrorActionPreference
			$ErrorActionPreference = "Continue"
			$mergeOut = & node $mergeTool $globalSettings $generated $tmp
			$mergeFailed = $LASTEXITCODE -ne 0
			$ErrorActionPreference = $prevEap
			if ($mergeFailed -or -not (Test-Path -LiteralPath $tmp)) {
				if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
				Warn "settings merge failed; $globalSettings is left untouched. Merge the hooks, permissions, and env blocks from $generated by hand."
			} else {
				foreach ($line in @($mergeOut)) {
					if ("$line".StartsWith("CONFLICT")) { Warn "$line" } else { Step "$line" }
				}
				if ((FileHash $tmp) -eq (FileHash $globalSettings)) {
					Remove-Item -LiteralPath $tmp -Force
				} else {
					BackupTarget $globalSettings "settings.json"
					Move-Item -LiteralPath $tmp -Destination $globalSettings -Force
					Step "merged the Forge wiring into $globalSettings (your original is backed up)"
				}
			}
		}
	} else {
		New-Item -ItemType Directory -Force -Path $ClaudeDir | Out-Null
		# Fresh writes route through the merge tool too, so _instructions
		# (setup guidance, not wiring) never lands in a deployed settings file.
		$wrote = $false
		if (Get-Command node -ErrorAction SilentlyContinue) {
			$mergeTool = Join-Path $RootAbs "tools/merge-settings.mjs"
			$empty = Join-Path $RootAbs "settings.empty.tmp.json"
			$tmp = Join-Path $RootAbs "settings.merged.tmp.json"
			[System.IO.File]::WriteAllText($empty, "{}", $utf8NoBom)
			$prevEap = $ErrorActionPreference
			$ErrorActionPreference = "Continue"
			$null = & node $mergeTool $empty $generated $tmp
			$mergeFailed = $LASTEXITCODE -ne 0
			$ErrorActionPreference = $prevEap
			Remove-Item -LiteralPath $empty -Force
			if (-not $mergeFailed -and (Test-Path -LiteralPath $tmp)) {
				Move-Item -LiteralPath $tmp -Destination $globalSettings -Force
				$wrote = $true
			} elseif (Test-Path -LiteralPath $tmp) {
				Remove-Item -LiteralPath $tmp -Force
			}
		}
		if (-not $wrote) {
			[System.IO.File]::WriteAllText($globalSettings, $text, $utf8NoBom)
			Warn "wrote the settings as-is; delete the _instructions key from it after reading"
		}
		Step "wrote $globalSettings (you had none). Review it, then it takes effect from your next session"
	}
}

# 7. Print what only you can finish.
Say ""
Say "Done with the mechanical parts. What is left for you:"
Say "  1. Settings: review ~/.claude/settings.json (written or merged above; any"
Say "     CONFLICT lines show where a Forge value replaced yours). The Forge-only"
Say "     reference copy is settings.generated.json in your root."
Say "  2. Hard lines: open hooks/git-gate.mjs at your root and replace <YOUR-HARD-LINES>"
Say "     with the git operations an agent must never do alone."
Say "  3. Craft rules: fill the <YOUR-*> sections in Claude/CLAUDE.md. A worked"
Say "     example lives in the examples/ folder from the download (beside template/)."
Say "  4. Roles: name the personas in Agents/AGENT_ROLES.md (optional now)."
Say "  5. Never-publish list: seed deny-list.txt with your names, employer, and paths."
if ($script:BackedUp) {
	Say ""
	Say "Everything replaced was backed up first: $script:BackupDir"
}
Say ""
Say "Then open a NEW session at your root and say: onboard <YourProject>"
Say "Hooks load at session start, so the wiring takes effect from your next session, not this shell."
