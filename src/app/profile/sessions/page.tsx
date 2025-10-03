'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import PentagonChart from '@/components/word-association/PentagonChart';
import ElevateCard from '@/components/ElevateCard';

type Session = {
	id: string;
	game_id: string;
	result: {
		summary: string;
		scores: number[];
	};
	created_at: string;
};

type ElevateSession = {
	id: string;
	game_id: string;
	result: {
		archetype: string;
		explanation: string;
	};
	created_at: string;
};

const ARCHETYPE_DESCRIPTIONS: Record<string, { tagline: string; emoji: string }> = {
	'The Icebreaker': {
		tagline: 'You thrive in groups and make others feel at ease.',
		emoji: '🤝'
	},
	'The Planner': {
		tagline: 'You prepare well and others can count on you.',
		emoji: '📋'
	},
	'The Floater': {
		tagline: 'You embrace spontaneity and find unexpected gems.',
		emoji: '🎈'
	},
	'The Note-Taker': {
		tagline: "You're detail-oriented and curious to understand fully.",
		emoji: '📝'
	},
	'The Action-Taker': {
		tagline: 'You move quickly from ideas to action and bring energy with you.',
		emoji: '⚡'
	},
	'The Observer': {
		tagline: 'You notice what others miss and reflect before acting.',
		emoji: '👁️'
	},
	'The Poster': {
		tagline: 'You capture the vibe and make it memorable for others.',
		emoji: '📸'
	},
	'The Big-Idea Person': {
		tagline: 'You think in possibilities and spark expansive conversations.',
		emoji: '💡'
	},
	'The Anchor': {
		tagline: "You're steady, grounding, and people naturally orbit you.",
		emoji: '⚓'
	}
};

export default function SessionsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [elevateSessions, setElevateSessions] = useState<ElevateSession[]>([]);
	const [loading, setLoading] = useState(true);

	// Merge and sort all sessions by date (latest first)
	const allSessions = useMemo(() => {
		const combined = [
			...sessions.map(s => ({ ...s, type: 'word-association' as const })),
			...elevateSessions.map(s => ({ ...s, type: 'elevate' as const }))
		];
		
		// Sort by created_at in descending order (latest first)
		return combined.sort((a, b) => 
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
	}, [sessions, elevateSessions]);

	useEffect(() => {
		const getData = async () => {
			const supabase = createClient();
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				// Fetch word-association sessions
				const { data: wordAssocData } = await supabase
					.from('sessions')
					.select('*')
					.eq('user_id', user.id)
					.eq('game_id', 'word-association')
					.order('created_at', { ascending: false });

				if (wordAssocData) {
					setSessions(wordAssocData as Session[]);
				}

				// Fetch all elevate-simulation sessions with results
				const { data: elevateData } = await supabase
					.from('sessions')
					.select('*')
					.eq('user_id', user.id)
					.eq('game_id', 'elevate-simulation')
					.not('result', 'is', null)
					.order('created_at', { ascending: false });

				if (elevateData) {
					setElevateSessions(elevateData as ElevateSession[]);
				}
			}

			setLoading(false);
		};

		getData();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-white">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Not logged in</h1>
					<Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
						Please log in to view your sessions
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Navigation Header */}
			<header className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<Link href="/profile" className="flex items-center hover:opacity-80 transition-opacity">
							<span className="material-symbols-rounded text-gray-600 mr-2">arrow_back</span>
							<span className="text-gray-600 font-medium">Back to Profile</span>
						</Link>
						<Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200">
							<Image 
								src='/MyPlace2.png' 
								alt='MyPlace Logo' 
								width={500}
								height={300}
								className='w-32 h-auto object-contain'
							/>
						</Link>
					</div>
				</div>
			</header>

			{/* Sessions Content */}
			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-8">
					<h1 className="font-[Instrument_Serif] text-4xl font-semibold text-gray-900 mb-2">All Sessions</h1>
					<p className="text-gray-600">
						{allSessions.length} session{allSessions.length !== 1 ? 's' : ''} total
					</p>
				</div>

				{allSessions.length > 0 ? (
					<div className="grid grid-cols-1 gap-6">
						{allSessions.map(session => (
							<div key={session.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex flex-col md:flex-row items-center gap-6">
									<div className="flex-shrink-0 flex justify-center items-center rounded-lg">
										{session.type === 'word-association' ? (
											<div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
												<PentagonChart scores={session.result.scores} size={180} />
											</div>
										) : (
											<ElevateCard
												archetype={session.result.archetype}
												tagline={ARCHETYPE_DESCRIPTIONS[session.result.archetype]?.tagline || ''}
												dimension={200}
											/>
										)}
									</div>
									<div className="flex-grow">
										<h3 className="text-2xl font-[Instrument_Serif] font-semibold tracking-tight text-gray-900 leading-6 mb-2 capitalize">
											{session.type === 'word-association' 
												? session.game_id.replace('-', ' ')
												: 'Elevate Simulation'
											}
										</h3>
										<p className="text-sm font-medium tracking-tight text-gray-400 mb-3 leading-5">
											{new Date(session.created_at).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
												hour: 'numeric',
												minute: '2-digit'
											})}
										</p>
										<p 
											className="text-base text-gray-700 tracking-tight leading-6 overflow-hidden"
											style={{
												display: '-webkit-box',
												WebkitLineClamp: 4,
												WebkitBoxOrient: 'vertical',
												lineClamp: 4
											}}
										>
											{session.type === 'word-association' ? (
												session.result.summary
											) : (
												<>
													<span className="font-semibold">{session.result.archetype}</span> • {session.result.explanation.split('\n')[0]}
												</>
											)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
						<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
							<span className="text-4xl">🎮</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
						<p className="text-gray-600 mb-6">
							You haven&apos;t completed any games yet. Start playing to see your results here!
						</p>
						<div className="flex gap-4 justify-center flex-wrap">
							<Link 
								href="/elevate" 
								className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full shadow-md transition-colors duration-200"
							>
								Try Elevate
							</Link>
							<Link 
								href="/word-association" 
								className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full shadow-md transition-colors duration-200"
							>
								Try Word Association
							</Link>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

