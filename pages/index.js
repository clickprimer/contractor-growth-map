import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { resetQuiz } from '../utils/ask';

export default function Home() {
  const [key, setKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetQuiz();
      setKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to reset consultation:', error);
      setKey(prev => prev + 1);
    } finally {
      setTimeout(() => setIsResetting(false), 500);
    }
  };

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-branding">
              <div className="logo-container">
                <img 
                  src="https://clickprimer.com/wp-content/uploads/clickprimer-logo-1.png" 
                  alt="ClickPrimer" 
                  className="brand-logo"
                />
              </div>
              <div className="header-text">
                <h1 className="app-title">
                  <span className="main-title">Profit Leak Detector</span>
                  <span className="subtitle">AI-Powered Consultation for Contractors</span>
                </h1>
                <div className="trust-indicators">
                  <div className="trust-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                    <span>Secure & Confidential</span>
                  </div>
                  <div className="trust-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>5 Minutes</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className={`reset-button ${isResetting ? 'resetting' : ''}`}
              onClick={handleReset}
              disabled={isResetting}
              title="Start new consultation"
            >
              <div className="reset-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </div>
              <span className="reset-text">
                {isResetting ? 'Restarting...' : 'Start Over'}
              </span>
            </button>
          </div>
          
          {/* Animated background elements */}
          <div className="header-bg-elements">
            <div className="bg-shape bg-shape-1"></div>
            <div className="bg-shape bg-shape-2"></div>
            <div className="bg-shape bg-shape-3"></div>
          </div>
        </header>

        <main className="main-content">
          <ChatInterface key={key} />
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <img 
                  src="https://clickprimer.com/wp-content/uploads/clickprimer-logo-1.png" 
                  alt="ClickPrimer" 
                  className="footer-brand-logo"
                />
              </div>
              <div className="footer-text">
                <span className="copyright">© 2024 ClickPrimer</span>
                <span className="tagline">Lead Systems That Actually Work</span>
              </div>
            </div>
            <div className="footer-trust">
              <div className="professional-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"/>
                </svg>
                <span>Trusted by 1000+ Contractors</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Open+Sans:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          font-family: 'Open Sans', sans-serif;
          background: linear-gradient(135deg, #0068ff 0%, #2ea3f2 100%);
          color: #002654;
          overflow-x: hidden;
        }

        #__next {
          height: 100%;
        }

        .app-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Header Styles */
        .app-header {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid #e8eeff;
          padding: 1.25rem 0;
          position: sticky;
          top: 0;
          z-index: 200;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 38, 84, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .header-branding {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .logo-container {
          flex-shrink: 0;
        }

        .brand-logo {
          height: 50px;
          width: auto;
          filter: drop-shadow(0 2px 8px rgba(0, 38, 84, 0.1));
        }

        .header-text {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .app-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .main-title {
          font-family: 'Roboto', sans-serif;
          font-size: 1.875rem;
          font-weight: 900;
          color: #002654;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }

        .subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: #0068ff;
          letter-spacing: 0.025em;
        }

        .trust-indicators {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #30d64f;
          font-size: 0.875rem;
          font-weight: 600;
          background: rgba(48, 214, 79, 0.1);
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(48, 214, 79, 0.2);
        }

        .trust-badge svg {
          width: 16px;
          height: 16px;
          stroke-width: 2.5;
        }

        .reset-button {
          background: white;
          border: 2px solid #0068ff;
          color: #0068ff;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 104, 255, 0.1);
        }

        .reset-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 104, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .reset-button:hover::before {
          left: 100%;
        }

        .reset-button:hover {
          background: #0068ff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 104, 255, 0.25);
        }

        .reset-button:active {
          transform: translateY(-1px);
        }

        .reset-button.resetting {
          background: linear-gradient(135deg, #30d64f, #0068ff);
          color: white;
          border-color: transparent;
        }

        .reset-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .reset-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reset-button.resetting .reset-icon {
          animation: spin 1s linear infinite;
        }

        .reset-icon svg {
          width: 100%;
          height: 100%;
          stroke-width: 2.5;
        }

        .reset-text {
          position: relative;
          z-index: 1;
        }

        /* Header Background Elements */
        .header-bg-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 104, 255, 0.05), rgba(46, 163, 242, 0.05));
          animation: float 8s ease-in-out infinite;
        }

        .bg-shape-1 {
          width: 120px;
          height: 120px;
          top: -60px;
          right: 8%;
          animation-delay: 0s;
        }

        .bg-shape-2 {
          width: 80px;
          height: 80px;
          top: 60%;
          right: 3%;
          animation-delay: -3s;
        }

        .bg-shape-3 {
          width: 60px;
          height: 60px;
          top: 10%;
          left: 3%;
          animation-delay: -6s;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* Footer */
        .app-footer {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-top: 2px solid #e8eeff;
          padding: 1.25rem;
          position: relative;
          z-index: 100;
          box-shadow: 0 -4px 20px rgba(0, 38, 84, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-brand-logo {
          height: 32px;
          width: auto;
          opacity: 0.8;
        }

        .footer-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .copyright {
          color: #002654;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .tagline {
          color: #2ea3f2;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.025em;
        }

        .footer-trust {
          display: flex;
          align-items: center;
        }

        .professional-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #002654;
          font-size: 0.875rem;
          font-weight: 600;
          background: rgba(232, 204, 0, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(232, 204, 0, 0.3);
        }

        .professional-badge svg {
          width: 16px;
          height: 16px;
          stroke-width: 2;
          color: #e8cc00;
          fill: #e8cc00;
        }

        /* Animations */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
            opacity: 0.6;
          }
        }

        /* Mobile Optimizations */
        @media (max-width: 968px) {
          .header-branding {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
          }

          .trust-indicators {
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 1rem 0;
          }
          
          .header-content {
            padding: 0 1rem;
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .header-branding {
            text-align: center;
            align-items: center;
          }
          
          .main-title {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .reset-button {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
            align-self: center;
            min-width: 160px;
            justify-content: center;
          }
          
          .footer-content {
            padding: 0 1rem;
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .trust-indicators {
            justify-content: center;
            flex-wrap: wrap;
          }

          .bg-shape-1,
          .bg-shape-2,
          .bg-shape-3 {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 0 0.75rem;
          }

          .brand-logo {
            height: 40px;
          }

          .main-title {
            font-size: 1.35rem;
          }

          .subtitle {
            font-size: 0.85rem;
          }

          .trust-badge {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
          }

          .reset-button {
            padding: 0.625rem 1rem;
            font-size: 0.85rem;
          }

          .footer-content {
            padding: 0 0.75rem;
          }

          .footer-brand-logo {
            height: 28px;
          }

          .copyright {
            font-size: 0.8rem;
          }

          .tagline {
            font-size: 0.75rem;
          }

          .professional-badge {
            font-size: 0.8rem;
            padding: 0.375rem 0.75rem;
          }
        }

        /* High DPI screens */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .main-title {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
          }
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .bg-shape,
          .reset-button,
          .reset-icon {
            animation: none;
          }

          .reset-button:hover {
            transform: none;
          }
        }

        /* Focus styles for accessibility */
        .reset-button:focus-visible {
          outline: 3px solid #30d64f;
          outline-offset: 2px;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(232, 238, 255, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 104, 255, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 104, 255, 0.5);
        }
      `}</style>
    </>
  );
}