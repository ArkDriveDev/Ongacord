import React, { useEffect, useRef, useCallback } from 'react';
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
  // Create an array to hold all bar refs
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize the array with null values
  useEffect(() => {
    barsRef.current = Array(barCount).fill(null);
  }, [barCount]);

  // Create a callback ref function
  const setBarRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    barsRef.current[index] = el;
  }, []);

  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isPlaying || !audioRef?.current) {
      // Reset bars when not playing
      barsRef.current.forEach(bar => {
        if (bar) {
          bar.style.height = '10%';
        }
      });
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
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
        const bar = bars[i];
        if (bar) {
          // Use different frequency bands for different bars
          const value = dataArray[i % dataArray.length];
          const height = `${10 + (value / 255) * 90}%`;
          bar.style.height = height;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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
          ref={setBarRef(i)}
          className="spectrum-bar" 
          style={{ 
            animation: isPlaying ? 'none' : `bounce 1s infinite ease-in-out ${i * 0.1}s`,
            background: 'linear-gradient(180deg, #320336, #ef05df)'
          }} 
        />
      ))}
    </div>
  );
};

export default SpectrumBars;