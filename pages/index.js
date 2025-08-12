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
      console.error('Failed to reset quiz:', error);
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
              <h1 className="app-title">
                <span className="brand">ClickPrimer</span>
                <span className="subtitle">Contractor Growth Assessment</span>
              </h1>
              <div className="brand-highlight"></div>
            </div>
            
            <button 
              className={`reset-button ${isResetting ? 'resetting' : ''}`}
              onClick={handleReset}
              disabled={isResetting}
              title="Start over"
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
                {isResetting ? 'Restarting...' : 'Restart Quiz'}
              </span>
            </button>
          </div>
          
          {/* Animated background elements */}
          <div className="header-bg-elements">
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>
            <div className="bg-circle bg-circle-3"></div>
          </div>
        </header>

        <main className="main-content">
          <ChatInterface key={key} />
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span>© 2024 ClickPrimer</span>
              <span className="footer-tagline">Lead Systems for Contractors</span>
            </div>
            <div className="footer-trust">
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 200;
          overflow: hidden;
          position: relative;
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
          position: relative;
        }

        .app-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
        }

        .brand {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.025em;
          position: relative;
        }

        .subtitle {
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.025em;
          opacity: 0.8;
        }

        .brand-highlight {
          position: absolute;
          bottom: -4px;
          left: 0;
          height: 3px;
          width: 0;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
          animation: expandLine 2s ease-out 0.5s forwards;
        }

        .reset-button {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 0.75rem 1.25rem;
          border-radius: 1rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .reset-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .reset-button:hover::before {
          left: 100%;
        }

        .reset-button:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
        }

        .reset-button:active {
          transform: translateY(-1px);
        }

        .reset-button.resetting {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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
          stroke-width: 2;
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

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        .bg-circle-1 {
          width: 80px;
          height: 80px;
          top: -40px;
          right: 10%;
          animation-delay: 0s;
        }

        .bg-circle-2 {
          width: 60px;
          height: 60px;
          top: 50%;
          right: 5%;
          animation-delay: -2s;
        }

        .bg-circle-3 {
          width: 40px;
          height: 40px;
          top: 20%;
          left: 5%;
          animation-delay: -4s;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* Footer */
        .app-footer {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem;
          position: relative;
          z-index: 100;
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
          flex-direction: column;
          gap: 0.25rem;
        }

        .footer-brand span:first-child {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .footer-tagline {
          color: #94a3b8;
          font-size: 0.8rem;
          letter-spacing: 0.025em;
        }

        .footer-trust {
          display: flex;
          align-items: center;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .trust-badge svg {
          width: 16px;
          height: 16px;
          stroke-width: 2;
          color: #10b981;
        }

        /* Animations */
        @keyframes expandLine {
          to {
            width: 100%;
          }
        }

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
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .app-header {
            padding: 0.75rem 0;
          }
          
          .header-content {
            padding: 0 1rem;
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .header-branding {
            text-align: center;
          }
          
          .brand {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.85rem;
          }
          
          .reset-button {
            padding: 0.625rem 1rem;
            font-size: 0.85rem;
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

          .bg-circle-1,
          .bg-circle-2,
          .bg-circle-3 {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 0 0.75rem;
          }

          .brand {
            font-size: 1.35rem;
          }

          .subtitle {
            font-size: 0.8rem;
          }

          .reset-button {
            padding: 0.5rem 0.875rem;
            font-size: 0.8rem;
          }

          .footer-content {
            padding: 0 0.75rem;
          }

          .footer-brand span:first-child {
            font-size: 0.8rem;
          }

          .footer-tagline {
            font-size: 0.75rem;
          }

          .trust-badge {
            font-size: 0.8rem;
            padding: 0.375rem 0.625rem;
          }
        }

        /* High DPI screens */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .brand {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
          }
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .bg-circle,
          .brand-highlight,
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
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.8);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.9);
        }

        /* Dark mode support (if needed in future) */
        @media (prefers-color-scheme: dark) {
          .app-header {
            background: rgba(15, 23, 42, 0.95);
          }

          .app-footer {
            background: rgba(15, 23, 42, 0.95);
          }

          .footer-brand span:first-child,
          .trust-badge {
            color: #e2e8f0;
          }

          .footer-tagline {
            color: #94a3b8;
          }
        }
      `}</style>
    </>
  );
}