'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import PentagonChart from '@/components/word-association/PentagonChart';

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

// Helper function to format archetype name for icon file
const formatArchetypeForIcon = (archetype: string): string => {
	return `icon_${archetype.toLowerCase().replace(/[\s-]/g, '_').replace(/^the_/, '')}`;
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
	const [elevateSession, setElevateSession] = useState<ElevateSession | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getData = async () => {
			const supabase = createClient();
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				// Fetch word-association sessions
				const { data: sessionsData } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

				if (sessionsData) {
					setSessions(sessionsData as Session[]);
				}

				// Fetch latest elevate-simulation session with results
				const { data: elevateData } = await supabase
					.from('sessions')
					.select('*')
					.eq('user_id', user.id)
					.eq('game_id', 'elevate-simulation')
					.not('result', 'is', null)
					.order('created_at', { ascending: false })
					.limit(1)
					.single();

				if (elevateData) {
					setElevateSession(elevateData as ElevateSession);
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
					<div className="bg-gradient-to-r px-8 py-8">
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
                  <h1 className="text-xl tracking-tight font-bold text-black">
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
						<div className="mb-12 flex-1">
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Scrapbook</h2>
							
							{/* Elevate Simulation Result */}
							{elevateSession && elevateSession.result ? (
								<div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
									<div className="flex flex-col items-center">
										<h3 className="text-lg font-semibold text-gray-800 mb-4">Elevate Simulation</h3>
										<p className="text-sm text-gray-500 mb-6">
											{new Date(elevateSession.created_at).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</p>
										
										{/* Result Card */}
										<div 
											className="relative w-[280px] max-w-[80vw] rounded-lg shadow-2xl overflow-hidden mb-6"
											style={{
												aspectRatio: '4/5.5',
												backgroundImage: 'url(/elevate/card.png)',
												backgroundSize: 'cover',
												backgroundPosition: 'center',
												backgroundRepeat: 'no-repeat'
											}}
										>
											<div className="flex flex-col justify-center items-center h-full p-4">
												<Image
													src={`/elevate/${formatArchetypeForIcon(elevateSession.result.archetype)}.png`}
													alt={`${elevateSession.result.archetype} icon`}
													width={200}
													height={200}
													className="rounded-lg mb-4"
													priority
												/>
											<h1 
												className="text-4xl font-semibold leading-tight mb-2 text-center"
												style={{ 
													fontFamily: 'var(--font-instrument-serif)',
													color: 'rgb(130, 44, 44)',
													letterSpacing: '-0.1px'
												}}
											>
												{elevateSession.result.archetype}
											</h1>
											<p 
												className="text-base font-medium leading-tight text-center w-4/5"
												style={{ 
													fontFamily: 'var(--font-lora)',
													color: 'rgba(130, 44, 44, 0.6)',
													letterSpacing: '-0.025em'
												}}
											>
												{ARCHETYPE_DESCRIPTIONS[elevateSession.result.archetype]?.tagline || ''}
											</p>
											</div>
										</div>

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
						<div className="width-[240px]">
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Game Sessions</h2>
							{sessions.length > 0 ? (
								<div className="grid grid-cols-1 gap-6">
									{sessions.map(session => (
										<div key={session.id} className="bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
											<div className="flex-shrink-0">
												<PentagonChart scores={session.result.scores} size={200} />
											</div>
											<div className="flex-grow">
												<h3 className="text-lg font-bold text-gray-900 capitalize">{session.game_id.replace('-', ' ')}</h3>
												<p className="text-sm text-gray-500 mb-2">
													{new Date(session.created_at).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													})}
												</p>
												<p className="text-sm text-gray-700 tracking-tight leading-5">{session.result.summary}</p>
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
