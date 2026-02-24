@echo off
echo === WilCo Guide Setup ===
echo.

REM Copy clean data files to /data directory
echo Copying clean data files...
copy "scripts\clean-businesses.json" "data\clean-businesses.json"
copy "scripts\clean-reviews.json" "data\clean-reviews.json"

REM Copy logo images from seniors directory
echo Copying logo images...
if not exist "public\images" mkdir "public\images"
copy "C:\ai-projects\wilco-seniors-directory\public\images\wilco-guide-logo-outline.png" "public\images\wilco-guide-logo-outline.png"
copy "C:\ai-projects\wilco-seniors-directory\public\images\wilco-guide-logo.png" "public\images\wilco-guide-logo.png"

REM Install dependencies
echo Installing dependencies...
npm install

echo.
echo === Setup complete! Run 'npm run dev' to start. ===
