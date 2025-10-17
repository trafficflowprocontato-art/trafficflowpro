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
    console.log('🔵 [supabase] signUp chamado');
    
    // 1. Criar usuário no auth (sem autoConfirm para evitar trigger)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: undefined,
      },
    });

    console.log('🔵 [supabase] auth.signUp resultado:', { authData: !!authData, authError: authError?.message });

    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log('🔵 [supabase] Usuário criado no auth, ID:', authData.user.id);

    // 2. Inserir manualmente na tabela users (SEM depender de trigger)
    try {
      console.log('🔵 [supabase] Inserindo na tabela users...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: name,
          created_at: authData.user.created_at,
        });

      if (insertError) {
        console.error('⚠️ [supabase] Erro ao inserir em users (não crítico):', insertError);
        // NÃO throw - deixa continuar mesmo se falhar
      } else {
        console.log('✅ [supabase] Inserido na tabela users com sucesso!');
      }
    } catch (insertErr) {
      console.error('⚠️ [supabase] Erro ao inserir em users (ignorado):', insertErr);
      // Ignora erro da tabela users - o importante é que o auth funcionou
    }

    console.log('✅ [supabase] signUp completo!');
    return { data: authData, error: null };
  } catch (error: any) {
    console.error('❌ [supabase] Erro no signUp:', error);
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
