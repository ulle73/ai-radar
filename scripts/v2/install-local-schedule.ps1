# Skapar (eller tar bort) den schemalagda aktiviteten som kör AI Radar v2:s lokala cykel var 30:e minut.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v2\install-local-schedule.ps1            # skapa/uppdatera
#   powershell -ExecutionPolicy Bypass -File scripts\v2\install-local-schedule.ps1 -Remove    # ta bort
#
# Körs som inloggad användare (inget sparat lösenord), bara när användaren är inloggad, dolt via wscript,
# aldrig flera instanser samtidigt och med 45 minuters tidsgräns.

param([switch]$Remove)

$ErrorActionPreference = 'Stop'
$TaskName = 'AI Radar v2 - lokal cykel'
$StateDir = Join-Path $env:USERPROFILE '.ai-radar'
$Launcher = Join-Path $StateDir 'run-cycle.vbs'
$Cycle = (Resolve-Path (Join-Path $PSScriptRoot 'local-cycle.mjs')).Path

if ($Remove) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    "Tog bort aktiviteten '$TaskName'."
  } else {
    "Aktiviteten '$TaskName' finns inte."
  }
  return
}

New-Item -ItemType Directory -Force -Path $StateDir | Out-Null

# wscript startar node utan synligt fönster (0) och väntar inte (False); node hittas via användarens PATH.
$vbs = @"
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "$(Split-Path -Parent (Split-Path -Parent $PSScriptRoot))"
shell.Run "node ""$Cycle""", 0, False
"@
Set-Content -Path $Launcher -Value $vbs -Encoding ASCII

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$Launcher`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 45)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'AI Radar v2 (ulle73/ai-radar): heartbeat --mode private och lokal domare. Loggar i %USERPROFILE%\.ai-radar\logs.' `
  -Force | Out-Null

$task = Get-ScheduledTask -TaskName $TaskName
"Aktiviteten '$TaskName' är skapad: $($task.State), nästa körning $((Get-ScheduledTaskInfo -TaskName $TaskName).NextRunTime)."
