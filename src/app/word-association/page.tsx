'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { getInterleavedWords } from '../../lib/scenarios/word_bank';
import StartScreen from '../../components/word-association/StartScreen';
import ResultsScreen from '../../components/word-association/ResultsScreen';
import { analyze } from './actions';
import './styles.css';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getOrCreateSessionId } from '@/lib/session';
import {
	trackGameStart,
	trackGameProgress,
	trackGameComplete,
} from '@/lib/analytics/amplitude';

const CACHE_KEY = 'word-association-cache';

type Response = {
	stimulus: string;
	response: string;
	timeMs: number;
};

type AnalysisResult = {
	summary: string;
	scores: number[];
};

export default function WordAssociationPage() {
	// Configurable options
	const [selectedLength, setSelectedLength] = useState(10); // 10, 20, 30
	const [timePerWordMs, setTimePerWordMs] = useState(6000); // default 6 seconds per word

	// Game state
	const [started, setStarted] = useState(false);
	const [finished, setFinished] = useState(false);
	const [words, setWords] = useState<string[]>([]);
	const [index, setIndex] = useState(0);
	const [inputValue, setInputValue] = useState('');
	const [responses, setResponses] = useState<Response[]>([]);
	const [elapsedMs, setElapsedMs] = useState(0);
	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const startedAtRef = useRef(0);

	// Analysis state
	const [isAnalyzing, startAnalysis] = useTransition();
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [sessionId, setSessionId] = useState<string>('');

	const inputRef = useRef<HTMLInputElement>(null);

	const startGame = () => {
		localStorage.removeItem(CACHE_KEY);
		setWords(getInterleavedWords(selectedLength));
		setResponses([]);
		setIndex(0);
		setInputValue('');
		setElapsedMs(0);
		setStarted(true);
		setFinished(false);
		startedAtRef.current = Date.now();
		startTimer();
		setAnalysisResult(null);
		setAnalysisError(null);
		
		// Track game start
		trackGameStart('word-association', 'Word Association', {
			session_id: sessionId,
			word_count: selectedLength,
			time_per_word_ms: timePerWordMs,
		});
	};

	const startTimer = () => {
		clearTimer();
		startedAtRef.current = Date.now();
		timerIntervalRef.current = setInterval(() => {
			const now = Date.now();
			const elapsed = now - startedAtRef.current;
			setElapsedMs(elapsed);
			if (elapsed >= timePerWordMs) {
				commitAndNext();
			}
		}, 30);
	};

	const clearTimer = useCallback(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}
	}, []);

	const commitCurrent = () => {
		const currentWord = words[index];
		const trimmed = (inputValue || '').trim();
		setResponses(prev => [
			...prev,
			{
				stimulus: currentWord,
				response: trimmed,
				timeMs: Math.min(elapsedMs, timePerWordMs)
			}
		]);
	};

	const commitAndNext = () => {
		commitCurrent();
		
		// Track progress
		trackGameProgress('word-association', 'Word Association', index + 1, words.length, {
			session_id: sessionId,
			word: words[index],
			response: inputValue.trim(),
			time_ms: Math.min(elapsedMs, timePerWordMs),
		});
		
		if (index + 1 >= words.length) {
			finishGame();
		} else {
			setIndex(prev => prev + 1);
			setInputValue('');
			setElapsedMs(0);
			startedAtRef.current = Date.now();
			startTimer();
		}
	};

	const finishGame = () => {
		clearTimer();
		setStarted(false);
		setFinished(true);

		const resultsJson = JSON.stringify(
			{
				length: selectedLength,
				timePerWordMs,
				results: responses
			},
			null,
			2
		);

		// Track completion
		trackGameComplete('word-association', 'Word Association', {
			session_id: sessionId,
			total_words: selectedLength,
			total_responses: responses.length,
		});

		startAnalysis(async () => {
			const result = await analyze(resultsJson, sessionId);
			if (result.success && result.analysis) {
				setAnalysisResult(result.analysis);
				const cacheData = { analysisResult: result.analysis, resultsJson };
				localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
			} else if (result.error) {
				setAnalysisError(result.error);
			}
		});
	};

	const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!started) return;
		if (e.key === 'Enter') {
			e.preventDefault();
			commitAndNext();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			exitGame();
		}
	};

	const exitGame = useCallback(() => {
		clearTimer();
		setStarted(false);
		setFinished(false);
		setInputValue('');
		setElapsedMs(0);
		setIndex(0);
	}, [clearTimer]);

	useEffect(() => {
		const handleGlobalKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && started) {
				event.preventDefault();
				exitGame();
			}
		};

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
			clearTimer();
		};
	}, [started, exitGame, clearTimer]);

	useEffect(() => {
		if (started && inputRef.current) {
			inputRef.current.focus({ preventScroll: true });
		}
	}, [started, index]);

	useEffect(() => {
		const supabase = createClient();
		const getUser = async () => {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);
		};
		getUser();

		// Ensure a persistent session id and create anonymous auth if needed
		(async () => {
			const sid = getOrCreateSessionId();
			setSessionId(sid);
			try {
				const { data } = await supabase.auth.getSession();
				if (!data.session) {
					await supabase.auth.signInAnonymously();
				}
			} catch {
				// non-fatal
			}
		})();

		const cachedResults = localStorage.getItem(CACHE_KEY);
		if (cachedResults) {
			try {
				const data = JSON.parse(cachedResults);
				setAnalysisResult(data.analysisResult);
				setFinished(true);
				setStarted(false);
			} catch (e) {
				console.error('Failed to parse cached results', e);
				localStorage.removeItem(CACHE_KEY);
			}
		}
	}, []);

	const progress = Math.min(100, Math.max(0, (elapsedMs / timePerWordMs) * 100));

	const radarLabels = ['Creativity', 'Optimism', 'Anxiety', 'Pragmatism', 'Spontaneity'];

	return (
		<div className="app">
			<div className="game-container">
				{!started && !finished && (
					<div>
						<StartScreen
							title="Word Association"
							subtitle="Type the first word that comes to mind"
							gameType="word"
							selectedLength={selectedLength}
							setSelectedLength={setSelectedLength}
							timePerWordMs={timePerWordMs}
							setTimePerWordMs={setTimePerWordMs}
							onStart={startGame}
							user={user}
						/>
					</div>
				)}

				{started && (
					<div>
						<section className="slide" role="application">
							<div className="progress-track" aria-hidden="true">
								<div className="progress-bar" style={{ width: `${progress}%` }}></div>
							</div>
							<div className="word" aria-live="polite">
								{words[index]}
							</div>
							<input
								ref={inputRef}
								className="response"
								type="text"
								placeholder="..."
								value={inputValue}
								onChange={e => setInputValue(e.target.value)}
								onKeyDown={handleKeydown}
								autoComplete="off"
								autoCapitalize="none"
								spellCheck={false}
							/>
							<div className="footer">
								<div className="count">
									{index + 1} / {words.length}
								</div>
								<button className="next" onClick={commitAndNext}>
									Next
								</button>
							</div>
							<button className="exit-button" type="button" onClick={exitGame} aria-label="Exit to selection">
								Exit
							</button>
						</section>
					</div>
				)}

				{finished && (
					<div>
						<ResultsScreen
							analysisLoading={isAnalyzing}
							analysisResult={analysisResult}
							analysisError={analysisError}
							labels={radarLabels}
							onComplete={() => {
								setFinished(false);
								setAnalysisResult(null);
								setAnalysisError(null);
								localStorage.removeItem(CACHE_KEY);
							}}
							onRestart={startGame}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
