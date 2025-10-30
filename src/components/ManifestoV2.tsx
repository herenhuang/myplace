'use client';

import { motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import * as d3 from 'd3';
// import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './ManifestoV2.module.scss';
// import SpeechBubbles from '@/components/manifesto/SpeechBubbles';
import WaitlistForm from '@/components/manifesto/WaitlistForm';
// import PentagonChart from '@/components/word-association/PentagonChart';
// import useMediaQuery from '@/lib/hooks/useMediaQuery';

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
      viewport={{ once: false, margin: "0px 0px -100px 0px" }}
      transition={{
        duration: 0.5,
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
// interface TimelineCard {
//   id: string;
//   label: string;
// }

// const timelineCards: TimelineCard[] = [
//   { id: 'pm', label: 'Product Manager' },
//   { id: 'enfj', label: 'ENFJ' },
//   { id: 'percent', label: '92%' },
//   { id: 'vc', label: 'VC' },
//   { id: 'exp', label: '5 Years of Experience' },
//   { id: 'uni', label: '[X] University' }
// ];

// function RotatingBox({ scrollProgress }: { scrollProgress: number }) {
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame(() => {
//     if (!meshRef.current) return;
//     const targetX = scrollProgress * Math.PI * 2;
//     const targetY = scrollProgress * Math.PI * 2.5;
//     const targetZ = scrollProgress * Math.PI * 1.5;
//     meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1);
//     meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.1);
//     meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.1);
//   });

//   // Load all 6 square textures
//   const squareTextures = React.useMemo(() => {
//     const loader = new THREE.TextureLoader();
//     const textures = [];
    
//     for (let i = 1; i <= 6; i++) {
//       const texture = loader.load(`/square-${i}.png`);
//       texture.wrapS = THREE.RepeatWrapping;
//       texture.wrapT = THREE.RepeatWrapping;
//       texture.needsUpdate = true;
//       textures.push(texture);
//     }
    
//     return textures;
//   }, []);

//   // Create materials array for each face
//   const materials = React.useMemo(() => {
//     return squareTextures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));
//   }, [squareTextures]);

//   return (
//     <mesh ref={meshRef} castShadow receiveShadow material={materials}>
//       <boxGeometry args={[1.5, 1.5, 1.5]} />
//     </mesh>
//   );
// }

// 3D Card component that flies into the center
// function FlyingCard({ 
//   card, 
//   index, 
//   scrollProgress 
// }: { 
//   card: TimelineCard; 
//   index: number; 
//   scrollProgress: number; 
// }) {
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame(() => {
//     if (!meshRef.current) return;
    
//     // Calculate card-specific progress with delay
//     const cardDelay = index * 0.1;
//     const cardProgress = THREE.MathUtils.clamp((scrollProgress - cardDelay) * 1.5, 0, 1);
    
//     // Starting positions (spread around the scene)
//     const startPositions = [
//       [-8, 3, -5],   // Top left
//       [-4, 4, -5],   // Top center-left
//       [0, 5, -5],    // Top center
//       [4, 4, -5],    // Top center-right
//       [8, 3, -5],    // Top right
//       [-6, 0, -5],   // Middle left
//     ];
    
//     const startPos = startPositions[index % startPositions.length];
//     const targetPos = [0, 0, 0]; // Center of the scene
    
//     // Interpolate position
//     meshRef.current.position.x = THREE.MathUtils.lerp(startPos[0], targetPos[0], cardProgress);
//     meshRef.current.position.y = THREE.MathUtils.lerp(startPos[1], targetPos[1], cardProgress);
//     meshRef.current.position.z = THREE.MathUtils.lerp(startPos[2], targetPos[2], cardProgress);
    
//     // Scale down as it approaches center
//     const scale = 1 - cardProgress * 0.8;
//     meshRef.current.scale.setScalar(scale);
    
//     // Rotate as it flies
//     meshRef.current.rotation.x += 0.01;
//     meshRef.current.rotation.y += 0.01;
//   });

//   return (
//     <mesh ref={meshRef} castShadow receiveShadow>
//       <boxGeometry args={[1.2, 0.3, 0.1]} />
//       <meshStandardMaterial 
//         color="#ffffff" 
//         metalness={0.1} 
//         roughness={0.3}
//         transparent
//         opacity={1 - scrollProgress * 0.9}
//       />
//     </mesh>
//   );
// }

// function BoxScene({ scrollProgress }: { scrollProgress: number }) {
//   return (
//     <>
//       <ambientLight intensity={1.0} />
//       <directionalLight
//         position={[3, 5, 5]}
//         intensity={1.5}
//         castShadow
//         shadow-mapSize-width={1024}
//         shadow-mapSize-height={1024}
//       />
//       <pointLight position={[-5, -2, -5]} intensity={0.8} />
//       <pointLight position={[5, 2, 5]} intensity={0.8} />
      
//       {/* Flying cards */}
//       {timelineCards.map((card, index) => (
//         <FlyingCard 
//           key={card.id}
//           card={card} 
//           index={index} 
//           scrollProgress={scrollProgress} 
//         />
//       ))}
      
//       <RotatingBox scrollProgress={scrollProgress} />
//     </>
//   );
// }

// function TimelineSection() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [scrollProgress, setScrollProgress] = React.useState(0);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
    
//     const handleScroll = () => {
//       if (!sectionRef.current) return;
      
//       const rect = sectionRef.current.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;
      
//       // Calculate progress: 0 when section enters viewport, 1 when it's centered/past
//       const sectionCenter = rect.top + rect.height / 2;
//       const progress = THREE.MathUtils.clamp(
//         1 - (sectionCenter / viewportHeight),
//         0,
//         1
//       );
      
//       setScrollProgress(progress);
//     };

//     handleScroll();
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     window.addEventListener('resize', handleScroll);
    
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       window.removeEventListener('resize', handleScroll);
//     };
//   }, []);

//   return (
//     <ManifestoSection delay={0.2}>
//       <div ref={sectionRef} className={styles.timeline}>
//         <div className={styles.timelineContainer}>
//           {/* Text section at top */}
//           <motion.div 
//             className={styles.timelineTextSection}
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: false }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//           >

//             <p className={styles.paragraph}>
//               But we've been taught to describe ourselves in a broken language. Forced to stay within a single lane.
//             </p>
  
//           </motion.div>
          
//           <div className={styles.timelineVisualization}>
//             {/* 3D Canvas with flying cards and rotating box */}
//             <div className={styles.boxContainer}>
//               <Canvas 
//                 shadows
//                 gl={{ alpha: true, antialias: true }}
//                 style={{ width: '100%', height: '100%', background: 'transparent' }} 
//                 camera={{ position: [0, 0, 5], fov: 50 }}
//               >
//                 <BoxScene scrollProgress={scrollProgress} />
//               </Canvas>
//             </div>
//           </div>

//           <p className={styles.paragraph}>
//               Yet we're far more multi-dimensional than that.
//             </p>
            


//         </div>
//       </div>
//     </ManifestoSection>
//   );
// }

// Hero Section Component with D3 Force Simulation
function HeroSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || typeof window === 'undefined') return;

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
      type: 'title' | 'icon' | 'repulsion';
      icon?: string;
      size?: number;
      text?: string;
      fx?: number;
      fy?: number;
      x?: number;
      y?: number;
    }

    const nodes: Node[] = [
      // Title node at center with strong repulsion
      { 
        id: 'title', 
        type: 'title',
        fx: width * 0.2, 
        fy: height / 2,
        size: 200  // Larger collision radius for stronger repulsion
      },
      // Additional repulsion points to protect text area
      { 
        id: 'repulsionLeft', 
        type: 'repulsion',
        fx: width * 0.4, 
        fy: height / 2,
        size: 200  // Medium repulsion radius
      },
      { 
        id: 'repulsionRight', 
        type: 'repulsion',
        fx: width * 0.5, 
        fy: height / 2,
        size: 200  // Medium repulsion radius
      },
      { 
        id: 'repulsionLeft', 
        type: 'repulsion',
        fx: width * 0.6, 
        fy: height / 2,
        size: 200  // Medium repulsion radius
      },
      { 
        id: 'repulsionRight', 
        type: 'repulsion',
        fx: width * 0.8, 
        fy: height / 2,
        size: 200  // Medium repulsion radius
      },
      // Icon nodes with varied sizes and initial positions
      { id: 'icon1', type: 'icon', icon: '/manifesto/s-01.png', size: 60, x: width * 0.1, y: height * 0.2 },
      { id: 'icon2', type: 'icon', icon: '/manifesto/s-02.png', size: 65, x: width * 0.9, y: height * 0.15 },
      { id: 'icon3', type: 'icon', icon: '/manifesto/s-03.png', size: 60, x: width * 0.15, y: height * 0.8 },
      { id: 'icon4', type: 'icon', icon: '/manifesto/s-04.png', size: 58, x: width * 0.85, y: height * 0.75 },
      { id: 'icon5', type: 'icon', icon: '/manifesto/s-05.png', size: 35, x: width * 0.05, y: height * 0.5 },
      { id: 'icon6', type: 'icon', icon: '/manifesto/s-06.png', size: 72, x: width * 0.95, y: height * 0.45 },
      { id: 'icon7', type: 'icon', icon: '/manifesto/s-07.png', size: 120, x: width * 0.3, y: height * 0.1 },
      { id: 'icon8', type: 'icon', icon: '/manifesto/s-08.png', size: 52, x: width * 0.7, y: height * 0.9 },
      { id: 'icon9', type: 'icon', icon: '/manifesto/s-09.png', size: 80, x: width * 0.25, y: height * 0.9 },
      { id: 'icon10', type: 'icon', icon: '/manifesto/s-10.png', size: 31, x: width * 0.75, y: height * 0.1 },
      { id: 'icon11', type: 'icon', icon: '/manifesto/s-11.png', size: 31, x: width * 0.1, y: height * 0.6 },
      { id: 'icon12', type: 'icon', icon: '/manifesto/s-12.png', size: 35, x: width * 0.9, y: height * 0.6 },
      { id: 'icon13', type: 'icon', icon: '/manifesto/s-13.png', size: 72, x: width * 0.4, y: height * 0.05 },
      { id: 'icon14', type: 'icon', icon: '/manifesto/s-14.png', size: 38, x: width * 0.6, y: height * 0.95 },
      { id: 'icon15', type: 'icon', icon: '/manifesto/s-15.png', size: 52, x: width * 0.35, y: height * 0.7 },
      { id: 'icon16', type: 'icon', icon: '/manifesto/s-16.png', size: 45, x: width * 0.65, y: height * 0.3 },
      { id: 'icon17', type: 'icon', icon: '/manifesto/s-17.png', size: 40, x: width * 0.2, y: height * 0.4 },
      { id: 'icon18', type: 'icon', icon: '/manifesto/s-18.png', size: 45, x: width * 0.8, y: height * 0.4 },
      { id: 'icon19', type: 'icon', icon: '/manifesto/s-19.png', size: 40, x: width * 0.5, y: height * 0.1 }
    ];

    // Define links: connect title to each icon, plus icon-icon links
    interface Link extends d3.SimulationLinkDatum<Node> {
      source: string | Node;
      target: string | Node;
    }

    const links: Link[] = [
      // Title → each icon (hub-and-spoke)
      /*
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
       */
    ];

    // Create force simulation with enhanced title repulsion
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(l => {
          const source = l.source as Node;
          const target = l.target as Node;
          // Title connections have longer distance
          if (source.id === 'title' || target.id === 'title') return 250;
          return 120;
        })
        .strength(l => {
          const source = l.source as Node;
          const target = l.target as Node;
          // Title connections have stronger force
          if (source.id === 'title' || target.id === 'title') return 0.4;
          return 0.25;
        }))
      .force('charge', d3.forceManyBody().strength(d => {
        const node = d as Node;
        // Title has strong negative charge (repulsion)
        if (node.type === 'title') return -800;
        // Repulsion points have medium negative charge
        if (node.type === 'repulsion') return -400;
        return -220;
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: d3.SimulationNodeDatum) => {
        const node = d as Node;
        if (node.type === 'title') return node.size! / 2; // Large collision radius for title
        if (node.type === 'repulsion') return node.size! / 2; // Medium collision radius for repulsion points
        return node.size! / 2 + 15;
      }))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      // Add custom repulsion force from title and repulsion points
      .force('titleRepulsion', () => {
        const repulsionNodes = nodes.filter(n => n.type === 'title' || n.type === 'repulsion');
        
        nodes.forEach(node => {
          if (node.type === 'icon' && node.x !== undefined && node.y !== undefined) {
            repulsionNodes.forEach(repulsionNode => {
              const dx = node.x! - repulsionNode.fx!;
              const dy = node.y! - repulsionNode.fy!;
            const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = repulsionNode.type === 'title' ? 200 : 120; // Different distances for title vs repulsion points
            
            if (distance < minDistance && distance > 0) {
                const force = (minDistance - distance) / minDistance * (repulsionNode.type === 'title' ? 0.3 : 0.2);
              const angle = Math.atan2(dy, dx);
              const fx = Math.cos(angle) * force;
              const fy = Math.sin(angle) * force;
              
              node.vx = (node.vx || 0) + fx;
              node.vy = (node.vy || 0) + fy;
            }
            });
          }
        });
      });

    // Define drag behavior (only for icons)
    const drag = d3.drag<SVGImageElement, Node>()
      .on('start', function(event, d) {
        if (d.type === 'title' || d.type === 'repulsion') return; // Don't allow dragging title or repulsion points
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
        if (d.type === 'title' || d.type === 'repulsion') return;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (d.type === 'title' || d.type === 'repulsion') return;
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
      .attr('stroke', 'rgba(147, 197, 253, 0.1)')
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
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={containerRef} className={styles.scatteredIcons}>
        <svg ref={svgRef} className={styles.d3IconCanvas}>
        </svg>
      </div>
      <h1 className={styles.heroTitle}>Discover yourself through play.</h1>
    </motion.section>
  )
}

// function SpeechBubblesSection() {
//   return (
//     <div className={styles.speechBubblesSection}>
//       <SpeechBubbles />
//     </div>
//   )
// }

// Cloud Section Component
function CloudSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate progress: 0 when section enters viewport, 1 when it's centered/past
      const sectionCenter = rect.top + rect.height;
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
    <ManifestoSection delay={0.1}>
      <div ref={sectionRef} className={styles.cloudSection}>
        
        <motion.div 
          className={styles.cloud1}
          style={{
            transform: `translate(${scrollProgress * 500 + 150}px, ${scrollProgress * 120}px)`,
            opacity: 1 - scrollProgress * 0.3
          }}
        >
          <Image src="/manifesto/cloud-1.png" alt="Cloud 1" width={400} height={200} />
        </motion.div>
        
        <motion.div 
          className={styles.cloud2}
          style={{
            transform: `translate(${scrollProgress * -600 - 400}px, ${scrollProgress * 80}px)`,
            opacity: 1 - scrollProgress * 0.2
          }}
        >
          <Image src="/manifesto/cloud-2.png" alt="Cloud 2" width={400} height={200} />
        </motion.div>
        
        <motion.div 
          className={styles.cloud3}
          style={{
            transform: `translate(${scrollProgress * 750 - 150}px, ${scrollProgress * 80}px)`,
            opacity: 1 - scrollProgress * 0.4
          }}
        >
          <Image src="/manifesto/cloud-3.png" alt="Cloud 3" width={400} height={200} />
        </motion.div>
        
        <motion.div 
          className={styles.cloud4}
          style={{
            transform: `translate(${scrollProgress * -400}px, ${scrollProgress * -40}px)`,
            opacity: 1 - scrollProgress * 0.25
          }}
        >
          <Image src="/manifesto/cloud-4.png" alt="Cloud 4" width={400} height={200} />
        </motion.div>
      </div>
    </ManifestoSection>
  )
}

// Text Content Section Component
function GreekSection() {
  return (
    <ManifestoSection delay={0}>
      <div className={styles.greekSection}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "0px 0px -100px 0px" }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.1,
          }}
          className={styles.section}
        >
          <>
            <div className={styles.greekContent}>
              <h3 className={styles.heading}>
                You're more than just a label.
              </h3>
              <p className={styles.paragraph}>
                You're a <b>living</b>,  <i>moving</i>, and {' '}
                <span className={styles.strikeThrough}>
                  sometimes
                </span> {' '} oftentimes <span className={styles.highlight}>contradictory</span> story.
              </p>
              <p className={styles.paragraph}>
                We as humans have been obsessed with understanding ourselves and others since the beginning of time.
              </p>
              <p className={styles.paragraph}>
                The Ancient Greeks carved 'Know thyself' above their temples, and every generation since has built new mirrors trying to solve it — astrology, Myers-Briggs, Enneagram, whatever's next.
              </p>
            </div>

            <Image src="/manifesto/greece-4.png" className={styles.greekBackground} alt="Greek" width={720} height={500} />
            <Image src="/manifesto/greece-3.png" className={styles.greekForeground} alt="Greek" width={720} height={500} />
            <Image src="/manifesto/greece-2.png" className={styles.greekImage} alt="Greek" width={720} height={500} />
          </>
        </motion.div>
      </div>
    </ManifestoSection>
  )
}

type TMotionBubbleSettings = {
  delay: number;
}
const getConversationMotionBubbleSettings = ({ delay = 0 }: TMotionBubbleSettings) => ({
  initial: { opacity: 0, y: 60, scale: 0.8 },
  whileInView: {
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      delay,
    }
  },
  whileHover: { 
    scale: 1.02,
    y: -2,
    transition: { duration: 0.2 }
  },
  viewport: { once: false, amount: 0.2 }
});
// Conversation Section Component
function ConversationSection() {
  return (
    <ManifestoSection delay={0.3}>
      <div className={styles.conversation}>
        <h3 className={styles.heading}>
          But who are we really?
        </h3>
        <p className={styles.paragraph}>
          We are not what we fill out on a form. We are not what we write in our LinkedIn or Tinder bios.
        </p>
        <p className={styles.paragraph}>
          The systems we have today only capture our answers, and not our actions. Everything is based on what you say, not what you actually do.
        </p>
        <p className={styles.paragraph}>
          And now, as AI can mimic your words and even fake your work, the one thing it can't copy is your <span className={styles.highlight}>character</span>, the way you build trust with others, the way you uniquely <span className={styles.highlight}>move</span> through the world.
        </p>
        
        <div className={styles.stackedBubbles}>
          <div className={styles.stackedBubblesRow}>
            <motion.div
              className={`${styles.stackedBubble} ${styles.bubble1}`}
              {...getConversationMotionBubbleSettings({ delay: 0 })}
            >
              In the future, <i>every</i> hire is a personality hire.
            </motion.div>
            <motion.div
              className={`${styles.stackedBubble} ${styles.fillerBubble1}`}
              {...getConversationMotionBubbleSettings({ delay: 0.1 })}
            >
            </motion.div>
          </div>
          <div className={styles.stackedBubblesRow}>
            <motion.div
              className={`${styles.stackedBubble} ${styles.fillerBubble2}`}
              {...getConversationMotionBubbleSettings({ delay: 0.2 })}
            >
            </motion.div>
            <motion.div
              className={`${styles.stackedBubble} ${styles.bubble2}`}
              {...getConversationMotionBubbleSettings({ delay: 0.3 })}
            >
              Every connection starts with <i> character </i>.
            </motion.div>
          </div>
          <div className={styles.stackedBubblesRow}>
            <motion.div
              className={`${styles.stackedBubble} ${styles.bubble3}`}
              {...getConversationMotionBubbleSettings({ delay: 0.4 })}
            >
              Every relationship begins with the <i>real</i>.
            </motion.div>
            <motion.div
              className={`${styles.stackedBubble} ${styles.fillerBubble3}`}
              {...getConversationMotionBubbleSettings({ delay: 0.5 })}
            >
            </motion.div>
          </div>
          <motion.div
            className={`${styles.stackedBubble} ${styles.fillerBubble4}`}
            {...getConversationMotionBubbleSettings({ delay: 0.6 })}
          >
          </motion.div>
        </div>
        
        <p className={styles.paragraph}>
          But how do we capture that? How do we reveal who we really are without forcing ourselves back into boxes? Without right or wrong answers? Without performing?
        </p>
      </div>
    </ManifestoSection>
  )
}

// Box Section Component - Animated timeline cards moving into center
// function BoxSection() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [scrollProgress, setScrollProgress] = React.useState(0);
//   const isMobile = useMediaQuery('(max-width: 768px)');

//   // Timeline cards data
//   const cards = [
//     { id: 'pm', label: 'Product Manager' },
//     { id: 'enfj', label: 'ENFJ' },
//     { id: 'percent', label: '92%' },
//     { id: 'vc', label: 'VC' },
//     { id: 'exp', label: '5 Years of Experience' },
//     { id: 'uni', label: '[X] University' }
//   ];

//   // Starting positions for cards (horizontal row above the cube)
//   const startPositions = isMobile
//     ? [
//       { x: 50, y: -5 },
//       { x: 50, y: 7 },
//       { x: 50, y: 19 },
//       { x: 50, y: 31 },
//       { x: 50, y: 43 },
//       { x: 50, y: 55 },
//     ] : [
//       { x: 25, y: 5 },    // Left side
//       { x: 36, y: 5 },    // Left-center
//       { x: 44, y: 5 },    // Center-left
//       { x: 51, y: 5 },    // Center-right
//       { x: 63, y: 5 },    // Right-center
//       { x: 78, y: 5 },    // Right side
//     ];

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
    
//     const handleScroll = () => {
//       if (!sectionRef.current) return;
      
//       const rect = sectionRef.current.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;
      
//       // Animation only starts when container reaches top 25% of viewport
//       const animationStartThreshold = viewportHeight * 0;
//       const containerTop = rect.top;
      
//       // Calculate progress: 0 until container hits top 25%, then animate
//       let progress = 0;
//       if (containerTop <= animationStartThreshold) {
//         // Once animation starts, calculate progress based on how far past the threshold
//         const animationDistance = animationStartThreshold - containerTop;
//         const maxAnimationDistance = viewportHeight * 0.8; // Animation completes over next 80% of viewport (slower)
//         progress = Math.min(1, animationDistance / maxAnimationDistance);
//       }
      
//       setScrollProgress(progress);
//     };

//     const handleResize = () => {
//       handleScroll();
//     };

//     // Initial calculation
//     handleScroll();
    
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     window.addEventListener('resize', handleResize);
    
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   return (
//     <ManifestoSection delay={0.2}>
//       <div ref={sectionRef} className={styles.boxSection}>

//         <p className={styles.paragraph}>
//           But we've been taught to describe ourselves in a broken language. Forced to stay within a single lane.
//         </p>
        
//         <div className={styles.animatedTimelineContainer}>
//           {/* Timeline cards that move toward center */}
//           {cards.map((card, index) => {
//             const startPos = startPositions[index];
//             // Direct progress calculation - no delays or multipliers
//             const cardProgress = Math.max(0, Math.min(1, scrollProgress));
            
//             // Target position (cube's actual position)
//             const targetX = 50; // 50% - matches cube's left: 50%
//             const targetY = isMobile ? 90 : 75; // 75% - matches cube's bottom: -50% (which is 75% from top)
            
//             // Direct linear interpolation for immediate response
//             const currentX = startPos.x + (targetX - startPos.x) * cardProgress;
//             const currentY = startPos.y + (targetY - startPos.y) * cardProgress;
            
//             // Scale and opacity - direct calculation
//             const scale = 1 - cardProgress * 0.8;
//             const opacity = Math.max(0, 1 - cardProgress * 0.9);
            
//             return (
//               <div
//                 key={card.id}
//                 className={styles.animatedTimelineCard}
//                 style={{
//                   left: `${currentX}%`,
//                   top: `${currentY}%`,
//                   transform: `translate3d(-50%, -50%, 0) scale(${scale})`,
//                   opacity: opacity,
//                   zIndex: 10 - index,
//                 }}
//               >
//                 <h3>{card.label}</h3>
//               </div>
//             );
//           })}
//           {/* Cube in center */}
//           <div className={styles.cubeContainer}>
//             <Image
//               src="/manifesto/cube.png"
//               className={styles.cube}
//               alt="Multidimensional cube"
//               width={400}
//               height={300}
//             />
//           </div>
//         </div>

//         <p className={styles.paragraph}>
//           Yet we're far more multi-dimensional than that.
//         </p>

//       </div>
//     </ManifestoSection>
//   )
// }

function PlaySection() {
  return (
    <ManifestoSection delay={0.3}>
      <div className={styles.playSection}>
        <h3 className={styles.heading}>
          We believe the answer is in <i>play</i>.
        </h3>
        <p className={styles.paragraph}>
          We were built for play. It's how kids learn, how friends bond, how we reveal ourselves without even trying. 
        </p>
        <p className={styles.paragraph}>
          When we play, we can't fake it. Our real choices emerge. How we handle pressure, how we build with others, how we move when there's no script.
        </p>
        <Image src="/manifesto/sticker-play.png" alt="Play" width={1000} height={200} />
      </div>
    </ManifestoSection>
  )
}

// Phone Section Component
// function PhoneSection() {
//   return (
//     <ManifestoSection delay={0.4}>
//       <div className={styles.phoneSection}>

//         <p className={styles.paragraph}>
//           1) Play - Quick daily stories, different scenarios each time.
//         </p>

// <div className={styles.phoneContent}>

//         <motion.div 
//           className={styles.phoneContainer}
//           initial={{ opacity: 0, scale: 0.8, y: 50 }}
//           whileInView={{ opacity: 1, scale: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.3 }}
//           transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
//         >
//           <div className={styles.chatContainer}>
//             <Image 
//               src="/iphone-14.png"
//               alt="iPhone frame"
//               layout="fill"
//               className={styles.phoneFrame}
//             />
//             <div className={styles.chatPhone}>
//               <div className={styles.chatHeader}>
//                 <button className={styles.chatHeaderBack} aria-label="Back">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <polyline points="15 18 9 12 15 6"></polyline>
//                   </svg>
//                 </button>
//                 <div className={styles.chatHeaderContact}>
//                   <div className={styles.chatHeaderAvatar}>👤</div>
//                   <span className={styles.chatHeaderName}>Alex</span>
//                 </div>
//                 <button className={styles.chatHeaderVideo} aria-label="Video call">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="m22 8-6 4 6 4V8Z" />
//                     <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
//                   </svg>
//                 </button>
//               </div>
//               <div className={styles.chatWindow}>
//                 <motion.div 
//                   className={styles.chatBubbleNpc}
//                   initial={{ opacity: 0, y: 8 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.2, delay: 0.3 }}
//                 >
//                   <p>Oh nice!!!</p>
//                 </motion.div>
//                 <motion.div 
//                   className={styles.chatBubbleUser}
//                   initial={{ opacity: 0, y: 8 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.2, delay: 0.4 }}
//                 >
//                   <p>I did say my shrimp dinner</p>
//                 </motion.div>
//                 <motion.div 
//                   className={styles.typingIndicator}
//                   initial={{ opacity: 0, y: 8 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.2, delay: 0.5 }}
//                 >
//                   <div className={styles.typingDot}></div>
//                   <div className={styles.typingDot}></div>
//                   <div className={styles.typingDot}></div>
//                 </motion.div>
//               </div>
//               <div className={styles.chatInputWrapper}>
//                 <div className={styles.chatInput}>
//                   <span className={styles.chatInputPlaceholder}>iMessage</span>
//                 </div>
//                 <button className={styles.chatSendButton} aria-label="Send message">
//                   <svg className={styles.iconSend} viewBox="0 0 24 24" fill="currentColor">
//                     <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className={styles.phoneLabel}>WHAT WOULD YOU MAKE?</div>
//         </motion.div>

//         {/* Elevate Simulation Phone */}
//         <motion.div 
//           className={styles.phoneContainer}
//           initial={{ opacity: 0, scale: 0.8, y: 50 }}
//           whileInView={{ opacity: 1, scale: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.3 }}
//           transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
//         >
//           <div className={styles.elevateContainer}>
//             <Image 
//               src="/iphone-14.png"
//               alt="iPhone frame"
//               layout="fill"
//               className={styles.phoneFrame}
//             />
//             <div className={styles.elevatePhone}>
//               {/* Background Image */}
//               <div 
//                 className={styles.elevateBackground}
//                 style={{ backgroundImage: 'url(/elevate/orange-2.png)' }}
//               />
              
//               {/* Text Content */}
//               <div className={styles.elevateTextContent}>
//                 <div className={styles.elevateStoryText}>
//                   <p>You hesitantly move toward the crowded networking area, glancing at your conference schedule to find your bearings. As you look up to scan the room for familiar faces, you suddenly trip, dropping your bag and scattering its contents everywhere!</p>
//         </div>
     
//                 <div className={styles.elevateQuestion}>
//                   <h2>What ends up falling out?</h2>
//                 </div>
//               </div>
              
//               {/* Choice Buttons at Bottom */}
//               <div className={styles.elevateChoices}>
//                 <motion.button
//                   className={styles.elevateChoiceButton}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.3, delay: 0.4 }}
//                 >
//                   <span>🤷 I came empty-handed</span>
//                   <span className={styles.elevateArrow}>→</span>
//                 </motion.button>
                
//                 <motion.button
//                   className={styles.elevateChoiceButton}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.3, delay: 0.5 }}
//                 >
//                   <span>💻 My work laptop</span>
//                   <span className={styles.elevateArrow}>→</span>
//                 </motion.button>
                
//                 <motion.button
//                   className={styles.elevateChoiceButton}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: false }}
//                   transition={{ duration: 0.3, delay: 0.6 }}
//                 >
//                   <span>📓 Notebook and some pens</span>
//                   <span className={styles.elevateArrow}>→</span>
//                 </motion.button>
//               </div>
//             </div>
//           </div>
//           <div className={styles.phoneLabel}>WHAT WOULD YOU DO???</div>
//         </motion.div>

//         {/* Bouncer Simulation Phone */}
//         <motion.div 
//           className={styles.phoneContainer}
//           initial={{ opacity: 0, scale: 0.8, y: 50 }}
//           whileInView={{ opacity: 1, scale: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.3 }}
//           transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
//         >
//           <div className={styles.bouncerContainer}>
//             <Image 
//               src="/iphone-14.png"
//               alt="iPhone frame"
//               layout="fill"
//               className={styles.phoneFrame}
//             />
//             <div className={styles.bouncerPhone}>
//               {/* Dark Background with Gradient */}
//               <div className={styles.bouncerBackground} />
              
//               {/* Bouncer Blob Character */}
//               <motion.div 
//                 className={styles.bouncerBlobContainer}
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 whileInView={{ scale: 1, opacity: 1 }}
//                 viewport={{ once: false }}
//                 transition={{ duration: 0.3, delay: 0.4 }}
//               >
//                 <Image 
//                   src="/bouncerblob.png"
//                   alt="Bouncer Blob"
//                   width={120}
//                   height={120}
//                   className={styles.bouncerBlob}
//                 />
//               </motion.div>
              
//               {/* Question Bubble */}
//               <motion.div 
//                 className={styles.bouncerQuestionBubble}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: false }}
//                 transition={{ duration: 0.3, delay: 0.5 }}
//               >
//                 <p>Howdy! You&apos;re on the Luma list... but to get in... I&apos;ma need to ask you some more questions. There are no <i>right</i> answers though, there&apos;s just <i>your</i> answers.</p>
//                 <p className={styles.bouncerQuestion}>Anyhow! The event starts at 5:45 and folks will start being told to leave latest by 8:30. When are you gonna show up? Tell me a bit about why that time works for you.</p>
//               </motion.div>
              
//               {/* Text Input at Bottom */}
//               <motion.div 
//                 className={styles.bouncerInputContainer}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: false }}
//                 transition={{ duration: 0.3, delay: 0.6 }}
//               >
//                 <div className={styles.bouncerInputWrapper}>
//                   <input
//                     type="text"
//                     placeholder="Type your answer..."
//                     disabled
//                     className={styles.bouncerInput}
//                   />
//                   <button
//                     disabled
//                     className={styles.bouncerSubmitButton}
//                   >
//                     <span>→</span>
//                   </button>
//                 </div>
//                 <div className={styles.bouncerProgressIndicator}>
//                   <span className={styles.bouncerProgressDot} />
//                   <span className={styles.bouncerProgressDot} />
//                   <span className={styles.bouncerProgressDot} />
//                   <span className={styles.bouncerProgressDot} />
//                   <span className={styles.bouncerProgressDot} />
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//           <div className={styles.phoneLabel}>ARE YOU REALLY IN? 🎟️</div>
//         </motion.div>
        
//         </div>
     
//       </div>
//     </ManifestoSection>
//   )
// }

function BuildSection() {
  const [selectedTrait, setSelectedTrait] = React.useState(0);
  
  const personalityTraits = [
    { 
      id: 'navigator', 
      name: 'The Navigator', 
      icon: '/manifesto/s-01.png',
      description: 'Guides others through complex decisions',
      color: '#3B82F6',
      tags: ['Leadership', 'Strategy'],
      level: 1,
      date: '11/03/2025',
      collected: true
    },
    { 
      id: 'freethinker', 
      name: 'The Freethinker', 
      icon: '/manifesto/s-02.png',
      description: 'Challenges conventional wisdom',
      color: '#8B5CF6',
      tags: ['Creativity', 'Innovation'],
      level: 1,
      date: '11/03/2025',
      collected: true
    },
    { 
      id: 'visionary', 
      name: 'The Visionary', 
      icon: '/manifesto/s-05.png',
      description: 'Sees possibilities others miss',
      color: '#EF4444',
      tags: ['Innovation', 'Future'],
      level: 1,
      date: '11/03/2025',
      collected: true
    },
    { 
      id: 'stabilizer', 
      name: 'The Stabilizer', 
      icon: '/manifesto/s-06.png',
      description: 'Provides grounding and balance',
      color: '#6B7280',
      tags: ['Balance', 'Support'],
      level: 1,
      date: '11/03/2025',
      collected: true
    },
    // Add more traits to fill the grid
    { 
      id: 'explorer', 
      name: 'The Explorer', 
      icon: '/manifesto/s-07.png',
      description: 'Seeks new experiences',
      color: '#EC4899',
      tags: ['Adventure', 'Curiosity'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'mentor', 
      name: 'The Mentor', 
      icon: '/manifesto/s-08.png',
      description: 'Guides and teaches others',
      color: '#14B8A6',
      tags: ['Teaching', 'Wisdom'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'analyst', 
      name: 'The Analyst', 
      icon: '/manifesto/s-09.png',
      description: 'Examines data and patterns',
      color: '#F97316',
      tags: ['Analysis', 'Logic'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'collaborator', 
      name: 'The Collaborator', 
      icon: '/manifesto/s-10.png',
      description: 'Works well with teams',
      color: '#6366F1',
      tags: ['Teamwork', 'Cooperation'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'realist', 
      name: 'The Realist', 
      icon: '/manifesto/s-12.png',
      description: 'Grounded in practical thinking',
      color: '#64748B',
      tags: ['Practical', 'Grounded'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    /*
    { 
      id: 'diplomat', 
      name: 'The Diplomat', 
      icon: '/manifesto/s-14.png',
      description: 'Resolves conflicts peacefully',
      color: '#059669',
      tags: ['Diplomacy', 'Peace'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'perfectionist', 
      name: 'The Perfectionist', 
      icon: '/manifesto/s-15.png',
      description: 'Strives for excellence',
      color: '#7C3AED',
      tags: ['Excellence', 'Quality'],
      level: 1,
      date: '11/03/2025',
      collected: false
    },
    { 
      id: 'adapter', 
      name: 'The Adapter', 
      icon: '/manifesto/s-16.png',
      description: 'Adjusts to changing situations',
      color: '#0891B2',
      tags: ['Flexibility', 'Adaptation'],
      level: 1,
      date: '11/03/2025',
      collected: false
    }
      */
  ];

  return (
    <ManifestoSection delay={0.4}>
      <div className={styles.buildSection}>
        <h3 className={styles.heading}>
          Here's a bit about how MyPlace works:
        </h3>
        {/* TODO: Style Updates */}
        <p className={styles.listItem}>
          <b>1. Play</b> - Quick daily games, different scenarios each time
        </p>
        <p className={styles.listItem}>
          <b>2. Build</b> - Your profile grows with every choice you make
        </p>
        <p className={styles.listItem}>
          <b>3. Discover</b> - See patterns you never knew existed
        </p>

        <div className={styles.stampbook}>
          {/* Icon Grid */}
          <div className={styles.iconGrid}>
          <h2 className={styles.stampbookTitle}>STAMPBOOK</h2>
            <div className={styles.gridContainer}>
              {personalityTraits.map((trait, index) => (
                <motion.div
                  key={trait.id}
                  className={`${styles.iconCard} ${trait.collected ? styles.collected : styles.uncollected} ${selectedTrait === index ? styles.selected : ''}`}
                  onClick={() => setSelectedTrait(index)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Image 
                    src={trait.icon} 
                    alt={trait.name}
                    width={50}
                    height={50}
                  />
                </motion.div>
              ))}
            </div>
            <h1 className={styles.placeholder}> Hello </h1>
             <h1 className={styles.placeholder}> Hello </h1>
    
          </div>

       

          {/* Magnified Card View */}
          <div className={styles.magnifiedView}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardDate}>{personalityTraits[selectedTrait].date}</span>
                <span className={styles.cardLevel}>LV. {personalityTraits[selectedTrait].level}</span>
              </div>
              
              <div className={styles.cardIconLarge}>
                <Image 
                  src={personalityTraits[selectedTrait].icon} 
                  alt={personalityTraits[selectedTrait].name}
                  width={70}
                  height={70}
                />
              </div>
              
              <h3 className={styles.cardTitleLarge}>{personalityTraits[selectedTrait].name}</h3>
              <p className={styles.cardDescription}>
                {personalityTraits[selectedTrait].description}
              </p>
              
              <div className={styles.cardIdentifier}>
                <span>SIM XX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManifestoSection>
  )
}

// function DiscoverSection() {
//   // Sample user results data
//   const userResults = {
//     personalityScores: [8, 6, 7, 9, 5], // Sample pentagon chart data
//     metascore: 87,
//     archetype: 'The Navigator',
//     summary: 'Based on your responses, you show high levels of creativity and analytical thinking. You tend to approach challenges systematically while maintaining innovative problem-solving strategies.'
//   };

//   return (
//     <ManifestoSection delay={0.4}>
//       <div className={styles.discoverSection}>
//         <p className={styles.paragraph}>
//           3) Discover - See patterns you never knew existed
//         </p>
        
//         <div className={styles.resultsContainer}>
//           {/* Pentagon Chart */}
//           <motion.div 
//             className={`${styles.resultCard} ${styles.pentagonCard}`}
//                   initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
//             whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
//             viewport={{ once: false }}
//             transition={{ duration: 0.4, delay: 0.1 }}
//           >
//             <div className={styles.pentagonContainer}>
//               <PentagonChart 
//                 scores={userResults.personalityScores}
//                 size={260}
//               />
//             </div>
//           </motion.div>

//           {/* Metascore */}
//           <motion.div 
//             className={`${styles.resultCard} ${styles.metascoreCard}`}
//             initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
//             whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
//             viewport={{ once: false }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             {/* SVG Circular Progress Border */}
//             <svg 
//               className={styles.progressRing}
//               width="296" 
//               height="296"
//               style={{ transform: 'rotate(-90deg)' }}
//             >
//               {/* Background circle */}
//               <circle
//                 cx="148"
//                 cy="148"
//                 r={140}
//                 stroke="rgba(229, 231, 235, 1)"
//                 strokeWidth="8"
//                 fill="none"
//               />
//               {/* Progress circle */}
//               <circle
//                 cx="148"
//                 cy="148"
//                 r={140}
//                 stroke="#3B82F6"
//                 strokeWidth="8"
//                 fill="none"
//                 strokeDasharray={2 * Math.PI * 140}
//                 strokeDashoffset={2 * Math.PI * 140 * (1 - userResults.metascore / 100)}
//                 strokeLinecap="round"
//               />
//             </svg>
            
//             <h3 className={styles.resultTitle}>Your Metascore</h3>
//             <div className={styles.metascoreDisplay}>
//               <span className={styles.metascoreNumber}>{userResults.metascore}</span>
//               <span className={styles.metascoreLabel}></span>
//             </div>
//           </motion.div>

//           {/* Insights */}
//           <motion.div 
//             className={`${styles.resultCard} ${styles.insightsCard}`}
//             initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
//             whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
//             viewport={{ once: false }}
//             transition={{ duration: 0.4, delay: 0.3 }}
//           >
//             <h3 className={styles.resultTitle}>Key Insights</h3>
//             <p className={styles.insightSummary}>
//               {userResults.summary}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </ManifestoSection>
//   )
// }

// Bottom Section Component
function BottomSection() {
  return (
    <ManifestoSection delay={0.5}>
      <div className={styles.bottomSection}>
        <p className={styles.paragraph}>
          We’re more than just a label. 
        </p>
        <p className={styles.paragraph}>
          We are all made up of living, breathing stories.
        </p>
        <p className={styles.paragraph}>
          So, what's your story?
        </p>
        
        <WaitlistForm />

        <motion.div 
          className={styles.bottomIcons}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
          transition={{ duration: 0.5 }}
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
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: icon.delay }}
            >
              <Image src={icon.src} alt="Icon" className={styles.bottomIcon} width={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} height={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          className={styles.branding}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image className={styles.brandName} src="/myplace_text.png" alt="myPlace Logo" width={200} height={200} />
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
      <GreekSection />
      {/* <TimelineSection /> */}
      {/* <BoxSection /> */}
      <ConversationSection />
      <PlaySection />
      <BuildSection />
      <CloudSection />
      {/* <PhoneSection /> */}
      {/* <DiscoverSection /> */}
      <BottomSection />
    </div>
  )
}
