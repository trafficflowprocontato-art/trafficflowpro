import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Você precisa criar uma conta no Supabase e adicionar suas credenciais aqui
// 1. Vá em https://supabase.com
// 2. Crie um projeto grátis
// 3. Vá em Settings > API
// 4. Copie a URL e a anon key
// 5. Crie um arquivo .env na raiz do projeto com essas variáveis

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'SUA_ANON_KEY_AQUI';

// Verificar se as credenciais estão configuradas
if (SUPABASE_URL === 'SUA_URL_AQUI' || SUPABASE_ANON_KEY === 'SUA_ANON_KEY_AQUI') {
  console.error('⚠️ ATENÇÃO: Credenciais do Supabase não configuradas!');
  console.error('📝 Crie um arquivo .env na raiz com:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL=sua_url');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_key');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          monthly_value: number;
          payment_status: string;
          payment_date: number;
          seller_name: string;
          seller_commission: number;
          extra_expenses: any;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          monthly_value: number;
          payment_status: string;
          payment_date: number;
          seller_name: string;
          seller_commission: number;
          extra_expenses?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          monthly_value?: number;
          payment_status?: string;
          payment_date?: number;
          seller_name?: string;
          seller_commission?: number;
          extra_expenses?: any;
          created_at?: string;
        };
      };
      agency_expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          description: string;
          value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          value?: number;
          created_at?: string;
        };
      };
      seller_commissions: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          client_name: string;
          seller_name: string;
          commission_value: number;
          payment_status: string;
          paid_date: string | null;
          month: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          client_id: string;
          client_name: string;
          seller_name: string;
          commission_value: number;
          payment_status: string;
          paid_date?: string | null;
          month: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          client_name?: string;
          seller_name?: string;
          commission_value?: number;
          payment_status?: string;
          paid_date?: string | null;
          month?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Funções de autenticação
export async function signUp(email: string, password: string, name: string) {
  try {
    console.log('🔵 signUp chamado:', { email, name });
    
    // Verificar se está configurado
    if (SUPABASE_URL === 'SUA_URL_AQUI' || SUPABASE_ANON_KEY === 'SUA_ANON_KEY_AQUI') {
      throw new Error('Supabase não configurado. Por favor, configure as credenciais no arquivo .env');
    }

    console.log('🔵 Chamando supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    console.log('🔵 Resultado auth.signUp:', { data, error });

    if (error) {
      console.error('❌ Erro no auth.signUp:', error);
      throw error;
    }

    // Criar registro na tabela users
    if (data.user) {
      console.log('🔵 Usuário criado no auth, inserindo na tabela users...', {
        id: data.user.id,
        email: data.user.email,
        name
      });
      
      const { data: insertData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name,
        })
        .select();

      console.log('🔵 Resultado insert users:', { insertData, profileError });

      if (profileError) {
        console.error('❌ Erro ao inserir na tabela users:', profileError);
        throw profileError;
      }
      
      console.log('✅ Usuário criado com sucesso na tabela users!');
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Erro no registro:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Buscar dados do perfil
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Se o perfil não existe, criar automaticamente
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Perfil não encontrado, criando automaticamente...');
        
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário';
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: userName,
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          throw createError;
        }

        return { data: { ...data, profile: newProfile }, error: null };
      }

      if (profileError) throw profileError;

      return { data: { ...data, profile }, error: null };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Erro no login:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Erro ao buscar usuário (normal se não logado):', error.message);
      return { user: null, profile: null, error: null };
    }
    
    if (!user) {
      return { user: null, profile: null, error: null };
    }

    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Se o perfil não existe, criar automaticamente
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Perfil não encontrado no getCurrentUser, criando...');
      
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
      
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: userName,
        })
        .select()
        .single();

      if (createError) {
        console.log('Erro ao criar perfil:', createError.message);
        return { user: null, profile: null, error: null };
      }

      return { user, profile: newProfile, error: null };
    }

    if (profileError) {
      console.log('Erro ao buscar perfil:', profileError.message);
      return { user: null, profile: null, error: null };
    }

    return { user, profile, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
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
    console.error('Erro ao resetar senha:', error);
    return { error };
  }
}
