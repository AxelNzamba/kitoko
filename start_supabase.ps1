# Démarre la stack Supabase locale en arrière-plan détaché (survit au shell bash).
$log = "D:\BOULOT\bright services\kitoko-stock\supabase_start2.log"
$err = "D:\BOULOT\bright services\kitoko-stock\supabase_start2.err"
Start-Process -FilePath "$env:USERPROFILE\.bun\bin\supabase.exe" `
  -ArgumentList "start" `
  -WorkingDirectory "D:\BOULOT\bright services\kitoko-stock" `
  -RedirectStandardOutput $log -RedirectStandardError $err `
  -WindowStyle Hidden
Write-Output "supabase start détaché (PID séparé)"
