'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import { oAuthSignIn } from '../../app/auth/actions';

interface UserButtonProps {
	user: User | null;
}

const UserButton: React.FC<UserButtonProps> = ({ user }) => {
	if (!user) {
		return (
			<form action={oAuthSignIn}>
				<input type="hidden" name="provider" value="google" />
				<button type="submit" className="px-5 py-2 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-base font-bold tracking-tight rounded-full shadow-md transition-colors duration-200">
					Sign In
				</button>
			</form>
		);
	}

	return (
		<Link href="/profile" className="z-10 block">
			<div className="bg-white border border-gray-200 hover:border-orange-300 backdrop-blur-lg px-3 py-2.5 rounded-full flex items-center space-x-4 shadow-lg transition-all duration-200 cursor-pointer">
				<div className="flex items-center space-x-2">
					<Image src={user.user_metadata.avatar_url} alt="Profile" width={36} height={36} className="rounded-full" />
					<div>
						<p className="font-semibold tracking-tight leading-5 text-sm text-black">{user.user_metadata.full_name}</p>
						<p className="font-medium tracking-tight leading-4 text-sm text-gray-400">{user.email}</p>
					</div>
				</div>
				<div className="px-4 py-2 hidden bg-black/10 hover:bg-black/20 transition-all duration-200 text-black tracking-tight text-sm font-semibold rounded-full">View Profile</div>
			</div>
		</Link>
	);
};

export default UserButton;
