import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { resetQuiz } from '../utils/ask';

export default function Home() {
  const [key, setKey] = useState(0); // Force re-render of ChatInterface

  const handleReset = async () => {
    try {
      await resetQuiz();
      setKey(prev => prev + 1); // Force ChatInterface to remount
    } catch (error) {
      console.error('Failed to reset quiz:', error);
      // Still remount the component to clear local state
      setKey(prev => prev + 1);
    }
  };

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="brand">ClickPrimer</span>
              <span className="subtitle">Contractor Growth Assessment</span>
            </h1>
            <button 
              className="reset-button"
              onClick={handleReset}
              title="Start over"
            >
              ↻ Restart Quiz
            </button>
          </div>
        </header>

        <main className="main-content">
          <ChatInterface key={key} />
        </main>

        <footer className="app-footer">
          <p>© 2024 ClickPrimer - Lead Systems for Contractors</p>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }

        #__next {
          height: 100%;
        }

        .app-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
        }

        .reset-button {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reset-button:hover {
          background: #e2e8f0;
          color: #334155;
          transform: translateY(-1px);
        }

        .main-content {
          flex: 1;
          overflow: hidden;
        }

        .app-footer {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .app-header {
            padding: 0.5rem 0;
          }
          
          .header-content {
            padding: 0 1rem;
          }
          
          .brand {
            font-size: 1.25rem;
          }
          
          .subtitle {
            font-size: 0.8rem;
          }
          
          .reset-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }
          
          .app-footer {
            padding: 0.75rem;
            font-size: 0.8rem;
          }
        }

        /* Global scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Focus styles for accessibility */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}
        