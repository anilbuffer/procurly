// PROCURly Operations Service — Reactive Multi-Tier State Store
'use client';

import {
  OperationsStaffUser,
  OperationalPartRequest,
  OperationalException,
  OperationalCustomer,
  OperationalAuditEntry,
  OperationalTask,
  OperationalReportMetrics,
  OperationalRequestStatus,
  RequestPriority,
  SupplierQuote,
  LandedCostCalculation,
  CustomerQuoteData,
  OperationalMessage,
  OperationalDocument,
  ExceptionStatus,
  OperationsRole,
} from '@/types/operations';
import {
  INITIAL_STAFF_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_REQUESTS,
  INITIAL_EXCEPTIONS,
  INITIAL_TASKS,
  INITIAL_AUDIT_LOG,
  INITIAL_REPORT_METRICS,
} from './mockData';

const STORAGE_KEY_USER = 'procurly_ops_current_user_v1';
const STORAGE_KEY_REQUESTS = 'procurly_ops_requests_v1';
const STORAGE_KEY_CUSTOMERS = 'procurly_ops_customers_v1';
const STORAGE_KEY_EXCEPTIONS = 'procurly_ops_exceptions_v1';
const STORAGE_KEY_TASKS = 'procurly_ops_tasks_v1';
const STORAGE_KEY_AUDIT = 'procurly_ops_audit_v1';
const STORAGE_KEY_DOCS = 'procurly_ops_docs_v1';

class OperationsService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private dispatchUpdate() {
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('procurly_ops_updated'));
    }
  }

  // --- USER & RBAC ---
  public getDefaultUser(): OperationsStaffUser {
    return INITIAL_STAFF_USERS[0];
  }

  public getCurrentUser(): OperationsStaffUser {
    if (!this.isBrowser()) return INITIAL_STAFF_USERS[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STAFF_USERS[0];
  }

  public getStaffUsers(): OperationsStaffUser[] {
    return INITIAL_STAFF_USERS;
  }

  public switchUser(userOrRole: OperationsRole | string): OperationsStaffUser {
    const matched =
      INITIAL_STAFF_USERS.find((u) => u.role === userOrRole || u.id === userOrRole || u.name.toLowerCase().includes(userOrRole.toLowerCase())) ||
      INITIAL_STAFF_USERS[0];

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(matched));
      this.addAuditLog({
        action: 'User Switched Role',
        objectType: 'User',
        objectId: matched.id,
        details: `Active session changed to ${matched.name} (${matched.roleTitle})`,
      });
      this.dispatchUpdate();
    }
    return matched;
  }

  // --- REQUESTS ---
  public getRequests(): OperationalPartRequest[] {
    if (!this.isBrowser()) return INITIAL_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REQUESTS;
  }

  public getRequestById(idOrRef: string): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const clean = idOrRef.trim().toLowerCase();
    return reqs.find(
      (r) => r.id.toLowerCase() === clean || r.referenceNumber.toLowerCase() === clean
    );
  }

  public saveRequests(reqs: OperationalPartRequest[]) {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(reqs));
      this.dispatchUpdate();
    }
  }

  public createRequest(data: Partial<OperationalPartRequest>): OperationalPartRequest {
    const reqs = this.getRequests();
    const nextNum = reqs.length + 124;
    const ref = `AH-P-000${nextNum}`;
    const user = this.getCurrentUser();

    const newReq: OperationalPartRequest = {
      id: `req_000${nextNum}`,
      referenceNumber: ref,
      customerName: data.customerName || 'AutoCare Auckland',
      customerId: data.customerId || 'cust_autocare',
      customerEmail: data.customerEmail || 'james@autocareauckland.co.nz',
      customerPhone: data.customerPhone || '021 555 8921',
      deliveryBranch: data.deliveryBranch || 'Auckland Main Workshop (Penrose)',
      submittedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: data.status || 'Request Submitted',
      priority: data.priority || 'Normal',
      ownerName: data.ownerName || user.name,
      ownerId: data.ownerId || user.id,
      vehicle: {
        vin: data.vehicle?.vin || 'VIN-UNSPECIFIED',
        year: data.vehicle?.year || 2021,
        make: data.vehicle?.make || 'Toyota',
        model: data.vehicle?.model || 'Hiace',
        rego: data.vehicle?.rego || 'NZA100',
        subModel: data.vehicle?.subModel || '',
        engineCode: data.vehicle?.engineCode || '',
      },
      part: {
        name: data.part?.name || 'Requested Component',
        partNumber: data.part?.partNumber || '',
        quantity: data.part?.quantity || 1,
        qualityPreference: data.part?.qualityPreference || 'Genuine OEM',
        conditionPreference: data.part?.conditionPreference || 'New',
        vehicleSide: data.part?.vehicleSide || 'Front',
        description: data.part?.description || '',
      },
      sourcing: {
        status: 'Not Started',
        supplierQuotes: [],
      },
      payment: {
        paymentNumber: `PAY-000${nextNum}`,
        amountNZD: 0,
        status: 'Payment Pending',
        dueDate: '2026-09-20',
      },
      timeline: [
        {
          id: `tl_init_${Date.now()}`,
          stage: 'Request Submitted',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: `${user.name} (${user.role})`,
          action: 'Created internal procurement request',
          isCompleted: true,
          isCurrent: true,
        },
      ],
      messages: [],
      documents: [],
    };

    reqs.unshift(newReq);
    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Request Created',
      objectType: 'Request',
      objectId: ref,
      details: `Created new request for ${newReq.vehicle.year} ${newReq.vehicle.make} ${newReq.vehicle.model} (${newReq.part.name})`,
    });

    return newReq;
  }

  public updateRequestStatus(
    requestId: string,
    newStatus: OperationalRequestStatus,
    note?: string
  ): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const user = this.getCurrentUser();
    const oldStatus = reqs[idx].status;
    reqs[idx].status = newStatus;
    reqs[idx].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Append to timeline
    reqs[idx].timeline.push({
      id: `tl_${Date.now()}`,
      stage: newStatus,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${user.name} (${user.role})`,
      action: `Status updated from ${oldStatus} to ${newStatus}`,
      note,
      isCompleted: true,
      isCurrent: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Status Changed',
      objectType: 'Request',
      objectId: reqs[idx].referenceNumber,
      details: note || `Status transitioned to ${newStatus}`,
      oldValue: oldStatus,
      newValue: newStatus,
    });

    return reqs[idx];
  }

  public assignRequestOwner(
    requestId: string,
    staffId: string,
    note?: string
  ): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const staff = INITIAL_STAFF_USERS.find((u) => u.id === staffId) || INITIAL_STAFF_USERS[0];
    const oldOwner = reqs[idx].ownerName;
    reqs[idx].ownerName = staff.name;
    reqs[idx].ownerId = staff.id;
    reqs[idx].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const user = this.getCurrentUser();
    reqs[idx].timeline.push({
      id: `tl_assign_${Date.now()}`,
      stage: 'Reassigned',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${user.name} (${user.role})`,
      action: `Assigned request owner to ${staff.name}`,
      note,
      isCompleted: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Staff Reassigned',
      objectType: 'Request',
      objectId: reqs[idx].referenceNumber,
      details: `Reassigned from ${oldOwner} to ${staff.name}`,
      oldValue: oldOwner,
      newValue: staff.name,
    });

    return reqs[idx];
  }

  public updateRequestPriority(
    requestId: string,
    priority: RequestPriority
  ): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const oldPriority = reqs[idx].priority;
    reqs[idx].priority = priority;
    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Priority Updated',
      objectType: 'Request',
      objectId: reqs[idx].referenceNumber,
      details: `Priority changed from ${oldPriority} to ${priority}`,
      oldValue: oldPriority,
      newValue: priority,
    });

    return reqs[idx];
  }

  // --- SOURCING & SUPPLIER QUOTES ---
  public addSupplierQuote(
    requestId: string,
    quoteInput: Omit<SupplierQuote, 'id' | 'quotedAt' | 'quotedBy'>
  ): SupplierQuote {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    const user = this.getCurrentUser();

    const newQuote: SupplierQuote = {
      ...quoteInput,
      id: `sq_${Date.now()}`,
      quotedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      quotedBy: user.name,
      totalSupplierCostNZD:
        quoteInput.partCostNZD +
        quoteInput.supplierFreightNZD +
        (quoteInput.supplierHandlingNZD || 0),
    };

    if (idx !== -1) {
      if (!reqs[idx].sourcing) {
        reqs[idx].sourcing = { status: 'In Progress', supplierQuotes: [] };
      }
      reqs[idx].sourcing.supplierQuotes.push(newQuote);
      reqs[idx].sourcing.status = 'Quotes Received';
      this.saveRequests(reqs);

      this.addAuditLog({
        action: 'Supplier Quote Added',
        objectType: 'Quote',
        objectId: reqs[idx].referenceNumber,
        details: `Added quote from ${newQuote.supplierName}: NZ$${newQuote.totalSupplierCostNZD.toFixed(2)}`,
      });
    }

    return newQuote;
  }

  public selectSupplierQuote(requestId: string, quoteId: string): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const quotes = reqs[idx].sourcing?.supplierQuotes || [];
    quotes.forEach((q) => {
      q.isSelected = q.id === quoteId;
    });

    const selected = quotes.find((q) => q.id === quoteId);
    if (selected) {
      reqs[idx].sourcing.selectedSupplierQuoteId = quoteId;
      reqs[idx].sourcing.status = 'Supplier Selected';

      // Auto compute default Landed Cost
      const internalCost = selected.totalSupplierCostNZD + 20; // 20 handling
      const margin = 50;
      const customerPrice = internalCost + margin + 50;

      reqs[idx].landedCost = {
        supplierCostNZD: selected.partCostNZD,
        supplierFreightNZD: selected.supplierFreightNZD,
        handlingCostNZD: 20,
        otherCostsNZD: selected.supplierHandlingNZD || 0,
        totalInternalCostNZD: internalCost,
        marginPercentage: Number(((margin / customerPrice) * 100).toFixed(1)),
        marginAmountNZD: margin,
        finalCustomerPriceNZD: customerPrice,
        dutiesAndBiosecurityNZD: 0,
        localCourierNZD: 15,
        gstNZD: Number((customerPrice * 0.15).toFixed(2)),
      };

      this.addAuditLog({
        action: 'Supplier Quote Selected',
        objectType: 'Quote',
        objectId: reqs[idx].referenceNumber,
        details: `Selected ${selected.supplierName} (${selected.supplierCode}) — NZ$${selected.totalSupplierCostNZD.toFixed(2)}`,
      });
    }

    this.saveRequests(reqs);
    return reqs[idx];
  }

  public updateLandedCost(
    requestId: string,
    cost: Partial<LandedCostCalculation>
  ): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    reqs[idx].landedCost = {
      ...(reqs[idx].landedCost || {
        supplierCostNZD: 0,
        supplierFreightNZD: 0,
        handlingCostNZD: 0,
        otherCostsNZD: 0,
        totalInternalCostNZD: 0,
        marginPercentage: 15,
        marginAmountNZD: 50,
        finalCustomerPriceNZD: 0,
        dutiesAndBiosecurityNZD: 0,
        localCourierNZD: 15,
        gstNZD: 0,
      }),
      ...cost,
    };

    this.saveRequests(reqs);
    return reqs[idx];
  }

  // --- CUSTOMER QUOTES ---
  public sendCustomerQuote(
    requestId: string,
    quoteData?: Partial<CustomerQuoteData>
  ): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const user = this.getCurrentUser();
    const existing = reqs[idx].customerQuote;
    const version = existing ? existing.version + 1 : 1;

    reqs[idx].customerQuote = {
      quoteNumber: `QUO-${reqs[idx].referenceNumber.replace('AH-P-', '')}-v${version}`,
      version,
      status: 'Sent',
      validUntil: quoteData?.validUntil || '2026-09-15',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sentBy: user.name,
      items: quoteData?.items || [
        {
          id: `qi_1`,
          description: `${reqs[idx].vehicle.make} ${reqs[idx].part.name}`,
          quantity: reqs[idx].part.quantity,
          unitPriceNZD: reqs[idx].landedCost?.finalCustomerPriceNZD || 485,
          totalPriceNZD: reqs[idx].landedCost?.finalCustomerPriceNZD || 485,
        },
      ],
      freightOptions: quoteData?.freightOptions || [
        {
          id: 'fo_air',
          freightType: 'Air Freight',
          transitEstimate: '5–8 business days',
          isRecommended: true,
          partCostNZD: reqs[idx].landedCost?.supplierCostNZD || 350,
          freightCostNZD: 85,
          procurementServiceNZD: 50,
          totalNZD: reqs[idx].landedCost?.finalCustomerPriceNZD || 485,
        },
      ],
      totalAmountNZD: reqs[idx].landedCost?.finalCustomerPriceNZD || 485,
      termsVersion: 'v1.2',
    };

    reqs[idx].status = 'Awaiting Customer Approval';
    reqs[idx].timeline.push({
      id: `tl_quote_sent_${Date.now()}`,
      stage: 'Customer Quote Sent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${user.name} (${user.role})`,
      action: `Sent quote ${reqs[idx].customerQuote?.quoteNumber} for NZ$${reqs[idx].customerQuote?.totalAmountNZD.toFixed(2)}`,
      isCompleted: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Customer Quote Sent',
      objectType: 'Quote',
      objectId: reqs[idx].referenceNumber,
      details: `Quote ${reqs[idx].customerQuote?.quoteNumber} sent to ${reqs[idx].customerName}`,
      newValue: `NZ$${reqs[idx].customerQuote?.totalAmountNZD.toFixed(2)}`,
    });

    return reqs[idx];
  }

  public simulateCustomerApproval(requestId: string): OperationalPartRequest | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    if (reqs[idx].customerQuote) {
      reqs[idx].customerQuote.status = 'Approved';
      reqs[idx].customerQuote.acceptanceRecord = {
        acceptedBy: reqs[idx].customerName.split(' ')[0] + ' Manager',
        acceptedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        termsVersion: 'v1.2',
        quoteVersion: `v${reqs[idx].customerQuote.version}`,
        signatureVerified: true,
        ipAddress: '122.56.84.102 (Auckland, NZ)',
      };
    }

    reqs[idx].status = 'Customer Approved';
    reqs[idx].payment.status = 'Awaiting Payment';

    reqs[idx].timeline.push({
      id: `tl_approved_${Date.now()}`,
      stage: 'Customer Approved',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${reqs[idx].customerName} (Online)`,
      action: 'Verified digital quote acceptance. Awaiting payment authorization.',
      isCompleted: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Customer Approved Quote',
      objectType: 'Quote',
      objectId: reqs[idx].referenceNumber,
      details: `Customer authorized procurement terms for ${reqs[idx].referenceNumber}`,
    });

    return reqs[idx];
  }

  // --- PROCUREMENT ORDERS & LOGISTICS ---
  public updateShipmentMilestone(
    shipmentNumber: string,
    milestoneIndex: number,
    status: 'completed' | 'in-progress' | 'pending',
    note?: string
  ) {
    const reqs = this.getRequests();
    const req = reqs.find((r) => r.shipment?.shipmentNumber === shipmentNumber);
    if (!req || !req.shipment?.milestones[milestoneIndex]) return;

    req.shipment.milestones[milestoneIndex].status = status;
    if (note) {
      req.shipment.milestones[milestoneIndex].note = note;
    }
    if (status === 'completed') {
      req.shipment.milestones[milestoneIndex].timestamp = new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16);
    }

    this.saveRequests(reqs);

    const user = this.getCurrentUser();
    this.addAuditLog({
      action: 'Shipment Milestone Updated',
      objectType: 'Shipment',
      objectId: shipmentNumber,
      details: `${req.shipment.milestones[milestoneIndex].title} set to ${status}`,
    });
  }

  // --- EXCEPTIONS ---
  public getExceptions(): OperationalException[] {
    if (!this.isBrowser()) return INITIAL_EXCEPTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXCEPTIONS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(INITIAL_EXCEPTIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXCEPTIONS;
  }

  public saveExceptions(excs: OperationalException[]) {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(excs));
      this.dispatchUpdate();
    }
  }

  public updateExceptionStatus(
    idOrCode: string,
    status: ExceptionStatus,
    note?: string
  ): OperationalException | undefined {
    const excs = this.getExceptions();
    const idx = excs.findIndex((e) => e.id === idOrCode || e.code === idOrCode);
    if (idx === -1) return undefined;

    const user = this.getCurrentUser();
    const oldStatus = excs[idx].status;
    excs[idx].status = status;
    excs[idx].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (note) {
      excs[idx].actionsHistory.push({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: user.name,
        action: `Status changed to ${status}: ${note}`,
        notes: note,
      });
    }

    if (status === 'Resolved' || status === 'Closed') {
      excs[idx].resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      excs[idx].resolvedBy = user.name;
      if (note) excs[idx].resolutionNote = note;
    }

    this.saveExceptions(excs);

    this.addAuditLog({
      action: 'Exception Updated',
      objectType: 'Exception',
      objectId: excs[idx].code,
      details: note || `Exception status moved from ${oldStatus} to ${status}`,
      oldValue: oldStatus,
      newValue: status,
    });

    return excs[idx];
  }

  // --- PAYMENTS & REFUNDS ---
  public recordPayment(paymentNumber: string, method?: string) {
    const reqs = this.getRequests();
    const req = reqs.find((r) => r.payment?.paymentNumber === paymentNumber);
    if (!req) return;

    req.payment.status = 'Payment Received';
    req.payment.paidAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (method) req.payment.method = method;
    req.status = 'Payment Received';

    const user = this.getCurrentUser();
    req.timeline.push({
      id: `tl_pay_rec_${Date.now()}`,
      stage: 'Payment Received',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${user.name} (${user.role})`,
      action: `Recorded settlement of NZ$${req.payment.amountNZD.toFixed(2)}`,
      isCompleted: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Payment Confirmed',
      objectType: 'Payment',
      objectId: paymentNumber,
      details: `Received payment for ${req.referenceNumber} (NZ$${req.payment.amountNZD.toFixed(2)})`,
      newValue: 'Payment Received',
    });
  }

  public processRefund(paymentNumber: string, amount: number, reason: string) {
    const reqs = this.getRequests();
    const req = reqs.find((r) => r.payment?.paymentNumber === paymentNumber);
    if (!req) return;

    const user = this.getCurrentUser();
    req.payment.status = 'Refunded';
    req.payment.refundDetails = {
      amountNZD: amount,
      reason,
      refundedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      processedBy: user.name,
    };
    req.status = 'Refunded';

    req.timeline.push({
      id: `tl_refund_${Date.now()}`,
      stage: 'Payment Refunded',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: `${user.name} (${user.role})`,
      action: `Processed refund of NZ$${amount.toFixed(2)}: ${reason}`,
      isCompleted: true,
    });

    this.saveRequests(reqs);

    this.addAuditLog({
      action: 'Refund Processed',
      objectType: 'Payment',
      objectId: paymentNumber,
      details: `Refunded NZ$${amount.toFixed(2)} to ${req.customerName}. Reason: ${reason}`,
      newValue: 'Refunded',
    });
  }

  // --- CUSTOMERS & APPROVALS ---
  public getCustomers(): OperationalCustomer[] {
    if (!this.isBrowser()) return INITIAL_CUSTOMERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  }

  public saveCustomers(custs: OperationalCustomer[]) {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(custs));
      this.dispatchUpdate();
    }
  }

  public approveCustomer(customerId: string): OperationalCustomer | undefined {
    const custs = this.getCustomers();
    const idx = custs.findIndex((c) => c.id === customerId);
    if (idx === -1) return undefined;

    custs[idx].status = 'Approved';
    custs[idx].approvedDate = new Date().toISOString().substring(0, 10);
    custs[idx].creditStatus = 'Approved Trade Account (20th Month Following)';

    this.saveCustomers(custs);

    const user = this.getCurrentUser();
    this.addAuditLog({
      action: 'Customer Approved',
      objectType: 'Customer',
      objectId: custs[idx].businessName,
      details: `Approved trade account application for ${custs[idx].businessName} (NZBN: ${custs[idx].nzbn})`,
    });

    return custs[idx];
  }

  public rejectCustomer(customerId: string, reason?: string): OperationalCustomer | undefined {
    const custs = this.getCustomers();
    const idx = custs.findIndex((c) => c.id === customerId);
    if (idx === -1) return undefined;

    custs[idx].status = 'Inactive';
    custs[idx].notes = `Application declined: ${reason || 'Failed trade credit verification.'}`;

    this.saveCustomers(custs);

    this.addAuditLog({
      action: 'Customer Rejected',
      objectType: 'Customer',
      objectId: custs[idx].businessName,
      details: `Declined application for ${custs[idx].businessName}: ${reason || 'N/A'}`,
    });

    return custs[idx];
  }

  // --- MESSAGES & INTERNAL NOTES ---
  public addMessage(
    requestId: string,
    content: string,
    isInternalOnly: boolean
  ): OperationalMessage | undefined {
    const reqs = this.getRequests();
    const idx = reqs.findIndex((r) => r.id === requestId || r.referenceNumber === requestId);
    if (idx === -1) return undefined;

    const user = this.getCurrentUser();
    const newMsg: OperationalMessage = {
      id: `msg_${Date.now()}`,
      requestId,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      isInternalOnly,
    };

    if (!reqs[idx].messages) reqs[idx].messages = [];
    reqs[idx].messages.push(newMsg);
    this.saveRequests(reqs);

    this.addAuditLog({
      action: isInternalOnly ? 'Internal Note Added' : 'Customer Message Sent',
      objectType: 'Request',
      objectId: reqs[idx].referenceNumber,
      details: isInternalOnly
        ? `Added internal note: "${content.substring(0, 40)}..."`
        : `Sent customer message: "${content.substring(0, 40)}..."`,
    });

    return newMsg;
  }

  // --- AUDIT LOG ---
  public getAuditLogs(): OperationalAuditEntry[] {
    if (!this.isBrowser()) return INITIAL_AUDIT_LOG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(INITIAL_AUDIT_LOG));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOG;
  }

  public addAuditLog(entry: {
    action: string;
    objectType: OperationalAuditEntry['objectType'];
    objectId: string;
    details: string;
    oldValue?: string;
    newValue?: string;
  }) {
    if (!this.isBrowser()) return;
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();

    const newEntry: OperationalAuditEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: user.name,
      userRole: user.role,
      ...entry,
    };

    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 200)));
  }

  // --- TASKS ---
  public getTasks(): OperationalTask[] {
    if (!this.isBrowser()) return INITIAL_TASKS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  }

  public completeTask(taskId: string) {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'Completed';
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
        this.dispatchUpdate();
      }
    }
  }

  // --- REPORTS ---
  public getReportMetrics(): OperationalReportMetrics {
    const reqs = this.getRequests();
    const excs = this.getExceptions();

    const openCount = reqs.filter((r) => r.status !== 'Closed' && r.status !== 'Delivered').length;
    const awaitingQuotes = reqs.filter((r) => r.status === 'Sourcing' || r.status === 'Request Submitted').length;
    const awaitingApproval = reqs.filter((r) => r.status === 'Awaiting Customer Approval').length;
    const awaitingPayment = reqs.filter((r) => r.status === 'Awaiting Payment' || r.status === 'Payment Failed').length;
    const procurementInProgress = reqs.filter(
      (r) => r.status === 'Ordered From Supplier' || r.status === 'Received At Shipping Facility'
    ).length;
    const activeShipments = reqs.filter(
      (r) => r.status === 'In Transit' || r.status === 'Customs Clearance' || r.status === 'Out For Delivery'
    ).length;
    const exceptionsCount = excs.filter((e) => e.status !== 'Closed' && e.status !== 'Resolved').length;

    return {
      ...INITIAL_REPORT_METRICS,
      openRequestsCount: openCount || INITIAL_REPORT_METRICS.openRequestsCount,
      awaitingQuotesCount: awaitingQuotes || INITIAL_REPORT_METRICS.awaitingQuotesCount,
      awaitingApprovalCount: awaitingApproval || INITIAL_REPORT_METRICS.awaitingApprovalCount,
      awaitingPaymentCount: awaitingPayment || INITIAL_REPORT_METRICS.awaitingPaymentCount,
      procurementInProgressCount: procurementInProgress || INITIAL_REPORT_METRICS.procurementInProgressCount,
      activeShipmentsCount: activeShipments || INITIAL_REPORT_METRICS.activeShipmentsCount,
      exceptionsCount: exceptionsCount || INITIAL_REPORT_METRICS.exceptionsCount,
    };
  }

  // --- GLOBAL SEARCH ---
  public globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { requests: [], customers: [], shipments: [], exceptions: [], documents: [] };

    const reqs = this.getRequests();
    const custs = this.getCustomers();
    const excs = this.getExceptions();

    const matchedRequests = reqs.filter(
      (r) =>
        r.referenceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q) ||
        r.part.name.toLowerCase().includes(q)
    );

    const matchedCustomers = custs.filter(
      (c) =>
        c.businessName.toLowerCase().includes(q) ||
        c.tradingName.toLowerCase().includes(q) ||
        c.nzbn.includes(q) ||
        c.primaryContact.name.toLowerCase().includes(q)
    );

    const matchedExceptions = excs.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q)
    );

    return {
      requests: matchedRequests,
      customers: matchedCustomers,
      exceptions: matchedExceptions,
    };
  }
}

export const operationsService = new OperationsService();
