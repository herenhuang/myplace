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

const Section1 = forwardRef<HTMLElement, Omit<SectionProps, 'user'> & { user: User | null; firstSlideHeight: number }>(({ scrollYProgress, user, firstSlideHeight }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [animate, setAnimate] = React.useState(false);
  const [windowHeight, setWindowHeight] = React.useState(0);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const updateWindowHeight = () => setWindowHeight(window.innerHeight);

    checkMobile();
    updateWindowHeight();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateWindowHeight);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateWindowHeight);
    };
  }, []);

  React.useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate progress based on actual first slide height - shrinks as you scroll away
  const totalHeight = firstSlideHeight + 2 * windowHeight;
  const firstSlideEnd = windowHeight > 0 ? firstSlideHeight / totalHeight : 0.33;
  const firstSlideProgress = useTransform(scrollYProgress, [0, firstSlideEnd], [0, 1]);
  const scale = useTransform(firstSlideProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(firstSlideProgress, [0, 1], [0, -5]);
  
  return (
    <motion.section
      ref={ref}
      style={isMobile ? {} : { scale, rotate }}
      className='md:sticky font-semibold md:top-0 h-auto min-h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-start text-gray-900 rounded-xl'
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

      <div className='flex flex-col items-center justify-start gap-0 md:flex-col md:justify-start w-full h-fit pb-8 md:pb-0 mx-auto'>

        <div className={`flex flex-col box-border w-full md:w-fit items-center justify-center rounded-xl p-12 pt-36 md:pt-16 md:pb-0 gap-4 z-10 shadow-[0_0_10px_rgba(0,0,0,0.0)] ${animate ? 'float-up' : 'opacity-0'}`}>
           <Image src={'/elevate/blobbert.png'} alt='MyPlace Logo' width={160} height={160} className='w-40 h-auto object-contain' />
          <h1 className='font-[Instrument_Serif] text-7xl font-medium text-center tracking-tighter leading-[90%] mb-4 -mt-4'>
            Personality Quizzes You Can <i>Play</i>
          </h1>
          
        </div>
       
        <div className={`mt-5 md:mt-0 w-fit pt-10 pb-10 ${animate ? 'float-up-delay-2' : 'opacity-0'}`}>
            <GamesSection />
        </div>
      </div>
        

    </motion.section>
  );
});

Section1.displayName = 'Section1';

const Section2: React.FC<Omit<SectionProps, 'user'> & { firstSlideHeight: number }> = ({ scrollYProgress, firstSlideHeight }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [windowHeight, setWindowHeight] = React.useState(0);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const updateWindowHeight = () => setWindowHeight(window.innerHeight);
    
    checkMobile();
    updateWindowHeight();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateWindowHeight);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateWindowHeight);
    };
  }, []);

  // Calculate progress for middle slide - enters then exits with same animation pattern
  const totalHeight = firstSlideHeight + 2 * windowHeight;
  const secondSlideStart = windowHeight > 0 ? firstSlideHeight / totalHeight : 0.33;
  const secondSlideEnd = windowHeight > 0 ? (firstSlideHeight + windowHeight) / totalHeight : 0.66;
  
  const scale = useTransform(scrollYProgress, 
    [secondSlideStart, secondSlideEnd, 1], 
    [0.8, 1, 0.8]
  );
  const rotate = useTransform(scrollYProgress, 
    [secondSlideStart, secondSlideEnd, 1], 
    [5, 0, -5]
  );

  return (
    <motion.section
      style={isMobile ? {} : { scale, rotate }}
      className='md:sticky md:top-0 relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl overflow-hidden'
    >
      <div className='absolute bottom-0 left-0 right-0 top-0'></div>
      
      <div className='relative z-10 w-full h-screen p-8'>
        <iframe 
          src="/human" 
          className='w-full h-full rounded-2xl'
          title="Human Page Preview"
        />
      </div>
    </motion.section>
  );
};

const Section3: React.FC<Omit<SectionProps, 'user'> & { firstSlideHeight: number }> = ({ scrollYProgress, firstSlideHeight }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [windowHeight, setWindowHeight] = React.useState(0);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const updateWindowHeight = () => setWindowHeight(window.innerHeight);
    
    checkMobile();
    updateWindowHeight();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateWindowHeight);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateWindowHeight);
    };
  }, []);

  // Calculate progress for final slide
  const totalHeight = firstSlideHeight + 2 * windowHeight;
  const thirdSlideStart = windowHeight > 0 ? (firstSlideHeight + windowHeight) / totalHeight : 0.5;
  
  const thirdSlideProgress = useTransform(scrollYProgress, [thirdSlideStart, 1], [0, 1]);
  const scale = useTransform(thirdSlideProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(thirdSlideProgress, [0, 1], [5, 0]);

  return (
    <motion.section
      style={isMobile ? {} : { scale, rotate }}
      className='md:sticky md:top-0 relative min-h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white rounded-xl mt-50'
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
  const firstSlideRef = useRef<HTMLElement>(null);
  const [firstSlideHeight, setFirstSlideHeight] = React.useState(0);
  
  React.useImperativeHandle(ref, () => container.current as HTMLElement);

  React.useEffect(() => {
    const measureFirstSlide = () => {
      if (firstSlideRef.current) {
        setFirstSlideHeight(firstSlideRef.current.offsetHeight);
      }
    };

    measureFirstSlide();
    window.addEventListener('resize', measureFirstSlide);
    measureFirstSlide(); // Call again after a brief delay to ensure content is loaded

    const timeoutId = setTimeout(measureFirstSlide, 100);

    return () => {
      window.removeEventListener('resize', measureFirstSlide);
      clearTimeout(timeoutId);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <>
      <main ref={container} className='relative md:h-[300vh] bg-black'>
        <Section1 ref={firstSlideRef} scrollYProgress={scrollYProgress} user={user} firstSlideHeight={firstSlideHeight} />
        <Section2 scrollYProgress={scrollYProgress} firstSlideHeight={firstSlideHeight} />
        <Section3 scrollYProgress={scrollYProgress} firstSlideHeight={firstSlideHeight} />
      </main>
    </>
  );
});

Component.displayName = 'Component';

export default Component;