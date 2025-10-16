'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './WaitlistForm.module.scss';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const supabase = createClient();

      // Format the data as JSON with question/answer structure
      const data = {
        question: message || null
      };

      // Insert into signups table
      const { error } = await supabase
        .from('signups')
        .insert([
          {
            email,
            data
          }
        ]);

      if (error) {
        throw error;
      }

      // Success
      setStatus('success');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setStatus('error');
      
      // Handle specific error messages
      if (error.code === '23505') {
        setErrorMessage('This email is already on the waitlist.');
      } else {
        setErrorMessage(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything you want to tell us?"
          disabled={isSubmitting}
          className={styles.textarea}
          rows={4}
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className={styles.button}
      >
        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
      </button>

      {status === 'success' && (
        <div className={styles.successMessage}>
          Thanks for joining! We'll be in touch soon.
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}
    </form>
  );
}

