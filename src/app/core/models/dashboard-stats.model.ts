export interface Invoice {
  id: number;
  invoiceNumber: string;
  contactName: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  amountDue: number;
}

export interface Account {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  status: string;
}

export interface Transaction {
  id: number;
  transactionType: string;
  contactName: string;
  transactionDate: string;
  amount: number;
  accountCode: string | null;
  accountName: string | null;
  description: string | null;
  reference: string | null;
  status: string;
}

export interface DashboardStatsResponse {
  totalInvoices: number;
  totalAccounts: number;
  totalTransactions: number;
  totalInvoiceAmount: number;
  totalOutstandingAmount: number;
  xeroConnected: boolean;
  username: string;
  invoices: Invoice[];
  accounts: Account[];
  transactions: Transaction[];
}