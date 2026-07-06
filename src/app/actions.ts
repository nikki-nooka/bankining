'use server';

import prisma from '@/lib/prisma';

import { revalidatePath } from 'next/cache';
import { calculateLoanStatus } from '@/lib/loanUtils';

export async function createLoan(formData: FormData) {
  try {
    const customerName = formData.get('customerName')?.toString().trim() || '';
    const loanDateString = formData.get('loanDate') as string;
    const loanDate = new Date(loanDateString);
    const loanAmount = parseFloat(formData.get('loanAmount') as string);
    const interestRatePerMonth = parseFloat(formData.get('interestRatePerMonth') as string);
    const pledgedItemName = formData.get('pledgedItemName')?.toString().trim() || '';
    const estimatedItemValue = parseFloat(formData.get('estimatedItemValue') as string);
    const paymentMode = formData.get('paymentMode') as string;
    const itemCategory = formData.get('itemCategory')?.toString() || 'Jewelry';
    let grossWeight: number | null = null;
    let stoneWeight: number | null = null;
    let netWeight: number | null = null;
    
    if (itemCategory === 'Jewelry') {
      grossWeight = parseFloat(formData.get('grossWeight') as string);
      stoneWeight = parseFloat(formData.get('stoneWeight') as string);
      if (isNaN(grossWeight) || grossWeight <= 0) throw new Error('Gross weight must be strictly greater than 0.');
      if (isNaN(stoneWeight) || stoneWeight < 0) throw new Error('Stone weight cannot be negative.');
      if (stoneWeight >= grossWeight) throw new Error('Stone weight must be strictly less than gross weight (net weight must be > 0).');
      netWeight = grossWeight - stoneWeight;
    }
    
    // Server-side validation
    if (!customerName) throw new Error('Customer name is required.');
    if (!loanDateString || isNaN(loanDate.getTime())) throw new Error('Valid loan date is required.');
    if (isNaN(loanAmount) || loanAmount <= 0) throw new Error('Loan amount must be strictly greater than 0.');
    if (isNaN(interestRatePerMonth) || interestRatePerMonth <= 0) throw new Error('Interest rate must be strictly greater than 0.');
    if (!pledgedItemName) throw new Error('Pledged item name is required.');
    if (isNaN(estimatedItemValue) || estimatedItemValue <= 0) throw new Error('Estimated item value must be strictly greater than 0.');
    if (paymentMode !== 'Cash' && paymentMode !== 'Bank') throw new Error('Payment mode must be Cash or Bank.');

    const loan = await prisma.$transaction(async (tx: any) => {
      // 1. Create the loan
      const newLoan = await tx.loan.create({
        data: {
          customerName,
          loanDate,
          loanAmount,
          interestRatePerMonth,
          pledgedItemName,
          itemCategory,
          grossWeight,
          stoneWeight,
          netWeight,
          estimatedItemValue,
          paymentMode,
        }
      });

      // 2. Create Ledger Entries
      const voucherNo = `LOAN-${newLoan.id}`;
      
      // Debit: Loan Account
      await tx.ledgerEntry.create({
        data: {
          date: loanDate,
          voucherNo,
          account: 'Loan Account',
          debit: loanAmount,
          credit: 0,
          description: `Loan disbursement to ${customerName}`
        }
      });

      // Credit: Cash/Bank Account
      await tx.ledgerEntry.create({
        data: {
          date: loanDate,
          voucherNo,
          account: paymentMode === 'Bank' ? 'Bank Account' : 'Cash Account',
          debit: 0,
          credit: loanAmount,
          description: `Loan disbursement to ${customerName}`
        }
      });

      return newLoan;
    });

    revalidatePath('/');
    return { success: true, loanId: loan.id };
  } catch (error: any) {
    console.error('Error creating loan:', error);
    return { success: false, error: error.message || 'Failed to create loan' };
  }
}

export async function receivePayment(loanId: number, formData: FormData) {
  try {
    const paymentDateString = formData.get('paymentDate') as string;
    const paymentDate = new Date(paymentDateString);
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMode = formData.get('paymentMode') as string;

    if (!paymentDateString || isNaN(paymentDate.getTime())) throw new Error('Valid payment date is required.');
    if (isNaN(amount) || amount <= 0) throw new Error('Payment amount must be strictly greater than 0.');
    if (paymentMode !== 'Cash' && paymentMode !== 'Bank') throw new Error('Payment mode must be Cash or Bank.');

    const result = await prisma.$transaction(async (tx: any) => {
      // Get loan with previous payments
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { payments: { orderBy: { paymentDate: 'desc' } } }
      });

      if (!loan) throw new Error('Loan not found');
      if (loan.status === 'CLOSED') throw new Error('Loan is already closed');
      
      if (paymentDate < loan.loanDate) {
        throw new Error('Payment date cannot be earlier than the loan creation date.');
      }
      
      if (loan.payments.length > 0) {
        const lastPaymentDate = new Date(loan.payments[0].paymentDate);
        if (paymentDate < lastPaymentDate) {
          throw new Error('Payment date cannot be earlier than the last recorded payment date.');
        }
      }

      // Calculate outstanding interest up to the payment date
      const status = calculateLoanStatus(loan, paymentDate);
      
      if (amount > status.totalAmountPayable + 0.01) {
        throw new Error(`Payment amount (₹${amount.toFixed(2)}) cannot exceed total amount payable (₹${status.totalAmountPayable.toFixed(2)}).`);
      }
      
      let interestPaid = 0;
      let principalPaid = 0;

      if (amount <= status.unpaidInterest) {
        interestPaid = amount;
      } else {
        interestPaid = status.unpaidInterest;
        principalPaid = amount - status.unpaidInterest;
      }
      
      // Ensure we don't pay more principal than owed (due to rounding)
      if (principalPaid > status.principalBalance) {
        principalPaid = status.principalBalance;
      }

      const totalAppliedAmount = interestPaid + principalPaid;

      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          loanId,
          paymentDate,
          amount: totalAppliedAmount,
          principalPaid,
          interestPaid,
          paymentMode,
        }
      });

      // 2. Ledger Entries
      const voucherNo = `PAY-${payment.id}`;

      // Debit: Cash/Bank (Money received)
      await tx.ledgerEntry.create({
        data: {
          date: paymentDate,
          voucherNo,
          account: paymentMode === 'Bank' ? 'Bank Account' : 'Cash Account',
          debit: totalAppliedAmount,
          credit: 0,
          description: `Payment received for Loan #${loanId}`
        }
      });

      // Credit: Interest Income
      if (interestPaid > 0) {
        await tx.ledgerEntry.create({
          data: {
            date: paymentDate,
            voucherNo,
            account: 'Interest Income',
            debit: 0,
            credit: interestPaid,
            description: `Interest received for Loan #${loanId}`
          }
        });
      }

      // Credit: Loan Account
      if (principalPaid > 0) {
        await tx.ledgerEntry.create({
          data: {
            date: paymentDate,
            voucherNo,
            account: 'Loan Account',
            debit: 0,
            credit: principalPaid,
            description: `Principal repayment for Loan #${loanId}`
          }
        });
      }

      // If principal is fully paid, close the loan
      if (status.principalBalance - principalPaid <= 0.001) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: 'CLOSED' }
        });
      }

      return payment;
    });

    revalidatePath(`/loans/${loanId}`);
    return { success: true, paymentId: result.id };
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return { success: false, error: error.message || 'Failed to process payment' };
  }
}
