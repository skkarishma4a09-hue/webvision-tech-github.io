$body = @{ email = "skkarishma4a09@gmail.com" } | ConvertTo-Json -Compress
Write-Host "Request body: $body"
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/request-otp" -Method POST -ContentType "application/json" -Body $body
    $resp | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error:" $_.Exception.Message
    Write-Host "Response:" $_.ErrorDetails.Message
}
