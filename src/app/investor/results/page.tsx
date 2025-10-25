"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadInvestorCache, clearInvestorCache, formatAmount } from '../utils';
import { NegotiationState, ChatMessage, AnalysisResult } from '../types';
import styles from './page.module.scss';
import investorStyles from '../page.module.scss';
import PentagonChart from '../components/PentagonChart';

export default function InvestorResultsPage() {
  const router = useRouter();
  const [negotiationState, setNegotiationState] = useState<NegotiationState | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedData = loadInvestorCache();
    if (cachedData) {
      setNegotiationState(cachedData.negotiationState);
      setTranscript(cachedData.transcript);
    } else {
      router.replace('/investor');
    }
  }, [router]);

  useEffect(() => {
    if (negotiationState && transcript.length > 0) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/investor/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negotiationState, transcript }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setAnalysis(data.analysis);
            }
          }
        } catch (error) {
          console.error('Failed to fetch analysis:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [negotiationState, transcript]);

  const finalOfferAmount = analysis?.finalAgreedAmount;

  if (!negotiationState || isLoading) {
    return (
        <div className={investorStyles.simulationContainer}>
            <p>Analyzing your negotiation...</p>
        </div>
    );
  }

  const handleRestart = () => {
    clearInvestorCache();
    router.push('/investor');
  };

  return (
    <div className={investorStyles.simulationContainer}>
        <div className={styles.resultsContainer}>
            <div className={`${styles.card} ${styles.offerCard}`}>
                <div className={styles.finalOffer}>
                    <div className={styles.offerAmount}>
                      {finalOfferAmount !== undefined && finalOfferAmount !== null ? formatAmount(finalOfferAmount) : 'No deal'}
                    </div>
                    <div className={styles.offerLabel}>Final Agreed Allocation</div>
                </div>
            </div>

            {analysis && (
              <>
                <div className={styles.card}>
                    <div className={styles.analysisSection}>
                        <h3>Your Negotiating Style</h3>
                        <p className={styles.archetypeTitle}>{analysis.archetype}</p>
                        <p className={styles.analysisFeedback}>{analysis.summary}</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.chartContainer}>
                      <PentagonChart 
                        scores={analysis.pentagonScores}
                        labels={analysis.pentagonLabels}
                        size={300}
                      />
                    </div>
                </div>
              </>
            )}
        </div>
        <button onClick={handleRestart} className={styles.restartButton}>
          <span className={`material-symbols-outlined ${styles.replayIcon}`}>
            replay
          </span>
            Replay
        </button>
    </div>
  );
}
