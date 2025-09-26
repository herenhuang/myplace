// hero-scroll-animation.tsx
'use client';

import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import React, { useRef, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageMask from '@/components/ui/image-mask';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/app/auth/actions';

interface SectionProps {
  scrollYProgress: MotionValue<number>;
  user: User | null;
}

const Section1: React.FC<Omit<SectionProps, 'user'> & { user: User | null }> = ({ scrollYProgress, user }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  return (
    <motion.section
      style={{ scale, rotate }}
      className='sticky font-semibold top-0 h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center text-gray-900'
    >
      <div className='absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]'></div>
      
      {/* Logo in top-left corner */}
      <div className='absolute top-6 left-6 z-10'>
        <Link href="/" className="block hover:scale-105 transition-transform duration-200">
          <Image 
            src='/MyPlace2.png' 
            alt='MyPlace Logo' 
            width={500}
            height={300}
            className='w-40 h-auto object-contain'
          />
        </Link>
      </div>

      <h1 className='2xl:text-8xl text-7xl px-8 font-semibold text-center tracking-tight leading-[120%] relative z-10'>
        Personality quizzes you can play <br /> <span className='text-6xl'>👇👇👇</span>
      </h1>
      {!user && (
        <div className="mt-8 z-10">
          <Link href="/signup" className="px-8 py-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-200">
              Sign In
          </Link>
        </div>
      )}
      {user && (
        <div className="mt-8 z-10 bg-white/30 backdrop-blur-lg p-3 rounded-full flex items-center space-x-4 shadow-lg">
          <div>
            <p className="font-semibold text-gray-900">{user.user_metadata.full_name}</p>
            <p className="text-sm text-gray-700">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white font-semibold rounded-full shadow-md hover:bg-gray-800 transition-colors duration-200"
            >
              Sign Out
            </button>
          </form>
        </div>
      )}
    </motion.section>
  );
};

const Section2: React.FC<Omit<SectionProps, 'user'>> = ({ scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  

  return (
    <motion.section
      style={{ scale, rotate }}
      className='relative min-h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white '
    >
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>
      <article className='container mx-auto relative z-10 pb-12 px-4 md:px-6 lg:px-8'>
        <h1 className='text-4xl md:text-6xl leading-[110%] pt-20 pb-16 md:pb-20 font-semibold tracking-tight max-w-5xl'>
          <span className="block sm:inline">Play games, discover your traits</span>
          <span className="block sm:inline"> and show them off in </span>
          <Link 
            href="/welcome" 
            className="inline-block hover:scale-105 transition-transform duration-200"
          >
            <Image 
              src="/LogoWhite.png" 
              alt="myPlace Logo" 
              width={400}
              height={100}
              className="inline-block w-48 md:w-72 lg:w-96 h-auto object-contain"
            />
          </Link>
        </h1>
        
        {/* Image Mask Section */}
        <div className='mt-20'>
          <ImageMask />
        </div>
        
        {/* Footer content integrated into games section */}
        <div className='mt-20 text-center border-t border-gray-700 pt-12'>
          <h1 className='text-3xl md:text-5xl text-white font-semibold mb-8 w-full'>
            Let us know what you like by clicking to vote!
          </h1>
          <p className='text-white text-base mb-8'>
            <a href="https://tally.so/r/mR91yP" target="_blank" rel="noopener noreferrer" className="hover:underline">
              contact here
            </a>
          </p>
          <div className='mt-12 mb-8'>
            <Link href="/" className="block hover:scale-105 transition-transform duration-200">
              <Image 
                src='/MyplaceWhite.png' 
                alt='MyPlace Logo' 
                width={500}
                height={300}
                className='mx-auto w-40 h-auto object-contain'
              />
            </Link>
          </div>
        </div>
      </article>
    </motion.section>
  );
};


interface ComponentProps {
    user: User | null;
}

const Component = forwardRef<HTMLElement, ComponentProps>(({ user }, ref) => {
  const container = useRef<HTMLDivElement>(null);
  
  React.useImperativeHandle(ref, () => container.current as HTMLElement);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <>
      <main ref={container} className='relative h-[200vh] bg-black'>
        <Section1 scrollYProgress={scrollYProgress} user={user} />
        <Section2 scrollYProgress={scrollYProgress} />
      </main>
    </>
  );
});

Component.displayName = 'Component';

export default Component;