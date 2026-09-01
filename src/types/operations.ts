// PROCURly Operations Portal Types & Data Models

export type OperationsRole = 'Operations' | 'Procurement' | 'Finance';

export interface OperationsStaffUser {
  id: string;
  name: string;
  email: string;
  role: OperationsRole;
  roleTitle: string;
  avatar: string;
  department: string;
  phone: string;
  permissions: {
    canManageRequests: boolean;
    canAssignStaff: boolean;
    canSourceParts: boolean;
    canAddSupplierQuotes: boolean;
    canCreateCustomerQuotes: boolean;
    canManageProcurementOrders: boolean;
    canUpdateShipments: boolean;
    canManageExceptions: boolean;
    canManagePayments: boolean;
    canIssueRefunds: boolean;
    canApproveCustomers: boolean;
    canManageUsers: boolean;
    canConfigureSystem: boolean;
    canViewAuditLogs: boolean;
    canViewFinancialReports: boolean;
  };
}

export type OperationalRequestStatus =
  | 'Request Submitted'
  | 'Sourcing'
  | 'Quote Ready'
  | 'Awaiting Customer Approval'
  | 'Customer Approved'
  | 'Awaiting Payment'
  | 'Payment Received'
  | 'Ordered From Supplier'
  | 'Received At Shipping Facility'
  | 'In Transit'
  | 'Arrived In New Zealand'
  | 'Customs Clearance'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Closed'
  // Exception / Alternate states
  | 'Payment Failed'
  | 'On Hold'
  | 'Procurement Exception'
  | 'Logistics Exception'
  | 'Cancelled'
  | 'Refunded';

export type RequestPriority = 'Normal' | 'High' | 'Urgent';

export type SupplierAvailability = 'In Stock' | '1–3 Days' | '4–7 Days' | 'Backorder' | 'Unknown';

export interface SupplierQuote {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  partDescription: string;
  partCostNZD: number;
  availability: SupplierAvailability;
  estimatedDispatchDays: string;
  supplierFreightNZD: number;
  supplierHandlingNZD?: number;
  totalSupplierCostNZD: number;
  notes?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isSelected?: boolean;
  quotedAt: string;
  quotedBy: string;
  validUntil: string;
}

export interface LandedCostCalculation {
  supplierCostNZD: number;
  supplierFreightNZD: number;
  handlingCostNZD: number;
  otherCostsNZD: number;
  totalInternalCostNZD: number;
  marginPercentage: number;
  marginAmountNZD: number;
  finalCustomerPriceNZD: number;
  dutiesAndBiosecurityNZD: number;
  localCourierNZD: number;
  gstNZD: number;
}

export interface CustomerQuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceNZD: number;
  totalPriceNZD: number;
}

export interface CustomerQuoteOption {
  id: string;
  freightType: 'Air Freight' | 'Sea Freight' | 'Air Express';
  transitEstimate: string; // e.g. "5–8 business days"
  isRecommended?: boolean;
  partCostNZD: number;
  freightCostNZD: number;
  procurementServiceNZD: number;
  totalNZD: number;
}

export interface CustomerQuoteData {
  quoteNumber: string; // e.g. "QUO-000123-v3"
  version: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined' | 'Expired' | 'Revised';
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  sentBy?: string;
  items: CustomerQuoteItem[];
  freightOptions: CustomerQuoteOption[];
  selectedFreightId?: string;
  totalAmountNZD: number;
  termsVersion: string;
  acceptanceRecord?: {
    acceptedBy: string;
    acceptedAt: string;
    termsVersion: string;
    quoteVersion: string;
    signatureVerified: boolean;
    ipAddress?: string;
  };
}

export interface OperationTimelineEvent {
  id: string;
  stage: string;
  timestamp: string;
  user: string;
  action: string;
  note?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export interface OperationalMessage {
  id: string;
  requestId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Customer' | 'Operations' | 'Procurement' | 'Finance' | 'System';
  timestamp: string;
  content: string;
  isInternalOnly: boolean; // CRITICAL: true = internal note, false = customer visible
  attachments?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
}

export interface OperationalDocument {
  id: string;
  title: string;
  category:
    | 'Supplier Quotes'
    | 'Customer Quotes'
    | 'Invoices'
    | 'Payment Receipts'
    | 'Procurement Documents'
    | 'Shipping Documents'
    | 'Customer Attachments';
  requestId: string;
  requestNumber: string;
  customerName?: string;
  supplierName?: string;
  date: string;
  fileFormat: 'PDF' | 'DOCX' | 'PNG' | 'JPG' | 'CSV' | 'XLSX';
  fileSizeBytes: number;
  fileSizeFormatted: string;
  uploadedBy: string;
  isInternalOnly: boolean;
  downloadUrl?: string;
}

export interface OperationalPartRequest {
  id: string;
  referenceNumber: string; // e.g. AH-P-000123
  customerName: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  deliveryBranch: string;
  submittedDate: string;
  updatedAt: string;
  status: OperationalRequestStatus;
  priority: RequestPriority;
  ownerName: string;
  ownerId: string;
  vehicle: {
    vin: string;
    year: number;
    make: string;
    model: string;
    rego?: string;
    subModel?: string;
    engineCode?: string;
    chassisCode?: string;
    transmission?: string;
  };
  part: {
    name: string;
    partNumber?: string;
    quantity: number;
    qualityPreference: 'Genuine OEM' | 'Genuine' | 'Aftermarket' | 'No Preference';
    conditionPreference: 'New' | 'Grade A Used' | 'Reconditioned' | 'No Preference';
    description?: string;
    vehicleSide?: 'Front' | 'Rear' | 'Left (Passenger)' | 'Right (Driver)' | 'Engine Bay' | 'Underbody';
    images?: string[];
  };
  sourcing: {
    status: 'Not Started' | 'In Progress' | 'Quotes Received' | 'Supplier Selected';
    supplierQuotes: SupplierQuote[];
    selectedSupplierQuoteId?: string;
  };
  landedCost?: LandedCostCalculation;
  customerQuote?: CustomerQuoteData;
  procurementOrder?: {
    orderNumber: string;
    supplierName: string;
    status: 'Ordered From Supplier' | 'Received At Shipping Facility' | 'Dispatched' | 'Completed';
    orderedAt: string;
    expectedShippingFacilityDate: string;
    supplierOrderRef?: string;
    supplierNotes?: string;
  };
  shipment?: {
    shipmentNumber: string;
    carrier: string;
    trackingCode: string;
    freightMethod: 'Air Freight' | 'Sea Freight' | 'Express Air';
    status:
      | 'Procurement Completed'
      | 'Received at shipping facility'
      | 'Dispatched'
      | 'In Transit'
      | 'Arrived in New Zealand'
      | 'Customs Clearance'
      | 'Out For Delivery'
      | 'Delivered';
    originHub: string;
    destinationHub: string;
    etaDate: string;
    milestones: {
      title: string;
      location: string;
      timestamp: string;
      status: 'completed' | 'in-progress' | 'pending';
      note?: string;
    }[];
  };
  payment: {
    paymentNumber: string;
    amountNZD: number;
    status: 'Awaiting Payment' | 'Payment Pending' | 'Payment Received' | 'Payment Failed' | 'Credit Approved' | 'Refunded';
    dueDate: string;
    paidAt?: string;
    method?: string;
    invoiceNumber?: string;
    creditApproved?: boolean;
    refundDetails?: {
      amountNZD: number;
      reason: string;
      refundedAt: string;
      processedBy: string;
    };
  };
  exceptions?: {
    id: string;
    code: string; // LOG-00042
    title: string;
    category: 'Payment' | 'Supplier' | 'Procurement' | 'Logistics' | 'Customer' | 'Customs';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'Investigating' | 'Action Required' | 'Resolved' | 'Closed';
    description: string;
    owner: string;
    createdAt: string;
  }[];
  timeline: OperationTimelineEvent[];
  messages: OperationalMessage[];
  documents: OperationalDocument[];
  notesCount?: number;
}

export type ExceptionCategory = 'Payment' | 'Supplier' | 'Procurement' | 'Logistics' | 'Customer' | 'Customs';
export type ExceptionSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ExceptionStatus = 'Detected' | 'Assigned' | 'Investigating' | 'Action Required' | 'Resolved' | 'Closed';

export interface OperationalException {
  id: string;
  code: string; // e.g. LOG-00042
  title: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  description: string;
  requestId: string;
  requestNumber: string;
  customerName: string;
  vehicleSummary: string;
  partSummary: string;
  shipmentNumber?: string;
  orderNumber?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  actionsHistory: {
    timestamp: string;
    user: string;
    action: string;
    notes?: string;
  }[];
}

export interface OperationalCustomer {
  id: string;
  businessName: string;
  tradingName: string;
  nzbn: string;
  businessType: string;
  status: 'Approved' | 'Pending Approval' | 'Suspended' | 'Inactive';
  submittedDate: string;
  approvedDate?: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  accountsContact: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryContact: {
    name: string;
    phone: string;
  };
  creditStatus: 'Approved Trade Account (20th Month Following)' | 'Prepaid Trade' | 'Pending Review';
  creditLimitNZD: number;
  outstandingBalanceNZD: number;
  activeRequestsCount: number;
  openOrdersCount: number;
  branches: {
    id: string;
    name: string;
    street: string;
    suburb: string;
    city: string;
    postcode: string;
    isPrimary: boolean;
  }[];
  notes?: string;
}

export interface OperationalAuditEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  user: string;
  userRole: OperationsRole;
  action: string;
  objectType: 'Request' | 'Quote' | 'Payment' | 'Procurement' | 'Shipment' | 'Exception' | 'Customer' | 'User' | 'System';
  objectId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface OperationalTask {
  id: string;
  title: string;
  requestId: string;
  requestNumber: string;
  vehicleSummary: string;
  customerName: string;
  assignedTo: string;
  priority: 'Urgent' | 'High' | 'Normal';
  dueDate: string;
  dueLabel: 'Overdue' | 'Due Today' | 'Due Tomorrow' | 'Upcoming';
  type: 'Review Supplier Quote' | 'Prepare Customer Quote' | 'Follow Up Approval' | 'Resolve Payment' | 'Dispatch PO' | 'Track Shipment' | 'Resolve Exception';
  status: 'Open' | 'In Progress' | 'Completed';
  targetUrl: string;
}

export interface OperationalReportMetrics {
  openRequestsCount: number;
  awaitingQuotesCount: number;
  awaitingApprovalCount: number;
  awaitingPaymentCount: number;
  procurementInProgressCount: number;
  activeShipmentsCount: number;
  exceptionsCount: number;
  avgProcessingDays: number;
  quoteConversionRate: number;
  paymentConversionRate: number;
  activeProcurementValueNZD: number;
  outstandingPaymentsNZD: number;
  monthlyRevenueNZD: number;
  requestsByStatus: { status: string; count: number; valueNZD: number }[];
  sourcingTimeDays: number;
  quotePreparationDays: number;
  approvalTimeDays: number;
  procurementTimeDays: number;
  deliveryTimeDays: number;
}

export interface FreightCarrierControl {
  id: string;
  name: string;
  code: string;
  category: 'Domestic Courier (NZ Post)' | 'Air Freight' | 'Sea Cargo' | 'Road Logistics';
  isEnabled: boolean;
  transitTime: string;
  trackingIntegration: 'NZ Post Live API' | 'NZ Post Courier' | 'Manual Track';
  statusNote: string;
  cutoffTime: string;
}

export interface NZPostPickupBooking {
  id: string;
  consignmentId: string;
  trackingNumber: string;
  customerName: string;
  pickupBranch: string;
  pickupAddress: string;
  scheduledTime: string;
  parcelCount: number;
  status: 'Scheduled' | 'Dispatched' | 'Driver En Route' | 'Picked Up' | 'In Transit';
  postcode: string;
}

