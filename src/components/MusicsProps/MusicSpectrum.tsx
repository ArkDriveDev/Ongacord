import { IonButton, IonIcon } from '@ionic/react';
import { musicalNotes } from 'ionicons/icons';

const MusicSpectrum: React.FC = () => {
  return (
    <IonButton expand="block" color="warning">
      <IonIcon slot="start" icon={musicalNotes} />
      Spectrum
    </IonButton>
  );
};

export default MusicSpectrum;
