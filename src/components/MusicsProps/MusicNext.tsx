import { IonButton, IonIcon } from '@ionic/react';
import { playSkipForward } from 'ionicons/icons';

const MusicNext: React.FC = () => {
  return (
    <IonButton color="secondary" shape="round">
      <IonIcon icon={playSkipForward} />
    </IonButton>
  );
};

export default MusicNext;
