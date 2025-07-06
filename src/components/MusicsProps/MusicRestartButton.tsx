import { IonButton, IonIcon } from '@ionic/react';
import { refresh } from 'ionicons/icons';

const MusicRestartButton: React.FC = () => {
  return (
    <IonButton color="medium" shape="round">
      <IonIcon icon={refresh} />
    </IonButton>
  );
};

export default MusicRestartButton;
