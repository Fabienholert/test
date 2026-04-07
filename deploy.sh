#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT NETLIFY AUTOMATISÉ
# Ce script configure tout automatiquement (si possible)

echo "🚗 Audit Garantie VW - Assistant de Déploiement"
echo "════════════════════════════════════════════════════"
echo ""

# Vérification préalable
echo "✓ Vérification du setup..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules non trouvé"
    echo "Lancez d'abord : npm install"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "🔨 Build production en cours..."
    npm run build
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "📋 PLAN DE DÉPLOIEMENT"
echo "════════════════════════════════════════════════════"
echo ""
echo "Suivez ces étapes pour déployer sur Netlify :"
echo ""
echo "1. CRÉER UN COMPTE GITHUB (si vous n'en avez pas)"
echo "   → Allez sur https://github.com/signup"
echo "   → Confirmez votre email"
echo ""
echo "2. CRÉER UN REPOSITORY GITHUB"
echo "   → Allez sur https://github.com/new"
echo "   → Nom : audit-garantie-vw"
echo "   → Public : oui"
echo "   → Copiez l'URL du repository"
echo ""
echo "3. POUSSER LE CODE SUR GITHUB"
echo "   Collez ces commandes dans le terminal :"
echo ""
echo "   git remote add origin <URL_DU_REPO>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. CRÉER UN COMPTE NETLIFY"
echo "   → Allez sur https://netlify.com"
echo "   → Sign up with GitHub"
echo ""
echo "5. DEPLOYER SUR NETLIFY"
echo "   → Cliquez 'Add new site'"
echo "   → Sélectionnez 'audit-garantie-vw'"
echo "   → Cliquez 'Deploy'"
echo ""
echo "6. RÉCUPÉRER L'URL"
echo "   → Vous recevrez une URL Netlify"
echo "   → Exemple: https://audit-garantie-vw-xxxxx.netlify.app"
echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo "✅ Votre app est prête à être déployée !"
echo ""
echo "📚 Pour plus de détails :"
echo "   → Lisez DEPLOY_NETLIFY_RAPIDE.md"
echo "   → Ou GITHUB_DEPLOYMENT.md"
echo ""
