import { useState, useEffect } from 'react';

const ProgressTracker = ({ 
  currentStep = 1, 
  totalSteps = 12, 
  stepLabels = [],
  onStepClick = null,
  showDetailedSteps = false 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const progressPercentage = Math.min(100, (currentStep / totalSteps) * 100);
  const isComplete = currentStep >= totalSteps;

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Show celebration when complete
  useEffect(() => {
    if (isComplete && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isComplete, showCelebration]);

  const defaultStepLabels = [
    'Welcome', 'Branding', 'Lead Response', 'Marketing', 'Operations', 
    'Growth', 'Goals', 'Challenges', 'Priorities', 'Investment', 
    'Timeline', 'Summary'
  ];

  const labels = stepLabels.length > 0 ? stepLabels : defaultStepLabels;

  return (
    <>
      <div className="progress-tracker">
        {/* Main Progress Bar */}
        <div className="progress-main">
          <div className="progress-bar-container">
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill"
                style={{ width: `${animatedProgress}%` }}
              />
              <div 
                className="progress-glow"
                style={{ left: `${animatedProgress}%` }}
              />
            </div>
            
            {/* Progress dots */}
            <div className="progress-dots">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <div
                    key={stepNumber}
                    className={`progress-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                    style={{ left: `${(index / (totalSteps - 1)) * 100}%` }}
                    onClick={() => onStepClick && onStepClick(stepNumber)}
                    title={labels[index]}
                  >
                    {isActive ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Text */}
          <div className="progress-text">
            <div className="progress-label">
              <span className="current-step">Step {currentStep}</span>
              <span className="step-name">{labels[currentStep - 1] || 'Assessment'}</span>
            </div>
            <div className="progress-stats">
              <span className="percentage">{Math.round(animatedProgress)}%</span>
              <span className="fraction">{currentStep}/{totalSteps}</span>
            </div>
          </div>
        </div>

        {/* Detailed Steps (Optional) */}
        {showDetailedSteps && (
          <div className="progress-detailed">
            <div className="steps-grid">
              {labels.slice(0, totalSteps).map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;
                const isCurrent = stepNumber === currentStep;
                const isClickable = onStepClick && stepNumber < currentStep;
                
                return (
                  <div
                    key={stepNumber}
                    className={`step-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isClickable ? 'clickable' : ''}`}
                    onClick={() => isClickable && onStepClick(stepNumber)}
                  >
                    <div className="step-icon">
                      {isActive ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      ) : (
                        <span>{stepNumber}</span>
                      )}
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Celebration Effect */}
        {showCelebration && (
          <div className="celebration-container">
            <div className="celebration-content">
              <div className="celebration-icon">🎉</div>
              <div className="celebration-text">Assessment Complete!</div>
              <div className="celebration-subtext">Generating your personalized growth map...</div>
            </div>
            <div className="confetti">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={`confetti-piece confetti-${i}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .progress-tracker {
          position: relative;
          width: 100%;
          z-index: 10;
        }

        /* Main Progress Section */
        .progress-main {
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .progress-bar-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .progress-bar-track {
          height: 8px;
          background: rgba(203, 213, 225, 0.3);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .progress-bar-fill::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.4), 
            transparent);
          animation: shimmer 2s infinite;
        }

        .progress-glow {
          position: absolute;
          top: -4px;
          height: 16px;
          width: 16px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          border-radius: 50%;
          transform: translateX(-50%);
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.8;
        }

        /* Progress Dots */
        .progress-dots {
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          height: 24px;
        }

        .progress-dot {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e2e8f0;
          border: 2px solid #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          transform: translateX(-50%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          z-index: 2;
        }

        .progress-dot.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          border-color: white;
        }

        .progress-dot.current {
          transform: translateX(-50%) scale(1.2);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        .progress-dot svg {
          width: 12px;
          height: 12px;
          stroke-width: 2.5;
        }

        .progress-dot.clickable {
          cursor: pointer;
        }

        .progress-dot.clickable:hover {
          transform: translateX(-50%) scale(1.1);
        }

        /* Progress Text */
        .progress-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .progress-label {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .current-step {
          font-size: 0.875rem;
          font-weight: 600;
          color: #3b82f6;
        }

        .step-name {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .progress-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .percentage {
          font-size: 1.125rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .fraction {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Detailed Steps */
        .progress-detailed {
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }

        .step-item.clickable {
          cursor: pointer;
        }

        .step-item.clickable:hover {
          background: rgba(59, 130, 246, 0.05);
          transform: translateY(-2px);
        }

        .step-item.current {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-item.active .step-icon {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .step-icon svg {
          width: 16px;
          height: 16px;
          stroke-width: 2.5;
        }

        .step-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
        }

        .step-item.active .step-label {
          color: #3b82f6;
          font-weight: 600;
        }

        /* Celebration */
        .celebration-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.5s ease-out;
        }

        .celebration-content {
          text-align: center;
          color: white;
          animation: bounceIn 0.8s ease-out;
          z-index: 2;
          position: relative;
        }

        .celebration-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: spin 2s ease-in-out infinite;
        }

        .celebration-text {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .celebration-subtext {
          font-size: 1.125rem;
          opacity: 0.8;
        }

        /* Confetti */
        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          animation: confetti-fall 3s ease-out infinite;
        }

        .confetti-0 { left: 10%; background: #3b82f6; animation-delay: 0s; }
        .confetti-1 { left: 20%; background: #8b5cf6; animation-delay: 0.1s; }
        .confetti-2 { left: 30%; background: #10b981; animation-delay: 0.2s; }
        .confetti-3 { left: 40%; background: #f59e0b; animation-delay: 0.3s; }
        .confetti-4 { left: 50%; background: #ef4444; animation-delay: 0.4s; }
        .confetti-5 { left: 60%; background: #3b82f6; animation-delay: 0.5s; }
        .confetti-6 { left: 70%; background: #8b5cf6; animation-delay: 0.6s; }
        .confetti-7 { left: 80%; background: #10b981; animation-delay: 0.7s; }
        .confetti-8 { left: 90%; background: #f59e0b; animation-delay: 0.8s; }
        .confetti-9 { left: 15%; background: #ef4444; animation-delay: 0.9s; }
        .confetti-10 { left: 75%; background: #3b82f6; animation-delay: 1s; }
        .confetti-11 { left: 85%; background: #8b5cf6; animation-delay: 1.1s; }

        /* Animations */
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
          }
          50% {
            opacity: 0.8;
            transform: translateX(-50%) scale(1.3);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes confetti-fall {
          0% {
            top: -10%;
            transform: rotate(0deg);
            opacity: 1;
          }
          100% {
            top: 110%;
            transform: rotate(720deg);
            opacity: 0;
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .progress-main {
            padding: 0.75rem 1rem;
          }

          .progress-detailed {
            padding: 0.75rem 1rem;
          }

          .steps-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.5rem;
          }

          .step-item {
            padding: 0.5rem;
          }

          .step-icon {
            width: 28px;
            height: 28px;
          }

          .step-label {
            font-size: 0.75rem;
          }

          .progress-text {
            gap: 0.25rem;
          }

          .current-step {
            font-size: 0.8rem;
          }

          .step-name {
            font-size: 0.75rem;
          }

          .percentage {
            font-size: 1rem;
          }

          .fraction {
            font-size: 0.8rem;
          }

          .celebration-icon {
            font-size: 3rem;
          }

          .celebration-text {
            font-size: 1.5rem;
          }

          .celebration-subtext {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .progress-dots {
            display: none;
          }

          .progress-bar-track {
            height: 6px;
          }

          .progress-main {
            padding: 0.5rem 0.75rem;
          }

          .steps-grid {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .progress-bar-fill,
          .progress-glow,
          .progress-dot,
          .step-item {
            transition: none;
          }

          .celebration-icon,
          .confetti-piece {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default ProgressTracker;