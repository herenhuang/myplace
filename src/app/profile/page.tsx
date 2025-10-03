'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import PentagonChart from '@/components/word-association/PentagonChart';
import ElevateCard from '@/components/ElevateCard';
import styles from './page.module.scss'

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

	// Get latest session for each game type
	const latestElevateSession = useMemo(() => elevateSessions[0], [elevateSessions]);
	const latestWordAssocSession = useMemo(() => sessions[0], [sessions]);

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
		<div className={styles.profilePage}>
			{/* Profile Content */}
			<main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full">
		
					{/* Profile Header */}
					
			{/* Latest Results Grid */}
			<div className="flex items-center justify-center px-6 h-full gap-16">

				<div className={styles.profileCard}>

					<div className="bg-gradient-to-r px-8 py-4">
						<div className="flex flex-col items-center justify-between w-full">

						<div className="flex flex-col items-center mb-6">

							<div className="pfp flex items-center justify-center">
								{user.user_metadata.avatar_url && (
									<div className="p-0 m-0">
										<Image
										src={user.user_metadata.avatar_url}
										alt="Profile Picture"
										width={120}
										height={120}
										className="rounded-full"
										/>
									</div>
								)}

								{!user.user_metadata.avatar_url && (
									<span className="text-3xl font-bold text-black">
									{user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
									</span>
								)}
							</div>
							
							<div>
							<h1 className="text-3xl font-[Instrument_Serif] font-bold text-black text-center mt-4">
								{user.user_metadata.full_name || 'User Profile'}
							</h1>
							<p className="text-gray-500 tracking-tight font-medium text-md text-center">
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

					{(sessions.length > 0 || elevateSessions.length > 0) && (
						<Link 
							href="/profile/sessions"
							className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/10 hover:bg-black/20 text-black font-medium rounded-full transition-all duration-200"
						>
							<span className="text-black text-sm tracking-tight font-semibold">View All Sessions</span>
						</Link>
					)}
				</div>
				
				<div className={styles.artifactGrid}>
			
					<div className={`${styles.artifactCard} ${latestElevateSession?.result ? styles.hasContent : ''}`}>
						{latestElevateSession && latestElevateSession.result && (
							<Link href="/elevate" className="group block w-full h-full">
								<div className="flex items-center justify-center w-full h-full p-2">
									<ElevateCard
										archetype={latestElevateSession.result.archetype}
										tagline={ARCHETYPE_DESCRIPTIONS[latestElevateSession.result.archetype]?.tagline || ''}
										dimension={145}
									/>
								</div>
							</Link>
						)}
					</div>
					<div className={`${styles.artifactCard} ${latestWordAssocSession?.result ? styles.hasContent : ''}`}>
						{latestWordAssocSession && latestWordAssocSession.result && (
							<Link href="/word-association" className="group block w-full h-full">
								<div className="flex items-center justify-center w-full h-full p-3">
									<div className="flex items-center justify-center" style={{ width: '180px', height: '180px' }}>
										<PentagonChart scores={latestWordAssocSession.result.scores} size={170} />
									</div>
								</div>
							</Link>
						)}
					</div>
					<div className={styles.artifactCard}></div>

					<div className={styles.artifactCard}></div>
					<div className={styles.artifactCard}></div>
					<div className={styles.artifactCard}></div>

					<div className={styles.artifactCard}></div>
					<div className={styles.artifactCard}></div>
					<div className={styles.artifactCard}></div>
				</div>

				</div>
		
			</main>
		</div>
	);
}
