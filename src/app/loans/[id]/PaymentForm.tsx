'use client';

import { useState, useTransition } from 'react';
import { receivePayment } from '@/app/actions';
import formStyles from '@/app/Form.module.css';

export default function PaymentForm({ loanId, maxAmount }: { loanId: number, maxAmount: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await receivePayment(loanId, formData);
      if (!result.success) {
        setError(result.error || 'Failed to process payment');
      } else {
        // Reset form on success
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ 
          backgroundColor: 'var(--danger-color)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius)', 
          fontWeight: 500 
        }}>
          {error}
        </div>
      )}
      
      <div className={formStyles.field}>
        <label className={formStyles.label}>Payment Date & Time</label>
        <input 
          required 
          type="datetime-local" 
          name="paymentDate" 
          className={formStyles.input} 
          defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} 
        />
      </div>
      
      <div className={formStyles.field}>
        <label className={formStyles.label}>Amount (₹)</label>
        <input required type="number" step="0.01" min="0.01" max={maxAmount.toFixed(2)} name="amount" className={formStyles.input} placeholder="0.00" />
        <small style={{ color: 'var(--text-muted)' }}>Max: ₹{maxAmount.toFixed(2)}</small>
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label}>Payment Mode</label>
        <select name="paymentMode" className={formStyles.select}>
          <option value="Cash">Cash (Physical Currency)</option>
          <option value="Bank">Bank Transfer / UPI / Cheque</option>
        </select>
      </div>
      
      <button type="submit" className={formStyles.submitBtn} disabled={isPending}>
        {isPending ? 'Processing...' : 'Receive Payment'}
      </button>
    </form>
  );
}
