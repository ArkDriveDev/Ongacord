import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton 
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Hologram.css';

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

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(globalSelectedModel);
  const [defaultModel, setDefaultModel] = useState<ModelData | null>(null);

  // Load the default model (Orb1) on component mount
  useEffect(() => {
    const loadDefaultModel = async () => {
      try {
        const orb1Src = (await import('../images/Orb1.gif')).default;
        const defaultModel = {
          id: 1,
          name: 'Orb 1',
          src: orb1Src
        };
        setDefaultModel(defaultModel);
        
        // If no model is selected yet, use the default
        if (!globalSelectedModel) {
          globalSelectedModel = defaultModel;
          setSelectedModel(defaultModel);
        }
      } catch (error) {
        console.error('Error loading default model:', error);
      }
    };

    loadDefaultModel();
  }, []);

  // Update model when navigation state changes
  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (defaultModel && !globalSelectedModel) {
      // Only use default if no model was ever selected
      globalSelectedModel = defaultModel;
      setSelectedModel(defaultModel);
    }
  }, [location.state, defaultModel]);

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