#!/bin/bash

echo "🚀 Forçando deploy no Vercel..."
echo ""

# 1. Fazer build local
echo "📦 Step 1: Buildando aplicação web..."
npm run build:web

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Verifique os erros acima."
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo ""

# 2. Adicionar ao git
echo "📝 Step 2: Commitando mudanças..."
git add -A
git commit -m "deploy: Force Vercel deployment $(date +%Y-%m-%d_%H:%M:%S)" || echo "Nada para commitar"

# 3. Push para GitHub
echo "📤 Step 3: Enviando para GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push!"
    exit 1
fi

echo "✅ Push concluído!"
echo ""
echo "🎯 Deploy forçado! Aguarde 2-3 minutos e verifique:"
echo "   https://vercel.com/dashboard"
echo ""
echo "Se ainda não deployar automaticamente:"
echo "   1. Acesse Vercel Dashboard"
echo "   2. Clique no seu projeto"
echo "   3. Clique em 'Redeploy' no último deployment"
