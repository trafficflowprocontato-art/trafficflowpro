import { Platform } from 'react-native';

// Use relative URLs to avoid CORS issues with www/non-www
const API_BASE = Platform.OS === 'web' && typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://trafficflowpro.com';

// Criar sessão de checkout do Stripe
export async function createCheckoutSession(priceId: string, userId: string, userEmail: string) {
  try {
    const response = await fetch(`${API_BASE}/api/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const session = await response.json();
    return { url: session.url, sessionId: session.sessionId, error: null };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { url: null, sessionId: null, error: error.message };
  }
}

// Redirecionar para o Stripe Checkout
export function redirectToCheckout(checkoutUrl: string) {
  if (Platform.OS === 'web') {
    window.location.href = checkoutUrl;
  } else {
    // No mobile, abrir no navegador
    // Linking.openURL(checkoutUrl);
  }
}

// Criar portal do cliente (para gerenciar assinatura)
export async function createCustomerPortalSession(customerId: string) {
  try {
    const response = await fetch(`${API_BASE}/api/create-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create portal session');
    }

    const session = await response.json();
    return { url: session.url, error: null };
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return { url: null, error: error.message };
  }
}

// Wrapper para criar portal session usando userId (busca o customer do Supabase)
export async function createPortalSession(userId: string) {
  try {
    // Buscar o stripe_customer_id do Supabase
    const { supabase } = require('./supabase');
    const { data, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (error || !data?.stripe_customer_id) {
      throw new Error('Customer ID not found');
    }

    return await createCustomerPortalSession(data.stripe_customer_id);
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return { url: null, error: error.message };
  }
}

// Redirecionar para o portal do Stripe
export function redirectToPortal(portalUrl: string) {
  if (Platform.OS === 'web') {
    window.location.href = portalUrl;
  } else {
    // No mobile, abrir no navegador
    // Linking.openURL(portalUrl);
  }
}
