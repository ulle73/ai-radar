# Skapar (eller tar bort) den schemalagda aktiviteten "GK Harness nattfas" (harness-designen C0, V18).
#
#   powershell -ExecutionPolicy Bypass -File scripts\v2\install-harness-schedule.ps1            # skapa/uppdatera
#   powershell -ExecutionPolicy Bypass -File scripts\v2\install-harness-schedule.ps1 -Disable   # inaktivera (återställning steg 2)
#   powershell -ExecutionPolicy Bypass -File scripts\v2\install-harness-schedule.ps1 -Remove    # ta bort
#
# Startar 23:30 och försöker igen varje timme till 05:00. Inget ledighetsvillkor i Task Scheduler (föråldrat
# enligt V18): harness-night.mjs kontrollerar själv nattfönstret och att ingen inmatning skett på 30 minuter.
# Körs som inloggad användare utan sparat lösenord, dolt via wscript, aldrig flera instanser, högst 5 timmar.
# Kopierar också motorns grundinställningar till motorns CLAUDE_CONFIG_DIR, så att även evals körs med
# disableSkillShellExecution och utan claude.ai-anslutningar.

param([switch]$Remove, [switch]$Disable)

$ErrorActionPreference = 'Stop'
$TaskName = 'GK Harness nattfas'
$Engine = Join-Path $env:USERPROFILE 'gk-engine'
$Launcher = Join-Path $Engine 'run-harness-night.vbs'
$Night = (Resolve-Path (Join-Path $PSScriptRoot 'harness-night.mjs')).Path
$Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if ($Remove) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    "Tog bort aktiviteten '$TaskName'."
  } else {
    "Aktiviteten '$TaskName' finns inte."
  }
  return
}
if ($Disable) {
  Disable-ScheduledTask -TaskName $TaskName | Out-Null
  "Aktiviteten '$TaskName' är inaktiverad."
  return
}

foreach ($dir in 'config\claude', 'state', 'logs', 'tmp', 'work') { New-Item -ItemType Directory -Force -Path (Join-Path $Engine $dir) | Out-Null }
foreach ($secret in 'claude-oauth.dpapi', 'notion-test.dpapi') {
  if (-not (Test-Path (Join-Path $Engine "secrets\$secret"))) { Write-Warning "secrets\$secret saknas (Jonas engångssteg i etapp 0)." }
}
$runSettings = Join-Path $Engine 'config\run-settings.json'
if (-not (Test-Path $runSettings)) {
  '{"disableClaudeAiConnectors":true,"syncClaudeAiPlugins":false,"syncClaudeAiSkills":false,"disableSkillShellExecution":true}' |
    Set-Content -Path $runSettings -Encoding ASCII
}
Copy-Item $runSettings (Join-Path $Engine 'config\claude\settings.json') -Force

$vbs = @"
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "$Repo"
shell.Run "node ""$Night""", 0, False
"@
Set-Content -Path $Launcher -Value $vbs -Encoding ASCII

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$Launcher`""
$trigger = New-ScheduledTaskTrigger -Daily -At '23:30'
$trigger.Repetition = (New-ScheduledTaskTrigger -Once -At '23:30' -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Hours 5 -Minutes 30)).Repetition
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 5)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'Förbättringsmotorn (ulle73/ai-radar, scripts/v2/harness-night.mjs): kärnloopen för Golfkupongers hubb. Loggar i %USERPROFILE%\gk-engine\logs.' `
  -Force | Out-Null

$task = Get-ScheduledTask -TaskName $TaskName
"Aktiviteten '$TaskName' är skapad: $($task.State), nästa körning $((Get-ScheduledTaskInfo -TaskName $TaskName).NextRunTime)."
