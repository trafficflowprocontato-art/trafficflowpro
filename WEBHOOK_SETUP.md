# 🔗 Guia Completo: Configurar Webhooks do Stripe

## 📋 O que são Webhooks?

Webhooks são notificações automáticas que o Stripe envia para seu servidor quando eventos importantes acontecem (pagamento aprovado, assinatura cancelada, etc.). Sem webhooks, o banco de dados não será atualizado automaticamente.

---

## 🎯 Eventos que Precisamos Escutar

- `checkout.session.completed` - Quando usuário completa o checkout
- `customer.subscription.created` - Nova assinatura criada
- `customer.subscription.updated` - Assinatura atualizada (upgrade/downgrade)
- `customer.subscription.deleted` - Assinatura cancelada
- `invoice.payment_succeeded` - Pagamento mensal bem-sucedido
- `invoice.payment_failed` - Pagamento falhou

---

## 🚀 Opção 1: Webhook com Vercel Serverless Function (RECOMENDADO)

Esta é a forma mais simples para apps hospedados no Vercel.

### Passo 1: Criar o Endpoint de Webhook

Crie o arquivo `/api/stripe-webhook.ts` na raiz do projeto:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Chave de service role (não a anon key)
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false, // Importante: Stripe precisa do raw body
  },
};

async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook (segurança)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      // Quando checkout é completado
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        await supabase
          .from('subscriptions')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            trial_ends_at: null, // Remover trial
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.client_reference_id!);

        console.log(`✅ Subscription activated for user: ${session.client_reference_id}`);
        break;
      }

      // Quando assinatura é atualizada
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Buscar user_id pelo customer_id
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', subData.user_id);

          console.log(`✅ Subscription updated for user: ${subData.user_id}`);
        }
        break;
      }

      // Quando assinatura é deletada/cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', subData.user_id);

          console.log(`✅ Subscription canceled for user: ${subData.user_id}`);
        }
        break;
      }

      // Quando pagamento é bem-sucedido
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', subData.user_id);

          console.log(`✅ Payment succeeded for user: ${subData.user_id}`);
        }
        break;
      }

      // Quando pagamento falha
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', subData.user_id);

          console.log(`⚠️ Payment failed for user: ${subData.user_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
```

### Passo 2: Adicionar Variáveis de Ambiente

Adicione no `.env`:

```env
# Chave de Service Role do Supabase (tem permissões administrativas)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Webhook Secret (você vai obter isso no próximo passo)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Como obter a Service Role Key:**
1. Vá em Supabase → Settings → API
2. Copie a chave "service_role" (⚠️ NÃO a "anon")
3. Cole no `.env`

### Passo 3: Deploy para Vercel

```bash
# Commitar as mudanças
git add .
git commit -m "Add Stripe webhook endpoint"

# Deploy
vercel --prod
```

Sua URL será algo como: `https://trafficflowpro.com/api/stripe-webhook`

### Passo 4: Configurar Webhook no Stripe Dashboard

1. **Acesse:** https://dashboard.stripe.com/webhooks
2. **Clique em:** "Add endpoint"
3. **Endpoint URL:** `https://trafficflowpro.com/api/stripe-webhook`
4. **Eventos para escutar:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. **Clique em:** "Add endpoint"
6. **Copie o "Signing secret"** (começa com `whsec_...`)
7. **Cole no `.env`** como `STRIPE_WEBHOOK_SECRET`

### Passo 5: Testar o Webhook

**No Stripe Dashboard:**
1. Vá em Webhooks → Seu endpoint
2. Clique em "Send test webhook"
3. Escolha um evento (ex: `checkout.session.completed`)
4. Clique "Send test event"
5. Verifique se o status é "Succeeded" ✅

**Ou teste fazendo um pagamento real:**
1. Crie uma conta no app
2. Escolha um plano
3. Use cartão de teste: `4242 4242 4242 4242`
4. Complete o checkout
5. Verifique no Supabase se o status mudou para `active` ✅

---

## 🔧 Opção 2: Testar Webhooks Localmente (Desenvolvimento)

Para testar webhooks localmente antes do deploy:

### Instalar Stripe CLI

```bash
# MacOS
brew install stripe/stripe-cli/stripe

# Windows (usando Scoop)
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
```

### Login e Forward Webhooks

```bash
# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Você verá um webhook secret temporário
# Copie e use no .env local
```

### Testar Eventos

```bash
# Simular checkout completado
stripe trigger checkout.session.completed

# Simular pagamento bem-sucedido
stripe trigger invoice.payment_succeeded
```

---

## 🛡️ Segurança e Boas Práticas

### ✅ SEMPRE faça:

1. **Verifique a assinatura do webhook:**
   ```typescript
   event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
   ```

2. **Use Service Role Key** (não a anon key) no webhook

3. **Valide dados antes de atualizar banco:**
   ```typescript
   if (!session.client_reference_id) {
     console.error('Missing client_reference_id');
     return;
   }
   ```

4. **Retorne 200 rapidamente:**
   - Stripe espera resposta em até 5 segundos
   - Faça processamento assíncrono se necessário

5. **Log tudo:**
   ```typescript
   console.log(`Event: ${event.type}`, event.data.object);
   ```

### ❌ NUNCA faça:

1. Não exponha o webhook secret publicamente
2. Não use a anon key no webhook (usa service_role)
3. Não processe webhooks sem verificar assinatura
4. Não faça operações pesadas que demorem >5s

---

## 🐛 Troubleshooting

### Webhook não está funcionando:

1. **Verifique logs no Stripe Dashboard:**
   - Webhooks → Seu endpoint → Logs
   - Veja o status e erro

2. **Verifique logs no Vercel:**
   - Vercel Dashboard → Functions → Logs
   - Procure por erros

3. **Teste assinatura:**
   ```typescript
   console.log('Signature valid:', !!event);
   ```

4. **Verifique Service Role Key:**
   - Deve começar com `eyJ...` (não `anon`)
   - Tem permissões para UPDATE na tabela

5. **URL correta:**
   - HTTPS (não HTTP)
   - Sem trailing slash: `/api/stripe-webhook` ✅
   - Com trailing slash: `/api/stripe-webhook/` ❌

### Banco não atualiza:

1. **Verifique se user_id existe:**
   ```typescript
   const { data, error } = await supabase...
   console.log('Data:', data, 'Error:', error);
   ```

2. **Verifique RLS policies:**
   - Service Role Key bypassa RLS automaticamente

3. **Verifique campos:**
   - Todos os campos existem na tabela?
   - Tipos de dados corretos?

---

## ✅ Checklist Final

Depois de configurar, verifique:

- [ ] Arquivo `/api/stripe-webhook.ts` criado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` no `.env`
- [ ] `STRIPE_WEBHOOK_SECRET` no `.env`
- [ ] Deploy feito no Vercel
- [ ] Webhook adicionado no Stripe Dashboard
- [ ] Eventos selecionados corretamente
- [ ] Teste enviado e bem-sucedido ✅
- [ ] Pagamento de teste realizado
- [ ] Banco de dados atualizou automaticamente ✅

---

## 🎉 Pronto!

Seu sistema agora está **100% automatizado**:

1. ✅ Usuário faz checkout
2. ✅ Stripe processa pagamento
3. ✅ Webhook notifica seu servidor
4. ✅ Banco atualiza automaticamente
5. ✅ Usuário tem acesso liberado
6. ✅ Renovações mensais automáticas
7. ✅ Cancelamentos processados
8. ✅ Falhas de pagamento tratadas

**Sistema de assinaturas profissional completo!** 🚀

---

## 📞 Suporte

Se tiver problemas:
1. Verifique logs do Stripe Dashboard
2. Verifique logs do Vercel
3. Teste com `stripe listen` localmente
4. Leia mensagens de erro nos logs
