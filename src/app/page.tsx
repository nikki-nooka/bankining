import prisma from '@/lib/prisma'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import LoanList from './LoanList'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const loans = await prisma.loan.findMany({
    orderBy: { createdAt: 'desc' },
    include: { payments: true }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link href="/loans/new" className={styles.button}>
          + New Loan
        </Link>
      </div>

      <LoanList loans={loans} />
    </div>
  )
}
