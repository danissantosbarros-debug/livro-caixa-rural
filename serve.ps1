param(
  [int]$Port = 5173,
  [string]$Root = $PSScriptRoot
)

$mimeMap = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.webmanifest' = 'application/manifest+json'
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $Root at $prefix"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    try {
      $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
      if ($path -eq '/') { $path = '/index.html' }
      $fullPath = Join-Path $Root ($path.TrimStart('/'))
      $fullPath = [System.IO.Path]::GetFullPath($fullPath)

      if (-not $fullPath.StartsWith([System.IO.Path]::GetFullPath($Root))) {
        $response.StatusCode = 403
        $response.Close()
        continue
      }

      if (Test-Path $fullPath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
        $mime = $mimeMap[$ext]
        if (-not $mime) { $mime = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $response.ContentType = $mime
        $response.ContentLength64 = $bytes.Length
        $response.KeepAlive = $true
        $response.Headers.Add('Cache-Control', 'no-cache')
        $response.Headers.Add('Service-Worker-Allowed', '/')
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found: ' + $path)
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
      }
    } catch {
      try {
        $response.StatusCode = 500
        $errBytes = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
        $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
      } catch {}
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
}
