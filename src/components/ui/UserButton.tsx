'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface UserButtonProps {
	user: User | null;
}

const UserButton: React.FC<UserButtonProps> = ({ user }) => {
	if (!user) {
		return (
			<div className="mt-8 z-10">
				<Link
					href="/signup"
					className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold tracking-tight rounded-full shadow-md transition-colors duration-200"
				>
					Sign In
				</Link>
			</div>
		);
	}

	return (
		<Link href="/profile" className="mt-8 z-10 block">
			<div className="bg-white/30 backdrop-blur-lg p-3 rounded-full flex items-center space-x-4 shadow-lg hover:bg-white/40 transition-all duration-200 cursor-pointer">
				<div>
					<p className="font-semibold tracking-tight text-black">{user.user_metadata.full_name}</p>
					<p className="font-medium tracking-tight text-sm text-gray-700">{user.email}</p>
				</div>
				<div className="px-4 py-2 bg-black/10 text-black font-semibold rounded-full">View Profile</div>
			</div>
		</Link>
	);
};

export default UserButton;
