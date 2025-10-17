#!/bin/bash

echo "🚀 =================================="
echo "   DEPLOY FORÇADO - TrafficFlow v2.0"
echo "   =================================="
echo ""

# Verificar se está na pasta correta
if [ ! -f "vercel.json" ]; then
    echo "❌ Erro: Execute este script na pasta do projeto!"
    exit 1
fi

echo "📦 Preparando deploy..."
echo ""

# Build local primeiro (garantir que está atualizado)
echo "🔨 Fazendo build local..."
rm -rf dist
bun run build:web

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erro no build local"
    exit 1
fi

echo ""
echo "✅ Build local concluído!"
echo ""

# Deploy para Vercel
echo "🚀 Fazendo deploy para Vercel..."
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Se perguntar 'Link to existing project?' → Digite: Y"
echo "   Se perguntar 'Project name?' → Digite: workspace"
echo ""

npx vercel --prod --force

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erro no deploy"
    echo ""
    echo "Tente manualmente:"
    echo "  npx vercel login"
    echo "  npx vercel --prod --force"
    exit 1
fi

echo ""
echo "🎉 =================================="
echo "   DEPLOY CONCLUÍDO!"
echo "   =================================="
echo ""
echo "✅ Seu site foi atualizado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Aguarde 1-2 minutos para propagação"
echo ""
echo "2. Teste se está atualizado:"
echo "   👉 https://trafficflowpro.com/version-check.html"
echo "   Deve aparecer: Página roxa 'VERSÃO NOVA ATIVA!'"
echo ""
echo "3. Acesse o site principal:"
echo "   👉 https://trafficflowpro.com"
echo "   Pressione Ctrl+Shift+R para limpar cache"
echo ""
echo "4. Verifique se aparece:"
echo "   ✅ Badge verde no canto: v2.0.0-trial-system"
echo "   ✅ Tela de login com: NOVO SISTEMA v2.0"
echo "   ✅ 5 abas no menu (com 'Planos')"
echo ""
echo "🎯 Se a página de teste (step 2) funcionar mas o site"
echo "   principal (step 3) ainda mostrar a versão antiga:"
echo ""
echo "   → Limpe COMPLETAMENTE o cache do navegador:"
echo "     1. Feche TODOS os navegadores"
echo "     2. Abra novamente"
echo "     3. Ou use aba anônima (Ctrl+Shift+N)"
echo ""
echo "✨ Tudo pronto! Qualquer dúvida, me avise!"
echo ""
