export interface DashboardStatsResponse {
  totalInvoices: number;
  totalAccounts: number;
  totalTransactions: number;
  totalInvoiceAmount: number;
  totalOutstandingAmount: number;
  xeroConnected: boolean;
  username: string;
  invoices: any[]; // Replace with specific invoice model
  accounts: any[]; // Replace with specific account model
  transactions: any[]; // Replace with specific transaction model
}
