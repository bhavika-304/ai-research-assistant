#!/bin/bash
# =============================================================================
# AI Research Assistant - FULL SETUP SCRIPT
# Run this ONCE to set up everything
# =============================================================================

set -e  # Exit on any error

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       AI Research Assistant - Setup Script           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Check Python ──────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 not found. Install from https://python.org${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# ── Check Node.js ─────────────────────────────────────────────────────────────
echo -e "${YELLOW}[2/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"

# ── Backend Setup ─────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Setting up Python backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate and install
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

echo "Installing Python packages (this may take 2-3 minutes)..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python packages installed${NC}"

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠  Created .env file - please add your GROQ_API_KEY!${NC}"
fi

deactivate
cd ..

# ── Frontend Setup ─────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Setting up React frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    npm install --silent
fi
echo -e "${GREEN}✓ Frontend packages installed${NC}"
cd ..

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                  SETUP COMPLETE! 🎉                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo -e "  ${CYAN}1. Add your Groq API key:${NC}"
echo -e "     Edit ${GREEN}backend/.env${NC} and set GROQ_API_KEY=your_key"
echo -e "     Get a FREE key at: https://console.groq.com"
echo ""
echo -e "  ${CYAN}2. Start the backend (Terminal 1):${NC}"
echo -e "     ${GREEN}cd backend && ./start_backend.sh${NC}"
echo ""
echo -e "  ${CYAN}3. Start the frontend (Terminal 2):${NC}"
echo -e "     ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo -e "  ${CYAN}4. Open your browser:${NC}"
echo -e "     ${GREEN}http://localhost:5173${NC}"
echo ""
