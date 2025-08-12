import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import styles from '../styles/Home.module.css';

export default function Home() {
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
        
        {/* Prevent zooming on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </Head>

      <main className={styles.main}>
        <ChatInterface />
      </main>
    </div>
  );
}