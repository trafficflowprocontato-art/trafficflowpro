#!/bin/bash

# 🚀 Script de Deploy - TrafficFlow Pro
# Execute com: bash deploy.sh

echo "🚀 TrafficFlow Pro - Deploy Automático"
echo "========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute na pasta do projeto${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Verificando alterações...${NC}"
git status --short

echo ""
echo -e "${GREEN}✅ Código já está buildado e pronto!${NC}"
echo ""
echo -e "${YELLOW}Escolha como fazer o deploy:${NC}"
echo ""
echo "  1) 🚀 Vercel CLI (Recomendado - automático)"
echo "  2) 📁 GitHub Push (precisa de credenciais)"
echo "  3) ❌ Cancelar"
echo ""
read -p "Escolha uma opção (1-3): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}🚀 Instalando/Verificando Vercel CLI...${NC}"
        
        if ! command -v vercel &> /dev/null; then
            echo "Instalando Vercel CLI..."
            npm install -g vercel
        fi
        
        echo ""
        echo -e "${YELLOW}📤 Fazendo deploy direto no Vercel...${NC}"
        echo -e "${YELLOW}(Vai abrir o navegador para você fazer login)${NC}"
        echo ""
        
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
            echo -e "${GREEN}🌐 Site: https://trafficflowpro.com${NC}"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}📝 Preparando push para GitHub...${NC}"
        
        # Verificar remote
        git remote -v | grep github > /dev/null || {
            echo "Adicionando remote do GitHub..."
            git remote add github https://github.com/trafficflowprocontato-art/trafficflowpro.git
        }
        
        echo ""
        echo -e "${YELLOW}🚀 Fazendo push...${NC}"
        echo -e "${YELLOW}⚠️  Você precisará digitar:${NC}"
        echo "  - Usuário: seu email ou username do GitHub"
        echo "  - Senha: Personal Access Token (crie em https://github.com/settings/tokens)"
        echo ""
        
        git push github main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Push realizado!${NC}"
            echo -e "${GREEN}⏳ Vercel vai detectar e fazer deploy em 2-3 minutos${NC}"
            echo -e "${GREEN}🌐 Site: https://trafficflowpro.com${NC}"
        else
            echo ""
            echo -e "${RED}❌ Erro no push${NC}"
            echo ""
            echo "💡 Dica: Use a opção 1 (Vercel CLI) que é mais fácil!"
        fi
        ;;
        
    3)
        echo ""
        echo "❌ Deploy cancelado"
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Pronto!${NC}"
