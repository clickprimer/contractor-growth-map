import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Handle iOS viewport height without breaking desktop layout
    if (typeof window !== 'undefined') {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
      
      // Only prevent body scroll on mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        document.body.style.touchAction = 'none';
        document.body.style.overscrollBehavior = 'none';
      }
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
        if (isMobile) {
          document.body.style.touchAction = 'auto';
          document.body.style.overscrollBehavior = 'auto';
        }
      };
    }
  }, []);
  
  return <Component {...pageProps} />;
}

export default MyApp;