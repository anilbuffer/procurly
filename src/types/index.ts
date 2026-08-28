export type RequestStatus =
  | 'Request Submitted'
  | 'Sourcing'
  | 'Quote Ready'
  | 'Awaiting Customer Approval'
  | 'Customer Approved'
  | 'Awaiting Payment'
  | 'Payment Pending'
  | 'Payment Received'
  | 'Ordered From Supplier'
  | 'Received At Shipping Facility'
  | 'In Transit'
  | 'In Transit - Air'
  | 'In Transit - Sea'
  | 'Arrived In New Zealand'
  | 'Customs Clearance'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Closed'
  | 'Payment Failed'
  | 'On Hold'
  | 'Procurement Exception'
  | 'Logistics Exception'
  | 'Cancelled'
  | 'Refunded'
  // Backward-compatible aliases
  | 'Quoted'
  | 'Quote Approved'
  | 'Shipped'
  | 'Rejected';

export type PartCondition =
  | 'New'
  | 'New OEM'
  | 'Used'
  | 'Grade A Used'
  | 'Reconditioned'
  | 'No Preference'
  | 'Certified Aftermarket'
  | 'Any Verified Fitment';

export type PartQualityPreference = 'Genuine OEM' | 'Genuine' | 'Aftermarket' | 'Reconditioned / Used' | 'No Preference';
export type PartConditionPreference = 'New Only' | 'Used Acceptable' | 'New' | 'Used' | 'Reconditioned' | 'No Preference';

export type UrgencyLevel = 'Standard' | 'Urgent' | 'Critical (Vehicle Off Road)';

export type FreightType = 'Air Freight (Express)' | 'Air Freight (Standard)' | 'Sea Freight (Consolidated)' | 'Air Freight' | 'Sea Freight';

export interface CostBreakdownItem {
  name: string;
  amountNZD: number;
  description?: string;
  isIncluded?: boolean;
}

export interface QuoteOption {
  id: string;
  type: 'air_express' | 'air_standard' | 'sea_freight' | 'air' | 'sea';
  name: string; // e.g. "Air Freight" or "Sea Freight"
  carrierName: string;
  transitDays: string; // e.g. "5–8 business days"
  estimatedDeliveryDate: string;
  partCostNZD: number;
  freightCostNZD: number;
  dutiesAndBiosecurityNZD: number;
  procurementServiceNZD: number;
  gstNZD: number;
  localCourierNZD: number;
  totalLandedCostNZD: number;
  isRecommended?: boolean;
  notes?: string;
}

export interface PartItem {
  id: string;
  name: string;
  partNumber?: string;
  category?: string;
  quantity: number;
  qualityPreference?: PartQualityPreference;
  conditionPreference?: PartConditionPreference;
  conditionRequired?: PartCondition;
  description?: string;
  damagePhotos?: string[];
  vehicleSide?: 'Front' | 'Rear' | 'Left (Passenger)' | 'Right (Driver)' | 'Engine Bay' | 'Underbody';
}

export interface VehicleInfo {
  vin: string;
  year: number;
  make: string;
  model: string;
  regoNumber?: string;
  subModel?: string;
  engineCode?: string;
  chassisCode?: string;
  transmission?: string;
  driveConfiguration?: string; // 2WD, 4WD, AWD
  originMarket?: 'Japan' | 'Europe' | 'Australia' | 'USA' | 'Domestic NZ';
}

export interface TrackingMilestone {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  carrier?: string;
  referenceNumber?: string;
}

export interface DeliveryAddress {
  id?: string;
  businessName: string;
  street: string;
  suburb?: string;
  city: string;
  postcode: string;
  country?: string;
  isDefault?: boolean;
  hasForklift?: boolean;
  hasLoadingDock?: boolean;
  deliveryNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'specialist' | 'system';
  senderName: string;
  timestamp: string;
  text: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
}

export interface PartRequest {
  id: string;
  referenceNumber: string; // e.g. AH-P-000123
  title: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  urgency: UrgencyLevel;
  vehicle: VehicleInfo;
  parts: PartItem[];
  selectedFreight?: FreightType;
  quoteOptions?: QuoteOption[];
  approvedQuoteId?: string;
  assignedSpecialist?: {
    name: string;
    role: string;
    avatar: string;
    directPhone: string;
    email: string;
  };
  trackingMilestones?: TrackingMilestone[];
  deliveryAddress: DeliveryAddress;
  messages?: ChatMessage[];
  quoteTermsAccepted?: {
    acceptedBy: string;
    acceptedAt: string;
    termsVersion: string;
    quoteVersion: string;
  };
  paymentStatus?: 'Awaiting Payment' | 'Payment Pending' | 'Payment Received' | 'Payment Failed' | 'Credit Approved' | 'Refunded';
}

// Procurement Order Model
export type OrderStatus =
  | 'Customer Approved'
  | 'Payment Received'
  | 'Ordered From Supplier'
  | 'Received At Shipping Facility'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Completed';

export interface ProcurementOrder {
  id: string; // e.g. ord_123
  orderNumber: string; // e.g. ORD-000123
  requestId: string;
  requestNumber: string; // AH-P-000123
  vehicle: VehicleInfo;
  part: PartItem;
  quantity: number;
  totalAmountNZD: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryDate: string;
  freightMethod: string;
  deliveryAddress: DeliveryAddress;
  timeline: {
    stage: string;
    timestamp: string;
    status: 'completed' | 'in-progress' | 'pending';
    description: string;
  }[];
}

// Shipment Tracking Model
export type ShipmentStatus =
  | 'Processing'
  | 'Received at shipping facility'
  | 'Dispatched'
  | 'In Transit'
  | 'Arrived in New Zealand'
  | 'Customs Clearance'
  | 'Out For Delivery'
  | 'Delivered';

export interface ShipmentTracking {
  id: string; // shp_123
  shipmentNumber: string; // SHP-000123
  requestId: string;
  requestNumber: string; // AH-P-000123
  orderNumber?: string;
  carrier: string;
  carrierTrackingCode: string;
  vehicle: VehicleInfo;
  partName: string;
  status: ShipmentStatus;
  dispatchedAt: string;
  estimatedArrival: string;
  originHub: string;
  destinationHub: string;
  currentLocation: string;
  freightType: 'Air Freight' | 'Sea Freight' | 'Express Air';
  milestones: {
    stage: string;
    location: string;
    timestamp: string;
    status: 'completed' | 'in-progress' | 'pending';
    description: string;
  }[];
}

// Payment Model
export type PaymentStatus =
  | 'Awaiting Payment'
  | 'Payment Pending'
  | 'Payment Received'
  | 'Payment Failed'
  | 'Credit Approved'
  | 'Refunded';

export interface PaymentTransaction {
  id: string; // pay_123
  paymentNumber: string; // PAY-000123
  requestId: string;
  requestNumber: string; // AH-P-000123
  orderNumber?: string;
  vehicleSummary: string; // "Toyota Hiace 2019"
  partSummary: string; // "Left Front Lower Control Arm"
  amountNZD: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: 'Approved Trade Credit (20th Mth Following)' | 'Credit Card (Visa/Mastercard)' | 'Account2Account Bank Transfer';
  receiptNumber?: string;
}

// Documents Model
export type DocumentCategory =
  | 'Quotes'
  | 'Invoices'
  | 'Payment Receipts'
  | 'Procurement Documents'
  | 'Shipping Documents';

export interface PortalDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  requestId: string;
  requestNumber: string;
  date: string;
  fileFormat: 'PDF' | 'DOCX' | 'PNG';
  fileSizeBytes: number;
  fileSizeFormatted: string;
  downloadUrl?: string;
  documentType: 'Quotation' | 'Tax Invoice' | 'Receipt' | 'Bill of Lading' | 'Biosecurity Clearance' | 'Inspection Certificate';
  previewData?: {
    quoteNumber?: string;
    invoiceNumber?: string;
    customerName: string;
    vehicleDetails: string;
    partDetails: string;
    items: { desc: string; qty: number; unitPrice: number; total: number }[];
    subtotal: number;
    gst: number;
    total: number;
  };
}

// Team Member Model
export type TeamRole = 'Administrator' | 'Workshop Manager' | 'Senior Technician' | 'Accounts Contact' | 'Technician';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamRole;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  avatarInitials: string;
  permissions: string[];
}

// Company Profile Model
export interface CompanyProfile {
  id: string;
  legalBusinessName: string; // AutoCare Auckland Ltd
  tradingName: string; // AutoCare Auckland
  nzbn: string; // 9429041234567
  businessType: string; // Independent Service Centre & Trade Repairer
  website: string; // autocareauckland.co.nz
  branchCount: number; // 3
  gstNumber: string; // 128-492-910
  creditLimitNZD: number; // 50000
  creditStatus: 'Approved Trade Account (20th Month Following)' | 'Prepaid Trade' | 'Pending Review';
  contacts: {
    primary: {
      name: string; // James Wilson
      email: string; // james@example.com
      phone: string; // 021 555 8921
      role: string; // Administrator
    };
    accounts: {
      name: string; // Sarah Jenkins
      email: string; // accounts@autocareauckland.co.nz
      phone: string; // 09 525 6810
    };
    delivery: {
      name: string; // Workshop Parts Team
      phone: string; // 09 525 1100
    };
  };
  billingAddress: DeliveryAddress;
  deliveryAddresses: DeliveryAddress[];
  memberSince: string;
}

// Notifications Model
export type NotificationType =
  | 'REQUEST_SUBMITTED'
  | 'INFORMATION_REQUIRED'
  | 'QUOTE_AVAILABLE'
  | 'QUOTE_ACCEPTED'
  | 'PAYMENT_RECEIVED'
  | 'ORDER_PLACED'
  | 'SHIPMENT_DISPATCHED'
  | 'SHIPMENT_ARRIVED'
  | 'DELIVERY_OUT'
  | 'DELIVERED';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timeGroup: 'Today' | 'Yesterday' | 'Older';
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  requestId?: string;
  requestNumber?: string;
  linkUrl: string;
}

// Legacy alias for compatibility
export type TradeAccount = CompanyProfile;
