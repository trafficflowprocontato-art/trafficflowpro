import { create } from "zustand";
import { Client, AgencyExpense, FinancialSummary, SellerCommissionRecord } from "../types/financial";
import { supabase } from "../services/supabase";

interface FinancialState {
  clients: Client[];
  agencyExpenses: AgencyExpense[];
  sellerCommissions: SellerCommissionRecord[];
  isLoading: boolean;
  userId: string | null;
  
  // Setup
  setUserId: (userId: string) => void;
  loadData: () => Promise<void>;
  clearData: () => void;
  
  // Client actions
  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  // Agency expense actions
  addAgencyExpense: (expense: AgencyExpense) => Promise<void>;
  updateAgencyExpense: (id: string, expense: Partial<AgencyExpense>) => Promise<void>;
  deleteAgencyExpense: (id: string) => Promise<void>;
  
  // Seller commission actions
  generateCommissionsForMonth: (month: string) => Promise<void>;
  updateCommissionStatus: (id: string, status: "paid" | "pending", paidDate?: string) => Promise<void>;
  getCommissionsByMonth: (month: string) => SellerCommissionRecord[];
  
  // Financial calculations
  getFinancialSummary: () => FinancialSummary;
}

export const useFinancialStore = create<FinancialState>()((set, get) => ({
  clients: [],
  agencyExpenses: [],
  sellerCommissions: [],
  isLoading: false,
  userId: null,
  
  setUserId: (userId: string) => {
    set({ userId });
  },
  
  loadData: async () => {
    const { userId } = get();
    if (!userId) return;
    
    set({ isLoading: true });
    
    try {
      // Carregar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      
      if (clientsError) throw clientsError;
      
      // Carregar despesas
      const { data: expensesData, error: expensesError } = await supabase
        .from('agency_expenses')
        .select('*')
        .eq('user_id', userId);
      
      if (expensesError) throw expensesError;
      
      // Carregar comissões
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('seller_commissions')
        .select('*')
        .eq('user_id', userId);
      
      if (commissionsError) throw commissionsError;
      
      // Converter dados do Supabase para formato do app
      const clients: Client[] = (clientsData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        monthlyValue: parseFloat(c.monthly_value),
        paymentStatus: c.payment_status as any,
        paymentDate: c.payment_date,
        sellerName: c.seller_name,
        sellerCommission: parseFloat(c.seller_commission),
        extraExpenses: c.extra_expenses || [],
      }));
      
      const agencyExpenses: AgencyExpense[] = (expensesData || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        value: parseFloat(e.value),
        category: "Geral", // Hardcoded até adicionar coluna no Supabase
      }));
      
      const sellerCommissions: SellerCommissionRecord[] = (commissionsData || []).map((c: any) => ({
        id: c.id,
        clientId: c.client_id,
        clientName: c.client_name,
        sellerName: c.seller_name,
        commissionValue: parseFloat(c.commission_value),
        paymentStatus: c.payment_status as any,
        paidDate: c.paid_date,
        month: c.month,
      }));
      
      set({
        clients,
        agencyExpenses,
        sellerCommissions,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      set({ isLoading: false });
    }
  },
  
  clearData: () => {
    set({
      clients: [],
      agencyExpenses: [],
      sellerCommissions: [],
      userId: null,
    });
  },
  
  addClient: async (client) => {
    const { userId } = get();
    console.log('🔍 addClient - userId:', userId);
    console.log('🔍 addClient - client:', client);
    
    if (!userId) {
      console.error('❌ userId não está definido em addClient!');
      return;
    }
    
    try {
      const insertData = {
        id: client.id,
        user_id: userId,
        name: client.name,
        monthly_value: client.monthlyValue,
        payment_status: client.paymentStatus,
        payment_date: client.paymentDate,
        seller_name: client.sellerName,
        seller_commission: client.sellerCommission,
        extra_expenses: client.extraExpenses,
      };
      
      console.log('📤 Enviando cliente para Supabase:', insertData);
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert(insertData)
        .select();
      
      console.log('📥 Resposta Supabase (cliente) - data:', data);
      console.log('📥 Resposta Supabase (cliente) - error:', error);
      
      if (error) {
        console.error('❌ Erro do Supabase ao inserir cliente:', error);
        throw error;
      }
      
      console.log('✅ Cliente inserido com sucesso no Supabase!');
      
      // Atualizar estado local
      set((state) => ({ clients: [...state.clients, client] }));
      
      // Se o cliente está pago, criar comissão automaticamente
      if (client.paymentStatus === "paid") {
        console.log('💰 Cliente pago - criando comissão automaticamente...');
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        
        const newCommission: SellerCommissionRecord = {
          id: `${client.id}-${currentMonth}`,
          clientId: client.id,
          clientName: client.name,
          sellerName: client.sellerName || "Sem vendedor",
          commissionValue: (client.monthlyValue * client.sellerCommission) / 100,
          paymentStatus: "pending",
          month: currentMonth,
        };
        
        console.log('📤 Criando comissão:', newCommission);
        
        await get().updateCommissionStatus(newCommission.id, "pending");
        
        const commissionInsertData = {
          id: newCommission.id,
          user_id: userId,
          client_id: newCommission.clientId,
          client_name: newCommission.clientName,
          seller_name: newCommission.sellerName,
          commission_value: newCommission.commissionValue,
          payment_status: newCommission.paymentStatus,
          month: newCommission.month,
        };
        
        console.log('📤 Enviando comissão para Supabase:', commissionInsertData);
        
        // Salvar comissão no Supabase
        const { data: commData, error: commError } = await supabase
          .from('seller_commissions')
          .insert(commissionInsertData)
          .select();
        
        console.log('📥 Resposta Supabase (comissão) - data:', commData);
        console.log('📥 Resposta Supabase (comissão) - error:', commError);
        
        if (commError) {
          console.error('❌ Erro ao criar comissão:', commError);
          throw commError;
        }
        
        set((state) => ({
          sellerCommissions: [...state.sellerCommissions, newCommission],
        }));
        
        console.log('✅ Comissão criada com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
      console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  updateClient: async (id, updatedClient) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      // Atualizar no Supabase
      const updateData: any = {};
      if (updatedClient.name) updateData.name = updatedClient.name;
      if (updatedClient.monthlyValue !== undefined) updateData.monthly_value = updatedClient.monthlyValue;
      if (updatedClient.paymentStatus) updateData.payment_status = updatedClient.paymentStatus;
      if (updatedClient.paymentDate !== undefined) updateData.payment_date = updatedClient.paymentDate;
      if (updatedClient.sellerName) updateData.seller_name = updatedClient.sellerName;
      if (updatedClient.sellerCommission !== undefined) updateData.seller_commission = updatedClient.sellerCommission;
      if (updatedClient.extraExpenses) updateData.extra_expenses = updatedClient.extraExpenses;
      
      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Atualizar estado local
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? { ...client, ...updatedClient } : client
        ),
      }));
      
      // Regenerar comissões para o mês atual quando atualizar cliente
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      
      const { clients, sellerCommissions } = get();
      const client = clients.find((c) => c.id === id);
      
      if (client) {
        if (client.paymentStatus === "paid") {
          const existingCommission = sellerCommissions.find(
            (c) => c.clientId === id && c.month === currentMonth
          );
          
          const commissionValue = (client.monthlyValue * client.sellerCommission) / 100;
          
          if (existingCommission) {
            // Atualizar comissão existente
            await supabase
              .from('seller_commissions')
              .update({
                client_name: client.name,
                seller_name: client.sellerName || "Sem vendedor",
                commission_value: commissionValue,
              })
              .eq('id', existingCommission.id)
              .eq('user_id', userId);
            
            set((state) => ({
              sellerCommissions: state.sellerCommissions.map((commission) =>
                commission.id === existingCommission.id
                  ? {
                      ...commission,
                      clientName: client.name,
                      sellerName: client.sellerName || "Sem vendedor",
                      commissionValue,
                    }
                  : commission
              ),
            }));
          } else {
            // Criar nova comissão
            const newCommission: SellerCommissionRecord = {
              id: `${client.id}-${currentMonth}`,
              clientId: client.id,
              clientName: client.name,
              sellerName: client.sellerName || "Sem vendedor",
              commissionValue,
              paymentStatus: "pending",
              month: currentMonth,
            };
            
            await supabase
              .from('seller_commissions')
              .insert({
                id: newCommission.id,
                user_id: userId,
                client_id: newCommission.clientId,
                client_name: newCommission.clientName,
                seller_name: newCommission.sellerName,
                commission_value: newCommission.commissionValue,
                payment_status: newCommission.paymentStatus,
                month: newCommission.month,
              });
            
            set((state) => ({
              sellerCommissions: [...state.sellerCommissions, newCommission],
            }));
          }
        } else {
          // Cliente não está pago, remover comissão se existir
          await supabase
            .from('seller_commissions')
            .delete()
            .eq('client_id', id)
            .eq('month', currentMonth)
            .eq('user_id', userId);
          
          set((state) => ({
            sellerCommissions: state.sellerCommissions.filter(
              (c) => !(c.clientId === id && c.month === currentMonth)
            ),
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },
  
  deleteClient: async (id) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      // Deletar comissões relacionadas primeiro
      await supabase
        .from('seller_commissions')
        .delete()
        .eq('client_id', id)
        .eq('user_id', userId);
      
      // Deletar cliente
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Atualizar estado local
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        sellerCommissions: state.sellerCommissions.filter((commission) => commission.clientId !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  },
  
  addAgencyExpense: async (expense) => {
    const { userId } = get();
    console.log('🔍 addAgencyExpense - userId:', userId);
    console.log('🔍 addAgencyExpense - expense:', expense);
    
    if (!userId) {
      console.error('❌ userId não está definido!');
      return;
    }
    
    try {
      const insertData = {
        id: expense.id,
        user_id: userId,
        description: expense.description,
        value: expense.value,
        // category removido temporariamente - precisa adicionar coluna no Supabase
      };
      
      console.log('📤 Enviando para Supabase:', insertData);
      
      const { data, error } = await supabase
        .from('agency_expenses')
        .insert(insertData)
        .select();
      
      console.log('📥 Resposta Supabase - data:', data);
      console.log('📥 Resposta Supabase - error:', error);
      
      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      set((state) => ({
        agencyExpenses: [...state.agencyExpenses, expense],
      }));
      
      console.log('✅ Despesa adicionada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa:', error);
      throw error;
    }
  },
  
  updateAgencyExpense: async (id, updatedExpense) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      const updateData: any = {};
      if (updatedExpense.description) updateData.description = updatedExpense.description;
      if (updatedExpense.value !== undefined) updateData.value = updatedExpense.value;
      // category removido temporariamente - precisa adicionar coluna no Supabase
      
      const { error } = await supabase
        .from('agency_expenses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set((state) => ({
        agencyExpenses: state.agencyExpenses.map((expense) =>
          expense.id === id ? { ...expense, ...updatedExpense } : expense
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  },
  
  deleteAgencyExpense: async (id) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('agency_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set((state) => ({
        agencyExpenses: state.agencyExpenses.filter((expense) => expense.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  },
  
  generateCommissionsForMonth: async (month: string) => {
    const { clients, sellerCommissions, userId } = get();
    if (!userId) return;
    
    const paidClients = clients.filter((c) => c.paymentStatus === "paid");
    
    const validClientIds = paidClients.map((c) => c.id);
    const existingCommissions = sellerCommissions.filter(
      (c) => c.month === month && validClientIds.includes(c.clientId)
    );
    
    const existingClientIds = existingCommissions.map((c) => c.clientId);
    const clientsNeedingCommission = paidClients.filter(
      (client) => !existingClientIds.includes(client.id)
    );
    
    if (clientsNeedingCommission.length > 0) {
      const newCommissions: SellerCommissionRecord[] = clientsNeedingCommission.map((client) => ({
        id: `${client.id}-${month}`,
        clientId: client.id,
        clientName: client.name,
        sellerName: client.sellerName || "Sem vendedor",
        commissionValue: (client.monthlyValue * client.sellerCommission) / 100,
        paymentStatus: "pending",
        month,
      }));
      
      // Inserir no Supabase
      const commissionsToInsert = newCommissions.map((c) => ({
        id: c.id,
        user_id: userId,
        client_id: c.clientId,
        client_name: c.clientName,
        seller_name: c.sellerName,
        commission_value: c.commissionValue,
        payment_status: c.paymentStatus,
        month: c.month,
      }));
      
      const { error } = await supabase
        .from('seller_commissions')
        .insert(commissionsToInsert);
      
      if (error) throw error;
      
      set((state) => ({
        sellerCommissions: [...state.sellerCommissions, ...newCommissions],
      }));
    }
    
    // Atualizar comissões existentes
    for (const client of paidClients) {
      const commission = sellerCommissions.find(
        (c) => c.month === month && c.clientId === client.id
      );
      
      if (commission) {
        const newCommissionValue = (client.monthlyValue * client.sellerCommission) / 100;
        
        await supabase
          .from('seller_commissions')
          .update({
            client_name: client.name,
            seller_name: client.sellerName || "Sem vendedor",
            commission_value: newCommissionValue,
          })
          .eq('id', commission.id)
          .eq('user_id', userId);
      }
    }
    
    // Recarregar dados
    await get().loadData();
  },
  
  updateCommissionStatus: async (id, status, paidDate) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('seller_commissions')
        .update({
          payment_status: status,
          paid_date: paidDate || null,
        })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set((state) => ({
        sellerCommissions: state.sellerCommissions.map((commission) =>
          commission.id === id
            ? { ...commission, paymentStatus: status, paidDate }
            : commission
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar status da comissão:', error);
      throw error;
    }
  },
  
  getCommissionsByMonth: (month: string) => {
    const { sellerCommissions } = get();
    return sellerCommissions.filter((c) => c.month === month);
  },
  
  getFinancialSummary: () => {
    const { clients, agencyExpenses, sellerCommissions } = get();
    
    const paidClients = clients.filter((client) => client.paymentStatus === "paid");
    
    const totalRevenue = paidClients.reduce(
      (sum, client) => sum + client.monthlyValue,
      0
    );
    
    const totalCommissions = sellerCommissions
      .filter((commission) => commission.paymentStatus === "paid")
      .reduce((sum, commission) => sum + commission.commissionValue, 0);
    
    const totalExtraExpenses = clients.reduce(
      (sum, client) =>
        sum +
        client.extraExpenses.reduce(
          (expSum, exp) => expSum + exp.value,
          0
        ),
      0
    );
    
    const totalAgencyExpenses = agencyExpenses.reduce(
      (sum, expense) => sum + expense.value,
      0
    );
    
    const totalExpenses =
      totalCommissions + totalExtraExpenses + totalAgencyExpenses;
    
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      totalCommissions,
      totalExtraExpenses,
      totalAgencyExpenses,
      netProfit,
    };
  },
}));
