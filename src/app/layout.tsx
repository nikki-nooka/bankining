import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import styles from './Layout.module.css'
import Link from 'next/link'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mini Pawn Broker',
  description: 'Manage loans and payments efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logo}>
            Mini Pawn Broker
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Dashboard</Link>
            <Link href="/loans/new" className={styles.navLink}>New Loan</Link>
            <Link href="/daybook" className={styles.navLink}>Day Book</Link>
          </div>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
      </body>
    </html>
  )
}
