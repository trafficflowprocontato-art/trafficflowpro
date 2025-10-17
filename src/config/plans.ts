import { Plan } from '../types/subscription';

// Price IDs do Stripe (MODO TESTE)
export const PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: 'price_1SIK6mFqUjYdOvCqVPk3Wpna',
    features: [
      'Até 20 clientes',
      'Dashboard completo',
      'Gestão de vendedores',
      'Controle de despesas',
      'Suporte por email',
    ],
    maxClients: 20,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: 'price_1SIK7kFqUjYdOvCqKEoV3SUV',
    features: [
      'Até 50 clientes',
      'Dashboard completo',
      'Gestão de vendedores',
      'Controle de despesas',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    maxClients: 50,
    popular: true, // Badge de "Popular"
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    priceId: 'price_1SIK8DFqUjYdOvCqAhSlRy22',
    features: [
      'Clientes ilimitados',
      'Dashboard completo',
      'Gestão de vendedores',
      'Controle de despesas',
      'Relatórios avançados',
      'Suporte VIP 24/7',
      'Acesso antecipado a novidades',
    ],
    maxClients: -1, // Ilimitado
  },
};

export const TRIAL_DAYS = 7;
