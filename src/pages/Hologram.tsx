import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton,
  IonButton, IonIcon
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { micOutline, micOffOutline } from 'ionicons/icons';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceCommands from '../services/VoiceCommands';

interface ModelData {
  id: number;
  name: string;
  src: string;
}

interface LocationState {
  model: ModelData;
}

const DEFAULT_MODEL = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const [selectedModel, setSelectedModel] = useState<ModelData>(DEFAULT_MODEL);
  const [micActive, setMicActive] = useState(false);

  // Handle voice command toggle
  const toggleVoiceCommands = () => {
    if (micActive) {
      VoiceCommands.disable();
    } else {
      VoiceCommands.enable();
    }
    setMicActive(!micActive);
  };

  // Initialize voice commands on Windows load
  useEffect(() => {
    // Add slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      VoiceCommands.enable();
      setMicActive(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      VoiceCommands.disable();
    };
  }, []);

  // Update model when navigation state changes
  useEffect(() => {
    if (location.state?.model) {
      setSelectedModel(location.state.model);
    }
  }, [location.state]);

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleVoiceCommands}>
              <IonIcon 
                icon={micActive ? micOutline : micOffOutline} 
                color={micActive ? 'success' : 'medium'}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="hologram-center">
          <div className="reflection-base">
            <div className="reflection-image top">
              <img src={selectedModel.src} alt="Top" />
            </div>
            <div className="reflection-image right">
              <img src={selectedModel.src} alt="Right" />
            </div>
            <div className="reflection-image bottom">
              <img src={selectedModel.src} alt="Bottom" />
            </div>
            <div className="reflection-image left">
              <img src={selectedModel.src} alt="Left" />
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hologram;