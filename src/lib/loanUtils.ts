import { Loan, Payment } from '@prisma/client'

export type LoanWithPayments = Loan & { payments: Payment[] };

export function calculateLoanStatus(loan: LoanWithPayments, asOfDate: Date = new Date()) {
  let principal = loan.loanAmount;
  let unpaidInterest = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  
  let lastDate = new Date(loan.loanDate);
  const rate = loan.interestRatePerMonth;

  // Ensure payments are sorted chronologically
  const sortedPayments = [...loan.payments].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  for (const payment of sortedPayments) {
    const paymentDate = new Date(payment.paymentDate);
    // Ignore payments in the future if we are calculating for a past date
    if (paymentDate > asOfDate) break;

    const daysElapsed = (paymentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    const monthsElapsed = daysElapsed / 30.0;
    
    // Calculate interest for this period
    const interestAccrued = principal * (rate / 100) * monthsElapsed;
    unpaidInterest += interestAccrued;

    // Apply payment
    unpaidInterest -= payment.interestPaid;
    principal -= payment.principalPaid;
    
    totalInterestPaid += payment.interestPaid;
    totalPrincipalPaid += payment.principalPaid;
    
    lastDate = paymentDate;
  }

  // Calculate interest from the last payment date to asOfDate
  if (lastDate < asOfDate) {
    const daysElapsed = (asOfDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    const monthsElapsed = daysElapsed / 30.0;
    const interestAccrued = principal * (rate / 100) * monthsElapsed;
    unpaidInterest += interestAccrued;
  }

  // Handle minor floating point inaccuracies
  unpaidInterest = Math.max(0, unpaidInterest);

  return {
    principalBalance: principal,
    unpaidInterest: unpaidInterest,
    totalInterestPaid,
    totalPrincipalPaid,
    totalAmountPayable: principal + unpaidInterest
  };
}
