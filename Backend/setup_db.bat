@echo off
REM Setup script for Pharmacy MongoDB Collections (Windows)
REM Requires Python 3 and pymongo, python-dotenv packages

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing required packages...
pip install pymongo python-dotenv

echo Running MongoDB collection setup...
python create_collections.py

pause
