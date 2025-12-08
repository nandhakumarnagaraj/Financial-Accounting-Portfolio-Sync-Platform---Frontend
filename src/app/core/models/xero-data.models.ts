export interface XeroInvoice {
  // Define properties based on your Xero API response
  invoiceID: string;
  invoiceNumber: string;
  contact: { name: string };
  date: string;
  dueDate: string;
  status: string;
  total: number;
  amountDue: number;
}

export interface XeroAccount {
  // Define properties based on your Xero API response
  accountID: string;
  name: string;
  code: string;
  type: string;
  status: string;
}

export interface XeroTransaction {
  id: string; // Changed from bankTransactionID
  transactionType: string;
  contactName: string; // Changed from contact: { name: string }
  transactionDate: string; // Changed from date
  amount: number; // Changed from total, also matches sample data
  isReconciled: boolean; // Keep for internal logic, even if not displayed
  status: string; // Added from sample data
  reference: string; // Added as per user request
}

export interface SyncResponse {
  status: string;
  message: string;
}

export interface MessageResponse {
    message: string;
    lastSyncTime?: string;
}
