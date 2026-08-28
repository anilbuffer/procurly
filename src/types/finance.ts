// PROCURly Finance Portal Types & Models

export type FinanceRole =
  | 'Financial Controller'
  | 'Senior Finance Manager'
  | 'Credit & Collections Lead'
  | 'Accounts & Reconciliation Officer'
  | 'Financial Compliance Auditor';

export interface FinanceStaffUser {
  id: string;
  name: string;
  email: string;
  role: FinanceRole;
  avatar: string;
  phone: string;
  permissions: string[];
  department: string;
}

export type PaymentMethodType =
  | 'Card'
  | 'Credit Card (Stripe)'
  | 'Bank Transfer'
  | 'Account2Account'
  | 'Trade Credit'
  | 'Direct Debit';

export type PaymentStatusType =
  | 'Received'
  | 'Pending'
  | 'Processing'
  | 'Failed'
  | 'Credit Approved'
  | 'Refunded'
  | 'Partially Refunded'
  | 'Reversed';

export interface FinancePayment {
  id: string; // e.g. PAY-00123
  requestNumber: string; // e.g. AH-P-000123
  orderNumber?: string; // e.g. ORD-2026-0089
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number; // NZD
  subtotal: number;
  freight: number;
  gst: number; // 15% NZ GST
  method: PaymentMethodType;
  status: PaymentStatusType;
  paymentDate: string;
  dueDate?: string;
  gatewayReference?: string; // Stripe ch_3Nx... or ANZ-Ref-992
  authCode?: string;
  bankAccountLast4?: string;
  cardBrand?: string;
  cardLast4?: string;
  allocatedBy?: string;
  internalNotes?: string[];
  failureReason?: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  quoteNumber?: string;
  partsSummary: string;
  vehicleSummary: string;
  auditTrail: FinanceAuditEntry[];
}

export interface FinanceAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface AwaitingPaymentItem {
  id: string;
  requestNumber: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  contactEmail: string;
  contactPhone: string;
  quoteValue: number;
  amountDue: number;
  quoteDate: string;
  dueDate: string;
  daysOutstanding: number;
  agingBucket: 'Current' | '1-7 Days' | '8-30 Days' | '30+ Days';
  status: 'Due Soon' | 'Due Today' | 'Overdue' | 'Reminder Sent' | 'Escalated' | 'Pending Bank Confirmation';
  paymentMethodExpected: PaymentMethodType;
  lastReminderDate?: string;
  reminderCount: number;
  notes?: string;
}

export type TransactionType = 'Payment' | 'Refund' | 'Adjustment' | 'Credit' | 'Charge';

export interface FinanceTransaction {
  id: string; // TXN-998231
  reference: string; // PAY-00123 or REF-0089
  requestNumber: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: 'NZD';
  method: PaymentMethodType;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reconciled' | 'Under Investigation';
  gatewayId: string;
  channel: 'Online Portal' | 'Virtual Terminal' | 'Direct Bank Wire' | 'Trade Ledger';
  timestamp: string;
  reconciledAt?: string;
  reconciledBy?: string;
  description: string;
}

export type CreditAccountStatus = 'Active' | 'Near Limit' | 'Overdue' | 'Suspended' | 'On Hold' | 'Pending Review';

export interface CreditAccount {
  id: string; // ACC-CR-001
  customerId: string;
  customerName: string;
  nzbn: string;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  utilizationPct: number;
  outstandingAmount: number;
  overdueAmount: number;
  paymentTerms: string; // e.g. "20th of Month Following", "Net 30 Days"
  status: CreditAccountStatus;
  riskRating: 'Low' | 'Medium' | 'High' | 'Severe';
  approvedDate: string;
  approvedBy: string;
  reviewDate: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  creditTransactions: CreditLedgerEntry[];
  holdsHistory: CreditHoldRecord[];
}

export interface CreditLedgerEntry {
  id: string;
  date: string;
  orderNumber: string;
  description: string;
  debit: number; // increased credit used
  credit: number; // payment made, restored credit
  balance: number;
  recordedBy: string;
}

export interface CreditHoldRecord {
  id: string;
  date: string;
  action: 'Placed on Hold' | 'Suspended' | 'Limit Adjusted' | 'Hold Lifted' | 'Credit Approved';
  reason: string;
  performedBy: string;
}

export type RefundStatus =
  | 'Requested'
  | 'Under Review'
  | 'Approved'
  | 'Processing'
  | 'Refunded'
  | 'Rejected'
  | 'Failed';

export interface RefundItem {
  id: string; // REF-0089
  paymentId: string; // PAY-00123
  requestNumber: string; // AH-P-000123
  orderNumber?: string;
  customerId: string;
  customerName: string;
  originalAmount: number;
  refundAmount: number;
  reason:
    | 'Part Unavailable at Origin'
    | 'Duplicate Payment Settled'
    | 'Customer Cancellation Before Dispatch'
    | 'Damaged Goods in Transit'
    | 'Pricing Adjustment / Freight Rebate'
    | 'Wrong Part Supplied by Source';
  detailedReason: string;
  status: RefundStatus;
  requestedBy: string;
  requestedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  processedBy?: string;
  processedDate?: string;
  refundMethod: PaymentMethodType;
  destinationAccountRef: string;
  approvalHistory: {
    stage: string;
    actor: string;
    timestamp: string;
    outcome: 'Pending' | 'Approved' | 'Rejected';
    comments?: string;
  }[];
  auditTrail: FinanceAuditEntry[];
}

export type FinancialExceptionType =
  | 'Payment Failed'
  | 'Payment Reversed'
  | 'Duplicate Payment'
  | 'Incorrect Amount'
  | 'Refund Failed'
  | 'Credit Limit Exceeded'
  | 'Payment Mismatch'
  | 'Transaction Error'
  | 'Customer Account Hold';

export type FinancialExceptionStage =
  | 'Detect'
  | 'Review'
  | 'Assign'
  | 'Investigate'
  | 'Take Action'
  | 'Resolve'
  | 'Close';

export interface FinancialException {
  id: string; // EXC-FIN-0041
  type: FinancialExceptionType;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  stage: FinancialExceptionStage;
  requestNumber: string;
  paymentId?: string;
  customerId: string;
  customerName: string;
  amountAtRisk: number;
  detectedAt: string;
  assignedOfficer: string;
  assignedOfficerAvatar: string;
  summary: string;
  investigationFindings?: string;
  resolutionNotes?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  timeline: {
    stage: FinancialExceptionStage;
    timestamp: string;
    actor: string;
    note: string;
  }[];
}

export interface FinanceCustomerQuote {
  id: string; // QUO-2026-0812
  quoteNumber: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  vehicleSummary: string;
  partsSummary: string;
  partsSubtotal: number;
  freightCost: number;
  customsDuty: number;
  marginAmount: number;
  gstAmount: number;
  totalAmount: number;
  quoteDate: string;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Approved by Customer' | 'Expired' | 'Rejected';
  paymentStatus: 'Awaiting Payment' | 'Paid' | 'Credit Approved' | 'Pending';
  financialClearanceReady: boolean;
  clearedForProcurement: boolean;
}

export type OrderClearanceStatus =
  | 'Customer Approved'
  | 'Awaiting Payment'
  | 'Payment Received'
  | 'Credit Verification'
  | 'Financially Cleared'
  | 'Payment Exception'
  | 'On Hold';

export interface ApprovedOrderFinance {
  id: string; // ORD-2026-0089
  orderNumber: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  partsCost: number;
  freightCost: number;
  margin: number;
  gst: number;
  orderDate: string;
  approvedDate: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  clearanceStatus: OrderClearanceStatus;
  creditVerified: boolean;
  clearedAt?: string;
  clearedBy?: string;
  releasedToProcurementAt?: string;
  procurementPoRef?: string;
  notes?: string;
  parts: {
    name: string;
    partNumber: string;
    qty: number;
    unitPrice: number;
  }[];
}

export interface CustomerFinancialProfile {
  id: string; // cus_autocare_akl
  name: string;
  nzbn: string;
  legalEntity: string;
  accountType: 'Trade Credit Account' | 'Cash / Pre-Payment Only' | 'Fleet Enterprise';
  accountStatus: 'Active' | 'On Hold' | 'Suspended' | 'Under Review';
  creditStatus: 'Active' | 'Near Limit' | 'Overdue' | 'Suspended' | 'No Credit Facility';
  creditLimit: number;
  currentExposure: number;
  availableCredit: number;
  utilizationPct?: number;
  outstandingBalance: number;
  overdueBalance: number;
  lifetimeRevenue: number;
  lifetimeOrdersCount: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  paymentBehaviour: 'Excellent (100% on time)' | 'Good (94% on time)' | 'Watchlist (Delayed)' | 'High Risk (Repeated Overdue)';
  creditTerms: string;
  billingEmail: string;
  phone: string;
  address: string;
  financialNotes: string;
}

export interface FinanceTask {
  id: string;
  title: string;
  category:
    | 'Verify Payment'
    | 'Review Failed Payment'
    | 'Confirm Credit Account'
    | 'Process Refund'
    | 'Review Outstanding Payment'
    | 'Verify Customer Payment'
    | 'Reconcile Transaction'
    | 'Resolve Financial Exception';
  priority: 'Urgent' | 'High' | 'Normal';
  dueDate: string;
  dueCategory: 'Urgent' | 'Due Today' | 'Upcoming' | 'Completed';
  targetUrl: string;
  referenceId: string;
  assignedTo: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface FinanceNotification {
  id: string;
  title: string;
  description: string;
  category:
    | 'Payment Received'
    | 'Payment Failed'
    | 'Payment Overdue'
    | 'Refund Requested'
    | 'Refund Approved'
    | 'Credit Limit Reached'
    | 'Credit Account Suspended'
    | 'Financial Exception'
    | 'Reconciliation Required';
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  severity: 'Critical' | 'Warning' | 'Success' | 'Info';
  targetUrl: string;
}

export interface FinanceDocument {
  id: string; // DOC-INV-9921
  documentNumber: string;
  category: 'Invoice' | 'Payment Receipt' | 'Refund Note' | 'Credit Statement' | 'Remittance Advice' | 'Tax Certificate';
  title: string;
  requestNumber?: string;
  paymentNumber?: string;
  orderNumber?: string;
  customerName: string;
  customerId: string;
  amount: number;
  currency: 'NZD';
  issueDate: string;
  dueDate?: string;
  status: 'Issued' | 'Paid' | 'Void' | 'Overdue' | 'Processed';
  fileSize: string;
  fileFormat: 'PDF' | 'CSV' | 'XLSX';
}
