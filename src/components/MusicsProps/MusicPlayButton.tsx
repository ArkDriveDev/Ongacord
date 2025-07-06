import { IonButton, IonIcon } from '@ionic/react';
import { play, pause } from 'ionicons/icons';
import { useState } from 'react';

const MusicPlayButton: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <IonButton onClick={() => setIsPlaying(!isPlaying)} color="primary" shape="round">
      <IonIcon icon={isPlaying ? pause : play} />
    </IonButton>
  );
};

export default MusicPlayButton;
