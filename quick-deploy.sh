#!/bin/bash

# 🚀 Deploy Rápido do TrafficFlow Pro
# Execute: bash quick-deploy.sh

echo ""
echo "🚀 =================================="
echo "   TrafficFlow Pro - Deploy Rápido"
echo "   =================================="
echo ""

# Perguntar se já tem conta no Vercel
echo "Você já tem conta no Vercel? (s/n)"
read -r tem_conta

if [ "$tem_conta" = "n" ] || [ "$tem_conta" = "N" ]; then
    echo ""
    echo "📝 Primeiro, crie uma conta gratuita:"
    echo "   👉 https://vercel.com/signup"
    echo ""
    echo "Pressione ENTER depois de criar a conta..."
    read -r
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar Vercel CLI"
        echo "Tente manualmente: npm install -g vercel"
        exit 1
    fi
fi

echo ""
echo "✅ Vercel CLI instalado!"
echo ""

# Login
echo "🔑 Fazendo login no Vercel..."
vercel login

if [ $? -ne 0 ]; then
    echo "❌ Erro no login"
    exit 1
fi

echo ""
echo "✅ Login realizado!"
echo ""

# Build
echo "🔨 Construindo projeto..."
echo ""
bun run build:web

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erro no build"
    echo "Verifique os erros acima"
    exit 1
fi

# Copiar landing page
cp web/landing.html dist/landing.html

echo ""
echo "✅ Build completo!"
echo ""

# Explicar próximo passo
echo "⚠️  ATENÇÃO!"
echo ""
echo "Agora vou fazer o deploy. Durante o processo:"
echo ""
echo "1. Quando perguntar 'Set up and deploy?' → Digite Y"
echo "2. Quando perguntar 'Link to existing project?' → Digite N"
echo "3. Quando perguntar 'Project name?' → Digite: trafficflowpro"
echo "4. Pressione ENTER para todas as outras perguntas"
echo ""
echo "Pressione ENTER para continuar..."
read -r

# Deploy
echo ""
echo "🚀 Fazendo deploy..."
echo ""
vercel --prod

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erro no deploy"
    exit 1
fi

echo ""
echo "🎉 =================================="
echo "   DEPLOY CONCLUÍDO COM SUCESSO!"
echo "   =================================="
echo ""
echo "📋 PRÓXIMOS PASSOS IMPORTANTES:"
echo ""
echo "1. Copie a URL que apareceu acima (algo como: https://trafficflowpro.vercel.app)"
echo ""
echo "2. Acesse: https://vercel.com/dashboard"
echo ""
echo "3. Clique no projeto 'trafficflowpro'"
echo ""
echo "4. Vá em: Settings → Environment Variables"
echo ""
echo "5. Adicione estas 5 variáveis:"
echo "   • EXPO_PUBLIC_SUPABASE_URL"
echo "   • EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "   • EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   • STRIPE_SECRET_KEY"
echo "   • SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "6. Depois de adicionar, faça um redeploy:"
echo "   vercel --prod"
echo ""
echo "📖 Para mais detalhes, leia: DEPLOY_AGORA.md"
echo ""
echo "🔥 Seu TrafficFlow Pro está quase pronto para uso!"
echo ""
