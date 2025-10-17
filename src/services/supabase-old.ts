import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'SUA_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// FUNÇÕES DE AUTENTICAÇÃO SIMPLIFICADAS (SEM TABELA USERS)

export async function signUp(email: string, password: string, name: string) {
  try {
    console.log('🔵 Iniciando registro:', { email, name });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('❌ Erro no signUp:', error);
      throw error;
    }

    console.log('✅ Usuário criado com sucesso!', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Erro crítico no registro:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('🔵 Tentando login:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }

    // Criar objeto profile a partir dos metadados
    const profile = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
      created_at: data.user.created_at
    };

    console.log('✅ Login bem-sucedido!');
    return { data: { ...data, profile }, error: null };
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('❌ Erro no logout:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, profile: null, error: null };
    }

    // Criar objeto profile a partir dos metadados
    const profile = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      created_at: user.created_at
    };

    return { user, profile, error: null };
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuário:', error);
    return { user: null, profile: null, error: null };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://trafficflowpro.com/reset-password',
    });
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('❌ Erro ao resetar senha:', error);
    return { error };
  }
}
