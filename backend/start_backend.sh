#!/bin/bash
# Start the FastAPI backend
# Run this from the 'backend' folder

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}Starting AI Research Assistant Backend...${NC}"

# Load .env if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✓ Environment loaded from .env${NC}"
fi

# Check API key
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your_groq_api_key_here" ]; then
    echo -e "${YELLOW}⚠  WARNING: GROQ_API_KEY not set in .env${NC}"
    echo -e "${YELLOW}   Summarization and Chat features will not work${NC}"
    echo -e "${YELLOW}   Get a free key at: https://console.groq.com${NC}"
    echo ""
fi

# Activate venv
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
fi

echo -e "${GREEN}✓ Starting server at http://localhost:8000${NC}"
echo -e "${CYAN}  API docs: http://localhost:8000/docs${NC}"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
