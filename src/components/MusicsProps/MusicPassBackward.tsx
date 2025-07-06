import { IonButton, IonIcon } from '@ionic/react';
import { playSkipBack } from 'ionicons/icons';

const MusicPassBackward: React.FC = () => {
  return (
    <IonButton color="secondary" shape="round">
      <IonIcon icon={playSkipBack} />
    </IonButton>
  );
};

export default MusicPassBackward;
