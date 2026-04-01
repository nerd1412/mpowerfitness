#!/bin/bash
# ============================================================
# MPOWER FITNESS - Development Setup (No Docker)
# ============================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🏋️  Mpower Fitness — Dev Setup${NC}"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org (v18+)${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Setup env
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}📋 .env created from template. Please configure it.${NC}"
fi

# Backend install
echo ""
echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
cd backend && npm install && cd ..

# Frontend install
echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..

echo ""
echo -e "${GREEN}✅ Dependencies installed!${NC}"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo ""
echo -e "  ${CYAN}Terminal 1 (Backend):${NC}"
echo "    cd backend && npm run dev"
echo ""
echo -e "  ${CYAN}Terminal 2 (Frontend):${NC}"
echo "    cd frontend && npm start"
echo ""
echo -e "  ${CYAN}Seed the database (first time):${NC}"
echo "    cd backend && npm run seed"
echo ""
echo -e "${YELLOW}Make sure MongoDB and Redis are running locally!${NC}"
echo "  MongoDB: mongod --dbpath /data/db"
echo "  Redis:   redis-server"
echo ""
