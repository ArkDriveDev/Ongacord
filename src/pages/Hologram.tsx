import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton 
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';

interface ModelData {
  id: number;
  name: string;
  src: string;
}

interface LocationState {
  model: ModelData;
}

// Persistent selected model outside component
let globalSelectedModel: ModelData | null = null;

const DEFAULT_MODEL = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(globalSelectedModel || DEFAULT_MODEL);

  // Update model when navigation state changes
  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (!globalSelectedModel) {
      // Only use default if no model was ever selected
      globalSelectedModel = DEFAULT_MODEL;
      setSelectedModel(DEFAULT_MODEL);
    }
  }, [location.state]);

  const imageDistance = 100;
  const imageSize = 150;

  if (!selectedModel) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/models" text="Back" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Loading hologram viewer</h3>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="hologram-center">
          <div 
            className="reflection-base"
            style={{
              width: `${imageDistance * 2}px`,
              height: `${imageDistance * 2}px`
            }}
          >
            <div className="reflection-image top" style={{ width: imageSize, height: imageSize, top: `-${imageDistance}px` }}>
              <img src={selectedModel.src} alt="Top" />
            </div>
            <div className="reflection-image right" style={{ width: imageSize, height: imageSize, right: `-${imageDistance}px` }}>
              <img src={selectedModel.src} alt="Right" />
            </div>
            <div className="reflection-image bottom" style={{ width: imageSize, height: imageSize, bottom: `-${imageDistance}px` }}>
              <img src={selectedModel.src} alt="Bottom" />
            </div>
            <div className="reflection-image left" style={{ width: imageSize, height: imageSize, left: `-${imageDistance}px` }}>
              <img src={selectedModel.src} alt="Left" />
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hologram; 