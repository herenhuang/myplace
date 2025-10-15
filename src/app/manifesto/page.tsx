'use client';

import { useScroll, useTransform, motion } from 'motion/react';
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.scss';

const ManifestoSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, -50]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={styles.section}
    >
      {children}
    </motion.div>
  );
};

export default function ManifestoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Header with Logo */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className={styles.header}
      >
        <Link href="/" className={styles.logoLink}>
          <Image 
            src='/MyPlace2.png' 
            alt='MyPlace Logo' 
            width={500}
            height={300}
            className={styles.logo}
          />
        </Link>
      </motion.header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.heroContent}
        >
          <h1 className={styles.title}>Manifesto</h1>
          <div className={styles.heroDecoration}></div>
        </motion.div>
      </section>

      {/* Manifesto Content */}
      <main className={styles.main}>
        <ManifestoSection>
          <p className={styles.paragraph}>
            We were built for 🎲 play. It&apos;s how kids learn, how friends bond, 
            how we reveal ourselves without even trying.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Somewhere along the way, many of us were told to grow up: 
            fill out forms, take tests, polish résumés 📝.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            But that doesn&apos;t capture who we are. Interviews, personality tests, 
            even social media reflect what we say, not how we act. None of them hold 
            the living record of how we actually show up: in the small choices, 
            under real pressure, over ⏳ time.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Now that AI can mimic our words and even fake our work, the one thing 
            it can&apos;t copy is our judgment, our character, the way we move through 
            the world. That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with 
            each other, and with the tools we rely on.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraphHighlight}>
            A living record of our human edge.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            If any of that resonates, there&apos;s a place for you here.
          </p>
        </ManifestoSection>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={styles.ctaSection}
        >
          <Link href="/" className={styles.ctaButton}>
            Explore Quizzes
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <a 
            href="https://tally.so/r/mR91yP" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.contactLink}
          >
            Contact
          </a>
          
          <div className={styles.footerLogo}>
            <Link href="/">
              <Image 
                src='/MyplaceWhite.png' 
                alt='MyPlace Logo' 
                width={500}
                height={300}
                className={styles.footerLogoImage}
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

