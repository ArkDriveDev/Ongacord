import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, useIonRouter,
  useIonViewWillEnter, useIonViewWillLeave 
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import hello from '../Responses/CuteResponse/hello1.ogg';
import reverseImage from '../images/reverse.png';

interface HologramModel {
  id: number;
  name: string;
  src: string;
}

const DEFAULT_MODEL: HologramModel = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<{ model?: HologramModel }>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio and voice on mount
  useIonViewWillEnter(() => {
    audioRef.current = new Audio(hello);
    audioRef.current.preload = 'auto';

    const initVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Release immediately
        setPermissionGranted(true);

        const started = await VoiceService.startListening((command) => {
          console.log("Heard:", command); // Optional: log commands
        });
        setIsVoiceActive(started);

        if (started) playHelloSound();
      } catch (error) {
        console.error("Voice init error:", error);
        setPermissionGranted(false);
      }
    };
    initVoice();
  });

  // Cleanup on unmount
  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsVoiceActive(false);
  });

  const playHelloSound = () => {
    if (!audioRef.current) return;
    
    setIsResponding(true);
    VoiceService.setSpeakingState(true); // Force mic off before playback
    
    audioRef.current.currentTime = 0;
    audioRef.current.play()
      .then(() => {
        audioRef.current!.onended = () => {
          setIsResponding(false);
          // Mic restart is now handled by VoiceService's cooldown
        };
      })
      .catch((e) => console.error("Audio error:", e));
  };

  const handleReverseClick = () => setIsReversed(!isReversed);

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <div slot="end" style={{ 
            color: isVoiceActive ? '#4CAF50' : '#ccc',
            padding: '0 16px',
            fontSize: '0.8rem'
          }}>
            {isVoiceActive ? 'Active' : 'Off'}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        {/* Your hologram UI remains unchanged */}
        <div className={`hologram-center ${isResponding ? 'pulse-effect' : ''}`}>
          <img
            src={reverseImage}
            alt="Reverse Hologram"
            className="center-image"
            onClick={handleReverseClick}
          />
          <div className={`reflection-base ${isReversed ? 'reversed' : ''}`}>
            {['top', 'right', 'bottom', 'left'].map((position) => (
              <div key={position} className={`reflection-image ${position}`}>
                <img src={selectedModel.src} alt={`${position} Reflection`} />
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hologram;