import React from 'react';
import './SpectrumBars.css';

interface SpectrumBarsProps {
  barCount?: number;
}

const SpectrumBars: React.FC<SpectrumBarsProps> = ({ barCount = 20 }) => {
  const bars = Array.from({ length: barCount });

  return (
    <div className="spectrum-container">
      {bars.map((_, i) => (
        <div key={i} className="spectrum-bar" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
};

export default SpectrumBars;
