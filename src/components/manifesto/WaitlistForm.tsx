'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import WaitlistModal from './WaitlistModal';
import styles from './WaitlistForm.module.scss';

interface BubbleData {
  bubblesPopped: number;
  timeElapsed: number;
  completed: boolean;
}

// Generate a unique session ID
const generateSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for browsers that don't support crypto.randomUUID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recordId, setRecordId] = useState<string>('');

  // Generate session ID on mount
  useEffect(() => {
    // Check if we already have a session ID in sessionStorage
    const existingSessionId = sessionStorage.getItem('waitlist_session_id');
    if (existingSessionId) {
      setRecordId(existingSessionId);
    }
  }, []);

  const handleOpenModal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const supabase = createClient();

      // Create initial entry with email
      const { data: insertedData, error } = await supabase
        .from('signups')
        .insert([
          {
            email,
            data: null
          }
        ])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Store the record ID for later update
      if (insertedData?.id) {
        setRecordId(insertedData.id);
        // Store in sessionStorage as backup
        sessionStorage.setItem('waitlist_session_id', insertedData.id);
      }

      // Open modal after successful entry creation
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error creating signup entry:', error);
      setStatus('error');
      
      if (error.code === '23505') {
        setErrorMessage('This email is already on the waitlist.');
      } else {
        setErrorMessage(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (message: string, bubbleData: BubbleData) => {
    if (!recordId) {
      setErrorMessage('Session expired. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const supabase = createClient();

      // Format the data as JSON with question/answer and bubble data
      const data = {
        question: message || null,
        bubbleData: {
          bubblesPopped: bubbleData.bubblesPopped,
          timeElapsed: bubbleData.timeElapsed,
          completed: bubbleData.completed,
        }
      };

      // Update existing record by ID with bubble data
      const { error } = await supabase
        .from('signups')
        .update({ data })
        .eq('id', recordId);

      if (error) {
        throw error;
      }

      // Success - clear session storage
      sessionStorage.removeItem('waitlist_session_id');
      setStatus('success');
      setEmail('');
      setRecordId('');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating signup:', error);
      setStatus('error');
      
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOpenModal} className={styles.form}>
        <h2 className={styles.formTitle}>Join the waitlist</h2>
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

          <button 
            type="submit" 
            disabled={isSubmitting || !email}
            className={styles.button}
          >
          {isSubmitting ? 'Loading...' : "Let's Play →"}
        </button>
        </div>

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

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

