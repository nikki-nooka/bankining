'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import { calculateLoanStatus } from '@/lib/loanUtils';

type LoanWithPayments = any;

export default function LoanList({ loans }: { loans: LoanWithPayments[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedLoans = useMemo(() => {
    let result = loans;

    // 1. Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(loan => 
        loan.customerName.toLowerCase().includes(term) ||
        loan.pledgedItemName.toLowerCase().includes(term) ||
        loan.id.toString().includes(term)
      );
    }

    // 2. Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter(loan => loan.itemCategory === categoryFilter);
    }

    // 3. Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.loanDate).getTime() - new Date(b.loanDate).getTime();
      } else if (sortBy === 'loanDesc') {
        return b.loanAmount - a.loanAmount;
      } else if (sortBy === 'loanAsc') {
        return a.loanAmount - b.loanAmount;
      }
      return 0;
    });

    return result;
  }, [loans, searchTerm, categoryFilter, sortBy]);

  return (
    <>
      <div className={styles.controlsContainer}>
        <input
          type="search"
          placeholder="Search by customer name, item, or ID..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className={styles.filtersWrapper}>
          <select 
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Electronics">Electronics</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Others">Others</option>
          </select>

          <select 
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
            <option value="loanDesc">Amount: High to Low</option>
            <option value="loanAsc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredAndSortedLoans.map(loan => {
          const status = calculateLoanStatus(loan);
          return (
            <div key={loan.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.customerName}>
                  <span className={styles.loanId}>ID: {String(loan.id).padStart(4, '0')}</span><br/>
                  {loan.customerName}
                </h3>
                <span className={`${styles.status} ${loan.status === 'CLOSED' ? styles.statusClosed : ''}`}>
                  {loan.status}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span>Item</span>
                <span className={styles.detailValue}>
                  {loan.pledgedItemName} ({loan.itemCategory})
                  {loan.itemCategory === 'Jewelry' && loan.netWeight !== null && ` - ${loan.netWeight}g`}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span>Loan Date</span>
                <span className={styles.detailValue}>{new Date(loan.loanDate).toLocaleDateString()}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span>Principal Balance</span>
                <span className={styles.detailValue}>₹{status.principalBalance.toFixed(2)}</span>
              </div>

              <div className={styles.detailRow}>
                <span>Total Payable</span>
                <span className={styles.detailValue}>₹{status.totalAmountPayable.toFixed(2)}</span>
              </div>

              <div className={styles.cardFooter}>
                <Link href={`/loans/${loan.id}`} className={styles.link}>
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
        {filteredAndSortedLoans.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            {loans.length === 0 ? 'No loans found. Create your first loan!' : 'No loans match your search/filters.'}
          </p>
        )}
      </div>
    </>
  );
}
