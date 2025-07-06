import { IonButton, IonIcon } from '@ionic/react';
import { repeat } from 'ionicons/icons';

const MusicRepeatButton: React.FC = () => {
  return (
    <IonButton color="tertiary" shape="round">
      <IonIcon icon={repeat} />
    </IonButton>
  );
};

export default MusicRepeatButton;
