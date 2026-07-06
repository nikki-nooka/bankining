import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { calculateLoanStatus } from '@/lib/loanUtils';
import styles from '@/app/LoanDetails.module.css';
import PaymentForm from './PaymentForm';

export const dynamic = 'force-dynamic';

export default async function LoanDetails(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const loanId = parseInt(params.id, 10);
  if (isNaN(loanId)) return notFound();

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { payments: { orderBy: { paymentDate: 'asc' } } }
  });

  if (!loan) return notFound();

  const status = calculateLoanStatus(loan);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Loan #{loan.id} - {loan.customerName}</h1>
        <span className={`${styles.status} ${loan.status === 'CLOSED' ? styles.statusClosed : ''}`}>
          {loan.status}
        </span>
      </div>

      <div className={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Loan Summary</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Loan Amount</span>
                <span className={styles.detailValue}>₹{loan.loanAmount.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Interest Rate</span>
                <span className={styles.detailValue}>{loan.interestRatePerMonth}% per month</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Loan Date</span>
                <span className={styles.detailValue}>{new Date(loan.loanDate).toLocaleString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Pledged Item</span>
                <span className={styles.detailValue}>
                  {loan.pledgedItemName} ({loan.itemCategory})
                  {loan.itemCategory === 'Jewelry' && loan.netWeight !== null && ` - ${loan.netWeight}g Net`}
                </span>
              </div>
            </div>

            <h3 className={styles.cardTitle} style={{ marginTop: '2rem' }}>Current Balances</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Interest Till Date</span>
                <span className={styles.detailValue}>₹{status.unpaidInterest.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Balance Principal</span>
                <span className={styles.detailValue}>₹{status.principalBalance.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Principal Paid</span>
                <span className={styles.detailValue}>₹{status.totalPrincipalPaid.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Interest Paid</span>
                <span className={styles.detailValue}>₹{status.totalInterestPaid.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <span className={styles.detailLabel}>Total Amount Payable</span>
                <span className={styles.highlightValue}>₹{status.totalAmountPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Payment History</h2>
            {loan.payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No payments received yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Principal</th>
                    <th className={styles.th}>Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.payments.map(payment => (
                    <tr key={payment.id}>
                      <td className={styles.td}>{new Date(payment.paymentDate).toLocaleString()}</td>
                      <td className={styles.td}>₹{payment.amount.toFixed(2)}</td>
                      <td className={styles.td}>₹{payment.principalPaid.toFixed(2)}</td>
                      <td className={styles.td}>₹{payment.interestPaid.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Receive Payment</h2>
            {loan.status === 'CLOSED' ? (
              <p style={{ color: 'var(--success-color)', fontWeight: 600 }}>Loan is fully settled.</p>
            ) : (
              <PaymentForm loanId={loan.id} maxAmount={status.totalAmountPayable} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
