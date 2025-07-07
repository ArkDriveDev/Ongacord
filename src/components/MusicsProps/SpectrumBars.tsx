import React, { useEffect, useRef, useCallback } from 'react';
import './SpectrumBars.css';

interface SpectrumBarsProps {
  barCount?: number;
  isPlaying?: boolean;
  audioElement?: HTMLAudioElement | null;
}

const SpectrumBars: React.FC<SpectrumBarsProps> = ({ 
  barCount = 20, 
  isPlaying = false, 
  audioElement 
}) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize the array with null values
  useEffect(() => {
    barsRef.current = Array(barCount).fill(null);
  }, [barCount]);

  // Create a callback ref function
  const setBarRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    barsRef.current[index] = el;
  }, []);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
        audioContextRef.current = null;
      }
      
      // Reset bars
      barsRef.current.forEach(bar => {
        if (bar) {
          bar.style.height = '10%';
          bar.style.opacity = '0.4';
        }
      });
    };

    if (!isPlaying || !audioElement) {
      cleanup();
      return;
    }

    // Setup audio context and analyzer
    const setupAudioAnalysis = () => {
      cleanup(); // Clean up any existing setup
      
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataArrayRef.current = dataArray;
        
        return true;
      } catch (error) {
        console.error('Audio analysis setup failed:', error);
        return false;
      }
    };

    // Only set up if we haven't already or if the audio element changed
    if (!audioContextRef.current || 
        sourceRef.current?.mediaElement !== audioElement) {
      if (!setupAudioAnalysis()) {
        return;
      }
    }

    // Animation loop
    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isPlaying) {
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const bars = barsRef.current;
      const dataArray = dataArrayRef.current;
      const bufferLength = dataArray.length;
      
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        if (bar) {
          // Map bar index to frequency band
          const bandIndex = Math.floor((i / bars.length) * bufferLength);
          const value = dataArray[bandIndex];
          // Apply some smoothing and scaling
          const height = `${10 + (value / 255) * 90}%`;
          bar.style.height = height;
          // Optional: Add color variation based on intensity
          bar.style.opacity = `${0.4 + (value / 255) * 0.6}`;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return cleanup;
  }, [isPlaying, audioElement]);

  const bars = Array.from({ length: barCount });

  return (
    <div className="spectrum-container">
      {bars.map((_, i) => (
        <div 
          key={i} 
          ref={setBarRef(i)}
          className="spectrum-bar" 
          style={{ 
            animation: isPlaying ? 'none' : `bounce 1s infinite ease-in-out ${i * 0.05}s`,
            background: 'linear-gradient(180deg, #320336, #ef05df)'
          }} 
        />
      ))}
    </div>
  );
};

export default SpectrumBars;