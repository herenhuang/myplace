// hero-scroll-animation.tsx
'use client';

import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import React, { useRef, forwardRef } from 'react';
import Image from 'next/image';
import ImageMask from '@/components/ui/image-mask';

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
      
      {/* Logo in top-left corner */}
      <div className='absolute top-6 left-6 z-10'>
        <Image 
          src='/MyPlace2.png' 
          alt='MyPlace Logo' 
          width={500}
          height={300}
          className='w-40 h-auto object-contain'
        />
      </div>

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
      className='relative min-h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white '
    >
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>
      <article className='container mx-auto relative z-10 pb-20'>
        <h1 className='text-6xl leading-[100%] pt-20 pb-10 font-semibold tracking-tight '>
          Play games, discover your traits <br /> and show them off
        </h1>
        
        {/* Image Mask Section */}
        <div className='mt-20'>
          <ImageMask />
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


const Component = forwardRef<HTMLElement>((_props, _ref) => {
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