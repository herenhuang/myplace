// hero-scroll-animation.tsx
'use client';

import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import React, { useRef, forwardRef } from 'react';

interface SectionProps {
  scrollYProgress: MotionValue<number>;
}

const Section1: React.FC<SectionProps> = ({ scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  return (
    <motion.section
      style={{ scale, rotate }}
      className='sticky font-semibold top-0 h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center text-gray-900'
    >
      <div className='absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]'></div>

      <h1 className='2xl:text-7xl text-6xl px-8 font-semibold text-center tracking-tight leading-[120%]'>
        Personality quizzes you can play <br /> 👇👇👇
      </h1>
    </motion.section>
  );
};

const Section2: React.FC<SectionProps> = ({ scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);

  return (
    <motion.section
      style={{ scale, rotate }}
      className='relative h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white '
    >
      <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>
      <article className='container mx-auto relative z-10 '>
        <h1 className='text-6xl leading-[100%] pt-20 pb-10 font-semibold tracking-tight '>
          Play games, discover your traits <br /> and show them off
        </h1>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='group cursor-pointer'>
            <img
              src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&auto=format&fit=crop'
              alt='Story Explorer - Interactive Fiction'
              className='object-cover w-full rounded-lg h-60 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-3'>
              <h3 className='text-lg font-semibold text-white'>Story Explorer</h3>
              <p className='text-sm text-gray-300'>Interactive Fiction</p>
            </div>
          </div>
          <div className='group cursor-pointer'>
            <img
              src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop'
              alt='Myers-Briggs Test - Personality Assessment'
              className='object-cover w-full rounded-lg h-60 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-3'>
              <h3 className='text-lg font-semibold text-white'>Myers-Briggs Test</h3>
              <p className='text-sm text-gray-300'>Classic Assessment</p>
            </div>
          </div>
          <div className='group cursor-pointer'>
            <img
              src='https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&auto=format&fit=crop'
              alt='Mystery Challenge - Problem Solving'
              className='object-cover w-full rounded-lg h-60 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-3'>
              <h3 className='text-lg font-semibold text-white'>Mystery Challenge</h3>
              <p className='text-sm text-gray-300'>Problem Solving</p>
            </div>
          </div>
          <div className='group cursor-pointer'>
            <img
              src='https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&auto=format&fit=crop'
              alt='Quick Quiz - Fast Assessment'
              className='object-cover w-full rounded-lg h-60 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-3'>
              <h3 className='text-lg font-semibold text-white'>Quick Quiz</h3>
              <p className='text-sm text-gray-300'>Fast Assessment</p>
            </div>
          </div>
        </div>
        
        {/* Footer content integrated into games section */}
        <div className='mt-20 text-center border-t border-gray-700 pt-12'>
          <p className='text-gray-400'>
            &copy; 2024 myPlace. All rights reserved.
          </p>
        </div>
      </article>
    </motion.section>
  );
};


const Component = forwardRef<HTMLElement>((props, ref) => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <>
      <main ref={container} className='relative h-[200vh] bg-black'>
        <Section1 scrollYProgress={scrollYProgress} />
        <Section2 scrollYProgress={scrollYProgress} />
      </main>
    </>
  );
});

Component.displayName = 'Component';

export default Component;