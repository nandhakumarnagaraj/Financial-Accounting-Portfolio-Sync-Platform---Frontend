export interface XeroInvoiceDTO {
  id: number;
  invoiceNumber: string;
  contactName: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  amountDue: number;
}

export interface XeroAccountDTO {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  status: string;
}

export interface XeroTransactionDTO {
  id: number;
  transactionType: string;
  contactName: string;
  transactionDate: string;
  amount: number;
  accountCode: string;
  accountName: string;
  description: string;
  status: string;
}

export interface SyncResponseDTO {
  status: string;
  message: string;
}

export interface SyncStatusResponse {
  connected: boolean;
  hasTenantId: boolean;
  tokenExpiry?: string;
  message: string;
}

export interface DashboardStats {
  totalInvoices: number;
  username: string;
  xeroConnected: boolean;
}

export interface XeroAuthResponse {
  authorizationUrl: string;
  message: string;
}

export interface XeroCallbackResponse {
  status: string;
  message: string;
  userId: number;
}

export interface SyncAllResponse {
  status: string;
  results: {
    invoices: SyncResponseDTO;
    accounts: SyncResponseDTO;
    transactions: SyncResponseDTO;
  };
  message: string;
}