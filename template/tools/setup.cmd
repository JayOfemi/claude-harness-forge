@echo off
rem Double-click setup for Windows. Runs the PowerShell helper beside this
rem file with a per-run policy bypass; nothing on the machine is changed
rem permanently, and the window stays open so you can read the output.
if not exist "%~dp0setup.ps1" (
	echo STOPPED: extract the whole zip first ^(right-click the download and choose Extract All^), then double-click this file again from the extracted folder.
	pause
	exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*
echo.
pause
