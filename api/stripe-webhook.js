const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { buffer } = require('micro');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('🔔 Webhook received:', req.method);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'stripe-signature, content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('🔑 Has webhook secret:', !!webhookSecret);
  console.log('🔑 Has signature:', !!sig);

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;
  
  try {
    const rawBody = await buffer(req);
    console.log('📦 Raw body size:', rawBody.length);
    
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('✅ Event verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const priceId = subscription.items.data[0].price.id;
        
        let planId = 'starter';
        if (priceId.includes('7k')) planId = 'pro';
        if (priceId.includes('8D')) planId = 'premium';
        
        console.log('💾 Saving subscription for user:', userId);
        
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: planId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('❌ Error saving subscription:', error);
          return res.status(500).json({ error: 'Failed to save subscription' });
        }
        
        console.log('✅ Subscription saved successfully');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);
        
        console.log('✅ Subscription updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
        
        console.log('✅ Subscription canceled');
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
