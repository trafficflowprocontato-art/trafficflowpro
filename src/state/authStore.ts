import { create } from "zustand";
import { signUp, signIn, signOut, getCurrentUser } from "../services/supabase";
import { useFinancialStore } from "./financialStore";
import type { Subscription, SubscriptionCheck } from "../types/subscription";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface TrialInfo {
  daysLeft: number;
  isExpired: boolean;
  hasFullAccess: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  subscriptionCheck: SubscriptionCheck | null;
  trialInfo: TrialInfo | null;
  
  // Actions
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (name: string) => void;
  checkSubscription: () => Promise<void>;
  calculateTrialInfo: () => TrialInfo;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  subscription: null,
  subscriptionCheck: null,
  trialInfo: null,
  
  register: async (email: string, password: string, name: string) => {
    try {
      // Validações
      if (!email || !password || !name) {
        return { success: false, error: "Preencha todos os campos" };
      }
      
      // Limpar espaços
      email = email.trim();
      name = name.trim();
      
      if (email.length > 254) {
        return { success: false, error: "Email muito longo (máximo 254 caracteres)" };
      }
      
      if (name.length > 255) {
        return { success: false, error: "Nome muito longo (máximo 255 caracteres)" };
      }
      
      if (name.length < 2) {
        return { success: false, error: "Nome muito curto (mínimo 2 caracteres)" };
      }
      
      if (password.length < 6) {
        return { success: false, error: "A senha deve ter no mínimo 6 caracteres" };
      }

      if (!email.includes("@") || !email.includes(".")) {
        return { success: false, error: "Email inválido" };
      }
      
      // Registrar no Supabase
      const { data, error } = await signUp(email, password, name);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name,
          created_at: data.user.created_at,
        };
        
        set({
          user,
          isAuthenticated: true,
        });
        
        // Calcular trial info
        get().calculateTrialInfo();
        
        // Carregar dados financeiros do Supabase
        useFinancialStore.getState().setUserId(user.id);
        await useFinancialStore.getState().loadData();
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro no registro:", error);
      let errorMessage = "Erro ao registrar usuário";
      
      if (error.message?.includes("already registered")) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message?.includes("email address is too long")) {
        errorMessage = "Email muito longo. Use um email válido.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { success: false, error: "Preencha email e senha" };
      }
      
      // Login no Supabase
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        const profile = (data as any).profile;
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || data.user.email!,
          created_at: data.user.created_at,
        };
        
        set({
          user,
          isAuthenticated: true,
        });
        
        // Carregar dados financeiros do Supabase
        useFinancialStore.getState().setUserId(user.id);
        await useFinancialStore.getState().loadData();
        
        // Verificar assinatura
        await get().checkSubscription();
        
        // Calcular trial info
        get().calculateTrialInfo();
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro no login:", error);
      let errorMessage = "Email ou senha incorretos";
      
      if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  logout: async () => {
    try {
      await signOut();
      
      // Limpar dados financeiros
      useFinancialStore.getState().clearData();
      
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  },
  
  checkSession: async () => {
    try {
      set({ isLoading: true });
      
      const { user, profile, error } = await getCurrentUser();
      
      if (error || !user || !profile) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }
      
      set({
        user: {
          id: user.id,
          email: user.email!,
          name: profile.name,
          created_at: user.created_at,
        },
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Carregar dados financeiros do Supabase apenas se houver usuário
      if (user && user.id) {
        useFinancialStore.getState().setUserId(user.id);
        await useFinancialStore.getState().loadData();
        
        // Verificar assinatura
        await get().checkSubscription();
        
        // Calcular trial info
        get().calculateTrialInfo();
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  
  updateProfile: (name: string) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, name },
      });
    }
  },

  checkSubscription: async () => {
    const { user } = get();
    if (!user) {
      set({ subscription: null, subscriptionCheck: null });
      return;
    }

    try {
      const { supabase } = require('../services/supabase');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // PGRST116 = no rows found (normal para usuários sem subscription paga)
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }
      
      if (!data) {
        // Sem subscription no banco = usar trial gratuito
        console.log('📝 Nenhuma subscription encontrada - usando trial gratuito de 7 dias');
        set({ 
          subscription: null,
          subscriptionCheck: {
            hasAccess: false,
            isTrialing: false,
            isActive: false,
            isPastDue: false,
            daysLeftInTrial: null,
            currentPlan: null,
            subscription: null,
          }
        });
        return;
      }

      const subscription: Subscription = data;
      const now = new Date();
      
      // Check if trialing
      const isTrialing = subscription.status === 'trialing';
      const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
      const daysLeftInTrial = trialEndsAt 
        ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Check if active
      const isActive = subscription.status === 'active';
      const isPastDue = subscription.status === 'past_due';

      // Has access if trialing with time left, or active
      const hasAccess = 
        (isTrialing && daysLeftInTrial !== null && daysLeftInTrial > 0) ||
        isActive;

      // Get current plan
      const { PLANS } = require('../config/plans');
      const currentPlan = PLANS[subscription.plan_id] || null;

      const check: SubscriptionCheck = {
        hasAccess,
        isTrialing,
        isActive,
        isPastDue,
        daysLeftInTrial,
        currentPlan,
        subscription,
      };

      set({ subscription, subscriptionCheck: check });
    } catch (error) {
      console.error('Error checking subscription:', error);
      set({ 
        subscription: null,
        subscriptionCheck: {
          hasAccess: false,
          isTrialing: false,
          isActive: false,
          isPastDue: false,
          daysLeftInTrial: null,
          currentPlan: null,
          subscription: null,
        }
      });
    }
  },

  calculateTrialInfo: () => {
    const { user, subscription } = get();
    
    // Se tem subscription ativa, tem acesso completo
    if (subscription && subscription.status === 'active') {
      const trialInfo: TrialInfo = {
        daysLeft: 999,
        isExpired: false,
        hasFullAccess: true,
      };
      set({ trialInfo });
      return trialInfo;
    }

    // Se não tem usuário, sem acesso
    if (!user || !user.created_at) {
      const trialInfo: TrialInfo = {
        daysLeft: 0,
        isExpired: true,
        hasFullAccess: false,
      };
      set({ trialInfo });
      return trialInfo;
    }

    // Calcular dias desde registro
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const daysSinceRegistration = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysSinceRegistration);
    const isExpired = daysLeft === 0;
    const hasFullAccess = !isExpired;

    const trialInfo: TrialInfo = {
      daysLeft,
      isExpired,
      hasFullAccess,
    };

    set({ trialInfo });
    return trialInfo;
  },
}));
