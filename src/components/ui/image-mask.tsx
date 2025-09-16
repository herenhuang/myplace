import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const wiggleStyle = `
  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    15% { transform: rotate(5deg); }
    30% { transform: rotate(-5deg); }
    45% { transform: rotate(3deg); }
    60% { transform: rotate(-3deg); }
    75% { transform: rotate(1deg); }
    100% { transform: rotate(0deg); }
  }
  .wiggle:hover {
    animation: wiggle 0.4s ease-out;
  }
`;

type ComponentProps = React.HTMLAttributes<HTMLDivElement>;

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
      // Fetch initial vote counts from the API
      fetch('/.netlify/functions/reactions-get')
        .then(response => response.json())
        .then(data => {
          // Convert string values to numbers
          const numericVotes: Record<string, number> = {};
          Object.entries(data).forEach(([key, value]) => {
            numericVotes[key] = typeof value === 'string' ? parseInt(value) : value as number;
          });
          setVotes(numericVotes);
        })
        .catch(error => {
          console.error('Error fetching votes:', error);
        });
    }, []);

    const handleVote = async (cardId: string) => {
      if (loading[cardId]) return;
      
      setLoading(prev => ({ ...prev, [cardId]: true }));
      
      try {
        const response = await fetch('/.netlify/functions/reactions-vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cardId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setVotes(prev => ({
            ...prev,
            [cardId]: data.count
          }));
        } else {
          console.error('Failed to vote');
        }
      } catch (error) {
        console.error('Error voting:', error);
      } finally {
        setLoading(prev => ({ ...prev, [cardId]: false }));
      }
    };

    return (
    <div ref={ref} className={className} {...props}>
      <style>{wiggleStyle}</style>
      <svg className='clipppy absolute -top-[999px] -left-[999px] w-0 h-0'>
        <defs>
          <clipPath id='clip-pattern' clipPathUnits={'objectBoundingBox'}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M0.71161 0H0V1H0.0362048C0.236734 1 0.42296 0.940031 0.577199 0.837408H0.74407V0.718826H0.888889V0.5H1V0.0562347V0H0.71161Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern1' clipPathUnits={'objectBoundingBox'}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M0.00124689 0H1V0.665217V0.88913V0.890217C1 0.950849 0.943617 1 0.874065 1C0.804513 1 0.74813 0.950849 0.74813 0.890217V0.890761C0.74813 0.951092 0.692026 1 0.622818 1C0.559929 1 0.50786 0.959615 0.498877 0.906971C0.490714 0.959506 0.439061 1 0.376559 1C0.311952 1 0.258938 0.956733 0.253565 0.901625C0.246444 0.956975 0.192577 1 0.127182 1C0.0569414 1 0 0.950362 0 0.88913V0.666304C0 0.661014 0.00042501 0.655811 0.00124689 0.650718V0Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern2' clipPathUnits={'objectBoundingBox'}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M0.827825 0.233206C0.928457 0.262983 1 0.338976 1 0.428023V0.964491C1 0.984102 0.979649 1 0.954545 1H0.0454546C0.0203507 1 0 0.984102 0 0.964491V0.428023C0 0.338976 0.0715426 0.262983 0.172175 0.233206C0.187663 0.102409 0.328522 0 0.5 0C0.671478 0 0.812337 0.102409 0.827825 0.233206Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern3' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M1 1H0.293592V0.868235H0V0.412941C0.0268256 0.241176 0.256754 0.0822454 0.500745 0C0.788326 0.098025 0.962742 0.26 0.99851 0.409412L1 1Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern4' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M0.997417 0.541807C1.02854 0.316235 0.773628 -0.00919936 0.492039 0.000199072C0.249199 0.00830422 0 0.217547 0 0.539457C0.0251948 0.836695 0.248984 1 0.492039 1C0.745469 1 0.982596 0.83787 0.997417 0.541807Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern5' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M0.00886287 0.313679C0.0269396 0.216981 0.172073 0 0.502947 0C0.798211 0 0.962906 0.196934 0.992581 0.318396C1.02374 0.511792 0.937683 0.525943 0.921363 0.625C0.921363 0.716981 1 0.746462 1 0.833726C0.988294 0.89801 0.974952 0.93728 0.949553 1H0.0504066C0.0237622 0.936348 0.00886178 0.908019 0.00292682 0.834906C-0.0104279 0.748821 0.0726626 0.735849 0.0771149 0.625C0.0696933 0.525943 -0.0297155 0.520047 0.00886287 0.313679Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern6' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M0 1H0.152466C0.185351 0.960002 0.327354 0.884713 0.505232 0.884713C0.683109 0.884713 0.818635 0.968237 0.849028 1H1V0.347104C0.985052 0.222406 0.838565 0.00477544 0.497758 6.98837e-05C0.156951 -0.00463567 0.0239163 0.229466 0 0.347104V1Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern7' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M0 0.578143V0H0.298507C0.725373 0.027027 0.958209 0.27027 1 0.518214V1H0.147761V0.694477H0.061194V0.578143H0Z'
              fill='#D9D9D9'
            />
          </clipPath>
          <clipPath id='clip-pattern8' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M1 1H0V0.365648C0.0111437 0.322987 0.0446555 0.306894 0.110945 0.298564C0 0.231481 0.0794603 0.107906 0.22039 0.166751C0.157421 0.0690679 0.296852 -0.0156706 0.398801 0.0855445C0.407796 -0.0215584 0.578711 -0.0356796 0.604198 0.0867166C0.673163 -0.00154936 0.836582 0.0502345 0.782609 0.163217C0.890555 0.113787 1.01499 0.220886 0.887556 0.302092C0.957241 0.303259 0.983419 0.319478 1 0.365648V1Z'
              fill='#D9D9D9'
            />
          </clipPath>
        </defs>
      </svg>

      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 p-6 w-full'>
        <div className='w-75 mx-auto transform rotate-2'>
          <div className='wiggle'>
            <a href="https://work-sim.netlify.app/remix-simulation/intro" target="_blank" rel="noopener noreferrer" className="block group">
              <figure style={{ clipPath: 'url(#clip-pattern)' }}>
                <div className='transition-all duration-300 aspect-[3/4] min-h-full align-bottom bg-gradient-to-br from-blue-400 to-blue-600 group-hover:scale-110 w-full cursor-pointer' />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Music Crisis Sim</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Interactive Fiction</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Text</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Personality</span>
                </div>
              </div>
            </a>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              onClick={() => handleVote('card-1')}
              disabled={loading['card-1']}
              className='w-fit py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed border border-gray-200 text-base text-gray-700 transition-colors cursor-pointer'
            >
              👍 {loading['card-1'] ? '...' : (votes['card-1'] || 0)}
            </button>
          </div>
        </div>
        <div className='w-75 mx-auto transform -rotate-1'>
          <div className='wiggle'>
            <a href="https://tryorange.vercel.app/word" target="_blank" rel="noopener noreferrer" className="block group">
              <figure style={{ clipPath: 'url(#clip-pattern1)' }}>
                <div className='transition-all duration-300 aspect-[3/4] min-h-full align-bottom bg-gradient-to-br from-purple-400 to-purple-600 group-hover:scale-110 w-full cursor-pointer' />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Word Association</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Word</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Quick</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Personality</span>
                </div>
              </div>
            </a>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              onClick={() => handleVote('card-2')}
              disabled={loading['card-2']}
              className='w-fit py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed border border-gray-200 text-base text-gray-700 transition-colors cursor-pointer'
            >
              👍 {loading['card-2'] ? '...' : (votes['card-2'] || 0)}
            </button>
          </div>
        </div>
        <div className='w-75 mx-auto transform rotate-1'>
          <div className='wiggle'>
            <a href="https://yellow-gypsum.netlify.app/story/dinner-helen-2" target="_blank" rel="noopener noreferrer" className="block group">
              <figure style={{ clipPath: 'url(#clip-pattern2)' }}>
                <div className='transition-all duration-300 aspect-[3/4] min-h-full align-bottom bg-gradient-to-br from-green-400 to-green-600 group-hover:scale-110 w-full cursor-pointer' />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Bill Splitting</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>MBTI</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Text</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Interactive Fiction</span>
                </div>
              </div>
            </a>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              onClick={() => handleVote('card-3')}
              disabled={loading['card-3']}
              className='w-fit py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed border border-gray-200 text-base text-gray-700 transition-colors cursor-pointer'
            >
              👍 {loading['card-3'] ? '...' : (votes['card-3'] || 0)}
            </button>
          </div>
        </div>
        <div className='w-75 mx-auto transform -rotate-2'>
          <div className='wiggle'>
            <a href="https://work-sim.netlify.app/workplace-simulation" target="_blank" rel="noopener noreferrer" className="block group">
              <figure style={{ clipPath: 'url(#clip-pattern7)' }}>
                <div className='transition-all duration-300 aspect-[3/4] min-h-full align-bottom bg-gradient-to-br from-red-400 to-red-600 group-hover:scale-110 w-full cursor-pointer' />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Workplace Crisis</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Open Input</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Text</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Personality</span>
                </div>
              </div>
            </a>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              onClick={() => handleVote('card-4')}
              disabled={loading['card-4']}
              className='w-fit py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed border border-gray-200 text-base text-gray-700 transition-colors cursor-pointer'
            >
              👍 {loading['card-4'] ? '...' : (votes['card-4'] || 0)}
            </button>
          </div>
        </div>
        <div className='w-75 mx-auto transform rotate-3'>
          <div className='wiggle'>
            <a href="https://tryorange.vercel.app/block" target="_blank" rel="noopener noreferrer" className="block group">
              <figure style={{ clipPath: 'url(#clip-pattern8)' }}>
                <div className='transition-all duration-300 aspect-[3/4] min-h-full align-bottom bg-gradient-to-br from-yellow-400 to-yellow-600 group-hover:scale-110 w-full cursor-pointer' />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Block Game</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Shapes</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Quick</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Personality</span>
                </div>
              </div>
            </a>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              onClick={() => handleVote('card-5')}
              disabled={loading['card-5']}
              className='w-fit py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed border border-gray-200 text-base text-gray-700 transition-colors cursor-pointer'
            >
              👍 {loading['card-5'] ? '...' : (votes['card-5'] || 0)}
            </button>
          </div>
        </div>
        <div className='w-75 mx-auto transform -rotate-1'>
          <div className='wiggle'>
            <div className="block group cursor-pointer">
              <figure>
                <Image 
                  src='/comingsoon.svg' 
                  alt='Coming Soon' 
                  width={300}
                  height={400}
                  className='transition-all duration-300 aspect-[3/4] w-full group-hover:scale-110 object-contain'
                />
              </figure>
              <div className='bg-gray-50 border border-gray-200 p-4 w-full mt-6 min-h-32'>
                <h3 className='font-semibold text-gray-900 text-lg mb-3'>Coming Soon</h3>
                <div className='flex flex-wrap gap-1 text-sm text-gray-600'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>More</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Games</span>
                  <span className='bg-gray-100 px-2 py-1 rounded'>Soon</span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-end mt-3'>
            <button 
              disabled
              className='w-fit py-2 px-3 bg-gray-50 border border-gray-200 text-base text-gray-400 cursor-not-allowed'
            >
              👍 Coming Soon
            </button>
          </div>
        </div>
      </section>
    </div>
    );
  }
);

Component.displayName = 'ImageMask';

export default Component;