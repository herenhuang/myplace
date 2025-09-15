// hero-scroll-animation.tsx
'use client';

import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import React, { useRef, forwardRef, useState } from 'react';
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

      <h1 className='2xl:text-7xl text-6xl px-8 font-semibold text-center tracking-tight leading-[120%]'>
        Personality quizzes you can play <br /> 👇👇👇
      </h1>
    </motion.section>
  );
};

const Section2: React.FC<SectionProps> = ({ scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  
  const [likes, setLikes] = useState<{[key: string]: boolean}>({});

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
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {/* Game 1: Copyright Crisis */}
          <div className='group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
            <img
              src='https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&auto=format&fit=crop'
              alt='Copyright Crisis'
              className='object-cover w-full rounded-lg h-48 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-4'>
              <h3 className='text-xl font-bold text-white mb-2'>Copyright Crisis</h3>
              <p className='text-gray-300 mb-4'>How will you handle yourself when your remix goes viral?</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                <span className='bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm'>Interactive Fiction</span>
                <span className='bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm'>Text</span>
                <span className='bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm'>Archetypes</span>
              </div>
              <button
                onClick={() => setLikes(prev => ({...prev, copyright: !prev.copyright}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  likes.copyright 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                👍 {likes.copyright ? 'Liked!' : 'Like'}
              </button>
            </div>
          </div>

          {/* Game 2: Digital Detox */}
          <div className='group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
            <img
              src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop'
              alt='Digital Detox'
              className='object-cover w-full rounded-lg h-48 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-4'>
              <h3 className='text-xl font-bold text-white mb-2'>Digital Detox</h3>
              <p className='text-gray-300 mb-4'>Can you survive a week without your smartphone?</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                <span className='bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm'>Life Simulation</span>
                <span className='bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm'>Habits</span>
                <span className='bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm'>Mindfulness</span>
              </div>
              <button
                onClick={() => setLikes(prev => ({...prev, detox: !prev.detox}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  likes.detox 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                👍 {likes.detox ? 'Liked!' : 'Like'}
              </button>
            </div>
          </div>

          {/* Game 3: Time Traveler's Dilemma */}
          <div className='group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
            <img
              src='https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&auto=format&fit=crop'
              alt='Time Traveler Dilemma'
              className='object-cover w-full rounded-lg h-48 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-4'>
              <h3 className='text-xl font-bold text-white mb-2'>Time Traveler's Dilemma</h3>
              <p className='text-gray-300 mb-4'>What would you change if you could go back in time?</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                <span className='bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm'>Choice-Based</span>
                <span className='bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm'>Ethics</span>
                <span className='bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm'>Philosophy</span>
              </div>
              <button
                onClick={() => setLikes(prev => ({...prev, time: !prev.time}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  likes.time 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                👍 {likes.time ? 'Liked!' : 'Like'}
              </button>
            </div>
          </div>

          {/* Game 4: Social Media Mayor */}
          <div className='group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
            <img
              src='https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&auto=format&fit=crop'
              alt='Social Media Mayor'
              className='object-cover w-full rounded-lg h-48 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-4'>
              <h3 className='text-xl font-bold text-white mb-2'>Social Media Mayor</h3>
              <p className='text-gray-300 mb-4'>Run a city through tweets, posts, and viral campaigns.</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                <span className='bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm'>Strategy</span>
                <span className='bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm'>Leadership</span>
                <span className='bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-sm'>Communication</span>
              </div>
              <button
                onClick={() => setLikes(prev => ({...prev, mayor: !prev.mayor}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  likes.mayor 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                👍 {likes.mayor ? 'Liked!' : 'Like'}
              </button>
            </div>
          </div>

          {/* Game 5: AI Best Friend */}
          <div className='group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 lg:col-span-2 max-w-lg mx-auto'>
            <img
              src='https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop'
              alt='AI Best Friend'
              className='object-cover w-full rounded-lg h-48 group-hover:scale-105 transition-transform duration-300'
            />
            <div className='mt-4'>
              <h3 className='text-xl font-bold text-white mb-2'>AI Best Friend</h3>
              <p className='text-gray-300 mb-4'>Your AI companion gets too attached. How do you handle the relationship?</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                <span className='bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-sm'>Relationships</span>
                <span className='bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm'>Technology</span>
                <span className='bg-slate-500/20 text-slate-300 px-3 py-1 rounded-full text-sm'>Empathy</span>
              </div>
              <button
                onClick={() => setLikes(prev => ({...prev, ai: !prev.ai}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  likes.ai 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                👍 {likes.ai ? 'Liked!' : 'Like'}
              </button>
            </div>
          </div>
        </div>
        
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