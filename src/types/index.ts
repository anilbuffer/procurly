export type RequestStatus = 
  | 'Quoted'
  | 'Quote Ready' 
  | 'Sourcing' 
  | 'Quote Approved' 
  | 'Shipped'
  | 'In Transit - Air' 
  | 'In Transit - Sea' 
  | 'Customs Clearance' 
  | 'Delivered' 
  | 'Cancelled'
  | 'Rejected';

export type PartCondition = 
  | 'New OEM' 
  | 'Grade A Used' 
  | 'Reconditioned' 
  | 'Certified Aftermarket' 
  | 'Any Verified Fitment';

export type PartQualityPreference = 'Genuine OEM' | 'Aftermarket' | 'Reconditioned / Used';
export type PartConditionPreference = 'New Only' | 'Used Acceptable';

export type UrgencyLevel = 'Standard' | 'Urgent' | 'Critical (Vehicle Off Road)';

export type FreightType = 'Air Freight (Express)' | 'Air Freight (Standard)' | 'Sea Freight (Consolidated)';

export interface CostBreakdownItem {
  name: string;
  amountNZD: number;
  description?: string;
  isIncluded?: boolean;
}

export interface QuoteOption {
  id: string;
  type: 'air_express' | 'air_standard' | 'sea_freight';
  carrierName: string;
  transitDays: string;
  estimatedDeliveryDate: string;
  partCostNZD: number;
  freightCostNZD: number;
  dutiesAndBiosecurityNZD: number;
  gstNZD: number;
  localCourierNZD: number;
  totalLandedCostNZD: number;
  isRecommended?: boolean;
  notes: string;
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
  deliveryAddress: {
    businessName: string;
    street: string;
    suburb: string;
    city: string;
    postcode: string;
    hasForklift: boolean;
    hasLoadingDock: boolean;
    deliveryNotes?: string;
  };
  messages?: {
    id: string;
    sender: 'user' | 'specialist';
    senderName: string;
    timestamp: string;
    text: string;
  }[];
}

export interface TradeAccount {
  id: string;
  legalBusinessName: string;
  tradingName: string;
  businessType: 'Dealership' | 'Collision Repairer' | 'Mechanical Workshop' | 'Fleet Operator' | 'Specialist Importer';
  nzbn: string; // New Zealand Business Number
  gstNumber: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  accountsPayableEmail: string;
  branchCount: number;
  deliverySetup: {
    street: string;
    suburb: string;
    city: string;
    postcode: string;
    hasForklift: boolean;
    hasLoadingDock: boolean;
    gateCode?: string;
    openingHours: string;
  };
  creditStatus: 'Approved - 20th Month Following' | 'Prepaid Trade' | 'Pending Review';
  memberSince: string;
  activeRequestsCount: number;
  totalOrdersCount: number;
}
