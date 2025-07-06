import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { play, pause, refresh } from 'ionicons/icons';

interface MusicPlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  onRestart: () => void;
  disabled?: boolean;
  className?: string;
}

const MusicPlayButton: React.FC<MusicPlayButtonProps> = ({ 
  isPlaying, 
  onToggle,
  onRestart,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="music-controls">
      <IonButton 
        expand="block" 
        onClick={onToggle}
        color={isPlaying ? 'danger' : 'success'}
        className={`play-button ${className}`}
        disabled={disabled}
      >
        <IonIcon 
          slot="start" 
          icon={isPlaying ? pause : play} 
        />
        {isPlaying ? 'Pause' : 'Play'}
      </IonButton>
      
      <IonButton 
        fill="clear"
        onClick={onRestart}
        className="restart-button"
        disabled={disabled}
      >
        <IonIcon 
          icon={refresh} 
          size="small"
        />
      </IonButton>
    </div>
  );
};

export default MusicPlayButton;