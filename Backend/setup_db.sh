#!/bin/bash
# Setup script for Pharmacy MongoDB Collections (Linux/macOS/Git Bash)
# Requires Python 3 and pymongo, python-dotenv packages

echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed or not in PATH"
    exit 1
fi

echo "Installing required packages..."
pip3 install pymongo python-dotenv

echo "Running MongoDB collection setup..."
python3 create_collections.py
