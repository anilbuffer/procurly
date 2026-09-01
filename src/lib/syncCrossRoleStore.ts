import { INITIAL_REQUESTS as CUSTOMER_INITIAL_REQUESTS, INITIAL_DOCUMENTS as CUSTOMER_INITIAL_DOCUMENTS, INITIAL_ORDERS as CUSTOMER_INITIAL_ORDERS, INITIAL_SHIPMENTS as CUSTOMER_INITIAL_SHIPMENTS } from '@/services/mockData';
import { INITIAL_REQUESTS as OPS_INITIAL_REQUESTS } from '@/services/operations/mockData';
import { INITIAL_REQUESTS as PROC_INITIAL_REQUESTS } from '@/services/procurement/mockData';
import { INITIAL_FINANCE_PAYMENTS, INITIAL_AWAITING_PAYMENTS } from '@/services/finance/mockData';
import { getSynchronizedOrderTimeline } from '@/lib/utils';


export interface SyncOptions {
  actorName?: string;
  note?: string;
  freightMethod?: string;
  totalAmountNZD?: number;
  paymentMethod?: string;
  carrierTrackingCode?: string;
}

export function syncRequestStatusAcrossRoles(
  requestIdOrRef: string,
  newStatus: string,
  options: SyncOptions = {}
) {
  if (typeof window === 'undefined') return;

  const rawInput = (requestIdOrRef || 'AH-P-000123').trim();
  const targetRef = rawInput.toUpperCase().includes('AH-P-')
    ? rawInput.toUpperCase()
    : `AH-P-${rawInput.replace(/[^0-9]/g, '').padStart(6, '0') || '000123'}`;
  const targetId = rawInput.toLowerCase().startsWith('req_')
    ? rawInput.toLowerCase()
    : `req_${targetRef.replace(/[^0-9]/g, '')}`;

  const now = new Date().toISOString();
  const actor = options.actorName || 'PROCURly Flow Engine';

  // 1. UPDATE CUSTOMER PORTAL STORAGE (procurly_requests_v3)
  try {
    const rawReqs = localStorage.getItem('procurly_requests_v3');
    const reqs = rawReqs ? JSON.parse(rawReqs) : [...CUSTOMER_INITIAL_REQUESTS];
    let req = reqs.find(
      (r: any) =>
        r.id === targetId ||
        r.id === rawInput ||
        (r.referenceNumber && r.referenceNumber.toUpperCase() === targetRef) ||
        (r.referenceNumber && r.referenceNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, ''))
    );
    if (!req && reqs.length > 0) {
      // Clone base request for dynamic ID (e.g. AH-P-000143)
      const base = reqs.find((r: any) => r.id === 'req_123' || r.referenceNumber === 'AH-P-000123') || reqs[0];
      req = {
        ...JSON.parse(JSON.stringify(base)),
        id: targetId,
        referenceNumber: targetRef,
      };
      reqs.unshift(req);
    }
    if (req) {
      req.status = newStatus;
      req.updatedAt = now;
      if (options.freightMethod) req.selectedFreight = options.freightMethod;

      if (newStatus === 'Awaiting Payment' || newStatus === 'Payment Pending') {
        req.paymentStatus = 'Awaiting Payment';
      } else if (newStatus === 'Customer Approved') {
        req.paymentStatus = 'Awaiting Payment';
      } else if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'PO Issued' ||
        newStatus === 'Received At Shipping Facility' ||
        newStatus === 'In Transit' ||
        newStatus === 'Arrived In New Zealand' ||
        newStatus === 'Customs Clearance' ||
        newStatus === 'Out For Delivery' ||
        newStatus === 'Delivered' ||
        newStatus === 'Closed'
      ) {
        req.paymentStatus = 'Payment Received';
      } else if (newStatus === 'Quote Ready' || newStatus === 'Sourcing' || newStatus === 'Request Submitted' || newStatus === 'Submitted') {
        req.paymentStatus = 'Pending Quote';
      }

      if (!req.trackingMilestones) req.trackingMilestones = [];
      req.trackingMilestones.push({
        id: `m_${Date.now()}_sync`,
        title: `Lifecycle Stage: ${newStatus}`,
        location: 'PROCURly Logistics Network',
        timestamp: 'Just now',
        status: 'completed',
        description: options.note || `Process successfully advanced to "${newStatus}" by ${actor}.`,
      });

      localStorage.setItem('procurly_requests_v3', JSON.stringify(reqs));
    }
  } catch (e) {
    console.error('Error syncing Customer requests:', e);
  }

  // 2. UPDATE OPERATIONS PORTAL STORAGE (procurly_ops_requests_v1)
  try {
    const rawOps = localStorage.getItem('procurly_ops_requests_v1');
    const opsReqs = rawOps ? JSON.parse(rawOps) : [...OPS_INITIAL_REQUESTS];
    let opsReq = opsReqs.find(
      (r: any) =>
        r.id === targetId ||
        r.id === rawInput ||
        (r.referenceNumber && r.referenceNumber.toUpperCase() === targetRef) ||
        (r.referenceNumber && r.referenceNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, ''))
    );
    if (!opsReq && opsReqs.length > 0) {
      const baseOps = opsReqs.find((r: any) => r.id === 'req_000123' || r.referenceNumber === 'AH-P-000123') || opsReqs[0];
      opsReq = {
        ...JSON.parse(JSON.stringify(baseOps)),
        id: targetId,
        referenceNumber: targetRef,
      };
      opsReqs.unshift(opsReq);
    }
    if (opsReq) {
      opsReq.status = newStatus;
      opsReq.updatedAt = now.replace('T', ' ').substring(0, 16);

      if (!opsReq.timeline) opsReq.timeline = [];
      opsReq.timeline.unshift({
        id: `ev_${Date.now()}`,
        stage: newStatus,
        action: `Process status updated to "${newStatus}"`,
        user: actor,
        timestamp: 'Just now',
        isCompleted: true,
        isCurrent: true,
        note: options.note,
      });

      if (opsReq.shipment) {
        if (newStatus === 'Received At Shipping Facility') {
          opsReq.shipment.status = 'Ready for Dispatch';
        } else if (newStatus === 'In Transit') {
          opsReq.shipment.status = 'In Transit';
        } else if (newStatus === 'Arrived In New Zealand' || newStatus === 'Customs Clearance') {
          opsReq.shipment.status = 'Customs Clearance';
        } else if (newStatus === 'Out For Delivery') {
          opsReq.shipment.status = 'Out For Delivery';
        } else if (newStatus === 'Delivered' || newStatus === 'Closed') {
          opsReq.shipment.status = 'Delivered';
        }
      }

      localStorage.setItem('procurly_ops_requests_v1', JSON.stringify(opsReqs));
    }
  } catch (e) {
    console.error('Error syncing Operations requests:', e);
  }

  // 3. UPDATE PROCUREMENT PORTAL STORAGE (procurly_proc_requests_v2 & procurly_proc_pos_v2)
  try {
    const rawProc = localStorage.getItem('procurly_proc_requests_v2');
    const procReqs = rawProc ? JSON.parse(rawProc) : [...PROC_INITIAL_REQUESTS];
    let procReq = procReqs.find(
      (r: any) =>
        r.id === targetId ||
        r.id === rawInput ||
        (r.requestNumber && r.requestNumber.toUpperCase() === targetRef) ||
        (r.requestNumber && r.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, ''))
    );
    if (!procReq && procReqs.length > 0) {
      const baseProc = procReqs.find((r: any) => r.id === 'req_000123' || r.requestNumber === 'AH-P-000123') || procReqs[0];
      procReq = {
        ...JSON.parse(JSON.stringify(baseProc)),
        id: targetId,
        requestNumber: targetRef,
      };
      procReqs.unshift(procReq);
    }
    if (procReq) {
      procReq.status = newStatus as any;
      procReq.updatedAt = now;

      if (newStatus === 'Sourcing' || newStatus === 'Request Submitted' || newStatus === 'Submitted') {
        procReq.sourcingStatus = 'Sourcing';
      } else if (newStatus === 'Quote Ready' || newStatus === 'Customer Approved' || newStatus === 'Awaiting Customer Approval') {
        procReq.sourcingStatus = 'Sourcing Complete';
      }

      if (!procReq.timeline) procReq.timeline = [];
      procReq.timeline.unshift({
        title: `Procurement Flow: ${newStatus}`,
        timestamp: now,
        actor: actor,
        description: options.note || `Flow synchronization moved status to ${newStatus}.`,
      });

      localStorage.setItem('procurly_proc_requests_v2', JSON.stringify(procReqs));
    }

    // Sync PO in procurement
    const rawPOs = localStorage.getItem('procurly_proc_pos_v2');
    if (rawPOs) {
      const pos = JSON.parse(rawPOs);
      const po = pos.find(
        (p: any) =>
          (p.requestRef && p.requestRef.toUpperCase() === targetRef) ||
          (p.requestRef && p.requestRef.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, ''))
      );
      if (po) {
        if (newStatus === 'Ordered From Supplier' || newStatus === 'PO Issued') {
          po.status = 'Ordered';
        } else if (newStatus === 'Delivered' || newStatus === 'Closed') {
          po.status = 'Fully Received';
        }
        localStorage.setItem('procurly_proc_pos_v2', JSON.stringify(pos));
      }
    }
  } catch (e) {
    console.error('Error syncing Procurement requests:', e);
  }

  // 4. UPDATE FINANCE PORTAL STORAGE (procurly_fin_payments_v1 & procurly_fin_awaiting_v1 & procurly_fin_orders_v1)
  try {
    const rawFinPay = localStorage.getItem('procurly_fin_payments_v1');
    const finPays = rawFinPay ? JSON.parse(rawFinPay) : [...INITIAL_FINANCE_PAYMENTS];
    let finPay = finPays.find(
      (p: any) =>
        (p.requestNumber && p.requestNumber.toUpperCase() === targetRef) ||
        (p.requestNumber && p.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, '')) ||
        p.id === `PAY-${targetRef.replace('AH-P-', '')}` ||
        p.id === rawInput
    );
    if (!finPay && finPays.length > 0) {
      const basePay = finPays[0];
      finPay = {
        ...JSON.parse(JSON.stringify(basePay)),
        id: `PAY-${targetRef.replace('AH-P-', '')}`,
        requestNumber: targetRef,
      };
      finPays.unshift(finPay);
    }
    if (finPay) {
      if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'PO Issued' ||
        newStatus === 'Received At Shipping Facility' ||
        newStatus === 'In Transit' ||
        newStatus === 'Arrived In New Zealand' ||
        newStatus === 'Customs Clearance' ||
        newStatus === 'Out For Delivery' ||
        newStatus === 'Delivered' ||
        newStatus === 'Closed'
      ) {
        finPay.status = 'Received';
        finPay.paymentDate = 'Today';
      } else if (newStatus === 'Awaiting Payment' || newStatus === 'Payment Pending' || newStatus === 'Customer Approved') {
        finPay.status = 'Awaiting';
      }
      localStorage.setItem('procurly_fin_payments_v1', JSON.stringify(finPays));
    }

    // Sync awaiting payments store
    const rawFinAwaiting = localStorage.getItem('procurly_fin_awaiting_v1');
    const finAwaiting = rawFinAwaiting ? JSON.parse(rawFinAwaiting) : [...INITIAL_AWAITING_PAYMENTS];
    const awaitingItem = finAwaiting.find(
      (a: any) =>
        (a.requestNumber && a.requestNumber.toUpperCase() === targetRef) ||
        (a.requestNumber && a.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, '')) ||
        a.id === `AWT-${targetRef.replace('AH-P-', '')}`
    );
    if (awaitingItem) {
      if (
        newStatus === 'Payment Received' ||
        newStatus === 'Ordered From Supplier' ||
        newStatus === 'PO Issued' ||
        newStatus === 'Received At Shipping Facility' ||
        newStatus === 'In Transit' ||
        newStatus === 'Delivered' ||
        newStatus === 'Closed'
      ) {
        awaitingItem.status = 'Paid & Released';
      } else if (newStatus === 'Awaiting Payment' || newStatus === 'Payment Pending' || newStatus === 'Customer Approved') {
        awaitingItem.status = 'Due Soon';
      }
      localStorage.setItem('procurly_fin_awaiting_v1', JSON.stringify(finAwaiting));
    }

    // Sync Finance Approved Orders
    const rawFinOrders = localStorage.getItem('procurly_fin_orders_v1');
    if (rawFinOrders) {
      const finOrders = JSON.parse(rawFinOrders);
      const finOrder = finOrders.find(
        (o: any) =>
          (o.requestNumber && o.requestNumber.toUpperCase() === targetRef) ||
          (o.requestNumber && o.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, ''))
      );
      if (finOrder) {
        if (
          newStatus === 'Payment Received' ||
          newStatus === 'Ordered From Supplier' ||
          newStatus === 'PO Issued' ||
          newStatus === 'In Transit' ||
          newStatus === 'Delivered' ||
          newStatus === 'Closed'
        ) {
          finOrder.clearanceStatus = 'Financially Cleared';
          finOrder.creditVerified = true;
          finOrder.releasedToProcurementAt = now;
        } else if (newStatus === 'Customer Approved' || newStatus === 'Awaiting Payment') {
          finOrder.clearanceStatus = 'Awaiting Payment';
        }
        localStorage.setItem('procurly_fin_orders_v1', JSON.stringify(finOrders));
      }
    }
  } catch (e) {
    console.error('Error syncing Finance payments & orders:', e);
  }

  // 5. UPDATE ORDERS & SHIPMENTS STORAGE (procurly_orders_v3 & procurly_shipments_v3)
  try {
    const rawOrders = localStorage.getItem('procurly_orders_v3');
    const orders = rawOrders ? JSON.parse(rawOrders) : [...CUSTOMER_INITIAL_ORDERS];
    let order = orders.find(
      (o: any) =>
        (o.requestNumber && o.requestNumber.toUpperCase() === targetRef) ||
        (o.requestNumber && o.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, '')) ||
        o.requestId === targetId ||
        o.requestId === rawInput ||
        o.id === rawInput ||
        (o.orderNumber && o.orderNumber.toUpperCase() === rawInput.toUpperCase())
    );
    if (!order && orders.length > 0) {
      const baseOrd = orders[0];
      order = {
        ...JSON.parse(JSON.stringify(baseOrd)),
        id: `ord_${targetRef.replace(/[^0-9]/g, '')}`,
        orderNumber: `ORD-${targetRef.replace('AH-P-', '')}`,
        requestNumber: targetRef,
        requestId: targetId,
      };
      orders.unshift(order);
    }
    if (order) {
      order.status = newStatus;
      order.timeline = getSynchronizedOrderTimeline(newStatus, order.timeline);
      localStorage.setItem('procurly_orders_v3', JSON.stringify(orders));
    }

    const rawShipments = localStorage.getItem('procurly_shipments_v3');
    const shipments = rawShipments ? JSON.parse(rawShipments) : [...CUSTOMER_INITIAL_SHIPMENTS];
    let shipment = shipments.find(
      (s: any) =>
        (s.requestNumber && s.requestNumber.toUpperCase() === targetRef) ||
        (s.requestNumber && s.requestNumber.replace(/[^0-9]/g, '') === targetRef.replace(/[^0-9]/g, '')) ||
        s.requestId === targetId ||
        s.requestId === rawInput ||
        s.id === rawInput
    );
    if (!shipment && shipments.length > 0) {
      const baseShp = shipments[0];
      shipment = {
        ...JSON.parse(JSON.stringify(baseShp)),
        id: `shp_${targetRef.replace(/[^0-9]/g, '')}`,
        trackingNumber: `NZP-AIR-${targetRef.replace(/[^0-9]/g, '')}-1192`,
        requestNumber: targetRef,
        requestId: targetId,
      };
      shipments.unshift(shipment);
    }
    if (shipment) {
      if (newStatus === 'In Transit') {
        shipment.currentStatus = 'In Transit';
        shipment.status = 'In Transit';
      } else if (newStatus === 'Arrived In New Zealand' || newStatus === 'Customs Clearance') {
        shipment.currentStatus = 'Customs Clearance';
        shipment.status = 'Customs Clearance';
      } else if (newStatus === 'Out For Delivery') {
        shipment.currentStatus = 'Out For Delivery';
        shipment.status = 'Out For Delivery';
      } else if (newStatus === 'Delivered' || newStatus === 'Closed') {
        shipment.currentStatus = 'Delivered';
        shipment.status = 'Delivered';
        if (shipment.events) {
          shipment.events.forEach((ev: any) => {
            ev.status = 'completed';
          });
        }
      } else if (newStatus === 'Ordered From Supplier' || newStatus === 'PO Issued') {
        shipment.status = 'Order Placed with Supplier';
        shipment.currentStatus = 'Order Placed with Supplier';
      }
      localStorage.setItem('procurly_shipments_v3', JSON.stringify(shipments));
    }
  } catch (e) {
    console.error('Error syncing Orders & Shipments:', e);
  }

  // 6. DYNAMICALLY GENERATE / SYNC TAX INVOICE & RECEIPT IN PORTAL DOCUMENTS (procurly_documents_v3)
  try {
    const rawDocs = localStorage.getItem('procurly_documents_v3');
    const docs = rawDocs ? JSON.parse(rawDocs) : CUSTOMER_INITIAL_DOCUMENTS;

    const hasInvoice = docs.some((d: any) => d.id === 'doc_123_inv' || (d.requestNumber === targetRef && d.category === 'Invoices'));
    const hasReceipt = docs.some((d: any) => d.id === 'doc_123_rcp' || (d.requestNumber === targetRef && d.category === 'Payment Receipts'));

    const isPaid = [
      'Payment Received',
      'Ordered From Supplier',
      'Received At Shipping Facility',
      'In Transit',
      'Arrived In New Zealand',
      'Customs Clearance',
      'Out For Delivery',
      'Delivered',
      'Closed',
    ].includes(newStatus);

    if (isPaid && !hasInvoice) {
      docs.unshift({
        id: 'doc_123_inv',
        title: `Tax Invoice — INV-2026-000123`,
        category: 'Invoices',
        requestId: targetId,
        requestNumber: targetRef,
        date: '28 Aug 2026',
        fileFormat: 'PDF',
        fileSizeBytes: 310000,
        fileSizeFormatted: '310 KB',
        documentType: 'Tax Invoice',
        previewData: {
          invoiceNumber: 'INV-2026-000123',
          customerName: 'AutoCare Auckland (James Wilson)',
          vehicleDetails: '2019 Toyota Hiace ZX Grand Cabin (VIN: JTEBR32P10029384)',
          partDetails: 'Left Front Lower Control Arm (OEM: 48069-26150)',
          items: [
            { desc: 'Left Front Lower Control Arm (Genuine OEM Toyota)', qty: 1, unitPrice: 350.0, total: 350.0 },
            { desc: 'International Air Freight (Priority Express NZ Post)', qty: 1, unitPrice: 85.0, total: 85.0 },
            { desc: 'Autohub Verified Procurement & Logistics Service', qty: 1, unitPrice: 50.0, total: 50.0 },
          ],
          subtotal: 485.0,
          gst: 0.0,
          total: 485.0,
        },
      });
    }

    if (isPaid && !hasReceipt) {
      docs.unshift({
        id: 'doc_123_rcp',
        title: `Payment Receipt — RCP-2026-000123`,
        category: 'Payment Receipts',
        requestId: targetId,
        requestNumber: targetRef,
        date: '28 Aug 2026',
        fileFormat: 'PDF',
        fileSizeBytes: 180000,
        fileSizeFormatted: '180 KB',
        documentType: 'Receipt',
        previewData: {
          quoteNumber: 'RCP-2026-000123',
          customerName: 'AutoCare Auckland (James Wilson)',
          vehicleDetails: '2019 Toyota Hiace ZX Grand Cabin (VIN: JTEBR32P10029384)',
          partDetails: 'Left Front Lower Control Arm (OEM: 48069-26150)',
          items: [
            { desc: 'Payment received via Direct Trade Settlement / Bank Wire', qty: 1, unitPrice: 485.0, total: 485.0 },
          ],
          subtotal: 485.0,
          gst: 0.0,
          total: 485.0,
        },
      });
    }

    localStorage.setItem('procurly_documents_v3', JSON.stringify(docs));
  } catch (e) {
    console.error('Error syncing Documents:', e);
  }

  // 7. DISPATCH REAL-TIME CROSS-PORTAL NOTIFICATIONS
  try {
    // Add to Customer Notifications
    const rawNotifs = localStorage.getItem('procurly_notifications_v3');
    const customerNotifs = rawNotifs ? JSON.parse(rawNotifs) : [];
    customerNotifs.unshift({
      id: `notif_${Date.now()}`,
      type: 'QUOTE_ACCEPTED',
      title: `Order Update: ${newStatus}`,
      description: `${targetRef} (2019 Toyota Hiace - Left Front Lower Control Arm) is now "${newStatus}".`,
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
      title: `${targetRef} Status: ${newStatus}`,
      description: `Procurement workflow transitioned to "${newStatus}".`,
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
      title: `${targetRef} Finance Notification`,
      description: `Order ${targetRef} billing updated to "${newStatus}".`,
      timestamp: 'Just now',
      isRead: false,
      actionUrl: `/finance/payments/PAY-000123`,
    });
    localStorage.setItem('procurly_fin_notifs_v1', JSON.stringify(finNotifs));
  } catch (e) {
    console.error('Error creating notifications:', e);
  }

  // 8. BROADCAST ALL REAL-TIME DOM EVENTS ACROSS ALL DESKS & ACTIVE TABS
  window.dispatchEvent(new Event('procurly_data_updated'));
  window.dispatchEvent(new Event('procurly_requests_updated'));
  window.dispatchEvent(new Event('procurly_ops_updated'));
  window.dispatchEvent(new Event('procurly_procurement_updated'));
  window.dispatchEvent(new Event('procurly_finance_updated'));
  window.dispatchEvent(new Event('storage'));
}
