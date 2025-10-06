import React, { useState, useEffect } from 'react';
import styles from './games-section.module.scss';
import Link from 'next/link';
import Image from 'next/image';

type ComponentProps = React.HTMLAttributes<HTMLDivElement>;

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [votedCards, setVotedCards] = useState<Set<string>>(new Set());
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
      // Load voted cards from localStorage
      const storedVotedCards = localStorage.getItem('orangeVotedCards');
      if (storedVotedCards) {
        setVotedCards(new Set(JSON.parse(storedVotedCards)));
      }

      // Fetch initial vote counts from the API
      fetch('/.netlify/functions/reactions-get')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }
          return response.json();
        })
        .then(data => {
          // Convert string values to numbers
          const numericVotes: Record<string, number> = {};
          Object.entries(data).forEach(([key, value]) => {
            numericVotes[key] = typeof value === 'string' ? parseInt(value) : value as number;
          });
          setVotes(numericVotes);
        })
        .catch(error => {
          console.error('Error fetching votes (API may not be available in development):', error);
          // Set default votes for development (all start at 0)
          setVotes({
            'card-1': 0,
            'card-2': 0,
            'card-3': 0,
            'card-4': 0,
            'card-5': 0,
            'card-6': 0,
            'card-7': 0
          });
        });

      // Trigger card animations after a short delay
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 300);

      return () => clearTimeout(timer);
    }, []);

    const handleVote = async (cardId: string) => {
      if (loading[cardId] || votedCards.has(cardId)) return;
      
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
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setVotes(prev => ({
              ...prev,
              [cardId]: data.count
            }));
            
            // Mark this card as voted and save to localStorage
            const newVotedCards = new Set(votedCards);
            newVotedCards.add(cardId);
            setVotedCards(newVotedCards);
            localStorage.setItem('orangeVotedCards', JSON.stringify([...newVotedCards]));
          } else {
            throw new Error('Response is not JSON');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error voting (API may not be available in development):', error);
        // Simulate vote increment for development
        setVotes(prev => ({
          ...prev,
          [cardId]: (prev[cardId] || 0) + 1
        }));
        
        // Mark this card as voted and save to localStorage
        const newVotedCards = new Set(votedCards);
        newVotedCards.add(cardId);
        setVotedCards(newVotedCards);
        localStorage.setItem('orangeVotedCards', JSON.stringify([...newVotedCards]));
      } finally {
        setLoading(prev => ({ ...prev, [cardId]: false }));
      }
    };

    const games = [
      {
        id: 'card-1',
        title: 'A First Date',
        href: 'https://yellow-gypsum.netlify.app/story/francis1',
        image: '/landing/sim-thumbnail-work.png',
        gradient: 'from-orange-300 to-red-500',
        clipPath: 'clip-pattern5',
        tags: ['Interactive Fiction', 'Text', 'Personality'],
        isNew: true,
        hidden: true
      },
      {
        id: 'card-2',
        title: 'Music Crisis Sim',
        href: '/remix-simulation/intro',
        image: '/landing/sim-thumbnail-music.png',
        gradient: 'from-orange-300 to-yellow-500',
        clipPath: 'clip-pattern',
        tags: ['Interactive Fiction', 'Text', 'Personality']
      },
      {
        id: 'card-3',
        title: 'Word Association',
        href: '/word-association',
        image: '/landing/sim-thumbnail-word.png',
        gradient: 'from-red-300 to-red-500',
        clipPath: 'clip-pattern1',
        tags: ['Word', 'Quick', 'Personality']
      },
      {
        id: 'card-4',
        title: 'Bill Splitting',
        href: 'https://yellow-gypsum.netlify.app/story/dinner-helen-2',
        image: '/landing/sim-thumbnail-work.png',
        gradient: 'from-green-300 to-green-500',
        clipPath: 'clip-pattern2',
        tags: ['MBTI', 'Text', 'Interactive Fiction'],
        hidden: true
      },
      {
        id: 'card-5',
        title: 'Workplace Crisis',
        href: '/workplace-simulation',
        image: '/landing/sim-thumbnail-work.png',
        gradient: 'from-teal-300 to-green-400',
        clipPath: 'clip-pattern7',
        tags: ['Open Input', 'Text', 'Personality']
      },
      /*
      {
        id: 'card-6',
        title: 'Block Game',
        href: 'https://tryorange.vercel.app/block',
        gradient: 'from-yellow-300 to-yellow-600',
        clipPath: 'clip-pattern8',
        tags: ['Shapes', 'Quick', 'Personality']
      },
      */
      {
        id: 'card-7',
        title: 'Bubble Popper',
        href: '/bubble-popper',
        image: '/landing/sim-thumbnail-bubble.png',
        gradient: 'from-purple-400 to-blue-400',
        clipPath: 'clip-pattern9',
        tags: ['Game', 'Quick', 'Personality'],
        isNew: true
      }
    ];

    return (
    <div ref={ref} className={className} {...props} style={{ width: 'fit-content' }}>
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
          <clipPath id='clip-pattern9' clipPathUnits={'objectBoundingBox'}>
            <path
              d='M0.5 0C0.224 0 0 0.224 0 0.5C0 0.776 0.224 1 0.5 1C0.776 1 1 0.776 1 0.5C1 0.224 0.776 0 0.5 0Z'
              fill='#D9D9D9'
            />
          </clipPath>
        </defs>
      </svg>

      <section className='flex flex-wrap w-full md:w-fit items-center justify-center gap-6 md:gap-3 p-4 max-w-7xl mx-auto'>
        {games.filter(game => !game.hidden).map((game, index) => {
          // Calculate staggered animation delay
          const animationDelays = ['', 'float-up-delay-1', 'float-up-delay-2', 'float-up-delay-3'];
          const animationClass = animationDelays[index % 4] || '';
          
          return (
          <div key={game.id} className={`relative group w-full md:w-fit ${animate ? (animationClass || 'float-up') : 'opacity-0'}`}>
            <a 
              href={game.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block"
            >
              <div 
                className="relative h-85 w-[90vw] md:w-60 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 mx-auto flex flex-row-reverse justify-center items-center md:flex-col"
                
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br z-2 ${game.gradient}`} />
                {/* Image overlay on top of gradient */}


                <Image className={`block md:h-auto md:w-[85%] w-fit h-[85%] -mb-3 mx-auto z-3 hover:scale-105 transition-transform duration-300`} src={game.image} alt={game.title} width={480} height={480} />
              

                {/* Content */}
                <div className="bottom-0 left-0 right-0 p-5 text-white z-5">
               
                  <div className="flex flex-wrap gap-2 mt-3 hidden">
                    {game.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    
                    <h3 className="font-[Instrument_Serif] text-4xl leading-7 tracking-tight font-medium text-shadow-3xl">
                      {game.title}
                    </h3>
                  </div>
                  {/* Small SVG icon */}
                 
                </div>

                <div 
                      className={`absolute top-4 left-4 w-8 h-8 bg-white/90 flex-shrink-0`}
                      style={{ clipPath: `url(#${game.clipPath})` }}
                    />

                {/* Vote Button - top right */}
                <div className="absolute top-4 right-4 z-10 hidden">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote(game.id);
                    }}
                    disabled={loading[game.id] || votedCards.has(game.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md ${
                      votedCards.has(game.id) 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : loading[game.id] 
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white/90 text-gray-800 hover:bg-white cursor-pointer'
                    }`}
                  >
                    {votedCards.has(game.id) ? '✅' : '👍'} {loading[game.id] ? '...' : (votes[game.id] || 0)}
                  </button>
                </div>

                {/* NEW Badge */}
                {game.isNew && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      NEW
                    </span>
                  </div>
                )}
              </div>
            </a>
          </div>
        );
        })}

        <Link href="/all-quizzes" className={`${animate ? 'float-up-delay-3' : 'opacity-0'}`}>
          <div className="relative h-85 w-[90vw] md:w-60 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 flex flex-col justify-center items-center cursor-pointer bg-orange-500/20 hover:bg-orange-500/30">
            <h2 className='font-[Instrument_Serif] text-black text-2xl font-bold'> More Games</h2>
            <span className="material-symbols-outlined text-black text-2xl mt-2">arrow_forward</span>
          </div>
        </Link>

      </section>
    </div>
    );
  }
);

Component.displayName = 'GamesSection';

export default Component;