import {
  PartRequest,
  CompanyProfile,
  TradeAccount,
  RequestStatus,
  QuoteOption,
  ProcurementOrder,
  ShipmentTracking,
  PaymentTransaction,
  PortalDocument,
  TeamMember,
  NotificationItem,
  ChatMessage,
  DeliveryAddress,
} from '@/types';
import {
  INITIAL_REQUESTS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_ORDERS,
  INITIAL_SHIPMENTS,
  INITIAL_PAYMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const REQUESTS_KEY = 'procurly_requests_v3';
const COMPANY_KEY = 'procurly_company_v3';
const ORDERS_KEY = 'procurly_orders_v3';
const SHIPMENTS_KEY = 'procurly_shipments_v3';
const PAYMENTS_KEY = 'procurly_payments_v3';
const DOCUMENTS_KEY = 'procurly_documents_v3';
const TEAM_KEY = 'procurly_team_v3';
const NOTIFICATIONS_KEY = 'procurly_notifications_v3';

class MockRequestsService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, data: T) {
    if (this.isBrowser()) {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('procurly_data_updated'));
      window.dispatchEvent(new Event('procurly_requests_updated'));
    }
  }

  // =================== REQUESTS ===================
  async getRequests(statusFilter?: string, searchQuery?: string): Promise<PartRequest[]> {
    let list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);

    if (statusFilter && statusFilter !== 'All') {
      const f = statusFilter.toLowerCase();
      if (f === 'awaiting action' || f === 'action required' || f === 'awaiting customer approval') {
        list = list.filter(
          (r) =>
            r.status === 'Quote Ready' ||
            r.status === 'Quoted' ||
            r.status === 'Awaiting Customer Approval' ||
            r.status === 'Payment Failed' ||
            r.paymentStatus === 'Awaiting Payment' ||
            r.paymentStatus === 'Payment Failed'
        );
      } else if (f === 'sourcing') {
        list = list.filter((r) => r.status === 'Sourcing' || r.status === 'Request Submitted');
      } else if (f === 'quoted') {
        list = list.filter((r) => r.status === 'Quote Ready' || r.status === 'Quoted');
      } else if (f === 'in progress' || f === 'in procurement') {
        list = list.filter(
          (r) =>
            r.status === 'Customer Approved' ||
            r.status === 'Ordered From Supplier' ||
            r.status === 'Received At Shipping Facility' ||
            r.status === 'In Transit' ||
            r.status === 'In Transit - Air' ||
            r.status === 'In Transit - Sea' ||
            r.status === 'Customs Clearance' ||
            r.status === 'Out For Delivery'
        );
      } else if (f === 'completed' || f === 'delivered') {
        list = list.filter((r) => r.status === 'Delivered' || r.status === 'Closed');
      } else {
        list = list.filter((r) => r.status.toLowerCase().includes(f));
      }
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.vehicle.make.toLowerCase().includes(q) ||
          r.vehicle.model.toLowerCase().includes(q) ||
          r.vehicle.vin.toLowerCase().includes(q) ||
          (r.vehicle.regoNumber && r.vehicle.regoNumber.toLowerCase().includes(q)) ||
          r.parts.some(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.partNumber && p.partNumber.toLowerCase().includes(q))
          )
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getRequestById(id: string): Promise<PartRequest | null> {
    const list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    return (
      list.find(
        (r) =>
          r.id === id ||
          r.referenceNumber.toLowerCase() === id.toLowerCase() ||
          r.referenceNumber.toLowerCase().replace(/[^a-z0-9]/g, '') ===
            id.toLowerCase().replace(/[^a-z0-9]/g, '')
      ) || null
    );
  }

  async getRequestByRef(ref: string): Promise<PartRequest | null> {
    return this.getRequestById(ref);
  }

  async createRequest(
    data: Omit<PartRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<PartRequest> {
    const list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const nextIndex = list.length + 130;
    const refNumber = `AH-P-${String(nextIndex).padStart(6, '0')}`;
    const newId = `req_${Date.now()}`;
    const now = new Date().toISOString();

    const mockAirQuote: QuoteOption = {
      id: `q_${Date.now()}_air`,
      type: 'air',
      name: 'Air Freight',
      carrierName: 'Air New Zealand Cargo Flight NZ90',
      transitDays: '5–8 business days',
      estimatedDeliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partCostNZD: 350.0,
      freightCostNZD: 85.0,
      procurementServiceNZD: 50.0,
      dutiesAndBiosecurityNZD: 0,
      gstNZD: 0,
      localCourierNZD: 0,
      totalLandedCostNZD: 485.0,
      isRecommended: true,
      notes: 'Priority Air Freight with MPI biosecurity green-lane pre-clearance.',
    };

    const mockSeaQuote: QuoteOption = {
      id: `q_${Date.now()}_sea`,
      type: 'sea',
      name: 'Sea Freight',
      carrierName: 'Autohub Consolidated Vessel',
      transitDays: '18–30 business days',
      estimatedDeliveryDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partCostNZD: 350.0,
      freightCostNZD: 35.0,
      procurementServiceNZD: 25.0,
      dutiesAndBiosecurityNZD: 0,
      gstNZD: 0,
      localCourierNZD: 0,
      totalLandedCostNZD: 410.0,
      isRecommended: false,
    };

    const newRequest: PartRequest = {
      ...data,
      id: newId,
      referenceNumber: refNumber,
      createdAt: now,
      updatedAt: now,
      status: 'Quote Ready',
      quoteOptions: [mockAirQuote, mockSeaQuote],
      assignedSpecialist: {
        name: 'Brendon Davies',
        role: 'Senior Sourcing & Logistics Specialist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        directPhone: '09 525 6814',
        email: 'brendon.d@autohub.co.nz',
      },
      trackingMilestones: [
        {
          id: `m_${Date.now()}_1`,
          title: 'Request Submitted',
          location: 'AutoCare Auckland Customer Portal',
          timestamp: 'Just now',
          status: 'completed',
          description: `Chassis VIN ${data.vehicle.vin} catalogued and matched against global supplier network.`,
        },
        {
          id: `m_${Date.now()}_2`,
          title: 'Sourcing & Quote Ready',
          location: 'Autohub Sourcing Hub',
          timestamp: 'Just now',
          status: 'completed',
          description: 'Quotes calculated with verified fitment guarantee and transparent landed costs.',
        },
      ],
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'specialist',
          senderName: 'Brendon Davies (Autohub)',
          timestamp: 'Just now',
          text: `Kia ora James! We have prepared landed quotations for your ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}. Please review and select your preferred freight option.`,
        },
      ],
    };

    list.unshift(newRequest);
    this.setItem(REQUESTS_KEY, list);

    // Create corresponding notification
    this.addNotification({
      type: 'REQUEST_SUBMITTED',
      title: 'Request Submitted',
      description: `Your parts request ${refNumber} has been catalogued.`,
      linkUrl: `/requests/${newId}`,
      requestId: newId,
      requestNumber: refNumber,
    });

    return newRequest;
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<PartRequest | null> {
    const list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const item = list.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.setItem(REQUESTS_KEY, list);
    return item;
  }

  async acceptQuote(
    requestId: string,
    quoteId: string,
    acceptanceInfo: { acceptedBy: string; termsVersion?: string }
  ): Promise<{ request: PartRequest; order: ProcurementOrder }> {
    const requests = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const item = requests.find((r) => r.id === requestId);
    if (!item) throw new Error('Request not found');

    const selectedQuote = item.quoteOptions?.find((q) => q.id === quoteId) || item.quoteOptions?.[0];
    item.approvedQuoteId = quoteId;
    item.selectedFreight = selectedQuote?.name === 'Sea Freight' ? 'Sea Freight' : 'Air Freight';
    item.status = 'Awaiting Payment';
    item.paymentStatus = 'Awaiting Payment';
    item.quoteTermsAccepted = {
      acceptedBy: acceptanceInfo.acceptedBy || 'James Wilson',
      acceptedAt: new Date().toISOString(),
      termsVersion: acceptanceInfo.termsVersion || 'v2.4-2026',
      quoteVersion: '1.0',
    };
    item.updatedAt = new Date().toISOString();

    if (item.trackingMilestones) {
      item.trackingMilestones.push({
        id: `m_${Date.now()}_acc`,
        title: 'Customer Approved & Terms Accepted',
        location: 'AutoCare Auckland',
        timestamp: 'Just now',
        status: 'completed',
        description: `Quotation approved by ${acceptanceInfo.acceptedBy}. Proceeding to payment.`,
      });
    }

    this.setItem(REQUESTS_KEY, requests);

    // Create Order
    const orders = this.getItem<ProcurementOrder[]>(ORDERS_KEY, INITIAL_ORDERS);
    const orderNum = `ORD-${item.referenceNumber.replace('AH-P-', '')}`;
    const newOrder: ProcurementOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      requestId: item.id,
      requestNumber: item.referenceNumber,
      vehicle: item.vehicle,
      part: item.parts[0] || { id: 'p_1', name: item.title, quantity: 1 },
      quantity: item.parts[0]?.quantity || 1,
      totalAmountNZD: selectedQuote?.totalLandedCostNZD || 485.0,
      status: 'Customer Approved',
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: selectedQuote?.estimatedDeliveryDate || '2026-09-18',
      freightMethod: item.selectedFreight,
      deliveryAddress: item.deliveryAddress,
      timeline: [
        { stage: 'Customer Approved', timestamp: 'Just now', status: 'completed', description: `Quotation verified and approved by ${acceptanceInfo.acceptedBy}.` },
        { stage: 'Payment Received', timestamp: 'Pending', status: 'in-progress', description: 'Awaiting payment confirmation.' },
        { stage: 'Ordered From Supplier', timestamp: 'Pending', status: 'pending', description: 'PO issuance to overseas supplier.' },
        { stage: 'Received at Shipping Facility', timestamp: 'Pending', status: 'pending', description: 'Export warehouse QA.' },
        { stage: 'Shipment', timestamp: 'Pending', status: 'pending', description: 'International transit.' },
        { stage: 'Delivered', timestamp: 'Pending', status: 'pending', description: 'Workshop handover.' },
      ],
    };
    orders.unshift(newOrder);
    this.setItem(ORDERS_KEY, orders);

    // Create Payment Record
    const payments = this.getItem<PaymentTransaction[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
    const payNum = `PAY-${item.referenceNumber.replace('AH-P-', '')}`;
    const newPayment: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      paymentNumber: payNum,
      requestId: item.id,
      requestNumber: item.referenceNumber,
      orderNumber: orderNum,
      vehicleSummary: `${item.vehicle.make} ${item.vehicle.model} · ${item.vehicle.year}`,
      partSummary: item.parts[0]?.name || item.title,
      amountNZD: selectedQuote?.totalLandedCostNZD || 485.0,
      status: 'Awaiting Payment',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    payments.unshift(newPayment);
    this.setItem(PAYMENTS_KEY, payments);

    this.addNotification({
      type: 'QUOTE_ACCEPTED',
      title: 'Quote Accepted',
      description: `${item.referenceNumber} quote accepted. Complete payment to start procurement.`,
      linkUrl: `/payments`,
      requestId: item.id,
      requestNumber: item.referenceNumber,
    });

    return { request: item, order: newOrder };
  }

  async rejectQuote(requestId: string, reason?: string): Promise<PartRequest | null> {
    const list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const item = list.find((r) => r.id === requestId);
    if (!item) return null;

    item.status = 'Cancelled';
    item.updatedAt = new Date().toISOString();

    if (!item.messages) item.messages = [];
    item.messages.push({
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: 'James Wilson',
      timestamp: 'Just now',
      text: reason ? `Quote declined: ${reason}` : 'Quote declined. Please source alternative pricing.',
    });

    this.setItem(REQUESTS_KEY, list);
    return item;
  }

  async sendMessage(requestId: string, text: string, attachments?: { name: string; size: string; type: string }[]): Promise<PartRequest | null> {
    const list = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const item = list.find((r) => r.id === requestId);
    if (!item) return null;

    if (!item.messages) item.messages = [];
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: 'James Wilson',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      attachments,
    };
    item.messages.push(newMsg);
    item.updatedAt = new Date().toISOString();
    this.setItem(REQUESTS_KEY, list);
    return item;
  }

  // =================== ORDERS ===================
  async getOrders(searchQuery?: string): Promise<ProcurementOrder[]> {
    let list = this.getItem<ProcurementOrder[]>(ORDERS_KEY, INITIAL_ORDERS);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.requestNumber.toLowerCase().includes(q) ||
          o.vehicle.make.toLowerCase().includes(q) ||
          o.vehicle.model.toLowerCase().includes(q) ||
          o.part.name.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getOrderById(id: string): Promise<ProcurementOrder | null> {
    const list = this.getItem<ProcurementOrder[]>(ORDERS_KEY, INITIAL_ORDERS);
    return list.find((o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase()) || null;
  }

  // =================== SHIPMENTS ===================
  async getShipments(searchQuery?: string): Promise<ShipmentTracking[]> {
    let list = this.getItem<ShipmentTracking[]>(SHIPMENTS_KEY, INITIAL_SHIPMENTS);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(q) ||
          s.requestNumber.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.carrierTrackingCode.toLowerCase().includes(q) ||
          s.vehicle.make.toLowerCase().includes(q) ||
          s.vehicle.model.toLowerCase().includes(q) ||
          s.partName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getShipmentById(id: string): Promise<ShipmentTracking | null> {
    const list = this.getItem<ShipmentTracking[]>(SHIPMENTS_KEY, INITIAL_SHIPMENTS);
    return (
      list.find(
        (s) =>
          s.id === id ||
          s.shipmentNumber.toLowerCase() === id.toLowerCase() ||
          s.requestId === id ||
          s.requestNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  // =================== PAYMENTS ===================
  async getPayments(searchQuery?: string): Promise<PaymentTransaction[]> {
    let list = this.getItem<PaymentTransaction[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(q) ||
          p.requestNumber.toLowerCase().includes(q) ||
          p.vehicleSummary.toLowerCase().includes(q) ||
          p.partSummary.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async processPayment(
    paymentId: string,
    method: 'Approved Trade Credit (20th Mth Following)' | 'Credit Card (Visa/Mastercard)' | 'Account2Account Bank Transfer'
  ): Promise<PaymentTransaction | null> {
    const payments = this.getItem<PaymentTransaction[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
    const item = payments.find((p) => p.id === paymentId || p.paymentNumber === paymentId || p.requestId === paymentId);
    if (!item) return null;

    item.status = method.includes('Trade Credit') ? 'Credit Approved' : 'Payment Received';
    item.paidAt = new Date().toISOString();
    item.paymentMethod = method;
    item.receiptNumber = `RCP-2026-${Date.now().toString().slice(-6)}`;
    this.setItem(PAYMENTS_KEY, payments);

    // Update request
    const requests = this.getItem<PartRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS);
    const req = requests.find((r) => r.id === item.requestId || r.referenceNumber === item.requestNumber);
    if (req) {
      req.status = 'Ordered From Supplier';
      req.paymentStatus = item.status;
      req.updatedAt = new Date().toISOString();
      if (req.trackingMilestones) {
        req.trackingMilestones.push({
          id: `m_${Date.now()}_paid`,
          title: 'Payment Received — Supplier Order Placed',
          location: 'Autohub Procurement Desk',
          timestamp: 'Just now',
          status: 'completed',
          description: `Payment authorized via ${method}. Order officially placed with supplier network.`,
        });
      }
      this.setItem(REQUESTS_KEY, requests);
    }

    // Update order
    const orders = this.getItem<ProcurementOrder[]>(ORDERS_KEY, INITIAL_ORDERS);
    const ord = orders.find((o) => o.requestId === item.requestId || o.requestNumber === item.requestNumber);
    if (ord) {
      ord.status = 'Ordered From Supplier';
      ord.timeline.forEach((t) => {
        if (t.stage === 'Payment Received') {
          t.status = 'completed';
          t.timestamp = 'Just now';
        }
        if (t.stage === 'Ordered From Supplier') {
          t.status = 'in-progress';
          t.timestamp = 'Just now';
        }
      });
      this.setItem(ORDERS_KEY, orders);
    }

    this.addNotification({
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      description: `Payment for ${item.requestNumber} (${item.vehicleSummary}) confirmed. Procurement in progress.`,
      linkUrl: `/orders`,
      requestId: item.requestId,
      requestNumber: item.requestNumber,
    });

    return item;
  }

  // =================== DOCUMENTS ===================
  async getDocuments(categoryFilter?: string, searchQuery?: string): Promise<PortalDocument[]> {
    let list = this.getItem<PortalDocument[]>(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    if (categoryFilter && categoryFilter !== 'All') {
      list = list.filter((d) => d.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.requestNumber.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getDocumentById(id: string): Promise<PortalDocument | null> {
    const list = this.getItem<PortalDocument[]>(DOCUMENTS_KEY, INITIAL_DOCUMENTS);
    return list.find((d) => d.id === id) || null;
  }

  // =================== COMPANY PROFILE ===================
  async getCompanyProfile(): Promise<CompanyProfile> {
    return this.getItem<CompanyProfile>(COMPANY_KEY, INITIAL_COMPANY_PROFILE);
  }

  // Legacy alias
  async getTradeAccount(): Promise<TradeAccount> {
    return this.getCompanyProfile();
  }

  async updateTradeAccount(data: any): Promise<CompanyProfile> {
    return this.updateCompanyProfile(data);
  }

  async updateCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const current = await this.getCompanyProfile();
    const updated = { ...current, ...data };
    this.setItem(COMPANY_KEY, updated);
    return updated;
  }

  async addDeliveryAddress(address: DeliveryAddress): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    const newAddr = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    if (address.isDefault) {
      profile.deliveryAddresses.forEach((a) => (a.isDefault = false));
    }
    profile.deliveryAddresses.push(newAddr);
    this.setItem(COMPANY_KEY, profile);
    return profile;
  }

  // =================== TEAM MEMBERS ===================
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.getItem<TeamMember[]>(TEAM_KEY, INITIAL_TEAM_MEMBERS);
  }

  async addTeamMember(member: Omit<TeamMember, 'id' | 'lastActive' | 'avatarInitials'>): Promise<TeamMember> {
    const list = this.getItem<TeamMember[]>(TEAM_KEY, INITIAL_TEAM_MEMBERS);
    const initials = member.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newMember: TeamMember = {
      ...member,
      id: `team_${Date.now()}`,
      lastActive: 'Invited today',
      avatarInitials: initials,
    };
    list.push(newMember);
    this.setItem(TEAM_KEY, list);
    return newMember;
  }

  // =================== NOTIFICATIONS ===================
  async getNotifications(): Promise<NotificationItem[]> {
    return this.getItem<NotificationItem[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
  }

  async markNotificationRead(id: string): Promise<void> {
    const list = this.getItem<NotificationItem[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.setItem(NOTIFICATIONS_KEY, list);
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    const list = this.getItem<NotificationItem[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    list.forEach((n) => (n.isRead = true));
    this.setItem(NOTIFICATIONS_KEY, list);
  }

  private addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'timeAgo' | 'timeGroup' | 'isRead'>) {
    const list = this.getItem<NotificationItem[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      timeGroup: 'Today',
      isRead: false,
    };
    list.unshift(newNotif);
    this.setItem(NOTIFICATIONS_KEY, list);
  }

  // =================== GLOBAL SEARCH ===================
  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) return { requests: [], orders: [], shipments: [], documents: [] };
    const q = query.toLowerCase().trim();

    const requests = (await this.getRequests()).filter(
      (r) =>
        r.referenceNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q) ||
        r.parts.some((p) => p.name.toLowerCase().includes(q))
    ).slice(0, 5);

    const orders = (await this.getOrders()).filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.requestNumber.toLowerCase().includes(q) ||
        o.part.name.toLowerCase().includes(q) ||
        o.vehicle.make.toLowerCase().includes(q)
    ).slice(0, 5);

    const shipments = (await this.getShipments()).filter(
      (s) =>
        s.shipmentNumber.toLowerCase().includes(q) ||
        s.requestNumber.toLowerCase().includes(q) ||
        s.carrierTrackingCode.toLowerCase().includes(q) ||
        s.partName.toLowerCase().includes(q)
    ).slice(0, 5);

    const documents = (await this.getDocuments()).filter(
      (d) => d.title.toLowerCase().includes(q) || d.requestNumber.toLowerCase().includes(q)
    ).slice(0, 5);

    return { requests, orders, shipments, documents };
  }

  // =================== RESET ===================
  async resetToDefaults(): Promise<void> {
    if (this.isBrowser()) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_REQUESTS));
      localStorage.setItem(COMPANY_KEY, JSON.stringify(INITIAL_COMPANY_PROFILE));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(INITIAL_SHIPMENTS));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      localStorage.setItem(TEAM_KEY, JSON.stringify(INITIAL_TEAM_MEMBERS));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      window.dispatchEvent(new Event('procurly_data_updated'));
      window.dispatchEvent(new Event('procurly_requests_updated'));
    }
  }
}

export const requestsService = new MockRequestsService();
