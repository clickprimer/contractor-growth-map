import Head from 'next/head';
import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [key, setKey] = useState(0);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const handleRestart = () => {
    setShowRestartConfirm(true);
  };

  const handleQuizComplete = (results) => {
    console.log('Quiz completed with results:', results);
    // Handle quiz completion - could redirect or show results
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Profit Leak Detector | ClickPrimer</title>
        <meta name="description" content="Discover where your contracting business is leaving money on the table. Get your personalized Contractor Growth Map in 2 minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Open Graph */}
        <meta property="og:title" content="Profit Leak Detector | ClickPrimer" />
        <meta property="og:description" content="Find hidden revenue in your contracting business" />
        <meta property="og:image" content="https://clickprimer.com/og-image.png" />
        <meta property="og:url" content="https://quiz.clickprimer.com" />
        <meta property="og:type" content="website" />
      </Head>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <img 
              src="https://clickprimer.com/wp-content/uploads/clickprimer-logo-1.png" 
              alt="ClickPrimer" 
              className={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h1 className={styles.logoText} style={{ display: 'none' }}>
              ClickPrimer
            </h1>
            <span className={styles.divider}>|</span>
            <div className={styles.titleBlock}>
              <span className={styles.appTitle}>Profit Leak Detector</span>
              <span className={styles.tagline}>AI-Powered Consultation for Contractors</span>
            </div>
          </div>

          <button 
            className={styles.restartButton}
            onClick={handleRestart}
            title="Restart Assessment"
          >
            <span style={{ fontSize: '16px', marginRight: '4px' }}>↻</span>
            <span>Restart</span>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className={styles.main}>
        <ChatInterface key={key} onQuizComplete={handleQuizComplete} />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.copyright}>© 2025 ClickPrimer</span>
          <span className={styles.footerDivider}>•</span>
          <a href="https://www.clickprimer.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            www.ClickPrimer.com
          </a>
          <span className={styles.footerDivider}>•</span>
          <span className={styles.trusted}>Trusted by Contractors</span>
        </div>
      </footer>

      {/* Confirm Modal (no URL header) */}
      <ConfirmModal
        open={showRestartConfirm}
        title="Restart consultation?"
        message="Do you really want to restart your Profit Leak Detector Consultation?"
        confirmText="Restart"
        cancelText="Cancel"
        onConfirm={() => { setShowRestartConfirm(false); setKey(prev => prev + 1); }}
        onCancel={() => setShowRestartConfirm(false)}
      />

      <style jsx>{`
        :global(html, body, #__next) {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
      `}</style>

    </div>
  );
}