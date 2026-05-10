param(
    [string]$BuildType = "Debug"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command cmake -ErrorAction SilentlyContinue)) {
    Write-Host "CMake was not found in PATH."
    Write-Host "Install CMake (or use CLion), then run this script again."
    exit 1
}

if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

cmake -S . -B build "-DCMAKE_BUILD_TYPE=$BuildType"
cmake --build build

Write-Host ""
Write-Host "Build completed."
Write-Host "Run tests with: .\\build\\tests_runner.exe"
