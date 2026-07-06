import prisma from '@/lib/prisma';
import styles from '@/app/DayBook.module.css';

export const dynamic = 'force-dynamic';

export default async function DayBook() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: [
      { date: 'desc' },
      { id: 'desc' }
    ]
  });

  const totalDebit = entries.reduce((sum: number, entry: any) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum: number, entry: any) => sum + entry.credit, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Day Book Ledger</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Voucher No.</th>
              <th className={styles.th}>Account</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Debit (₹)</th>
              <th className={styles.th}>Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td className={styles.td}>{new Date(entry.date).toLocaleString()}</td>
                <td className={styles.td}>{entry.voucherNo}</td>
                <td className={styles.td}>{entry.account}</td>
                <td className={styles.td} style={{ color: 'var(--text-muted)' }}>{entry.description}</td>
                <td className={`${styles.td} ${entry.debit > 0 ? styles.debit : ''}`}>
                  {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                </td>
                <td className={`${styles.td} ${entry.credit > 0 ? styles.credit : ''}`}>
                  {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
            {entries.length > 0 && (
              <tr className={styles.totals}>
                <td className={styles.td} colSpan={4} style={{ textAlign: 'right' }}>Totals</td>
                <td className={styles.td}>₹{totalDebit.toFixed(2)}</td>
                <td className={styles.td}>₹{totalCredit.toFixed(2)}</td>
              </tr>
            )}
            {entries.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
