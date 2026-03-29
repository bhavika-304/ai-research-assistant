@echo off
REM Start the FastAPI backend (Windows)
REM Run this from the 'backend' folder

echo Starting AI Research Assistant Backend...

REM Load environment
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
    )
    echo Environment loaded from .env
)

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
)

echo Server starting at http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
