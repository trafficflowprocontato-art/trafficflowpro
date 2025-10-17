# TrafficFlow Pro - Deploy Web Guide

## 🚀 DEPLOY NA VERCEL

### Método 1: Deploy via CLI (Mais Rápido)

#### Passo 1: Instalar Vercel CLI
```bash
bun add -g vercel
```

#### Passo 2: Fazer Login
```bash
vercel login
```

#### Passo 3: Build do Projeto
```bash
bun run build:web
```

#### Passo 4: Deploy
```bash
vercel --prod
```

---

### Método 2: Deploy via GitHub (Recomendado)

#### Passo 1: Criar Repositório no GitHub
1. Vá em: https://github.com/new
2. Nome: `trafficflow-pro`
3. Private ou Public (sua escolha)
4. **NÃO** inicialize com README
5. Clique em "Create repository"

#### Passo 2: Push do Código
```bash
cd /home/user/workspace
git add .
git commit -m "Initial commit - TrafficFlow Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/trafficflow-pro.git
git push -u origin main
```

#### Passo 3: Conectar na Vercel
1. Vá em: https://vercel.com/dashboard
2. Clique em "Add New" → "Project"
3. Selecione o repositório `trafficflow-pro`
4. Configure:
   - Framework Preset: **Other**
   - Build Command: `bun run build:web`
   - Output Directory: `dist`
5. Clique em "Deploy"

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### Environment Variables (Variáveis de Ambiente)

Na Vercel, adicione estas variáveis:

```
EXPO_PUBLIC_SUPABASE_URL=https://kdmnznwrdbqsztpxxjbi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbW56bndyZGJxc3p0cHh4amJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDU2MjcsImV4cCI6MjA3NTc4MTYyN30.Ezt6fY6QOZK41mlTvFuFis2fE0StazDCf9a6TT4sU5Q
```

---

## 🌐 CONFIGURAR DOMÍNIO NO SUPABASE

Depois do deploy, você terá uma URL como:
```
https://trafficflow-pro.vercel.app
```

Adicione no Supabase:

1. Supabase → Authentication → URL Configuration
2. **Site URL**: `https://trafficflow-pro.vercel.app`
3. **Redirect URLs**: 
   - `https://trafficflow-pro.vercel.app/**`
   - `https://trafficflow-pro.vercel.app/auth/callback`

---

## 📱 PWA - INSTALAR COMO APP

Depois de publicado, os usuários podem:

### No Android:
1. Abrir o site no Chrome
2. Menu → "Adicionar à tela inicial"
3. Funciona como app nativo!

### No iOS:
1. Abrir no Safari
2. Botão compartilhar → "Adicionar à Tela de Início"
3. Funciona como app nativo!

### No Desktop:
1. Chrome → Ícone de instalação na barra de endereços
2. Ou Menu → "Instalar TrafficFlow Pro"

---

## 🎨 OTIMIZAÇÕES IMPLEMENTADAS

- ✅ Build otimizado para produção
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Service worker (PWA)
- ✅ Offline support
- ✅ Fast refresh
- ✅ Responsive design

---

## 🔧 TROUBLESHOOTING

### Build falhou?
```bash
# Limpar cache
rm -rf node_modules .expo dist
bun install
bun run build:web
```

### App não carrega?
- Verifique variáveis de ambiente na Vercel
- Verifique console do navegador (F12)
- Verifique se Supabase URL está correta

### Estilos quebrados?
- Certifique-se que nativewind está configurado
- Verifique se Tailwind CSS está no build

---

## 📊 MONITORAMENTO

### Analytics (Opcional)
Adicione Google Analytics ou Vercel Analytics:
1. Vercel Dashboard → Seu projeto → Analytics
2. Enable Analytics

### Performance
- Vercel mostra métricas automaticamente
- Core Web Vitals
- Tempo de carregamento
- Taxa de erro

---

## 🚀 DEPLOY AUTOMÁTICO

Configurado via GitHub:
- ✅ Push para `main` → Deploy automático em produção
- ✅ Pull request → Preview deploy automático
- ✅ Rollback com 1 clique

---

## 🎯 PRÓXIMOS PASSOS

Depois do deploy:
1. ✅ Testar em diferentes dispositivos
2. ✅ Configurar domínio próprio (opcional)
3. ✅ Adicionar Google Analytics (opcional)
4. ✅ Configurar SEO
5. ✅ Testar PWA install
6. ✅ Compartilhar com usuários!

---

## 📱 URL FINAL

Seu app estará disponível em:
```
https://trafficflow-pro.vercel.app
```

Ou com domínio próprio:
```
https://trafficflowpro.com.br
```

---

**Status:** ⏳ Aguardando deploy...
