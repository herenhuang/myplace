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

export default function ProfilePage() {
	const [user, setUser] = useState<User | null>(null);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getData = async () => {
			const supabase = createClient();
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				const { data: sessionsData } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

				if (sessionsData) {
					setSessions(sessionsData as Session[]);
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Navigation Header */}
			<header className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200">
							<Image 
								src='/MyPlace2.png' 
								alt='MyPlace Logo' 
								width={500}
								height={300}
								className='w-32 h-auto object-contain'
							/>
						</Link>
						<Link 
							href="/" 
							className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
						>
							← Back to Home
						</Link>
					</div>
				</div>
			</header>

			{/* Profile Content */}
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
					<div className="px-8 py-8">

						{/* Game Sessions */}
						<div className="col-span-1 md:col-span-2">
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
												<p className="text-gray-700">{session.result.summary}</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 bg-gray-50 rounded-lg">
									<p className="text-gray-600">You haven't played any games yet.</p>
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
