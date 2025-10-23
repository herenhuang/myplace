'use client';

import { motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import * as d3 from 'd3';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './ManifestoV2.module.scss';
import SpeechBubbles from '@/components/manifesto/SpeechBubbles';
import WaitlistForm from '@/components/manifesto/WaitlistForm';

const ManifestoSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  id?: string;
}> = ({ children, delay = 0, id }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay,
      }}
      className={styles.section}
    >
      {children}
    </motion.div>
  );
};

// Combined Timeline + Box Section: Cards absorbed into rotating 3D box
interface TimelineCard {
  id: string;
  label: string;
}

const timelineCards: TimelineCard[] = [
  { id: 'pm', label: 'Product Manager' },
  { id: 'enfj', label: 'ENFJ' },
  { id: 'percent', label: '92%' },
  { id: 'vc', label: 'VC' },
  { id: 'exp', label: '5 Years of Experience' },
  { id: 'uni', label: '[X] University' }
];

function RotatingBox({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetX = scrollProgress * Math.PI * 2;
    const targetY = scrollProgress * Math.PI * 2.5;
    const targetZ = scrollProgress * Math.PI * 1.5;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.1);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.1);
  });

  // Create gradient texture using canvas
  const gradientTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a multi-color gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ff6b6b');    // Red
      gradient.addColorStop(0.25, '#f06595'); // Pink
      gradient.addColorStop(0.5, '#cc5de8');  // Purple
      gradient.addColorStop(0.75, '#339af0'); // Blue
      gradient.addColorStop(1, '#51cf66');    // Green
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        map={gradientTexture}
        metalness={0.3} 
        roughness={0.4}
      />
    </mesh>
  );
}

function BoxScene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, -2, -5]} intensity={0.3} />
      <RotatingBox scrollProgress={scrollProgress} />
    </>
  );
}

function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate progress: 0 when section enters viewport, 1 when it's centered/past
      const sectionCenter = rect.top + rect.height / 2;
      const progress = THREE.MathUtils.clamp(
        1 - (sectionCenter / viewportHeight),
        0,
        1
      );
      
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <ManifestoSection delay={0.2}>
      <div ref={sectionRef} className={styles.timeline}>
        <div className={styles.timelineContainer}>
          {/* Text section at top */}
          <motion.div 
            className={styles.timelineTextSection}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >

            <p className={styles.paragraph}>
              But we've been taught to describe ourselves in a broken language. Forced to stay within a single lane.
            </p>

            <div className={styles.cardsContainer}>
              {timelineCards.map((card, index) => {
                // Calculate how much each card should move based on scroll
                const cardDelay = index * 0.1;
                const cardProgress = THREE.MathUtils.clamp((scrollProgress - cardDelay) * 1.5, 0, 1);
                
                // Move downward toward the box (positive translateY)
                const translateY = cardProgress * 150; // Move 150px downward
                const scale = 1 - cardProgress * 0.85; // Shrink as absorbed
                const fadeOpacity = 1 - cardProgress * 0.95; // Fade out
                
                return (
                  <div
                    key={card.id}
                    className={styles.timelineCard}
                    style={{
                      transform: `translateY(${translateY}px) scale(${scale})`,
                      opacity: fadeOpacity,
                    }}
                  >
                    {card.label}
                  </div>
                );
              })}
            </div>
            
          </motion.div>
          
          <div className={styles.timelineVisualization}>
            {/* Horizontal cards in the middle that move downward into the box */}
            
            <p className={styles.paragraph}>
              Yet we're far more multi-dimensional than that.
            </p>
            
            {/* 3D Box at bottom */}
            <div className={styles.boxContainer}>
              <Canvas 
                shadows
                gl={{ alpha: true, antialias: true }}
                style={{ width: '100%', height: '100%', background: 'transparent' }} 
                camera={{ position: [0, 0, 5], fov: 50 }}
              >
                <BoxScene scrollProgress={scrollProgress} />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </ManifestoSection>
  );
}

// Hero Section Component with D3 Force Simulation
function HeroSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear any existing content
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define node data including title as fixed center node
    interface Node extends d3.SimulationNodeDatum {
      id: string;
      type: 'title' | 'icon';
      icon?: string;
      size?: number;
      text?: string;
      fx?: number;
      fy?: number;
      x?: number;
      y?: number;
    }

    const nodes: Node[] = [
      // Fixed title node at center
      { 
        id: 'title', 
        type: 'title',
        text: 'Discover yourself through play.',
        fx: width / 2, 
        fy: height / 2,
        size: 300  // Large collision radius to keep icons away
      },
      // Icon nodes
      { id: 'icon1', type: 'icon', icon: '/manifesto/s-01.png', size: 40 },
      { id: 'icon2', type: 'icon', icon: '/manifesto/s-02.png', size: 35 },
      { id: 'icon3', type: 'icon', icon: '/manifesto/s-03.png', size: 50 },
      { id: 'icon4', type: 'icon', icon: '/manifesto/s-04.png', size: 45 },
      { id: 'icon5', type: 'icon', icon: '/manifesto/s-05.png', size: 40 },
      { id: 'icon6', type: 'icon', icon: '/manifesto/s-06.png', size: 55 },
      { id: 'icon7', type: 'icon', icon: '/manifesto/s-07.png', size: 42 },
      { id: 'icon8', type: 'icon', icon: '/manifesto/s-08.png', size: 38 },
      { id: 'icon9', type: 'icon', icon: '/manifesto/s-09.png', size: 48 },
      { id: 'icon10', type: 'icon', icon: '/manifesto/s-10.png', size: 44 }
    ];

    // Define links: connect title to each icon, plus icon-icon links
    interface Link extends d3.SimulationLinkDatum<Node> {
      source: string | Node;
      target: string | Node;
    }

    const links: Link[] = [
      // Title → each icon (hub-and-spoke)
      { source: 'title', target: 'icon1' },
      { source: 'title', target: 'icon2' },
      { source: 'title', target: 'icon3' },
      { source: 'title', target: 'icon4' },
      { source: 'title', target: 'icon5' },
      { source: 'title', target: 'icon6' },
      { source: 'title', target: 'icon7' },
      { source: 'title', target: 'icon8' },
      { source: 'title', target: 'icon9' },
      { source: 'title', target: 'icon10' },
      // Icon ring + cross connections
      { source: 'icon1', target: 'icon2' },
      { source: 'icon2', target: 'icon3' },
      { source: 'icon3', target: 'icon4' },
      { source: 'icon4', target: 'icon5' },
      { source: 'icon5', target: 'icon6' },
      { source: 'icon6', target: 'icon7' },
      { source: 'icon7', target: 'icon8' },
      { source: 'icon8', target: 'icon9' },
      { source: 'icon9', target: 'icon10' },
      { source: 'icon10', target: 'icon1' },
      // Add some cross-connections for more interesting structure
      { source: 'icon1', target: 'icon5' },
      { source: 'icon3', target: 'icon7' },
      { source: 'icon2', target: 'icon8' },
      { source: 'icon4', target: 'icon9' },
    ];

    // Create force simulation with link force
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(l => (typeof l.source !== 'string' && l.source.id === 'title') ? 220 : 120)
        .strength(l => (typeof l.source !== 'string' && l.source.id === 'title') ? 0.35 : 0.25))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: d3.SimulationNodeDatum) => {
        const node = d as Node;
        if (node.type === 'title') return node.size! / 2; // participates in collision like a normal node
        return node.size! / 2 + 15;
      }))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Define drag behavior (only for icons)
    const drag = d3.drag<SVGImageElement, Node>()
      .on('start', function(event, d) {
        if (d.type === 'title') return; // Don't allow dragging title
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this)
          .style('cursor', 'grabbing')
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .on('drag', function(event, d) {
        if (d.type === 'title') return;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (d.type === 'title') return;
        if (!event.active) simulation.alphaTarget(0);
        d.fx = undefined;
        d.fy = undefined;
        d3.select(this)
          .style('cursor', 'grab')
          .transition()
          .duration(200)
          .attr('opacity', 0.9);
      });

    // Create link elements first (so they appear behind icons)
    const linkElements = svg
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(147, 197, 253, 0.3)')
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    // Animate links in
    linkElements
      .transition()
      .duration(1000)
      .delay(200)
      .attr('opacity', 1);

    // Create title text element (fixed at center)
    const titleNode = nodes.find(n => n.type === 'title');
    
    // Add gradient for title
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'titleGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'black');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#6f82a2');

    const titleElement = svg
      .append('text')
      .datum(titleNode!)
      .attr('class', 'd3-title')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('x', titleNode!.fx!)
      .attr('y', titleNode!.fy!)
      .attr('opacity', 0)
      .style('font-family', 'var(--font-instrument-serif)')
      .style('font-size', '96px')
      .style('font-weight', '400')
      .style('letter-spacing', '-4px')
      .style('line-height', '1')
      .style('fill', 'url(#titleGradient)')
      .style('pointer-events', 'none')
      .style('white-space', 'nowrap');

    // Single-line title with max-width 1200px: measure and scale down if wider
    const fullTitle = titleNode!.text!;
    titleElement.text(fullTitle);
    const tmpBBox = (titleElement.node() as SVGTextElement).getBBox();
    const maxWidth = 1200;
    if (tmpBBox.width > maxWidth) {
      const scale = maxWidth / tmpBBox.width;
      titleElement
        .attr('transform', `translate(${titleNode!.fx!},${titleNode!.fy!}) scale(${scale}) translate(${-titleNode!.fx!},${-titleNode!.fy!})`);
      // Increase collision radius proportionally so icons keep distance
      titleNode!.size = (titleNode!.size || 300) / scale;
    }

    // Animate title in
    titleElement
      .transition()
      .duration(1200)
      .delay(600)
      .attr('opacity', 1);

    // Create icon elements (filter out title node)
    const iconNodes = nodes.filter(n => n.type === 'icon');
    const iconElements = svg
      .selectAll('image')
      .data(iconNodes)
      .enter()
      .append('image')
      .attr('href', d => d.icon!)
      .attr('width', d => d.size!)
      .attr('height', d => d.size!)
      .attr('opacity', 0)
      .style('cursor', 'grab')
      .call(drag);

    // Animate icons in
    iconElements
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('opacity', 0.9);

    // Update positions on each tick
    simulation.on('tick', () => {
      // Update link positions
      linkElements
        .attr('x1', d => (d.source as Node).x || 0)
        .attr('y1', d => (d.source as Node).y || 0)
        .attr('x2', d => (d.target as Node).x || 0)
        .attr('y2', d => (d.target as Node).y || 0);

      // Update icon positions
      iconElements
        .attr('x', d => (d.x || 0) - d.size! / 2)
        .attr('y', d => (d.y || 0) - d.size! / 2);

      // Title stays fixed, no need to update
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <motion.section 
      className={styles.hero}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={containerRef} className={styles.scatteredIcons}>
        <svg ref={svgRef} className={styles.d3IconCanvas}></svg>
      </div>
    </motion.section>
  )
}

function IntroSection() {
  return (
    <ManifestoSection delay={0.1}>
      <div className={styles.introSection}>
      <p className={styles.paragraph}>
          You're more than just a label.
        </p>
        <p className={styles.paragraph}>
          You're a living, moving, and sometimes oftentimes contradictory story.
        </p>
      </div>
    </ManifestoSection>
  )
}

function SpeechBubblesSection() {
  return (
    <div className={styles.speechBubblesSection}>
      <SpeechBubbles />
    </div>
  )
}

// Text Content Section Component
function GreekSection() {
  return (
    <ManifestoSection delay={0.1}>
      <div className={styles.greekSection}>
        <p className={styles.paragraph}>
          This isn't new. Ancient Greeks carved 'Know thyself' above their temples — even they knew this was the hardest command.
        </p>
        <p className={styles.paragraph}>
          Every generation since has built new mirrors trying to solve it — astrology, Myers-Briggs, Enneagram, whatever's next.
        </p>
      </div>
    </ManifestoSection>
  )
}


// Conversation Section Component
function ConversationSection() {
  const chatMessages = [
    "In the future, every hire is a personality hire.",
    "Every connection starts with character.",
    "Every relationship begins with the real."
  ];

  return (
    <ManifestoSection delay={0.3}>
      <div className={styles.conversation}>
        <p className={styles.paragraph}>
          And now, as AI can mimic our words and even fake our work, the one thing it can't copy is our judgment, our character, the way we move through the world and build trust with others.
        </p>
        
        <div className={styles.stackedBubbles}>
          {chatMessages.map((message, index) => (
            <motion.div
              key={index}
              className={styles.stackedBubble}
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.3
                }
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
            >
              {message}
            </motion.div>
          ))}
        </div>
        
        <p className={styles.paragraph}>
        But how do we capture that? How do we reveal who we really are without forcing ourselves back into boxes? Without right or wrong answers? Without performing?
        </p>
      </div>
    </ManifestoSection>
  )
}

function PlaySection() {
  return (
    <ManifestoSection delay={0.3}>
      <div className={styles.playSection}>
      <p className={styles.paragraph}>
        We were built for play. It's how kids learn, how friends bond, how we reveal ourselves without even trying. 
      </p>
      <Image src="/manifesto/sticker-play.png" alt="Play" width={1000} height={200} />
      <p className={styles.paragraph}>
        When we play, we can't fake it. Our real choices emerge. How we handle pressure, how we build with others, how we move when there's no script.
        </p>
      </div>
    </ManifestoSection>
  )
}

// Phone Section Component
function PhoneSection() {
  return (
    <ManifestoSection delay={0.4}>
      <div className={styles.phoneSection}>


        <p className={styles.paragraph}>
          Every day, a new game. A new chance to discover who you could through the simple building a silly moment of who you really are.
        </p>
        <motion.div 
          className={styles.phoneContainer}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className={styles.chatContainer}>
            <Image 
              src="/iphone-14.png"
              alt="iPhone frame"
              layout="fill"
              className={styles.phoneFrame}
            />
            <div className={styles.chatPhone}>
              <div className={styles.chatHeader}>
                <button className={styles.chatHeaderBack} aria-label="Back">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div className={styles.chatHeaderContact}>
                  <div className={styles.chatHeaderAvatar}>👤</div>
                  <span className={styles.chatHeaderName}>Alex</span>
                </div>
                <button className={styles.chatHeaderVideo} aria-label="Video call">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </button>
              </div>
              <div className={styles.chatWindow}>
                <motion.div 
                  className={styles.chatBubbleNpc}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <p>Oh nice!!!</p>
                </motion.div>
                <motion.div 
                  className={styles.chatBubbleUser}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <p>I did say my shrimp dinner</p>
                </motion.div>
                <motion.div 
                  className={styles.typingIndicator}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </motion.div>
              </div>
              <div className={styles.chatInputWrapper}>
                <div className={styles.chatInput}>
                  <span className={styles.chatInputPlaceholder}>iMessage</span>
                </div>
                <button className={styles.chatSendButton} aria-label="Send message">
                  <svg className={styles.iconSend} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className={styles.phoneLabel}>WHAT WOULD YOU MAKE?</div>
        </motion.div>
     
        <p className={styles.paragraph}>
          We’re more than just a label. 
        </p>
        <p className={styles.paragraph}>
          We're a living, moving and oftentimes contradictory story.
        </p>
        <p className={styles.paragraph}>
          So, what's your story?
        </p>
        
      </div>
    </ManifestoSection>
  )
}

// Bottom Section Component
function BottomSection() {
  return (
    <ManifestoSection delay={0.5}>
      <div className={styles.bottomSection}>

      <WaitlistForm />

        <motion.div 
          className={styles.bottomIcons}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {[
            { src: "/manifesto/s-11.png", delay: 0.1 },
            { src: "/manifesto/s-12.png", delay: 0.15 },
            { src: "/manifesto/s-13.png", delay: 0.2 },
            { src: "/manifesto/s-14.png", delay: 0.25 },
            { src: "/manifesto/s-15.png", delay: 0.3 },
            { src: "/manifesto/s-16.png", delay: 0.35 },
            { src: "/manifesto/s-17.png", delay: 0.4 },
            { src: "/manifesto/s-18.png", delay: 0.45 },
            { src: "/manifesto/s-19.png", delay: 0.5 }
          ].map((icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 360 - 180 }}
              whileInView={{ opacity: 0.8, scale: 1, rotate: 0 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: icon.delay }}
            >
              <Image src={icon.src} alt="Icon" className={styles.bottomIcon} width={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} height={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          className={styles.branding}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Image src="/myplace_text.png" alt="myPlace Logo" width={200} height={200} />
        </motion.div>
      </div>
    </ManifestoSection>
  )
}

// Main ManifestoV2 Component
export default function ManifestoV2() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <IntroSection />
      <GreekSection />
      <SpeechBubblesSection />
      <TimelineSection />
      <ConversationSection />
      <PlaySection />
      <PhoneSection />
      <BottomSection />
    </div>
  )
}