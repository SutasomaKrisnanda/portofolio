const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Select-Object ProcessId, CommandLine | Format-List"').toString();
  console.log(out);
} catch(e) {
  console.error(e.message);
}
