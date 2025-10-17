// Tipos para o sistema de assinaturas

export type PlanId = 'starter' | 'pro' | 'premium';

export type SubscriptionStatus = 
  | 'trialing'      // Em período de trial
  | 'active'        // Assinatura ativa e paga
  | 'past_due'      // Pagamento atrasado
  | 'canceled'      // Cancelada
  | 'incomplete';   // Pagamento incompleto

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  features: string[];
  maxClients: number; // -1 para ilimitado
  popular?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: PlanId;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCheck {
  hasAccess: boolean;
  isTrialing: boolean;
  isActive: boolean;
  isPastDue: boolean;
  daysLeftInTrial: number | null;
  currentPlan: Plan | null;
  subscription: Subscription | null;
}
