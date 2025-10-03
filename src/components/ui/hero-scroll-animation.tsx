// hero-scroll-animation.tsx
'use client';

import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import React, { useRef, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GamesSection from '@/components/ui/games-section';
import type { User } from '@supabase/supabase-js';
import UserButton from './UserButton';

interface SectionProps {
  scrollYProgress: MotionValue<number>;
  user: User | null;
}

const Section1: React.FC<Omit<SectionProps, 'user'> & { user: User | null }> = ({ scrollYProgress, user }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  
  return (
    <motion.section
      style={isMobile ? {} : { scale, rotate }}
      className='md:sticky font-semibold md:top-0 min-h-screen h-auto md:h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-start md:justify-center text-gray-900 rounded-xl'
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
      <div className="absolute top-6 right-6 z-10">
				<UserButton user={user} />
			</div>

      <div className='flex flex-col items-center justify-start gap-12 md:flex-row md:justify-center w-full pb-8 md:pb-0 mx-auto'>

        <div className='flex flex-col box-border w-full md:w-fit items-center justify-center rounded-xl p-12 pt-36 md:pt-12 md:pb-0 gap-4 z-10 shadow-[0_0_10px_rgba(0,0,0,0.0)]'>
          <Image src={'/elevate/blobbert.png'} alt='MyPlace Logo' width={500} height={300} className='w-40 h-auto object-contain' />
          <h1 className='text-5xl font-bold text-center tracking-tight leading-[90%] w-[360px] mb-8'>
            Real, Interactive Simulations.
          </h1>
          <div className="">
            <UserButton user={user} />
          </div>
        </div>
       
        <div className='mt-5 md:mt-10 w-fit'>
            <GamesSection />
        </div>
      </div>
        

    </motion.section>
  );
};

const Section2: React.FC<Omit<SectionProps, 'user'>> = ({ scrollYProgress }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  

  return (
    <motion.section
      style={isMobile ? {} : { scale, rotate }}
      className='relative min-h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white rounded-xl'
    >

      <div className='absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle,#505050,transparent_1px)] bg-[size:20px_20px]'></div>

      <article className='container mx-auto relative z-10 pb-12 px-4 md:px-6 lg:px-8'>
        
        
      <div className='flex-1 container mx-auto relative z-10 px-4 md:px-6 lg:px-8 pt-32 pb-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-white text-2xl font-medium leading-8 space-y-12'>
            <p>We were built for 🎲 play. It&apos;s how kids learn, how friends bond, how we reveal ourselves without even trying.</p>
            
            <p>Somewhere along the way, many of us were told to grow up: fill out forms, take tests, polish résumés 📝.</p>
            <p>But that doesn&apos;t capture who we are. Interviews, personality tests, even social media reflect what we say, not how we act. None of them hold the living record of how we actually show up: in the small choices, under real pressure, over ⏳ time.</p>
            
            <p>Now that AI can mimic our words and even fake our work, the one thing it can&apos;t copy is our judgment, our character, the way we move through the world. That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with each other, and with the tools we rely on.</p>
            <p>A living record of our human edge.</p>
            
            <p>If any of that resonates, there&apos;s a place for you here.</p>
          </div>
        </div>
      </div>

        
        {/* Footer content integrated into games section */}
        <div className='mt-20 text-center border-t border-gray-700 pt-12'>
          <h1 className='text-4xl tracking-tight text-white font-semibold mb-8 w-full'>
            Let us know what you like by clicking to vote!
          </h1>
          <a href="https://tally.so/r/mR91yP" target="_blank" rel="noopener noreferrer" className="hover:underline mx-auto w-fit block">
            <p className='text-white mb-8 bg-white/10 rounded-full w-fit text-base font-semibold tracking-tight px-5 py-3'>
                Contact
            </p>
          </a>
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
      <main ref={container} className='relative md:h-[200vh] bg-black'>
        <Section1 scrollYProgress={scrollYProgress} user={user} />
        <Section2 scrollYProgress={scrollYProgress} />
      </main>
    </>
  );
});

Component.displayName = 'Component';

export default Component;