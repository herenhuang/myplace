'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
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

export default function ProfilePage() {
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
						Please log in to view your profile
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Profile Content */}
			<main className="max-w-[1400px]mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-2xl overflow-hidden">
					{/* Profile Header */}
					<div className="bg-gradient-to-r px-8 py-4">
						<div className="flex items-center justify-between w-full space-x-6">

              <div className="flex items-center space-x-5">
                  {user.user_metadata.avatar_url && (
                      <div className="p-0 m-0 mr-3">
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Profile Picture"
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                      </div>
                  )}

                  {!user.user_metadata.avatar_url && (
                    <span className="text-3xl font-bold text-black">
                      {user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  )}
                  
                <div>
                  <h1 className="text-3xl font-[Instrument_Serif] font-bold text-black">
                    {user.user_metadata.full_name || 'User Profile'}
                  </h1>
                  <p className="text-gray-500 tracking-tight font-medium text-md">
                    {user.email}
                  </p>
                </div>
              </div>

              <form action={signOut} className="">
									<button
										type="submit"
										className="w-fit cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 tracking-tight text-sm text-white font-semibold rounded-full shadow-md transition-colors duration-200"
									>
										Sign Out
									</button>
								</form>


						</div>
					</div>

					{/* Profile Information */}
					<div className="px-8 py-8 flex gap-12">

						{/* Scrapbook Section */}
						<div className="mb-12 flex-2">
							<h2 className="font-[Instrument_Serif] text-3xl font-semibold text-gray-900 mb-6">My Scrapbook</h2>
							
							{/* Elevate Simulation Result */}
							{elevateSessions.length > 0 && elevateSessions[0].result ? (
								<div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
									<div className="flex flex-col items-center">
										<ElevateCard
											archetype={elevateSessions[0].result.archetype}
											tagline={ARCHETYPE_DESCRIPTIONS[elevateSessions[0].result.archetype]?.tagline || ''}
											size="large"
											className="mb-6"
										/>

										<Link 
											href="/elevate" 
											className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
										>
											Play again →
										</Link>
									</div>
								</div>
							) : (
								<div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
									<div className="max-w-md mx-auto">
										<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
											<span className="text-4xl">📸</span>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">No Memories Yet</h3>
										<p className="text-gray-600 mb-6">
											Complete the Elevate Simulation to discover your conference archetype and add it to your scrapbook!
										</p>
										<Link 
											href="/elevate" 
											className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full shadow-md transition-colors duration-200"
										>
											Start Elevate Simulation
										</Link>
									</div>
								</div>
							)}
						</div>

						{/* Game Sessions */}
						<div className="width-[240px] flex-2">
						<h2 className="font-[Instrument_Serif] text-3xl font-semibold text-gray-900 mb-6">My Sessions</h2>
							{allSessions.length > 0 ? (
								<div className="grid grid-cols-1 gap-6">
									{allSessions.map(session => (
										<div key={session.id} className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row items-center gap-6 max-h-[300px]">
											<div className="flex-shrink-0 flex justify-center items-center rounded-lg p-2 w-[200px]">
												{session.type === 'word-association' ? (
													<div className="h-full w-full bg-white rounded-lg shadow-[-4px_8px_24px_rgba(0,0,0,0.05)]">

														<PentagonChart scores={session.result.scores} size={180} />
													</div>
												) : (
													<ElevateCard
														archetype={session.result.archetype}
														tagline={ARCHETYPE_DESCRIPTIONS[session.result.archetype]?.tagline || ''}
														size="small"
													/>
												)}
											</div>
											<div className="flex-grow">
												<h3 className="text-xl font-semibold tracking-tight text-gray-900 leading-5 mb-2 capitalize">
													{session.type === 'word-association' 
														? session.game_id.replace('-', ' ')
														: 'Elevate Simulation'
													}
												</h3>
												<p className="text-sm font-medium tracking-tight text-gray-400 mb-2 leading-5">
													{new Date(session.created_at).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													})}
												</p>
											<p 
												className="text-sm text-gray-700 tracking-tight leading-5 overflow-hidden"
												style={{
													display: '-webkit-box',
													WebkitLineClamp: 3,
													WebkitBoxOrient: 'vertical',
													lineClamp: 3
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
									))}
								</div>
							) : (
								<div className="text-center py-8 bg-gray-50 rounded-lg">
									<p className="text-gray-600">You haven&apos;t played any games yet.</p>
									<Link href="/" className="text-orange-500 hover:text-orange-600 font-medium mt-2 inline-block">
										Play a game
									</Link>
								</div>
							)}
						</div>

					</div>
				</div>
			</main>
		</div>
	);
}
