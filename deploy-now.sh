#!/bin/bash

echo "🚀 Deploy Manual - TrafficFlow Pro v2.0"
echo ""
echo "Esse script vai fazer deploy sem cache diretamente para produção"
echo ""

# Build local
echo "📦 Fazendo build..."
bun run build:web

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

echo "✅ Build concluído!"
echo ""

# Deploy
echo "🚀 Fazendo deploy para Vercel..."
npx vercel --prod --force

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Aguarde 1-2 minutos e teste:"
echo "👉 https://trafficflowpro.com"
echo ""
