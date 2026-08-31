// PROCURly Cross-Role Real-Time Synchronization Engine
'use client';

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

  const targetRef = requestIdOrRef.toUpperCase().includes('AH-P-')
    ? requestIdOrRef.toUpperCase()
    : 'AH-P-000123';
  const targetId = 'req_123';
  const now = new Date().toISOString();
  const actor = options.actorName || 'System User';

  // 1. UPDATE CUSTOMER PORTAL STORAGE (procurly_requests_v3)
  try {
    const rawReqs = localStorage.getItem('procurly_requests_v3');
    if (rawReqs) {
      const reqs = JSON.parse(rawReqs);
      const req = reqs.find(
        (r: any) =>
          r.id === targetId ||
          r.referenceNumber.toUpperCase() === targetRef ||
          r.id === requestIdOrRef
      );
      if (req) {
        req.status = newStatus;
        req.updatedAt = now;
        if (options.freightMethod) req.selectedFreight = options.freightMethod;

        if (newStatus === 'Awaiting Payment' || newStatus === 'Customer Approved') {
          req.paymentStatus = 'Awaiting Payment';
        } else if (newStatus === 'Payment Received' || newStatus === 'Ordered From Supplier') {
          req.paymentStatus = 'Payment Received';
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
    }
  } catch (e) {
    console.error('Error syncing Customer requests:', e);
  }

  // 2. UPDATE OPERATIONS PORTAL STORAGE (procurly_ops_requests_v1)
  try {
    const rawOps = localStorage.getItem('procurly_ops_requests_v1');
    if (rawOps) {
      const opsReqs = JSON.parse(rawOps);
      const opsReq = opsReqs.find(
        (r: any) =>
          r.id === 'req_000123' ||
          r.referenceNumber.toUpperCase() === targetRef ||
          r.id === requestIdOrRef
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
    }
  } catch (e) {
    console.error('Error syncing Operations requests:', e);
  }

  // 3. UPDATE PROCUREMENT PORTAL STORAGE (procurly_proc_requests_v2)
  try {
    const rawProc = localStorage.getItem('procurly_proc_requests_v2');
    if (rawProc) {
      const procReqs = JSON.parse(rawProc);
      const procReq = procReqs.find(
        (r: any) =>
          r.id === 'req_123' ||
          r.requestNumber.toUpperCase() === targetRef ||
          r.id === requestIdOrRef
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
    }
  } catch (e) {
    console.error('Error syncing Procurement requests:', e);
  }

  // 4. UPDATE FINANCE PORTAL STORAGE (procurly_fin_payments_v1 & procurly_fin_awaiting_v1)
  try {
    const rawFinPay = localStorage.getItem('procurly_fin_payments_v1');
    if (rawFinPay) {
      const finPays = JSON.parse(rawFinPay);
      const finPay = finPays.find(
        (p: any) => p.requestNumber.toUpperCase() === targetRef || p.id === 'PAY-00123'
      );
      if (finPay) {
        if (newStatus === 'Payment Received' || newStatus === 'Ordered From Supplier') {
          finPay.status = 'Received';
          finPay.paymentDate = 'Just now';
        } else if (newStatus === 'Awaiting Payment') {
          finPay.status = 'Awaiting';
        }
        localStorage.setItem('procurly_fin_payments_v1', JSON.stringify(finPays));
      }
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
      description: `${targetRef} (Toyota Hiace 2019) status updated to ${newStatus}.`,
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
      actionUrl: `/procurement/requests`,
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
      actionUrl: `/finance/payments`,
    });
    localStorage.setItem('procurly_fin_notifs_v1', JSON.stringify(finNotifs));
  } catch (e) {
    console.error('Error creating notifications:', e);
  }

  // 6. BROADCAST ALL REAL-TIME DOM EVENTS ACROSS ALL OPEN DESKS
  window.dispatchEvent(new Event('procurly_data_updated'));
  window.dispatchEvent(new Event('procurly_requests_updated'));
  window.dispatchEvent(new Event('procurly_ops_updated'));
  window.dispatchEvent(new Event('procurly_procurement_updated'));
  window.dispatchEvent(new Event('procurly_finance_updated'));
}
