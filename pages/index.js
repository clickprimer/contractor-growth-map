import Head from 'next/head';
import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { RotateCcw } from 'lucide-react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [key, setKey] = useState(0);

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart the assessment?')) {
      setKey(prev => prev + 1);
    }
  };

  const handleQuizComplete = (answers) => {
    console.log('Quiz completed with answers:', answers);
    // Handle quiz completion - could redirect or show results
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Profit Leak Detector | ClickPrimer</title>
        <meta name="description" content="Discover where your contracting business is leaving money on the table. Get your personalized Contractor Growth Map in 2 minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        
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
              src="/clickprimer-logo.png" 
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
            <span className={styles.appTitle}>Profit Leak Detector</span>
          </div>
          <button 
            className={styles.restartButton}
            onClick={handleRestart}
            title="Restart Assessment"
          >
            <RotateCcw size={18} />
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
          <span className={styles.copyright}>© 2024 ClickPrimer</span>
          <span className={styles.footerDivider}>•</span>
          <span className={styles.trusted}>Trusted by 500+ Contractors</span>
        </div>
      </footer>

      <style jsx>{`
        :global(body) {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100vh;
        }
      `}</style>
    </div>
  );
}