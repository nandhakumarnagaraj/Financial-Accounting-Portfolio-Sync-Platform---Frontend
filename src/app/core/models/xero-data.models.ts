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
  // Define properties based on your Xero API response
  bankTransactionID: string;
  contact: { name: string };
  date: string;
  total: number;
  isReconciled: boolean;
}

export interface SyncResponse {
  status: string;
  message: string;
}

export interface MessageResponse {
    message: string;
}
