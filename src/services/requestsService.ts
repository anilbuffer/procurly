import { PartRequest, TradeAccount, RequestStatus, QuoteOption } from '@/types';
import { INITIAL_REQUESTS, INITIAL_TRADE_ACCOUNT } from './mockData';

const REQUESTS_STORAGE_KEY = 'procurly_requests_data_v2';
const ACCOUNT_STORAGE_KEY = 'procurly_account_data_v2';

// Abstract Interface for Requests Service
export interface IRequestsService {
  getRequests(statusFilter?: string, searchQuery?: string): Promise<PartRequest[]>;
  getRequestById(id: string): Promise<PartRequest | null>;
  getRequestByRef(ref: string): Promise<PartRequest | null>;
  createRequest(data: Omit<PartRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>): Promise<PartRequest>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<PartRequest | null>;
  approveQuote(requestId: string, quoteId: string): Promise<PartRequest | null>;
  rejectQuote(requestId: string, reason?: string): Promise<PartRequest | null>;
  sendMessage(requestId: string, text: string): Promise<PartRequest | null>;
  getTradeAccount(): Promise<TradeAccount>;
  updateTradeAccount(data: Partial<TradeAccount>): Promise<TradeAccount>;
  resetToDefaults(): Promise<void>;
}

class MockRequestsService implements IRequestsService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getStoredRequests(): PartRequest[] {
    if (!this.isBrowser()) return INITIAL_REQUESTS;
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REQUESTS;
    }
  }

  private saveRequests(requests: PartRequest[]) {
    if (this.isBrowser()) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
      // Dispatch custom storage event for in-tab reactive updates
      window.dispatchEvent(new Event('procurly_requests_updated'));
    }
  }

  async getRequests(statusFilter?: string, searchQuery?: string): Promise<PartRequest[]> {
    let list = this.getStoredRequests();

    if (statusFilter && statusFilter !== 'All') {
      const filterLower = statusFilter.toLowerCase();
      if (filterLower === 'quoted' || filterLower === 'quote ready' || filterLower === 'awaiting approval') {
        list = list.filter((r) => r.status === 'Quoted' || r.status === 'Quote Ready');
      } else if (filterLower === 'in transit' || filterLower === 'shipped') {
        list = list.filter((r) => r.status === 'Shipped' || r.status.includes('In Transit') || r.status === 'Customs Clearance');
      } else if (filterLower === 'delivered' || filterLower === 'completed') {
        list = list.filter((r) => r.status === 'Delivered');
      } else {
        list = list.filter((r) => r.status.toLowerCase().includes(filterLower));
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
          r.parts.some((p) => p.name.toLowerCase().includes(q) || (p.partNumber && p.partNumber.toLowerCase().includes(q)))
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getRequestById(id: string): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    return list.find((r) => r.id === id || r.referenceNumber.toLowerCase() === id.toLowerCase()) || null;
  }

  async getRequestByRef(ref: string): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    return list.find((r) => r.referenceNumber.toLowerCase() === ref.toLowerCase()) || null;
  }

  async createRequest(
    data: Omit<PartRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<PartRequest> {
    const list = this.getStoredRequests();
    const nextIndex = list.length + 129;
    const refNumber = `AH-P-${String(nextIndex).padStart(6, '0')}`;
    const newId = `req_${Date.now()}`;
    const now = new Date().toISOString();

    // Default mock quote generated for the new request
    const mockAirQuote: QuoteOption = {
      id: `q_${Date.now()}_air`,
      type: 'air_express',
      carrierName: 'Air New Zealand Cargo / Priority Express',
      transitDays: '3-5 Business Days',
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partCostNZD: 320.0,
      freightCostNZD: 65.0,
      dutiesAndBiosecurityNZD: 25.0,
      gstNZD: 61.50,
      localCourierNZD: 0.0,
      totalLandedCostNZD: 471.50,
      isRecommended: true,
      notes: 'AIR FREIGHT - FASTEST (Inc. Freight, Customs, GST)',
    };

    const mockSeaQuote: QuoteOption = {
      id: `q_${Date.now()}_sea`,
      type: 'sea_freight',
      carrierName: 'Autohub Consolidated Sea Freight',
      transitDays: '18-22 Business Days',
      estimatedDeliveryDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partCostNZD: 240.0,
      freightCostNZD: 30.0,
      dutiesAndBiosecurityNZD: 20.0,
      gstNZD: 43.50,
      localCourierNZD: 0.0,
      totalLandedCostNZD: 333.50,
      isRecommended: false,
      notes: 'SEA FREIGHT - ECONOMY (Inc. Freight, Customs, GST)',
    };

    const newRequest: PartRequest = {
      ...data,
      id: newId,
      referenceNumber: refNumber,
      createdAt: now,
      updatedAt: now,
      status: 'Quoted',
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
          title: 'Request Submitted & Catalogued',
          location: 'Procurly Portal, NZ',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'completed',
          description: 'Request matched against Autohub global parts inventory.',
        },
        {
          id: `m_${Date.now()}_2`,
          title: 'Landed Quotes Generated',
          location: 'Autohub Sourcing Network, Tokyo / Sydney',
          timestamp: 'Just now',
          status: 'completed',
          description: 'Quotes calculated with verified fitment guarantees and transparent landed costs.',
        },
        {
          id: `m_${Date.now()}_3`,
          title: 'Awaiting Trade Approval',
          location: 'Customer Workshop Portal',
          timestamp: 'Pending',
          status: 'in-progress',
          description: 'Select Air or Sea freight option to trigger overseas dispatch.',
        },
      ],
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'specialist',
          senderName: 'Brendon Davies',
          timestamp: 'Just now',
          text: `Kia ora Dave! We have generated all-inclusive landed quotes for ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}. Please compare the Air vs Sea freight options and confirm approval.`,
        },
      ],
    };

    list.unshift(newRequest);
    this.saveRequests(list);
    return newRequest;
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    const item = list.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.saveRequests(list);
    return item;
  }

  async approveQuote(requestId: string, quoteId: string): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return null;

    item.approvedQuoteId = quoteId;
    const selected = item.quoteOptions?.find((q) => q.id === quoteId);
    item.selectedFreight = selected?.type === 'sea_freight' ? 'Sea Freight (Consolidated)' : 'Air Freight (Express)';
    item.status = selected?.type === 'sea_freight' ? 'In Transit - Sea' : 'Shipped';
    item.updatedAt = new Date().toISOString();

    // Add milestone
    if (item.trackingMilestones) {
      item.trackingMilestones.forEach((m) => {
        if (m.title.includes('Awaiting Trade Approval') || m.title.includes('Landed Quotation Issued')) {
          m.status = 'completed';
          m.timestamp = 'Approved today';
        }
      });
      item.trackingMilestones.push({
        id: `m_${Date.now()}_disp`,
        title: 'Supplier Packaging & Dispatch Scheduled',
        location: 'Export Warehouse Hub, Tokyo',
        timestamp: 'In Progress',
        status: 'in-progress',
        description: `Export packing and customs export filing initiated for ${item.selectedFreight}. Tracking number will be assigned shortly.`,
      });
    }

    this.saveRequests(list);
    return item;
  }

  async rejectQuote(requestId: string, reason?: string): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return null;

    item.status = 'Rejected';
    item.updatedAt = new Date().toISOString();

    if (!item.messages) item.messages = [];
    item.messages.push({
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: 'Dave Morrison',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: reason ? `Quote rejected: ${reason}` : 'Quote rejected. Please source alternative options or pricing.',
    });

    this.saveRequests(list);
    return item;
  }

  async sendMessage(requestId: string, text: string): Promise<PartRequest | null> {
    const list = this.getStoredRequests();
    const item = list.find((r) => r.id === requestId);
    if (!item) return null;

    if (!item.messages) item.messages = [];
    item.messages.push({
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: 'Dave Morrison',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    });

    item.updatedAt = new Date().toISOString();
    this.saveRequests(list);
    return item;
  }

  async getTradeAccount(): Promise<TradeAccount> {
    if (!this.isBrowser()) return INITIAL_TRADE_ACCOUNT;
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(INITIAL_TRADE_ACCOUNT));
      return INITIAL_TRADE_ACCOUNT;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_TRADE_ACCOUNT;
    }
  }

  async updateTradeAccount(data: Partial<TradeAccount>): Promise<TradeAccount> {
    const current = await this.getTradeAccount();
    const updated = { ...current, ...data };
    if (this.isBrowser()) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  }

  async resetToDefaults(): Promise<void> {
    if (this.isBrowser()) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(INITIAL_TRADE_ACCOUNT));
      window.dispatchEvent(new Event('procurly_requests_updated'));
    }
  }
}

export const requestsService = new MockRequestsService();
