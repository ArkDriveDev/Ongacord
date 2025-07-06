import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { play, pause } from 'ionicons/icons';

interface MusicPlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

const MusicPlayButton: React.FC<MusicPlayButtonProps> = ({ 
  isPlaying, 
  onToggle, 
  disabled = false,
  className = ''
}) => {
  return (
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
  );
};

export default MusicPlayButton;