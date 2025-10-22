@echo off
echo Building OCR Service...
call npx tsc
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Build successful!
echo Starting OCR service...
node dist\index.js
