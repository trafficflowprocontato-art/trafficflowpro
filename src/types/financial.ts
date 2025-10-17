export type PaymentStatus = "paid" | "pending" | "overdue";
export type CommissionPaymentStatus = "paid" | "pending";

export interface Client {
  id: string;
  name: string;
  monthlyValue: number;
  paymentDate: number; // Day of month (1-31)
  paymentStatus: PaymentStatus;
  sellerCommission: number; // Percentage
  sellerName: string; // Nome do vendedor
  extraExpenses: ExtraExpense[];
}

export interface ExtraExpense {
  id: string;
  description: string;
  value: number;
}

export interface AgencyExpense {
  id: string;
  description: string;
  value: number;
  category: string;
}

export interface SellerCommissionRecord {
  id: string;
  clientId: string;
  clientName: string;
  sellerName: string;
  commissionValue: number;
  paymentStatus: CommissionPaymentStatus;
  month: string; // formato: "2025-10"
  paidDate?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalCommissions: number;
  totalExtraExpenses: number;
  totalAgencyExpenses: number;
  netProfit: number;
}
