#!/bin/bash

# 🚀 Script de Deploy - TrafficFlow Pro
# Execute com: bash deploy.sh

echo "🚀 TrafficFlow Pro - Deploy Rápido"
echo "====================================="
echo ""

# Verificar se o bun está instalado
if ! command -v bun &> /dev/null; then
    echo "❌ Bun não encontrado. Instalando..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Ferramentas verificadas"
echo ""

# Build do projeto
echo "🔨 Construindo projeto..."
bun run build:web

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Verifique os erros acima."
    exit 1
fi

# Copiar landing page para dist
echo "📄 Copiando landing page..."
cp web/landing.html dist/landing.html

echo "✅ Build completo!"
echo ""

# Deploy
echo "🚀 Iniciando deploy no Vercel..."
echo ""
echo "⚠️  IMPORTANTE: Você precisará adicionar as variáveis de ambiente:"
echo "   - EXPO_PUBLIC_SUPABASE_URL"
echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "   - EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Pressione qualquer tecla para continuar com o deploy..."
read -n 1 -s

vercel --prod

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Acesse o dashboard do Vercel"
echo "   2. Vá em Settings > Environment Variables"
echo "   3. Adicione todas as variáveis de ambiente"
echo "   4. Faça um redeploy se necessário"
echo ""
echo "📖 Leia o arquivo DEPLOY_AGORA.md para instruções completas"
