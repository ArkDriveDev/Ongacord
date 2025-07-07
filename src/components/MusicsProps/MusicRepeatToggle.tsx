import { IonButton, IonIcon } from '@ionic/react';
import { repeat, repeatOutline } from 'ionicons/icons';

const MusicRepeatToggle: React.FC = () => {
  return (
    <IonButton color="tertiary" shape="round">
      <IonIcon icon={repeat} />
    </IonButton>
  );
};

export default MusicRepeatToggle;