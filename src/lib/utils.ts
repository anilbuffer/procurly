import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Quote Ready':
    case 'Quoted':
    case 'Awaiting Customer Approval':
      return {
        bg: 'bg-amber-50 text-amber-900',
        text: 'text-amber-900',
        border: 'border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'Customer Approved':
    case 'Quote Approved':
      return {
        bg: 'bg-indigo-50 text-indigo-700',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-600',
      };
    case 'Awaiting Payment':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'Payment Pending':
      return {
        bg: 'bg-blue-50 text-blue-700',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500 animate-pulse',
      };
    case 'Payment Received':
    case 'Credit Approved':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
      };
    case 'Payment Failed':
      return {
        bg: 'bg-red-50 text-red-700',
        text: 'text-red-700',
        border: 'border-red-300',
        dot: 'bg-red-600 animate-pulse',
      };
    case 'Ordered From Supplier':
    case 'Received At Shipping Facility':
      return {
        bg: 'bg-sky-50 text-sky-800',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dot: 'bg-sky-600',
      };
    case 'In Transit':
    case 'In Transit - Air':
    case 'Shipped':
      return {
        bg: 'bg-blue-50 text-brand-blue',
        text: 'text-brand-blue',
        border: 'border-blue-200',
        dot: 'bg-brand-blue animate-pulse',
      };
    case 'In Transit - Sea':
      return {
        bg: 'bg-cyan-50 text-cyan-800',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        dot: 'bg-cyan-600 animate-pulse',
      };
    case 'Arrived In New Zealand':
    case 'Customs Clearance':
      return {
        bg: 'bg-purple-50 text-purple-800',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-600 animate-pulse',
      };
    case 'Out For Delivery':
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-600 animate-pulse',
      };
    case 'Delivered':
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Sourcing':
    case 'Request Submitted':
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-500 animate-pulse',
      };
    case 'On Hold':
    case 'Procurement Exception':
    case 'Logistics Exception':
      return {
        bg: 'bg-amber-100 text-amber-900',
        text: 'text-amber-900',
        border: 'border-amber-300',
        dot: 'bg-amber-600',
      };
    case 'Cancelled':
    case 'Rejected':
    case 'Refunded':
      return {
        bg: 'bg-red-50 text-red-700',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getStatusDescription(status: string): string {
  switch (status) {
    case 'Request Submitted':
      return 'Your parts request has been catalogued and assigned to Autohub procurement.';
    case 'Sourcing':
      return 'Autohub parts specialists are sourcing verified OEM/aftermarket options across supplier networks.';
    case 'Quote Ready':
      return 'Quote Ready — Review and approve your quotation to proceed with payment and procurement.';
    case 'Awaiting Customer Approval':
      return 'Quote ready for trade review. Select your preferred freight option to proceed.';
    case 'Customer Approved':
      return 'Quotation approved. Preparing for trade payment / credit verification.';
    case 'Awaiting Payment':
      return 'Payment is required before procurement and dispatch can begin.';
    case 'Payment Pending':
      return 'Your payment is being verified by the banking gateway.';
    case 'Payment Received':
      return 'Payment confirmed. Autohub procurement team is placing the supplier order.';
    case 'Ordered From Supplier':
      return 'Order officially locked with authorized supplier. Preparing for warehouse dispatch.';
    case 'Received At Shipping Facility':
      return 'Part received, inspected for fitment quality, and packed for international transit.';
    case 'In Transit':
    case 'In Transit - Air':
      return 'Consignment is in flight / international transit to New Zealand.';
    case 'In Transit - Sea':
      return 'Consignment is onboard maritime consolidated carrier to Ports of Auckland.';
    case 'Arrived In New Zealand':
      return 'Vessel / flight arrived in Auckland. Handed over for biosecurity and customs processing.';
    case 'Customs Clearance':
      return 'MPI biosecurity check and NZ Customs tariff clearance in progress.';
    case 'Out For Delivery':
      return 'Dispatched on express metro courier van for delivery to your workshop.';
    case 'Delivered':
      return 'Package safely received and signed for at your workshop address.';
    case 'Payment Failed':
      return 'Payment could not be completed. Please retry payment to avoid procurement delay.';
    default:
      return 'Currently being processed by Autohub.';
  }
}

export interface OrderTimelineMilestone {
  stage: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
}

export function getSynchronizedOrderTimeline(
  status: string,
  existingTimeline?: OrderTimelineMilestone[]
): OrderTimelineMilestone[] {
  const s = (status || '').trim().toLowerCase();

  const getExisting = (stageName: string) => {
    return existingTimeline?.find(
      (t) =>
        t.stage.toLowerCase() === stageName.toLowerCase() ||
        t.stage.toLowerCase().includes(stageName.toLowerCase()) ||
        stageName.toLowerCase().includes(t.stage.toLowerCase())
    );
  };

  const isDeliveredOrClosed =
    s.includes('delivered') || s.includes('closed') || s.includes('completed');
  const isOutForDelivery = s.includes('out for delivery');
  const isInTransitOrCustoms =
    s.includes('in transit') ||
    s.includes('dispatched') ||
    s.includes('shipped') ||
    s.includes('customs') ||
    s.includes('arrived in new zealand') ||
    s.includes('arrived in nz') ||
    s.includes('transit');
  const isAtFacility =
    s.includes('shipping facility') ||
    s.includes('facility') ||
    s.includes('export warehouse');
  const isOrdered =
    s.includes('ordered') ||
    s.includes('po issued') ||
    s.includes('ready for procurement');
  const isPaymentReceived =
    s.includes('payment received') ||
    s.includes('paid') ||
    s.includes('reconciled') ||
    s.includes('credit approved');

  // Stage 1: Customer Approved
  const ex1 = getExisting('Customer Approved');
  const stage1: OrderTimelineMilestone = {
    stage: 'Customer Approved',
    timestamp: ex1?.timestamp && ex1.timestamp !== 'Pending' ? ex1.timestamp : 'Just now',
    status: 'completed',
    description: ex1?.description || 'Quotation verified and approved by trade customer.',
  };

  // Stage 2: Payment Received
  const ex2 = getExisting('Payment Received');
  let status2: 'completed' | 'in-progress' | 'pending' = 'pending';
  let time2 = 'Pending';
  let desc2 = 'Awaiting payment confirmation.';

  if (isDeliveredOrClosed || isOutForDelivery || isInTransitOrCustoms || isAtFacility || isOrdered || isPaymentReceived) {
    status2 = 'completed';
    time2 = ex2?.timestamp && ex2.timestamp !== 'Pending' ? ex2.timestamp : 'Completed';
    desc2 =
      ex2?.description && !ex2.description.toLowerCase().includes('awaiting')
        ? ex2.description
        : 'Payment verified and trade account billing authorized.';
  } else {
    status2 = 'in-progress';
    time2 = 'Pending';
    desc2 = 'Awaiting payment confirmation.';
  }

  const stage2: OrderTimelineMilestone = {
    stage: 'Payment Received',
    timestamp: time2,
    status: status2,
    description: desc2,
  };

  // Stage 3: Ordered From Supplier
  const ex3 = getExisting('Ordered From Supplier');
  let status3: 'completed' | 'in-progress' | 'pending' = 'pending';
  let time3 = 'Pending';
  let desc3 = 'PO issuance to overseas supplier.';

  if (isDeliveredOrClosed || isOutForDelivery || isInTransitOrCustoms || isAtFacility) {
    status3 = 'completed';
    time3 = ex3?.timestamp && ex3.timestamp !== 'Pending' ? ex3.timestamp : 'Completed';
    desc3 =
      ex3?.description && !ex3.description.toLowerCase().includes('pending')
        ? ex3.description
        : 'PO transmitted and fulfilled by overseas supplier hub.';
  } else if (isOrdered) {
    status3 = 'in-progress';
    time3 = ex3?.timestamp && ex3.timestamp !== 'Pending' ? ex3.timestamp : 'Just now';
    desc3 = 'PO transmitted to supplier network. Sourcing in progress.';
  } else if (isPaymentReceived) {
    status3 = 'in-progress';
    time3 = 'In Progress';
    desc3 = 'PO issuance to overseas supplier.';
  }

  const stage3: OrderTimelineMilestone = {
    stage: 'Ordered From Supplier',
    timestamp: time3,
    status: status3,
    description: desc3,
  };

  // Stage 4: Received at Shipping Facility
  const ex4 = getExisting('Received at Shipping Facility') || getExisting('Received At Shipping Facility');
  let status4: 'completed' | 'in-progress' | 'pending' = 'pending';
  let time4 = 'Pending';
  let desc4 = 'Export warehouse QA & fitment inspection.';

  if (isDeliveredOrClosed || isOutForDelivery || isInTransitOrCustoms) {
    status4 = 'completed';
    time4 = ex4?.timestamp && ex4.timestamp !== 'Pending' ? ex4.timestamp : 'Completed';
    desc4 =
      ex4?.description && !ex4.description.toLowerCase().includes('scheduled') && !ex4.description.toLowerCase().includes('pending')
        ? ex4.description
        : 'Export warehouse QA inspection passed. Crated for departure.';
  } else if (isAtFacility) {
    status4 = 'in-progress';
    time4 = ex4?.timestamp && ex4.timestamp !== 'Pending' ? ex4.timestamp : 'Just now';
    desc4 = 'Received at origin shipping facility. Export fitment QA in progress.';
  }

  const stage4: OrderTimelineMilestone = {
    stage: 'Received at Shipping Facility',
    timestamp: time4,
    status: status4,
    description: desc4,
  };

  // Stage 5: Shipment
  const ex5 = getExisting('Shipment') || getExisting('In Transit');
  let status5: 'completed' | 'in-progress' | 'pending' = 'pending';
  let time5 = 'Pending';
  let desc5 = 'International transit.';

  if (isDeliveredOrClosed) {
    status5 = 'completed';
    time5 = ex5?.timestamp && ex5.timestamp !== 'Pending' ? ex5.timestamp : 'Completed';
    desc5 =
      ex5?.description && !ex5.description.toLowerCase().includes('expected') && !ex5.description.toLowerCase().includes('pending')
        ? ex5.description
        : 'International freight transit and customs clearance completed.';
  } else if (isOutForDelivery) {
    status5 = 'completed';
    time5 = ex5?.timestamp && ex5.timestamp !== 'Pending' ? ex5.timestamp : 'Arrived';
    desc5 = 'Arrived in New Zealand. Customs cleared and released for delivery.';
  } else if (isInTransitOrCustoms) {
    status5 = 'in-progress';
    time5 = ex5?.timestamp && ex5.timestamp !== 'Pending' ? ex5.timestamp : 'In Transit';
    desc5 =
      ex5?.description && !ex5.description.toLowerCase().includes('pending')
        ? ex5.description
        : 'International freight transit / customs processing.';
  }

  const stage5: OrderTimelineMilestone = {
    stage: 'Shipment',
    timestamp: time5,
    status: status5,
    description: desc5,
  };

  // Stage 6: Delivered
  const ex6 = getExisting('Delivered');
  let status6: 'completed' | 'in-progress' | 'pending' = 'pending';
  let time6 = 'Pending';
  let desc6 = 'Workshop handover.';

  if (isDeliveredOrClosed) {
    status6 = 'completed';
    time6 = ex6?.timestamp && ex6.timestamp !== 'Pending' ? ex6.timestamp : 'Delivered';
    desc6 =
      ex6?.description && !ex6.description.toLowerCase().includes('expected') && !ex6.description.toLowerCase().includes('pending')
        ? ex6.description
        : 'Workshop handover complete. Consignment signed and delivered.';
  } else if (isOutForDelivery) {
    status6 = 'in-progress';
    time6 = 'Out for Delivery';
    desc6 = 'Dispatched on local courier van for direct workshop delivery.';
  }

  const stage6: OrderTimelineMilestone = {
    stage: 'Delivered',
    timestamp: time6,
    status: status6,
    description: desc6,
  };

  return [stage1, stage2, stage3, stage4, stage5, stage6];
}

