import { 
  IonContent, 
  IonHeader, 
  IonPage, 
} from '@ionic/react';
import Orb1 from '../images/Orb1.gif';
import './Hologram.css';

const Hologram: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="pyramid">
          <div className="pyramid-face">
            <img src={Orb1} alt="Hologram Orb" />
          </div>
          <div className="pyramid-face">
            <img src={Orb1} alt="Hologram Orb" />
          </div>
          <div className="pyramid-face">
            <img src={Orb1} alt="Hologram Orb" />
          </div>
          <div className="pyramid-face">
            <img src={Orb1} alt="Hologram Orb" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hologram;