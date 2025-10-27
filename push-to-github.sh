#!/bin/bash

# Script pour pousser les changements vers GitHub
echo "🚀 Poussage des changements vers GitHub..."

# Vérifier le statut
git status

# Ajouter tous les fichiers
git add .

# Commiter avec le message
git commit -m "Add ZenRows scraper for LeBonCoin

Integrate ZenRows API to bypass DataDome protection and scrape real LeBonCoin data"

# Pousser vers GitHub
git push origin main

echo "✅ Changements poussés vers GitHub !"




