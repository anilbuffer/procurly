// PROCURly Finance Service — State Management & Reactive Store
'use client';

import {
  FinanceStaffUser,
  FinancePayment,
  AwaitingPaymentItem,
  FinanceTransaction,
  CreditAccount,
  RefundItem,
  FinancialException,
  FinanceCustomerQuote,
  ApprovedOrderFinance,
  CustomerFinancialProfile,
  FinanceTask,
  FinanceNotification,
  FinanceDocument,
  FinancialExceptionStage,
  PaymentStatusType,
  PaymentMethodType,
} from '@/types/finance';
import {
  INITIAL_FINANCE_STAFF,
  INITIAL_FINANCE_PAYMENTS,
  INITIAL_AWAITING_PAYMENTS,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_CREDIT_ACCOUNTS,
  INITIAL_REFUNDS,
  INITIAL_FINANCIAL_EXCEPTIONS,
  INITIAL_CUSTOMER_QUOTES_FINANCE,
  INITIAL_APPROVED_ORDERS_FINANCE,
  INITIAL_CUSTOMER_FINANCIAL_PROFILES,
  INITIAL_FINANCE_TASKS,
  INITIAL_FINANCE_NOTIFICATIONS,
  INITIAL_FINANCE_DOCUMENTS,
} from './mockData';

const KEY_USER = 'procurly_fin_user_v1';
const KEY_PAYMENTS = 'procurly_fin_payments_v1';
const KEY_AWAITING = 'procurly_fin_awaiting_v1';
const KEY_TRANSACTIONS = 'procurly_fin_txns_v1';
const KEY_CREDIT = 'procurly_fin_credit_v1';
const KEY_REFUNDS = 'procurly_fin_refunds_v1';
const KEY_EXCEPTIONS = 'procurly_fin_exceptions_v1';
const KEY_QUOTES = 'procurly_fin_quotes_v1';
const KEY_ORDERS = 'procurly_fin_orders_v1';
const KEY_CUSTOMERS = 'procurly_fin_customers_v1';
const KEY_TASKS = 'procurly_fin_tasks_v1';
const KEY_NOTIFS = 'procurly_fin_notifs_v1';
const KEY_DOCS = 'procurly_fin_docs_v1';

class FinanceService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private dispatch() {
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('procurly_finance_updated'));
    }
  }

  // --- USER & STAFF ---
  public getCurrentUser(): FinanceStaffUser {
    if (!this.isBrowser()) return INITIAL_FINANCE_STAFF[0];
    try {
      const val = localStorage.getItem(KEY_USER);
      if (val) return JSON.parse(val);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_STAFF[0];
  }

  public getStaffUsers(): FinanceStaffUser[] {
    return INITIAL_FINANCE_STAFF;
  }

  public switchUser(userId: string): FinanceStaffUser {
    const user = INITIAL_FINANCE_STAFF.find((u) => u.id === userId) || INITIAL_FINANCE_STAFF[0];
    if (this.isBrowser()) {
      localStorage.setItem(KEY_USER, JSON.stringify(user));
      this.dispatch();
    }
    return user;
  }

  // --- PAYMENTS ---
  public getPayments(): FinancePayment[] {
    if (!this.isBrowser()) return INITIAL_FINANCE_PAYMENTS;
    try {
      const val = localStorage.getItem(KEY_PAYMENTS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_PAYMENTS, JSON.stringify(INITIAL_FINANCE_PAYMENTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_PAYMENTS;
  }

  public getPaymentById(id: string): FinancePayment | undefined {
    const list = this.getPayments();
    return list.find((p) => p.id.toLowerCase() === id.toLowerCase() || p.requestNumber.toLowerCase() === id.toLowerCase());
  }

  public recordPayment(paymentData: Partial<FinancePayment>): FinancePayment {
    const list = this.getPayments();
    const currentUser = this.getCurrentUser();
    const newId = `PAY-${String(list.length + 124).padStart(5, '0')}`;
    const amount = Number(paymentData.amount) || 0;
    const subtotal = Math.round((amount / 1.15) * 0.9 * 100) / 100;
    const freight = Math.round((amount / 1.15) * 0.1 * 100) / 100;
    const gst = Math.round((amount - (subtotal + freight)) * 100) / 100;

    const newPayment: FinancePayment = {
      id: newId,
      requestNumber: paymentData.requestNumber || `AH-P-${String(list.length + 124).padStart(6, '0')}`,
      orderNumber: paymentData.orderNumber || `ORD-2026-${String(list.length + 90).padStart(4, '0')}`,
      customerId: paymentData.customerId || 'cus_custom',
      customerName: paymentData.customerName || 'Direct Customer',
      customerEmail: paymentData.customerEmail || 'accounts@example.co.nz',
      amount,
      subtotal,
      freight,
      gst,
      method: paymentData.method || 'Card',
      status: paymentData.status || 'Received',
      paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      gatewayReference: paymentData.gatewayReference || `MANUAL-${Date.now().toString().slice(-6)}`,
      receiptNumber: `REC-2026-${String(list.length + 124).padStart(4, '0')}`,
      invoiceNumber: `INV-2026-${String(list.length + 124).padStart(4, '0')}`,
      quoteNumber: paymentData.quoteNumber || `QUO-2026-${String(list.length + 124).padStart(4, '0')}`,
      partsSummary: paymentData.partsSummary || 'Commercial Automotive Replacement Parts',
      vehicleSummary: paymentData.vehicleSummary || 'Commercial Vehicle Fleet',
      internalNotes: [`Payment recorded by ${currentUser.name} (${currentUser.role}).`],
      auditTrail: [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: 'Manual Payment Recorded',
          details: `Recorded NZ$${amount.toFixed(2)} via ${paymentData.method || 'Card'}`,
        },
      ],
    };

    list.unshift(newPayment);
    if (this.isBrowser()) {
      localStorage.setItem(KEY_PAYMENTS, JSON.stringify(list));
      this.dispatch();
    }

    // Also record transaction
    this.recordTransaction({
      reference: newPayment.id,
      requestNumber: newPayment.requestNumber,
      orderNumber: newPayment.orderNumber,
      customerId: newPayment.customerId,
      customerName: newPayment.customerName,
      type: 'Payment',
      amount: newPayment.amount,
      fee: 0,
      netAmount: newPayment.amount,
      currency: 'NZD',
      method: newPayment.method,
      status: 'Completed',
      channel: 'Virtual Terminal',
      description: `Payment recorded for ${newPayment.requestNumber}`,
    });

    return newPayment;
  }

  public updatePaymentStatus(paymentId: string, status: PaymentStatusType, note?: string): FinancePayment | null {
    const list = this.getPayments();
    const idx = list.findIndex((p) => p.id === paymentId);
    if (idx === -1) return null;

    const currentUser = this.getCurrentUser();
    list[idx].status = status;
    if (note) {
      list[idx].internalNotes = list[idx].internalNotes || [];
      list[idx].internalNotes?.unshift(`[${new Date().toLocaleDateString('en-GB')}] ${note} (by ${currentUser.name})`);
    }
    list[idx].auditTrail.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      actorRole: currentUser.role,
      action: `Payment Status Changed to ${status}`,
      details: note || `Updated payment status to ${status}`,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_PAYMENTS, JSON.stringify(list));
      this.dispatch();
    }
    return list[idx];
  }

  public addPaymentNote(paymentId: string, noteText: string): boolean {
    const list = this.getPayments();
    const idx = list.findIndex((p) => p.id === paymentId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].internalNotes = list[idx].internalNotes || [];
    list[idx].internalNotes?.unshift(`[${new Date().toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit' })}] ${noteText} — ${currentUser.name}`);

    if (this.isBrowser()) {
      localStorage.setItem(KEY_PAYMENTS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- AWAITING PAYMENTS & REMINDERS ---
  public getAwaitingPayments(): AwaitingPaymentItem[] {
    if (!this.isBrowser()) return INITIAL_AWAITING_PAYMENTS;
    try {
      const val = localStorage.getItem(KEY_AWAITING);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_AWAITING, JSON.stringify(INITIAL_AWAITING_PAYMENTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AWAITING_PAYMENTS;
  }

  public sendPaymentReminder(id: string, customMessage?: string): boolean {
    const list = this.getAwaitingPayments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].reminderCount += 1;
    list[idx].lastReminderDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    list[idx].status = 'Reminder Sent';
    list[idx].notes = customMessage ? `${customMessage} (Sent by ${currentUser.name})` : `Reminder #${list[idx].reminderCount} dispatched to ${list[idx].contactEmail}`;

    if (this.isBrowser()) {
      localStorage.setItem(KEY_AWAITING, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- TRANSACTIONS ---
  public getTransactions(): FinanceTransaction[] {
    if (!this.isBrowser()) return INITIAL_FINANCE_TRANSACTIONS;
    try {
      const val = localStorage.getItem(KEY_TRANSACTIONS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(INITIAL_FINANCE_TRANSACTIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_TRANSACTIONS;
  }

  public recordTransaction(txnData: Partial<FinanceTransaction>): FinanceTransaction {
    const list = this.getTransactions();
    const newTxn: FinanceTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      reference: txnData.reference || 'REF-GEN',
      requestNumber: txnData.requestNumber || 'AH-P-000000',
      orderNumber: txnData.orderNumber,
      customerId: txnData.customerId || 'cus_unknown',
      customerName: txnData.customerName || 'Customer',
      type: txnData.type || 'Payment',
      amount: txnData.amount || 0,
      fee: txnData.fee || 0,
      netAmount: txnData.netAmount || (txnData.amount || 0),
      currency: 'NZD',
      method: txnData.method || 'Card',
      status: txnData.status || 'Completed',
      gatewayId: txnData.gatewayId || `GW-${Date.now().toString().slice(-6)}`,
      channel: txnData.channel || 'Online Portal',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      description: txnData.description || 'Commercial Automotive Transaction',
    };
    list.unshift(newTxn);
    if (this.isBrowser()) {
      localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(list));
      this.dispatch();
    }
    return newTxn;
  }

  public reconcileTransaction(id: string): boolean {
    const list = this.getTransactions();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].status = 'Reconciled';
    list[idx].reconciledAt = new Date().toISOString();
    list[idx].reconciledBy = currentUser.name;

    if (this.isBrowser()) {
      localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- CREDIT ACCOUNTS ---
  public getCreditAccounts(): CreditAccount[] {
    if (!this.isBrowser()) return INITIAL_CREDIT_ACCOUNTS;
    try {
      const val = localStorage.getItem(KEY_CREDIT);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_CREDIT, JSON.stringify(INITIAL_CREDIT_ACCOUNTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CREDIT_ACCOUNTS;
  }

  public getCreditAccountById(customerId: string): CreditAccount | undefined {
    const list = this.getCreditAccounts();
    return list.find((c) => c.customerId.toLowerCase() === customerId.toLowerCase() || c.id.toLowerCase() === customerId.toLowerCase());
  }

  public adjustCreditLimit(customerId: string, newLimit: number, reason: string): boolean {
    const list = this.getCreditAccounts();
    const idx = list.findIndex((c) => c.customerId === customerId || c.id === customerId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    const prevLimit = list[idx].creditLimit;
    list[idx].creditLimit = newLimit;
    list[idx].creditAvailable = Math.max(0, newLimit - list[idx].creditUsed);
    list[idx].utilizationPct = Math.round((list[idx].creditUsed / newLimit) * 1000) / 10;
    list[idx].status = list[idx].utilizationPct >= 90 ? 'Near Limit' : 'Active';

    list[idx].holdsHistory.unshift({
      id: `ch_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: 'Limit Adjusted',
      reason: `Limit adjusted from NZ$${prevLimit.toLocaleString()} to NZ$${newLimit.toLocaleString()}. Rationale: ${reason}`,
      performedBy: currentUser.name,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_CREDIT, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  public setCreditHold(customerId: string, onHold: boolean, reason: string): boolean {
    const list = this.getCreditAccounts();
    const idx = list.findIndex((c) => c.customerId === customerId || c.id === customerId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].status = onHold ? 'On Hold' : 'Active';
    list[idx].holdsHistory.unshift({
      id: `ch_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: onHold ? 'Placed on Hold' : 'Hold Lifted',
      reason,
      performedBy: currentUser.name,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_CREDIT, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  public suspendCreditAccount(customerId: string, reason: string): boolean {
    const list = this.getCreditAccounts();
    const idx = list.findIndex((c) => c.customerId === customerId || c.id === customerId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].status = 'Suspended';
    list[idx].creditAvailable = 0;
    list[idx].holdsHistory.unshift({
      id: `ch_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: 'Suspended',
      reason,
      performedBy: currentUser.name,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_CREDIT, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- REFUNDS ---
  public getRefunds(): RefundItem[] {
    if (!this.isBrowser()) return INITIAL_REFUNDS;
    try {
      const val = localStorage.getItem(KEY_REFUNDS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_REFUNDS, JSON.stringify(INITIAL_REFUNDS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REFUNDS;
  }

  public getRefundById(refundId: string): RefundItem | undefined {
    const list = this.getRefunds();
    return list.find((r) => r.id.toLowerCase() === refundId.toLowerCase());
  }

  public approveRefund(refundId: string, comments: string): boolean {
    const list = this.getRefunds();
    const idx = list.findIndex((r) => r.id === refundId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].status = 'Approved';
    list[idx].reviewedBy = currentUser.name;
    list[idx].reviewedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    list[idx].approvalHistory.push({
      stage: 'Finance Approval',
      actor: currentUser.name,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      outcome: 'Approved',
      comments,
    });
    list[idx].auditTrail.push({
      id: `aud_ref_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      actorRole: currentUser.role,
      action: 'Refund Approved',
      details: comments,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REFUNDS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  public rejectRefund(refundId: string, reason: string): boolean {
    const list = this.getRefunds();
    const idx = list.findIndex((r) => r.id === refundId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].status = 'Rejected';
    list[idx].reviewedBy = currentUser.name;
    list[idx].reviewedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    list[idx].approvalHistory.push({
      stage: 'Finance Rejection',
      actor: currentUser.name,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      outcome: 'Rejected',
      comments: reason,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REFUNDS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  public processRefund(refundId: string): boolean {
    const list = this.getRefunds();
    const idx = list.findIndex((r) => r.id === refundId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    const refund = list[idx];
    list[idx].status = 'Refunded';
    list[idx].processedBy = currentUser.name;
    list[idx].processedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    list[idx].auditTrail.push({
      id: `aud_ref_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      actorRole: currentUser.role,
      action: 'Refund Executed to Gateway',
      details: `Settled NZ$${refund.refundAmount.toFixed(2)} to ${refund.destinationAccountRef}`,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_REFUNDS, JSON.stringify(list));
      this.dispatch();
    }

    // Also record ledger refund entry
    this.recordTransaction({
      reference: refund.id,
      requestNumber: refund.requestNumber,
      orderNumber: refund.orderNumber,
      customerId: refund.customerId,
      customerName: refund.customerName,
      type: 'Refund',
      amount: -refund.refundAmount,
      fee: 0,
      netAmount: -refund.refundAmount,
      currency: 'NZD',
      method: refund.refundMethod,
      status: 'Completed',
      channel: 'Online Portal',
      description: `Settled refund ${refund.id} for ${refund.reason}`,
    });

    // Update payment status to Refunded
    this.updatePaymentStatus(refund.paymentId, 'Refunded', `Refund ${refund.id} settled.`);

    return true;
  }

  // --- EXCEPTIONS ---
  public getExceptions(): FinancialException[] {
    if (!this.isBrowser()) return INITIAL_FINANCIAL_EXCEPTIONS;
    try {
      const val = localStorage.getItem(KEY_EXCEPTIONS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(INITIAL_FINANCIAL_EXCEPTIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCIAL_EXCEPTIONS;
  }

  public getExceptionById(id: string): FinancialException | undefined {
    const list = this.getExceptions();
    return list.find((e) => e.id.toLowerCase() === id.toLowerCase() || e.requestNumber.toLowerCase() === id.toLowerCase());
  }

  public updateExceptionStage(id: string, stage: FinancialExceptionStage, note: string): boolean {
    const list = this.getExceptions();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].stage = stage;
    if (stage === 'Resolve') list[idx].status = 'Resolved';
    if (stage === 'Close') list[idx].status = 'Closed';

    list[idx].timeline.push({
      stage,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      actor: currentUser.name,
      note,
    });

    if (this.isBrowser()) {
      localStorage.setItem(KEY_EXCEPTIONS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- CUSTOMER QUOTES & APPROVED ORDERS ---
  public getCustomerQuotes(): FinanceCustomerQuote[] {
    if (!this.isBrowser()) return INITIAL_CUSTOMER_QUOTES_FINANCE;
    try {
      const val = localStorage.getItem(KEY_QUOTES);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_QUOTES, JSON.stringify(INITIAL_CUSTOMER_QUOTES_FINANCE));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMER_QUOTES_FINANCE;
  }

  public getApprovedOrders(): ApprovedOrderFinance[] {
    if (!this.isBrowser()) return INITIAL_APPROVED_ORDERS_FINANCE;
    try {
      const val = localStorage.getItem(KEY_ORDERS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_ORDERS, JSON.stringify(INITIAL_APPROVED_ORDERS_FINANCE));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_APPROVED_ORDERS_FINANCE;
  }

  public grantFinancialClearance(orderId: string, note?: string): boolean {
    const list = this.getApprovedOrders();
    const idx = list.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].clearanceStatus = 'Financially Cleared';
    list[idx].creditVerified = true;
    list[idx].clearedAt = new Date().toISOString();
    list[idx].clearedBy = currentUser.name;
    list[idx].releasedToProcurementAt = new Date().toISOString();
    list[idx].procurementPoRef = `PO-2026-${orderId.replace(/\D/g, '') || '0099'}`;
    list[idx].notes = note ? `${note} (Cleared by ${currentUser.name})` : `Financially cleared and released to procurement by ${currentUser.name}.`;

    if (this.isBrowser()) {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- CUSTOMER FINANCIAL PROFILES ---
  public getCustomerProfiles(): CustomerFinancialProfile[] {
    if (!this.isBrowser()) return INITIAL_CUSTOMER_FINANCIAL_PROFILES;
    try {
      const val = localStorage.getItem(KEY_CUSTOMERS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_CUSTOMERS, JSON.stringify(INITIAL_CUSTOMER_FINANCIAL_PROFILES));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMER_FINANCIAL_PROFILES;
  }

  public getCustomerProfileById(id: string): CustomerFinancialProfile | undefined {
    const list = this.getCustomerProfiles();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase().includes(id.toLowerCase()));
  }

  // --- TASKS ---
  public getTasks(): FinanceTask[] {
    if (!this.isBrowser()) return INITIAL_FINANCE_TASKS;
    try {
      const val = localStorage.getItem(KEY_TASKS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_TASKS, JSON.stringify(INITIAL_FINANCE_TASKS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_TASKS;
  }

  public toggleTask(taskId: string): boolean {
    const list = this.getTasks();
    const idx = list.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;

    const currentUser = this.getCurrentUser();
    list[idx].isCompleted = !list[idx].isCompleted;
    if (list[idx].isCompleted) {
      list[idx].completedAt = new Date().toISOString();
      list[idx].completedBy = currentUser.name;
    } else {
      list[idx].completedAt = undefined;
      list[idx].completedBy = undefined;
    }

    if (this.isBrowser()) {
      localStorage.setItem(KEY_TASKS, JSON.stringify(list));
      this.dispatch();
    }
    return true;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): FinanceNotification[] {
    if (!this.isBrowser()) return INITIAL_FINANCE_NOTIFICATIONS;
    try {
      const val = localStorage.getItem(KEY_NOTIFS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_NOTIFS, JSON.stringify(INITIAL_FINANCE_NOTIFICATIONS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_NOTIFICATIONS;
  }

  public markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      if (this.isBrowser()) {
        localStorage.setItem(KEY_NOTIFS, JSON.stringify(list));
        this.dispatch();
      }
    }
  }

  public markAllNotificationsAsRead() {
    const list = this.getNotifications();
    list.forEach((n) => (n.isRead = true));
    if (this.isBrowser()) {
      localStorage.setItem(KEY_NOTIFS, JSON.stringify(list));
      this.dispatch();
    }
  }

  // --- DOCUMENTS ---
  public getDocuments(): FinanceDocument[] {
    if (!this.isBrowser()) return INITIAL_FINANCE_DOCUMENTS;
    try {
      const val = localStorage.getItem(KEY_DOCS);
      if (val) return JSON.parse(val);
      localStorage.setItem(KEY_DOCS, JSON.stringify(INITIAL_FINANCE_DOCUMENTS));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FINANCE_DOCUMENTS;
  }

  public getDocumentById(id: string): FinanceDocument | undefined {
    const list = this.getDocuments();
    return list.find((d) => d.id.toLowerCase() === id.toLowerCase() || d.documentNumber.toLowerCase() === id.toLowerCase());
  }
}

export const financeService = new FinanceService();
