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

export async function signUp(email: string, password: string, name: string) {
  try {
    console.log('✅ Iniciando registro:', { email, name });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;
    console.log('✅ Usuário criado!', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'Usuário',
      created_at: data.user.created_at
    };

    return { data: { ...data, profile }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { user: null, profile: null, error: null };

    const profile = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || 'Usuário',
      created_at: user.created_at
    };

    return { user, profile, error: null };
  } catch (error: any) {
    return { user: null, profile: null, error: null };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  } catch (error: any) {
    return { error };
  }
}
