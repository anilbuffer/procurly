// PROCURly Procurement Portal Types & Models

export type ProcurementRole = 'Senior Procurement Specialist' | 'Procurement Lead' | 'Sourcing Officer' | 'Logistics Coordinator';

export interface ProcurementStaffUser {
  id: string;
  name: string;
  email: string;
  role: ProcurementRole;
  avatar: string;
  phone: string;
  specialization: string[];
  activeRegions: string[];
}

export type ProcurementPriority = 'Normal' | 'High' | 'Urgent';

export type ProcurementRequestStatus =
  | 'New'
  | 'Sourcing'
  | 'Awaiting Supplier'
  | 'Quote Ready'
  | 'Customer Approved'
  | 'Payment Received'
  | 'Ready for Procurement'
  | 'Ordered'
  | 'On Hold'
  | 'Exception'
  | 'Completed'
  | 'Cancelled';

export type SourcingStatus =
  | 'Not Started'
  | 'Sourcing'
  | 'Supplier Contacted'
  | 'Awaiting Response'
  | 'Quote Received'
  | 'No Availability'
  | 'Sourcing Complete';

export type SupplierQuoteStatus =
  | 'Draft'
  | 'Received'
  | 'Under Review'
  | 'Accepted'
  | 'Rejected'
  | 'Clarification Requested'
  | 'Expired';

export type POStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Sent to Supplier'
  | 'Supplier Confirmed'
  | 'Ordered'
  | 'Partially Received'
  | 'Fully Received'
  | 'Cancelled'
  | 'Exception';

export type TrackingStatus =
  | 'Active Procurement'
  | 'Supplier Confirmed'
  | 'Awaiting Dispatch'
  | 'Dispatched'
  | 'Received at Shipping Facility'
  | 'Ready for Logistics'
  | 'In Transit'
  | 'Delivered';

export type ExceptionType =
  | 'Supplier Delay'
  | 'Supplier Cancellation'
  | 'Part Unavailable'
  | 'Wrong Part'
  | 'Damaged Part'
  | 'Quantity Mismatch'
  | 'Shipping Delay'
  | 'Documentation Issue'
  | 'Customs Issue';

export type ExceptionStage = 'Review' | 'Assign' | 'Investigate' | 'Supplier Communication' | 'Resolution' | 'Close';
export type ExceptionSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface VehicleRequirement {
  make: string;
  model: string;
  year: number;
  vin: string;
  rego?: string;
  chassisCode?: string;
  engineCode?: string;
  transmission?: string;
}

export interface PartRequirement {
  name: string;
  partNumber?: string;
  quantity: number;
  qualityPreference: 'Genuine OEM' | 'Genuine' | 'Aftermarket' | 'No Preference';
  condition: 'New' | 'Grade A Used' | 'Reconditioned' | 'No Preference';
  notes?: string;
  images: string[];
}

export interface SupplierSummary {
  id: string;
  name: string;
  code: string;
  location: string;
  country: string;
  specialization: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  activeOrdersCount: number;
  responseRatePct: number;
  avgLeadTimeDays: number;
  avgResponseTimeHours: number;
  orderCompletionPct: number;
  exceptionRatePct: number;
  status: 'Active' | 'Preferred' | 'Under Review' | 'Inactive';
  operatingRegions: string[];
  preferredCategories: string[];
  reliabilityScore: number; // 0 - 100
  notes?: string;
}

export interface SupplierQuoteItem {
  id: string;
  quoteNumber: string; // e.g. SQ-9021
  requestId: string;
  requestRef: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  condition: string;
  warrantyMonths: number;
  unitCostNZD: number;
  freightCostNZD: number;
  handlingCostNZD: number;
  totalCostNZD: number;
  availability: 'In Stock' | '1–2 Days' | '3–5 Days' | '7–10 Days' | 'Backorder';
  leadTimeDays: number;
  leadTimeDisplay: string; // e.g. "3 Days"
  validUntil: string;
  status: SupplierQuoteStatus;
  createdAt: string;
  notes?: string;
  paymentTerms: string;
  attachments?: {
    name: string;
    size: string;
    url: string;
  }[];
  clarificationNotes?: string;
  isPreferred?: boolean;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string; // e.g. PO-NZ-4029
  requestId: string;
  requestRef: string;
  quoteId: string;
  quoteRef: string;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  supplierEmail: string;
  customerName: string;
  vehicleSummary: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitPriceNZD: number;
  freightCostNZD: number;
  taxNZD: number;
  totalAmountNZD: number;
  status: POStatus;
  createdAt: string;
  sentAt?: string;
  confirmedAt?: string;
  expectedDispatchDate: string;
  deliveryAddress: string;
  deliveryHub: string;
  shippingTerms: string; // e.g. "FOB Yokohama / DDP Auckland"
  paymentTerms: string;
  notes?: string;
  documents: {
    title: string;
    type: string;
    url: string;
    size: string;
  }[];
  timeline: {
    stage: string;
    date: string;
    done: boolean;
    note?: string;
  }[];
}

export interface ProcurementRequest {
  id: string;
  requestNumber: string; // e.g. PR-10048
  customerName: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerBranch: string;
  vehicle: VehicleRequirement;
  part: PartRequirement;
  priority: ProcurementPriority;
  status: ProcurementRequestStatus;
  sourcingStatus: SourcingStatus;
  assignedTo: string;
  assignedStaffId: string;
  createdAt: string;
  updatedAt: string;
  targetBudgetNZD?: number;
  selectedSupplierQuoteId?: string;
  purchaseOrderId?: string;
  quotesCount: number;
  timeline: {
    title: string;
    timestamp: string;
    actor: string;
    description: string;
  }[];
  internalNotes: {
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }[];
  customerAttachments: {
    name: string;
    size: string;
    url: string;
  }[];
  documents: {
    id: string;
    title: string;
    type: string;
    date: string;
    size: string;
  }[];
}

export interface ProcurementTaskItem {
  id: string;
  title: string;
  type:
    | 'Review sourcing request'
    | 'Contact supplier'
    | 'Add supplier quotation'
    | 'Compare quotations'
    | 'Confirm supplier'
    | 'Create purchase order'
    | 'Follow up supplier'
    | 'Update procurement status'
    | 'Resolve procurement exception';
  requestId: string;
  requestRef: string;
  vehicleSummary: string;
  customerName: string;
  priority: ProcurementPriority;
  dueDate: string;
  dueBucket: 'Today' | 'Overdue' | 'Upcoming' | 'Completed';
  isCompleted: boolean;
  assignedTo: string;
  targetUrl: string;
}

export interface ProcurementExceptionItem {
  id: string;
  code: string; // e.g. EXC-7041
  title: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  stage: ExceptionStage;
  requestId: string;
  requestRef: string;
  poNumber?: string;
  supplierName: string;
  customerName: string;
  vehicleSummary: string;
  partSummary: string;
  description: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  resolvedAt?: string;
  actions: {
    timestamp: string;
    user: string;
    note: string;
    stage: ExceptionStage;
  }[];
}

export interface SupplierMessageItem {
  id: string;
  supplierId: string;
  supplierName: string;
  requestId?: string;
  requestRef?: string;
  poNumber?: string;
  sender: string;
  senderRole: 'Procurement Specialist' | 'Supplier Representative' | 'System';
  isInternalNote: boolean;
  message: string;
  timestamp: string;
  attachments?: {
    name: string;
    size: string;
  }[];
}

export interface SupplierConversation {
  id: string;
  supplierId: string;
  supplierName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  relatedRequestRef?: string;
  relatedPoNumber?: string;
  messages: SupplierMessageItem[];
}

export interface ProcurementDocumentItem {
  id: string;
  title: string;
  type:
    | 'Supplier Quote'
    | 'Supplier Invoice'
    | 'Purchase Order'
    | 'Supplier Confirmation'
    | 'Packing Document'
    | 'Freight Document'
    | 'Inspection Certificate'
    | 'Customer Specification';
  requestId?: string;
  requestRef?: string;
  poNumber?: string;
  supplierName?: string;
  customerName?: string;
  date: string;
  uploadedBy: string;
  fileSize: string;
  fileFormat: 'PDF' | 'PNG' | 'JPG' | 'DOCX' | 'XLSX';
  downloadUrl: string;
  isInternalOnly: boolean;
}

export interface ShipmentDispatchItem {
  id: string;
  shipmentNumber: string; // e.g. SHP-8092
  requestId: string;
  requestRef: string;
  poNumber: string;
  customerName: string;
  supplierName: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  freightMethod: 'Air Freight' | 'Sea Freight' | 'Air Express';
  carrier: string;
  trackingCode: string;
  currentLocation: string;
  originHub: string;
  destinationHub: string;
  eta: string;
  status:
    | 'Ready for Dispatch'
    | 'Dispatched'
    | 'In Transit'
    | 'Customs Clearance'
    | 'Arrived at Destination'
    | 'Exception';
  exceptionNote?: string;
  weightKg: number;
  dimensionsCm: string;
  verifiedChecklist?: {
    partVerified: boolean;
    quantityVerified: boolean;
    supplierVerified: boolean;
    shippingInfoVerified: boolean;
  };
}

export interface ProcurementNotificationItem {
  id: string;
  title: string;
  description: string;
  type:
    | 'New request assigned'
    | 'Supplier responded'
    | 'Supplier quote received'
    | 'Quote expiring'
    | 'Customer approved'
    | 'Payment received'
    | 'PO requires action'
    | 'Supplier delayed'
    | 'Shipment exception'
    | 'Procurement completed';
  timestamp: string;
  isRead: boolean;
  requestId?: string;
  targetUrl: string;
  priority: 'Urgent' | 'High' | 'Normal';
}
