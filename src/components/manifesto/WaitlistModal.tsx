'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './WaitlistModal.module.scss';
import { createClient } from '@/lib/supabase/client';

interface BubbleData {
  bubblesPopped: number;
  timeElapsed: number;
  completed: boolean;
}

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, bubbleData: BubbleData) => Promise<void>;
  isSubmitting: boolean;
}

type TBubbleStats = {
  poppedMoreThan: number;
  beatsTimePercent: number;
};

export default function WaitlistModal({ isOpen, onClose, onSubmit, isSubmitting }: WaitlistModalProps) {
  const [stage, setStage] = useState<'game' | 'question'>('game');
  const [bubbles, setBubbles] = useState<boolean[]>(Array(10).fill(false));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bubbleData, setBubbleData] = useState<BubbleData | null>(null);
  const [bubbleStats, setBubbleStats] = useState<TBubbleStats | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Timer effect
  useEffect(() => {
    if (isGameActive && stage === 'game') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, stage]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      // Reset state when opening
      setStage('game');
      setBubbles(Array(10).fill(false));
      setTimeElapsed(0);
      setIsGameActive(true);
      setMessage('');
      setBubbleData(null);
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBubblePop = (index: number) => {
    if (bubbles[index] || !isGameActive) return;

    const newBubbles = [...bubbles];
    newBubbles[index] = true;
    setBubbles(newBubbles);

    const allPopped = newBubbles.every((b) => b);
    if (allPopped) {
      handleGameComplete(true);
    }
  };

  const handleGameComplete = async (completed: boolean) => {
    setIsLoading(true);
    setIsGameActive(false);
    const bubblesPopped = bubbles.filter((b) => b).length;
    
    const data: BubbleData = {
      bubblesPopped,
      timeElapsed,
      completed,
    };
    
    setBubbleData(data);
    await onSubmit(message, data);
    const supabase = createClient();
    // can be optimized to a single query using supabase rpc
    const [poppedMoreThan, hadGreaterTime, total] = await Promise.all([
      supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .lt('data->bubbleData->>bubblesPopped', bubblesPopped),
      supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .gt('data->bubbleData->>timeElapsed', timeElapsed)
        .eq('data->bubbleData->>bubblesPopped', bubblesPopped),

      supabase
        .from('signups')
        .select('*', { count: 'exact', head: true }),
    ]);
    if (!poppedMoreThan.error && !hadGreaterTime.error && !total.error) {
      setBubbleStats({
        poppedMoreThan: poppedMoreThan.count || 0,
        beatsTimePercent: total.count && total.count > 0 ? Math.round(((hadGreaterTime.count || 0) / total.count) * 100) : 0,
      });
    }

    // Move to question stage after a short delay
    setTimeout(() => {
      setStage('question');
      setIsLoading(false);
    }, 500);
  };

  const handleSkip = () => {
    handleGameComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bubblesPopped = bubbles.filter((b) => b).length;

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={onClose}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ✕
        </button>

        {stage === 'game' && (
          <div className={styles.gameStage}>
            <div className={styles.gameHeader}>
              <h2 className={styles.gameTitle}>you're on the list! pop some bubbles for fun~</h2>
              <div className={styles.gameStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{bubblesPopped}</span>
                  <span className={styles.statLabel}>/ {bubbles.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{formatTime(timeElapsed)}</span>
                  <span className={styles.statLabel}>time</span>
                </div>
              </div>
            </div>

            <div className={styles.bubblesGrid}>
              {/* Row 1: 4 bubbles (indices 0-3) */}
              <div className={styles.bubbleRow}>
                {bubbles.slice(0, 4).map((isPopped, idx) => {
                  const index = idx;
                  return (
                    <button
                      key={index}
                      className={`${styles.bubble} ${isPopped ? styles.popped : ''}`}
                      onClick={() => handleBubblePop(index)}
                      disabled={isPopped || !isGameActive}
                      type="button"
                    >
                      {!isPopped && <div className={styles.bubbleShine} />}
                    </button>
                  );
                })}
              </div>
              
              {/* Row 2: 3 bubbles (indices 4-6) */}
              <div className={styles.bubbleRow}>
                {bubbles.slice(4, 7).map((isPopped, idx) => {
                  const index = idx + 4;
                  return (
                    <button
                      key={index}
                      className={`${styles.bubble} ${isPopped ? styles.popped : ''}`}
                      onClick={() => handleBubblePop(index)}
                      disabled={isPopped || !isGameActive}
                      type="button"
                    >
                      {!isPopped && <div className={styles.bubbleShine} />}
                    </button>
                  );
                })}
              </div>
              
              {/* Row 3: 2 bubbles (indices 7-8) */}
              <div className={styles.bubbleRow}>
                {bubbles.slice(7, 9).map((isPopped, idx) => {
                  const index = idx + 7;
                  return (
                    <button
                      key={index}
                      className={`${styles.bubble} ${isPopped ? styles.popped : ''}`}
                      onClick={() => handleBubblePop(index)}
                      disabled={isPopped || !isGameActive}
                      type="button"
                    >
                      {!isPopped && <div className={styles.bubbleShine} />}
                    </button>
                  );
                })}
              </div>
              
              {/* Row 4: 1 bubble (index 9) */}
              <div className={styles.bubbleRow}>
                {bubbles.slice(9, 10).map((isPopped, idx) => {
                  const index = idx + 9;
                  return (
                    <button
                      key={index}
                      className={`${styles.bubble} ${isPopped ? styles.popped : ''}`}
                      onClick={() => handleBubblePop(index)}
                      disabled={isPopped || !isGameActive}
                      type="button"
                    >
                      {!isPopped && <div className={styles.bubbleShine} />}
                    </button>
                  );
                })}
              </div>
            </div>
            {isLoading ? (
              <div className={styles.loadingMessage}>One sec ...</div>
            ) : (
              <button
                className={styles.skipButton}
                onClick={handleSkip}
                type="button"
              >
                Skip →
              </button>
            )}
          </div>
        )}

        {stage === 'question' && (
          <div className={styles.questionStage}>
            <h2 className={styles.questionTitle}>
              Nice!
            </h2>

            <div className={styles.questionLabel}>
              <p>
                {bubbleData?.bubblesPopped === 0
                  ? "Too good for bubbles, huh? no worries, you're still on the list!"
                  : `Nice! you popped ${bubbleData?.bubblesPopped} bubbles in ${formatTime(bubbleData?.timeElapsed || 0)}`
                }
                {bubbleData && bubbleData.bubblesPopped > 0 && !bubbleData?.completed && bubbleStats && `. you popped more bubbles than ${bubbleStats?.poppedMoreThan || 0} other participants.`}
                {bubbleData?.completed && `. you actually popped them all. that's better than ${bubbleStats ? `${bubbleStats.poppedMoreThan} other participants` : '>90% of all other'} participants. faster than ${bubbleStats && bubbleStats.beatsTimePercent ? `${bubbleStats.beatsTimePercent}% of` : 'some'} others too! impressive.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

