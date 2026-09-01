// PROCURly Procurement Service — State Management & Reactive Store
'use client';

import {
  ProcurementStaffUser,
  ProcurementRequest,
  SupplierSummary,
  SupplierQuoteItem,
  PurchaseOrderItem,
  ProcurementTaskItem,
  ProcurementExceptionItem,
  SupplierConversation,
  ProcurementDocumentItem,
  ShipmentDispatchItem,
  ProcurementNotificationItem,
  ProcurementRequestStatus,
  SourcingStatus,
  SupplierQuoteStatus,
  POStatus,
  ExceptionStage,
} from '@/types/procurement';
import {
  INITIAL_STAFF_USERS,
  INITIAL_SUPPLIERS,
  INITIAL_REQUESTS,
  INITIAL_SUPPLIER_QUOTES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TASKS,
  INITIAL_EXCEPTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_SHIPMENTS,
  INITIAL_NOTIFICATIONS,
} from './mockData';
import { syncRequestStatusAcrossRoles } from '@/lib/syncCrossRoleStore';

const KEY_USER = 'procurly_proc_user_v2';
const KEY_REQUESTS = 'procurly_proc_requests_v2';
const KEY_SUPPLIERS = 'procurly_proc_suppliers_v2';
const KEY_QUOTES = 'procurly_proc_quotes_v2';
const KEY_POS = 'procurly_proc_pos_v2';
const KEY_TASKS = 'procurly_proc_tasks_v2';
const KEY_EXCEPTIONS = 'procurly_proc_exceptions_v2';
const KEY_CONVERSATIONS = 'procurly_proc_conversations_v2';
const KEY_DOCS = 'procurly_proc_docs_v2';
const KEY_SHIPMENTS = 'procurly_proc_shipments_v2';
const KEY_NOTIFS = 'procurly_proc_notifs_v2';

class ProcurementService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private dispatch() {
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('procurly_procurement_updated'));
    }
  }

  // --- USER & STAFF ---
  public getCurrentUser(): ProcurementStaffUser {
    if (!this.isBrowser()) return INITIAL_STAFF_USERS[0];
    try {
      const val = localStorage.getItem(KEY_USER);
      if (val) return JSON.parse(val);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STAFF_USERS[0];
  }

  public getStaffUsers(): ProcurementStaffUser[] {
    return INITIAL_STAFF_USERS;
  }

  public switchUser(userId: string): ProcurementStaffUser {
    const user = INITIAL_STAFF_USERS.find((u) => u.id === userId) || INITIAL_STAFF_USERS[0];
    if (this.isBrowser()) {
      localStorage.setItem(KEY_USER, JSON.stringify(user));
      this.dispatch();
    }
    return user;
  }

  // --- REQUESTS ---
  public getRequests(): ProcurementRequest[] {
    if (!this.isBrowser()) return INITIAL_REQUESTS;
    try {
      const val = localStorage.getItem(KEY_REQUESTS);
      if (val) {
        const stored: ProcurementRequest[] = JSON.parse(val);
        let updated = false;
        INITIAL_REQUESTS.forEach((initReq) => {
          if (!stored.some((r) => r.id === initReq.id || r.requestNumber === initReq.requestNumber)) {
            stored.unshift(initReq);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_REQUESTS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REQUESTS;
  }

  public getRequestById(id: string): ProcurementRequest | undefined {
    const reqs = this.getRequests();
    const clean = id.trim().toLowerCase();
    const match = reqs.find(
      (r) =>
        r.id.toLowerCase() === clean ||
        r.requestNumber.toLowerCase() === clean ||
        r.requestNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
    );
    if (match) return match;

    const baseReq = reqs.find((r) => r.id === 'req_000123' || r.requestNumber === 'AH-P-000123' || r.id === 'req_123') || reqs[0];
    if (baseReq) {
      const numPart = id.replace(/[^0-9]/g, '') || '000143';
      const formattedRef = id.toUpperCase().includes('AH-P-')
        ? id.toUpperCase()
        : `AH-P-${numPart.padStart(6, '0')}`;
      const formattedId = id.toLowerCase().startsWith('req_')
        ? id.toLowerCase()
        : `req_${numPart.padStart(6, '0')}`;

      return {
        ...JSON.parse(JSON.stringify(baseReq)),
        id: formattedId,
        requestNumber: formattedRef,
      };
    }

    return undefined;
  }

  public updateRequestStatus(
    id: string,
    status: ProcurementRequestStatus,
    sourcingStatus?: SourcingStatus,
    note?: string
  ): ProcurementRequest | null {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === id || r.requestNumber === id);
    if (idx === -1) return null;

    const user = this.getCurrentUser();
    reqs[idx].status = status;
    if (sourcingStatus) {
      reqs[idx].sourcingStatus = sourcingStatus;
    }
    reqs[idx].updatedAt = new Date().toISOString();

    reqs[idx].timeline.unshift({
      title: `Status Updated to ${status}`,
      timestamp: new Date().toISOString(),
      actor: user.name,
      description: note || `Request transitioned to status: ${status}`,
    });

    if (note) {
      reqs[idx].internalNotes.unshift({
        id: 'note_' + Date.now(),
        author: user.name,
        timestamp: new Date().toISOString(),
        text: note,
      });
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      this.dispatch();

      syncRequestStatusAcrossRoles(reqs[idx].requestNumber, status, {
        actorName: user.name,
        note,
      });
    }
    return reqs[idx];
  }

  public addRequestInternalNote(requestId: string, text: string): void {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.requestNumber === requestId);
    if (idx === -1) return;

    const user = this.getCurrentUser();
    reqs[idx].internalNotes.unshift({
      id: 'note_' + Date.now(),
      author: user.name,
      timestamp: new Date().toISOString(),
      text,
    });
    reqs[idx].updatedAt = new Date().toISOString();

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      this.dispatch();
    }
  }

  public assignRequest(requestId: string, staffId: string): void {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.requestNumber === requestId);
    if (idx === -1) return;

    const staff = INITIAL_STAFF_USERS.find((s) => s.id === staffId);
    if (!staff) return;

    reqs[idx].assignedStaffId = staff.id;
    reqs[idx].assignedTo = staff.name;
    reqs[idx].updatedAt = new Date().toISOString();

    reqs[idx].timeline.unshift({
      title: `Assigned to ${staff.name}`,
      timestamp: new Date().toISOString(),
      actor: this.getCurrentUser().name,
      description: `Ownership reassigned to ${staff.name} (${staff.role})`,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      this.dispatch();
    }
  }

  // --- SUPPLIERS ---
  public getSuppliers(): SupplierSummary[] {
    if (!this.isBrowser()) return INITIAL_SUPPLIERS;
    try {
      const val = localStorage.getItem(KEY_SUPPLIERS);
      if (val) {
        const stored: SupplierSummary[] = JSON.parse(val);
        let updated = false;
        INITIAL_SUPPLIERS.forEach((initSup) => {
          if (!stored.some((s) => s.id === initSup.id || s.code === initSup.code)) {
            stored.unshift(initSup);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_SUPPLIERS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUPPLIERS;
  }

  public getSupplierById(id: string): SupplierSummary | undefined {
    const sups = this.getSuppliers();
    return sups.find((s) => s.id === id || s.code === id);
  }

  public addSupplier(supplier: Omit<SupplierSummary, 'id' | 'reliabilityScore' | 'activeOrdersCount'>): SupplierSummary {
    const sups = this.getSuppliers();
    const newSup: SupplierSummary = {
      ...supplier,
      id: 'sup_' + Date.now(),
      activeOrdersCount: 0,
      reliabilityScore: 90,
    };
    sups.unshift(newSup);
    if (this.isBrowser()) {
      localStorage.setItem(KEY_SUPPLIERS, JSON.stringify(sups));
      this.dispatch();
    }
    return newSup;
  }

  // --- SUPPLIER QUOTES ---
  public getSupplierQuotes(): SupplierQuoteItem[] {
    if (!this.isBrowser()) return INITIAL_SUPPLIER_QUOTES;
    try {
      const val = localStorage.getItem(KEY_QUOTES);
      if (val) {
        const stored: SupplierQuoteItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_SUPPLIER_QUOTES.forEach((initQ) => {
          if (!stored.some((q) => q.id === initQ.id || q.quoteNumber === initQ.quoteNumber)) {
            stored.unshift(initQ);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_QUOTES, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_QUOTES, JSON.stringify(INITIAL_SUPPLIER_QUOTES));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUPPLIER_QUOTES;
  }

  public getQuotesByRequestId(requestId: string): SupplierQuoteItem[] {
    const quotes = this.getSupplierQuotes();
    return quotes.filter((q) => q.requestId === requestId || q.requestRef === requestId);
  }

  public getQuoteById(quoteId: string): SupplierQuoteItem | undefined {
    const quotes = this.getSupplierQuotes();
    return quotes.find((q) => q.id === quoteId || q.quoteNumber === quoteId);
  }

  public addSupplierQuote(quote: Omit<SupplierQuoteItem, 'id' | 'quoteNumber' | 'createdAt'>): SupplierQuoteItem {
    const quotes = this.getSupplierQuotes();
    const newQuote: SupplierQuoteItem = {
      ...quote,
      id: 'sq_' + Date.now(),
      quoteNumber: `SQ-${Math.floor(9000 + Math.random() * 999)}`,
      createdAt: new Date().toISOString(),
    };
    quotes.unshift(newQuote);

    // Update request quotes count & status
    const reqs = this.getRequests();
    const rIdx = reqs.findIndex((r) => r.id === quote.requestId || r.requestNumber === quote.requestRef);
    if (rIdx !== -1) {
      reqs[rIdx].quotesCount = (reqs[rIdx].quotesCount || 0) + 1;
      reqs[rIdx].sourcingStatus = 'Quote Received';
      reqs[rIdx].timeline.unshift({
        title: `Supplier Quote Added (${newQuote.quoteNumber})`,
        timestamp: new Date().toISOString(),
        actor: this.getCurrentUser().name,
        description: `Quoted NZD $${newQuote.totalCostNZD} by ${newQuote.supplierName}`,
      });
      if (this.isBrowser()) {
        localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_QUOTES, JSON.stringify(quotes));
      this.dispatch();
    }
    return newQuote;
  }

  public updateQuoteStatus(quoteId: string, status: SupplierQuoteStatus, notes?: string): void {
    const quotes = this.getSupplierQuotes();
    const idx = quotes.findIndex((q) => q.id === quoteId || q.quoteNumber === quoteId);
    if (idx === -1) return;

    quotes[idx].status = status;
    if (notes) quotes[idx].notes = (quotes[idx].notes ? quotes[idx].notes + '\n' : '') + notes;

    if (this.isBrowser()) {
      localStorage.setItem(KEY_QUOTES, JSON.stringify(quotes));
      this.dispatch();
    }
  }

  public selectPreferredSupplier(requestId: string, quoteId: string): void {
    const quotes = this.getSupplierQuotes();
    const targetQuote = quotes.find((q) => q.id === quoteId || q.quoteNumber === quoteId);
    if (!targetQuote) return;

    // Mark other quotes for this request as not accepted / un-preferred
    quotes.forEach((q) => {
      if (q.requestId === requestId || q.requestRef === targetQuote.requestRef) {
        if (q.id === targetQuote.id) {
          q.status = 'Accepted';
          q.isPreferred = true;
        } else {
          q.status = 'Rejected';
          q.isPreferred = false;
        }
      }
    });

    // Update request
    const reqs = this.getRequests();
    const rIdx = reqs.findIndex((r) => r.id === requestId || r.requestNumber === targetQuote.requestRef);
    if (rIdx !== -1) {
      reqs[rIdx].selectedSupplierQuoteId = targetQuote.id;
      reqs[rIdx].sourcingStatus = 'Sourcing Complete';
      reqs[rIdx].status = 'Quote Ready';
      reqs[rIdx].timeline.unshift({
        title: `Preferred Supplier Selected: ${targetQuote.supplierName}`,
        timestamp: new Date().toISOString(),
        actor: this.getCurrentUser().name,
        description: `Selected Quote ${targetQuote.quoteNumber} (NZD $${targetQuote.totalCostNZD}). Ready for customer approval/PO.`,
      });
      if (this.isBrowser()) {
        localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_QUOTES, JSON.stringify(quotes));
      this.dispatch();
    }
  }

  // --- PURCHASE ORDERS ---
  public getPurchaseOrders(): PurchaseOrderItem[] {
    if (!this.isBrowser()) return INITIAL_PURCHASE_ORDERS;
    try {
      const val = localStorage.getItem(KEY_POS);
      if (val) {
        const stored: PurchaseOrderItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_PURCHASE_ORDERS.forEach((initPo) => {
          if (!stored.some((p) => p.id === initPo.id || p.poNumber === initPo.poNumber)) {
            stored.unshift(initPo);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_POS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_POS, JSON.stringify(INITIAL_PURCHASE_ORDERS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PURCHASE_ORDERS;
  }

  public getPurchaseOrderById(id: string): PurchaseOrderItem | undefined {
    const pos = this.getPurchaseOrders();
    return pos.find((p) => p.id === id || p.poNumber === id);
  }

  public createPurchaseOrder(po: Omit<PurchaseOrderItem, 'id' | 'poNumber' | 'createdAt' | 'timeline' | 'documents'>): PurchaseOrderItem {
    const pos = this.getPurchaseOrders();
    const newPO: PurchaseOrderItem = {
      ...po,
      id: 'po_' + Date.now(),
      poNumber: `PO-NZ-${Math.floor(4030 + Math.random() * 200)}`,
      createdAt: new Date().toISOString(),
      documents: [
        {
          title: `Purchase Order Document`,
          type: 'Purchase Order',
          url: '/docs/po_generated.pdf',
          size: '220 KB',
        },
      ],
      timeline: [
        { stage: 'PO Created', date: new Date().toLocaleDateString('en-NZ'), done: true, note: `Generated by ${this.getCurrentUser().name}` },
        { stage: 'Sent to Supplier', date: '-', done: false },
        { stage: 'Supplier Confirmed', date: '-', done: false },
        { stage: 'Dispatched to Air Hub', date: '-', done: false },
        { stage: 'Received at NZ Facility', date: '-', done: false },
      ],
    };
    pos.unshift(newPO);

    // Link PO to request
    const reqs = this.getRequests();
    const rIdx = reqs.findIndex((r) => r.id === po.requestId || r.requestNumber === po.requestRef);
    if (rIdx !== -1) {
      reqs[rIdx].purchaseOrderId = newPO.id;
      reqs[rIdx].status = 'Ordered';
      reqs[rIdx].timeline.unshift({
        title: `Purchase Order Issued (${newPO.poNumber})`,
        timestamp: new Date().toISOString(),
        actor: this.getCurrentUser().name,
        description: `PO for NZD $${newPO.totalAmountNZD} dispatched to ${newPO.supplierName}`,
      });
      if (this.isBrowser()) {
        localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      }

      syncRequestStatusAcrossRoles(reqs[rIdx].requestNumber, 'Ordered From Supplier', {
        actorName: this.getCurrentUser().name,
        note: `PO ${newPO.poNumber} for NZ$${newPO.totalAmountNZD.toFixed(2)} dispatched to ${newPO.supplierName}`,
      });
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_POS, JSON.stringify(pos));
      this.dispatch();
    }
    return newPO;
  }

  public updatePOStatus(poId: string, status: POStatus, note?: string): void {
    const pos = this.getPurchaseOrders();
    const idx = pos.findIndex((p) => p.id === poId || p.poNumber === poId);
    if (idx === -1) return;

    pos[idx].status = status;
    if (status === 'Sent to Supplier') {
      pos[idx].sentAt = new Date().toISOString();
      pos[idx].timeline[1].done = true;
      pos[idx].timeline[1].date = new Date().toLocaleDateString('en-NZ');
    } else if (status === 'Supplier Confirmed') {
      pos[idx].confirmedAt = new Date().toISOString();
      pos[idx].timeline[2].done = true;
      pos[idx].timeline[2].date = new Date().toLocaleDateString('en-NZ');
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_POS, JSON.stringify(pos));
      this.dispatch();
    }
  }

  // --- TASKS ---
  public getTasks(): ProcurementTaskItem[] {
    if (!this.isBrowser()) return INITIAL_TASKS;
    try {
      const val = localStorage.getItem(KEY_TASKS);
      if (val) {
        const stored: ProcurementTaskItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_TASKS.forEach((initTask) => {
          if (!stored.some((t) => t.id === initTask.id)) {
            stored.unshift(initTask);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_TASKS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  }

  public toggleTaskComplete(taskId: string): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    tasks[idx].isCompleted = !tasks[idx].isCompleted;
    tasks[idx].dueBucket = tasks[idx].isCompleted ? 'Completed' : 'Today';

    if (this.isBrowser()) {
      localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
      this.dispatch();
    }
  }

  // --- EXCEPTIONS ---
  public getExceptions(): ProcurementExceptionItem[] {
    if (!this.isBrowser()) return INITIAL_EXCEPTIONS;
    try {
      const val = localStorage.getItem(KEY_EXCEPTIONS);
      if (val) {
        const stored: ProcurementExceptionItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_EXCEPTIONS.forEach((initExc) => {
          if (!stored.some((e) => e.id === initExc.id || e.code === initExc.code)) {
            stored.unshift(initExc);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(INITIAL_EXCEPTIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXCEPTIONS;
  }

  public getExceptionById(id: string): ProcurementExceptionItem | undefined {
    const excs = this.getExceptions();
    return excs.find((e) => e.id === id || e.code === id);
  }

  public createException(exc: Omit<ProcurementExceptionItem, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'actions'>): ProcurementExceptionItem {
    const excs = this.getExceptions();
    const newExc: ProcurementExceptionItem = {
      ...exc,
      id: 'exc_' + Date.now(),
      code: `EXC-${Math.floor(7050 + Math.random() * 500)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          timestamp: new Date().toISOString(),
          user: this.getCurrentUser().name,
          note: `Exception logged: ${exc.title}`,
          stage: 'Review',
        },
      ],
    };
    excs.unshift(newExc);

    // Update request status to Exception
    const reqs = this.getRequests();
    const rIdx = reqs.findIndex((r) => r.id === exc.requestId || r.requestNumber === exc.requestRef);
    if (rIdx !== -1) {
      reqs[rIdx].status = 'Exception';
      reqs[rIdx].timeline.unshift({
        title: `Logistics Exception Logged (${newExc.code})`,
        timestamp: new Date().toISOString(),
        actor: this.getCurrentUser().name,
        description: exc.description,
      });
      if (this.isBrowser()) {
        localStorage.setItem(KEY_REQUESTS, JSON.stringify(reqs));
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(excs));
      this.dispatch();
    }
    return newExc;
  }

  public updateExceptionStage(excId: string, stage: ExceptionStage, note: string): void {
    const excs = this.getExceptions();
    const idx = excs.findIndex((e) => e.id === excId || e.code === excId);
    if (idx === -1) return;

    excs[idx].stage = stage;
    excs[idx].updatedAt = new Date().toISOString();
    excs[idx].actions.push({
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser().name,
      note,
      stage,
    });
    if (stage === 'Close' || stage === 'Resolution') {
      excs[idx].resolution = note;
      excs[idx].resolvedAt = new Date().toISOString();
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(excs));
      this.dispatch();
    }
  }

  // --- CONVERSATIONS / MESSAGING ---
  public getConversations(): SupplierConversation[] {
    if (!this.isBrowser()) return INITIAL_CONVERSATIONS;
    try {
      const val = localStorage.getItem(KEY_CONVERSATIONS);
      if (val) {
        const stored: SupplierConversation[] = JSON.parse(val);
        let updated = false;
        INITIAL_CONVERSATIONS.forEach((initConv) => {
          if (!stored.some((c) => c.id === initConv.id)) {
            stored.unshift(initConv);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_CONVERSATIONS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CONVERSATIONS;
  }

  public sendSupplierMessage(supplierId: string, text: string, isInternal: boolean, requestId?: string): void {
    const convs = this.getConversations();
    let conv = convs.find((c) => c.supplierId === supplierId);
    const sup = this.getSupplierById(supplierId);

    if (!conv && sup) {
      conv = {
        id: 'conv_' + Date.now(),
        supplierId,
        supplierName: sup.name,
        lastMessage: text,
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [],
      };
      convs.unshift(conv);
    }

    if (conv) {
      conv.messages.push({
        id: 'msg_' + Date.now(),
        supplierId,
        supplierName: conv.supplierName,
        requestId,
        sender: this.getCurrentUser().name,
        senderRole: 'Procurement Specialist',
        isInternalNote: isInternal,
        message: text,
        timestamp: new Date().toISOString(),
      });
      conv.lastMessage = text;
      conv.lastMessageTime = 'Just now';

      if (this.isBrowser()) {
        localStorage.setItem(KEY_CONVERSATIONS, JSON.stringify(convs));
        this.dispatch();
      }
    }
  }

  // --- DOCUMENTS ---
  public getDocuments(): ProcurementDocumentItem[] {
    if (!this.isBrowser()) return INITIAL_DOCUMENTS;
    try {
      const val = localStorage.getItem(KEY_DOCS);
      if (val) {
        const stored: ProcurementDocumentItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_DOCUMENTS.forEach((initDoc) => {
          if (!stored.some((d) => d.id === initDoc.id)) {
            stored.unshift(initDoc);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_DOCS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_DOCS, JSON.stringify(INITIAL_DOCUMENTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DOCUMENTS;
  }

  public uploadDocument(doc: Omit<ProcurementDocumentItem, 'id' | 'date' | 'uploadedBy'>): ProcurementDocumentItem {
    const docs = this.getDocuments();
    const newDoc: ProcurementDocumentItem = {
      ...doc,
      id: 'pdoc_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      uploadedBy: this.getCurrentUser().name,
    };
    docs.unshift(newDoc);
    if (this.isBrowser()) {
      localStorage.setItem(KEY_DOCS, JSON.stringify(docs));
      this.dispatch();
    }
    return newDoc;
  }

  // --- SHIPMENTS & DISPATCH ---
  public getShipments(): ShipmentDispatchItem[] {
    if (!this.isBrowser()) return INITIAL_SHIPMENTS;
    try {
      const val = localStorage.getItem(KEY_SHIPMENTS);
      if (val) {
        const stored: ShipmentDispatchItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_SHIPMENTS.forEach((initShp) => {
          if (!stored.some((s) => s.id === initShp.id || s.shipmentNumber === initShp.shipmentNumber)) {
            stored.unshift(initShp);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_SHIPMENTS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_SHIPMENTS, JSON.stringify(INITIAL_SHIPMENTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SHIPMENTS;
  }

  public markReadyForDispatch(shipmentId: string): void {
    const shps = this.getShipments();
    const idx = shps.findIndex((s) => s.id === shipmentId || s.shipmentNumber === shipmentId);
    if (idx === -1) return;

    shps[idx].status = 'Ready for Dispatch';
    shps[idx].verifiedChecklist = {
      partVerified: true,
      quantityVerified: true,
      supplierVerified: true,
      shippingInfoVerified: true,
    };

    if (this.isBrowser()) {
      localStorage.setItem(KEY_SHIPMENTS, JSON.stringify(shps));
      this.dispatch();
    }
  }

  public handoverToLogistics(shipmentId: string, trackingCode: string, carrier: string): void {
    const shps = this.getShipments();
    const idx = shps.findIndex((s) => s.id === shipmentId || s.shipmentNumber === shipmentId);
    if (idx === -1) return;

    shps[idx].status = 'In Transit';
    shps[idx].trackingCode = trackingCode;
    shps[idx].carrier = carrier;

    if (this.isBrowser()) {
      localStorage.setItem(KEY_SHIPMENTS, JSON.stringify(shps));
      this.dispatch();
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): ProcurementNotificationItem[] {
    if (!this.isBrowser()) return INITIAL_NOTIFICATIONS;
    try {
      const val = localStorage.getItem(KEY_NOTIFS);
      if (val) {
        const stored: ProcurementNotificationItem[] = JSON.parse(val);
        let updated = false;
        INITIAL_NOTIFICATIONS.forEach((initNotif) => {
          if (!stored.some((n) => n.id === initNotif.id)) {
            stored.unshift(initNotif);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEY_NOTIFS, JSON.stringify(stored));
        }
        return stored;
      }
      localStorage.setItem(KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifs[idx].isRead = true;
      if (this.isBrowser()) {
        localStorage.setItem(KEY_NOTIFS, JSON.stringify(notifs));
        this.dispatch();
      }
    }
  }

  public markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.isRead = true));
    if (this.isBrowser()) {
      localStorage.setItem(KEY_NOTIFS, JSON.stringify(notifs));
      this.dispatch();
    }
  }
}

export const procurementService = new ProcurementService();
