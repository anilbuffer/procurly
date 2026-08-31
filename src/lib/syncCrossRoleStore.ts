import { INITIAL_REQUESTS as CUSTOMER_INITIAL_REQUESTS } from '@/services/mockData';
import { INITIAL_REQUESTS as OPS_INITIAL_REQUESTS } from '@/services/operations/mockData';
import { INITIAL_REQUESTS as PROC_INITIAL_REQUESTS } from '@/services/procurement/mockData';
import { INITIAL_FINANCE_PAYMENTS, INITIAL_AWAITING_PAYMENTS } from '@/services/finance/mockData';

export interface SyncOptions {
  actorName?: string;
  note?: string;
  freightMethod?: string;
  totalAmountNZD?: number;
  paymentMethod?: string;
}

export function syncRequestStatusAcrossRoles(
  requestIdOrRef: string,
  newStatus: string,
  options: SyncOptions = {}
) {
  if (typeof window === 'undefined') return;

  const rawInput = requestIdOrRef || 'AH-P-000123';
  const targetRef = rawInput.toUpperCase().includes('AH-P-')
    ? rawInput.toUpperCase()
    : 'AH-P-000123';
  const targetId = rawInput === 'AH-P-000123' || rawInput === 'req_000123' || rawInput === 'req_123'
    ? 'req_123'
    : rawInput;

  const now = new Date().toISOString();
  const actor = options.actorName || 'System User';

  // 1. UPDATE CUSTOMER PORTAL STORAGE (procurly_requests_v3)
  try {
    const rawReqs = localStorage.getItem('procurly_requests_v3');
    const reqs = rawReqs ? JSON.parse(rawReqs) : CUSTOMER_INITIAL_REQUESTS;
    const req = reqs.find(
      (r: any) =>
        r.id === targetId ||
        r.id === rawInput ||
        (r.referenceNumber && r.referenceNumber.toUpperCase() === targetRef)
    );
    if (req) {
      req.status = newStatus;
      req.updatedAt = now;
      if (options.freightMethod) req.selectedFreight = options.freightMethod;

      if (newStatus === 'Awaiting Payment' || newStatus === 'Customer Approved') {
        req.paymentStatus = 'Awaiting Payment';
      } else if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'In Transit' ||
        newStatus === 'Delivered'
      ) {
        req.paymentStatus = 'Payment Received';
      } else if (newStatus === 'Quote Ready' || newStatus === 'Sourcing' || newStatus === 'Request Submitted') {
        req.paymentStatus = 'Pending Quote';
      }

      if (req.trackingMilestones) {
        req.trackingMilestones.push({
          id: `m_${Date.now()}_sync`,
          title: `Status Changed: ${newStatus}`,
          location: 'PROCURly Sync Network',
          timestamp: 'Just now',
          status: 'completed',
          description: options.note || `Process updated to ${newStatus} by ${actor}.`,
        });
      }
      localStorage.setItem('procurly_requests_v3', JSON.stringify(reqs));
    }
  } catch (e) {
    console.error('Error syncing Customer requests:', e);
  }

  // 2. UPDATE OPERATIONS PORTAL STORAGE (procurly_ops_requests_v1)
  try {
    const rawOps = localStorage.getItem('procurly_ops_requests_v1');
    const opsReqs = rawOps ? JSON.parse(rawOps) : OPS_INITIAL_REQUESTS;
    const opsReq = opsReqs.find(
      (r: any) =>
        r.id === 'req_000123' ||
        r.id === targetId ||
        r.id === rawInput ||
        (r.referenceNumber && r.referenceNumber.toUpperCase() === targetRef)
    );
    if (opsReq) {
      opsReq.status = newStatus;
      opsReq.updatedAt = now;

      if (opsReq.timeline) {
        opsReq.timeline.unshift({
          id: `ev_${Date.now()}`,
          stage: newStatus,
          action: `Real-time process status updated to ${newStatus}`,
          user: actor,
          timestamp: 'Just now',
          isCompleted: true,
          isCurrent: true,
          note: options.note,
        });
      }
      localStorage.setItem('procurly_ops_requests_v1', JSON.stringify(opsReqs));
    }
  } catch (e) {
    console.error('Error syncing Operations requests:', e);
  }

  // 3. UPDATE PROCUREMENT PORTAL STORAGE (procurly_proc_requests_v2)
  try {
    const rawProc = localStorage.getItem('procurly_proc_requests_v2');
    const procReqs = rawProc ? JSON.parse(rawProc) : PROC_INITIAL_REQUESTS;
    const procReq = procReqs.find(
      (r: any) =>
        r.id === targetId ||
        r.id === rawInput ||
        (r.requestNumber && r.requestNumber.toUpperCase() === targetRef)
    );
    if (procReq) {
      procReq.status = newStatus;
      procReq.updatedAt = now;
      if (procReq.timeline) {
        procReq.timeline.unshift({
          title: `Procurement Flow: ${newStatus}`,
          timestamp: now,
          actor: actor,
          description: options.note || `Cross-portal synchronization updated status to ${newStatus}.`,
        });
      }
      localStorage.setItem('procurly_proc_requests_v2', JSON.stringify(procReqs));
    }
  } catch (e) {
    console.error('Error syncing Procurement requests:', e);
  }

  // 4. UPDATE FINANCE PORTAL STORAGE (procurly_fin_payments_v1 & procurly_fin_awaiting_v1)
  try {
    const rawFinPay = localStorage.getItem('procurly_fin_payments_v1');
    const finPays = rawFinPay ? JSON.parse(rawFinPay) : INITIAL_FINANCE_PAYMENTS;
    const finPay = finPays.find(
      (p: any) =>
        (p.requestNumber && p.requestNumber.toUpperCase() === targetRef) ||
        p.id === 'PAY-000123' ||
        p.id === 'PAY-00123' ||
        p.id === rawInput
    );
    if (finPay) {
      if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'In Transit' ||
        newStatus === 'Delivered'
      ) {
        finPay.status = 'Received';
        finPay.paymentDate = 'Just now';
      } else if (newStatus === 'Awaiting Payment' || newStatus === 'Customer Approved' || newStatus === 'Quote Ready') {
        finPay.status = 'Awaiting';
      }
      localStorage.setItem('procurly_fin_payments_v1', JSON.stringify(finPays));
    }

    // Sync awaiting payments store
    const rawFinAwaiting = localStorage.getItem('procurly_fin_awaiting_v1');
    const finAwaiting = rawFinAwaiting ? JSON.parse(rawFinAwaiting) : INITIAL_AWAITING_PAYMENTS;
    const awaitingItem = finAwaiting.find(
      (a: any) => (a.requestNumber && a.requestNumber.toUpperCase() === targetRef) || a.id === 'AWT-000123'
    );
    if (awaitingItem) {
      if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'In Transit' ||
        newStatus === 'Delivered'
      ) {
        awaitingItem.status = 'Paid & Released';
      } else if (newStatus === 'Awaiting Payment' || newStatus === 'Customer Approved') {
        awaitingItem.status = 'Due Soon';
      }
      localStorage.setItem('procurly_fin_awaiting_v1', JSON.stringify(finAwaiting));
    }
  } catch (e) {
    console.error('Error syncing Finance payments:', e);
  }

  // 5. DISPATCH REAL-TIME CROSS-PORTAL NOTIFICATIONS
  try {
    // Add to Customer Notifications
    const rawNotifs = localStorage.getItem('procurly_notifications_v3');
    const customerNotifs = rawNotifs ? JSON.parse(rawNotifs) : [];
    customerNotifs.unshift({
      id: `notif_${Date.now()}`,
      type: 'QUOTE_ACCEPTED',
      title: `Process Updated: ${newStatus}`,
      description: `${targetRef} (2019 Toyota Hiace - Left Front Lower Control Arm) status updated to ${newStatus}.`,
      timeGroup: 'Today',
      timestamp: now,
      timeAgo: 'Just now',
      isRead: false,
      requestId: targetId,
      requestNumber: targetRef,
      linkUrl: `/requests/${targetId}`,
    });
    localStorage.setItem('procurly_notifications_v3', JSON.stringify(customerNotifs));

    // Add to Procurement Notifications
    const rawProcNotifs = localStorage.getItem('procurly_proc_notifs_v2');
    const procNotifs = rawProcNotifs ? JSON.parse(rawProcNotifs) : [];
    procNotifs.unshift({
      id: `pnotif_${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: `${targetRef} Status Changed`,
      description: `Customer order process moved to "${newStatus}".`,
      timestamp: 'Just now',
      isRead: false,
      requestId: targetRef,
      actionUrl: `/procurement/requests/${targetId}`,
    });
    localStorage.setItem('procurly_proc_notifs_v2', JSON.stringify(procNotifs));

    // Add to Finance Notifications
    const rawFinNotifs = localStorage.getItem('procurly_fin_notifs_v1');
    const finNotifs = rawFinNotifs ? JSON.parse(rawFinNotifs) : [];
    finNotifs.unshift({
      id: `fnotif_${Date.now()}`,
      type: 'PAYMENT_EVENT',
      title: `${targetRef} Finance Update`,
      description: `Order ${targetRef} trade billing updated to "${newStatus}".`,
      timestamp: 'Just now',
      isRead: false,
      actionUrl: `/finance/payments/PAY-000123`,
    });
    localStorage.setItem('procurly_fin_notifs_v1', JSON.stringify(finNotifs));
  } catch (e) {
    console.error('Error creating notifications:', e);
  }

  // 6. BROADCAST ALL REAL-TIME DOM EVENTS & STORAGE SYNC ACROSS DESKS & TABS
  window.dispatchEvent(new Event('procurly_data_updated'));
  window.dispatchEvent(new Event('procurly_requests_updated'));
  window.dispatchEvent(new Event('procurly_ops_updated'));
  window.dispatchEvent(new Event('procurly_procurement_updated'));
  window.dispatchEvent(new Event('procurly_finance_updated'));
  window.dispatchEvent(new Event('storage'));
}

