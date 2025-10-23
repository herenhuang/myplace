'use client';

import { motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import * as d3 from 'd3';
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

    // Define icon data
    interface IconNode extends d3.SimulationNodeDatum {
      id: string;
      icon: string;
      size: number;
      x?: number;
      y?: number;
    }

    const icons: IconNode[] = [
      { id: 'icon1', icon: '/manifesto/s-01.png', size: 40 },
      { id: 'icon2', icon: '/manifesto/s-02.png', size: 35 },
      { id: 'icon3', icon: '/manifesto/s-03.png', size: 50 },
      { id: 'icon4', icon: '/manifesto/s-04.png', size: 45 },
      { id: 'icon5', icon: '/manifesto/s-05.png', size: 40 },
      { id: 'icon6', icon: '/manifesto/s-06.png', size: 55 },
      { id: 'icon7', icon: '/manifesto/s-07.png', size: 42 },
      { id: 'icon8', icon: '/manifesto/s-08.png', size: 38 },
      { id: 'icon9', icon: '/manifesto/s-09.png', size: 48 },
      { id: 'icon10', icon: '/manifesto/s-10.png', size: 44 }
    ];

    // Define links between icons (creating a network)
    interface IconLink extends d3.SimulationLinkDatum<IconNode> {
      source: string | IconNode;
      target: string | IconNode;
    }

    const links: IconLink[] = [
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
    const simulation = d3.forceSimulation(icons)
      .force('link', d3.forceLink<IconNode, IconLink>(links)
        .id(d => d.id)
        .distance(100)
        .strength(0.3))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: d3.SimulationNodeDatum) => {
        const node = d as IconNode;
        return node.size / 2 + 15;
      }))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Define drag behavior
    const drag = d3.drag<SVGImageElement, IconNode>()
      .on('start', function(event, d) {
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
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
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

    // Create icon elements
    const iconElements = svg
      .selectAll('image')
      .data(icons)
      .enter()
      .append('image')
      .attr('href', d => d.icon)
      .attr('width', d => d.size)
      .attr('height', d => d.size)
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
        .attr('x1', d => (d.source as IconNode).x || 0)
        .attr('y1', d => (d.source as IconNode).y || 0)
        .attr('x2', d => (d.target as IconNode).x || 0)
        .attr('y2', d => (d.target as IconNode).y || 0);

      // Update icon positions
      iconElements
        .attr('x', d => (d.x || 0) - d.size / 2)
        .attr('y', d => (d.y || 0) - d.size / 2);
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
      <motion.h1 
        className={styles.heroTitle}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.6
        }}
      >
        Discover yourself through <em>play</em>.
      </motion.h1>
    </motion.section>
  )
}

// Text Content Section Component
function TextContentSection() {
  return (
    <ManifestoSection delay={0.1}>
      <div className={styles.introSection}>
        <p className={styles.paragraph}>
          You're more than just a label.
        </p>
        <p className={styles.paragraph}>
          You're a living, moving, and sometimes oftentimes contradictory story.
        </p>
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

// Timeline Section Component with D3 Force Visualization
function TimelineSection() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 500;
    const height = 400;

    // Clear any existing content
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define nodes and links
    interface Node extends d3.SimulationNodeDatum {
      id: string;
      label: string;
      isCenter?: boolean;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }

    interface Link extends d3.SimulationLinkDatum<Node> {
      source: string | Node;
      target: string | Node;
    }

    const nodes: Node[] = [
      { id: 'center', label: '👤', isCenter: true },
      { id: 'pm', label: 'Product Manager' },
      { id: 'enfj', label: 'ENFJ' },
      { id: 'percent', label: '92%' },
      { id: 'vc', label: 'VC' },
      { id: 'exp', label: '5 Years of Experience' },
      { id: 'uni', label: '[X] University' }
    ];

    const links: Link[] = [
      { source: 'center', target: 'pm' },
      { source: 'center', target: 'enfj' },
      { source: 'center', target: 'percent' },
      { source: 'center', target: 'vc' },
      { source: 'center', target: 'exp' },
      { source: 'center', target: 'uni' }
    ];

    // Create force simulation (collision will be updated after measuring text)
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(140))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create container for links and nodes
    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    // Draw links
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(0,0,0, 0.4)')
      .attr('stroke-width', 2);

    // Define drag behavior
    const drag = d3.drag<SVGGElement, Node>()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this)
          .style('cursor', 'grabbing')
          .select('rect')
          .transition()
          .duration(200)
          .attr('fill', 'rgba(0,0,0, 0.15)');
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(this)
          .style('cursor', 'grab')
          .select('rect')
          .transition()
          .duration(200)
          .attr('fill', d.isCenter ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)');
      });

    // Draw nodes
    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(drag);

    // Add text labels first to measure dimensions
    node
      .append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => d.isCenter ? '20px' : '18px')
      .attr('fill', 'black')
      .attr('font-weight', d => d.isCenter ? '400' : '500')
      .attr('pointer-events', 'none')
      .style('user-select', 'none');

    // Calculate text dimensions and add rectangles
    node.each(function(d) {
      const textElement = d3.select(this).select('text').node() as SVGTextElement;
      if (textElement) {
        const bbox = textElement.getBBox();
        const padding = d.isCenter ? 16 : 12;
        d.width = bbox.width + padding * 2;
        d.height = bbox.height + padding * 2;
        
        // Insert rectangle before text
        d3.select(this)
          .insert('rect', 'text')
          .attr('width', d.width)
          .attr('height', d.height)
          .attr('x', -d.width / 2)
          .attr('y', -d.height / 2)
          .attr('rx', d.isCenter ? 50 : 4)
          .attr('ry', d.isCenter ? 50 : 4)
          .attr('fill', d.isCenter ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)')
          .attr('stroke', d.isCenter ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)')
          .attr('stroke-width', d.isCenter ? 3 : 2);
      }
    });

    // Update collision force now that we have dimensions
    simulation.force('collision', d3.forceCollide().radius((d) => {
      const node = d as Node;
      const maxDimension = Math.max(node.width || 50, node.height || 30);
      return maxDimension / 2 + 10;
    }));

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x || 0)
        .attr('y1', d => (d.source as Node).y || 0)
        .attr('x2', d => (d.target as Node).x || 0)
        .attr('y2', d => (d.target as Node).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Set initial cursor style
    node.style('cursor', 'grab');

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <ManifestoSection delay={0.2}>
      <div className={styles.timeline}>
        <div className={styles.timelineContainer}>
          <motion.div 
            className={styles.timelineTextSection}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p className={styles.paragraph}>
              But we've been taught to describe ourselves in a broken language. Forced to stay within a single lane.
            </p>
            <p className={styles.paragraph}>
              Yet we're far more multi-dimensional than that.
            </p>
          </motion.div>
          
          <motion.div 
            className={styles.timelineCanvasSection}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg ref={svgRef} className={styles.d3Canvas}></svg>
          </motion.div>
        </div>
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
      <TextContentSection />
      <SpeechBubbles />
      <TimelineSection />
      <ConversationSection />
      <PlaySection />
      <PhoneSection />
      <BottomSection />


    </div>
  )
}