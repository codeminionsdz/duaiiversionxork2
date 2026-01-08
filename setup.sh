#!/bin/bash

# ================================
# دوائي - Quick Start Script
# ================================

set -e

echo "🚀 Starting Duaiii Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Copying from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values before running the app."
fi

# Run database migrations (optional)
echo "📊 Database setup (optional)..."
echo "Remember to run SQL scripts in Supabase SQL Editor:"
echo "  1. scripts/001_initial_schema.sql"
echo "  2. scripts/021_add_pwa_analytics.sql"

# Build the app
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🐳 To start with Docker:"
echo "   docker-compose up"
echo ""
echo "📖 Read README.md for more information"
