import React, { useEffect, useRef } from 'react';
import './SpectrumBars.css';

interface SpectrumBarsProps {
  barCount?: number;
  isPlaying?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const SpectrumBars: React.FC<SpectrumBarsProps> = ({ 
  barCount = 20, 
  isPlaying = false, 
  audioRef 
}) => {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isPlaying || !audioRef?.current) {
      // Reset bars when not playing
      barsRef.current.forEach(bar => {
        bar.style.height = '10%';
      });
      return;
    }

    // Setup audio context and analyzer
    const setupAudioAnalysis = () => {
      if (!audioRef?.current) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
    };

    setupAudioAnalysis();

    // Animation loop
    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isPlaying) {
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const bars = barsRef.current;
      const dataArray = dataArrayRef.current;
      
      for (let i = 0; i < bars.length; i++) {
        // Use different frequency bands for different bars
        const value = dataArray[i % dataArray.length];
        const height = `${10 + (value / 255) * 90}%`;
        bars[i].style.height = height;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current && audioContextRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current && audioContextRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [isPlaying, audioRef]);

  const bars = Array.from({ length: barCount });

  return (
    <div className="spectrum-container">
      {bars.map((_, i) => (
        <div 
          key={i} 
          ref={el => { if (el) barsRef.current[i] = el }}
          className="spectrum-bar" 
          style={{ 
            animation: isPlaying ? 'none' : `bounce 1s infinite ease-in-out ${i * 0.1}s`,
            background: isPlaying ? 
              'linear-gradient(180deg, #320336, #ef05df)' : 
              'linear-gradient(180deg, #320336, #ef05df)'
          }} 
        />
      ))}
    </div>
  );
};

export default SpectrumBars;