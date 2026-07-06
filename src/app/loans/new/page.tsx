'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLoan } from '@/app/actions';
import styles from '@/app/Form.module.css';

export default function NewLoan() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const [category, setCategory] = useState('Jewelry');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  
  const netWeight = (parseFloat(grossWeight || '0') - parseFloat(stoneWeight || '0')).toFixed(2);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createLoan(formData);
      if (result.success) {
        router.push(`/loans/${result.loanId}`);
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Create New Loan</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: 'var(--danger-color)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius)', 
          fontWeight: 500,
          marginBottom: '1.5rem' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Customer Name</label>
          <input required type="text" name="customerName" className={styles.input} placeholder="John Doe" minLength={1} />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Loan Date & Time</label>
          <input 
            required 
            type="datetime-local" 
            name="loanDate" 
            className={styles.input} 
            defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} 
          />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Loan Amount (₹)</label>
          <input required type="number" step="0.01" min="0.01" name="loanAmount" className={styles.input} placeholder="1000" />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Interest Rate (% per month)</label>
          <input required type="number" step="0.01" min="0.01" name="interestRatePerMonth" className={styles.input} defaultValue="2.0" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Item Category</label>
          <select name="itemCategory" className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="Jewelry">Jewelry / Gold</option>
            <option value="Electronics">Electronics</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Pledged Item Name</label>
          <input required type="text" name="pledgedItemName" className={styles.input} placeholder="Gold Necklace" minLength={1} />
        </div>
        
        {category === 'Jewelry' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Gross Weight (g)</label>
              <input required type="number" step="0.01" min="0.01" name="grossWeight" className={styles.input} value={grossWeight} onChange={e => setGrossWeight(e.target.value)} />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Stone Weight (g)</label>
              <input required type="number" step="0.01" min="0" name="stoneWeight" className={styles.input} value={stoneWeight} onChange={e => setStoneWeight(e.target.value)} />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Net Weight (g) - Auto Calculated</label>
              <input type="text" className={styles.input} value={netWeight} readOnly style={{ backgroundColor: 'var(--bg-secondary)' }} />
            </div>
          </>
        )}
        
        <div className={styles.field}>
          <label className={styles.label}>Estimated Item Value (₹)</label>
          <input required type="number" step="0.01" min="0.01" name="estimatedItemValue" className={styles.input} />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Payment Mode</label>
          <select name="paymentMode" className={styles.select}>
            <option value="Cash">Cash (Physical Currency)</option>
            <option value="Bank">Bank Transfer / UPI / Cheque</option>
          </select>
        </div>
        
        <div className={`${styles.buttonContainer} ${styles.fullWidth}`}>
          <button type="submit" className={styles.submitBtn} disabled={isPending || (category === 'Jewelry' && parseFloat(netWeight) <= 0)}>
            {isPending ? 'Creating...' : 'Create Loan'}
          </button>
          {category === 'Jewelry' && parseFloat(netWeight) <= 0 && <span style={{ color: 'var(--danger-color)', display: 'block', marginTop: '0.5rem', fontSize: '0.875rem' }}>Net weight must be greater than 0</span>}
        </div>
      </form>
    </div>
  );
}
