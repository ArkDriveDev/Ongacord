import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, useIonViewWillEnter, useIonViewWillLeave, useIonViewDidEnter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hello from '../Responses/CuteResponse/hello1.ogg';
import reverseImage from '../images/reverse.png';
import wanya from '../Responses/CuteResponse/Wanya.mp3';
import success from '../Responses/CuteResponse/Success.mp3';
import { fetchAvailableModels } from '../services/ModelsService';

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
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isModelChanging, setIsModelChanging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const wanyaSound = useRef(new Audio(wanya)).current;
  const successSound = useRef(new Audio(success)).current;


  useEffect(() => {
    // Initialize audio elements
    wanyaSound.load();
    successSound.load();

    // Set up aria-hidden observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          const target = mutation.target as HTMLElement;
          if (target.id === 'main-content') {
            target.removeAttribute('aria-hidden');
          }
        }
      });
    });

    const mainContent = document.getElementById('main-content');
    if (mainContent) observer.observe(mainContent, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fromRoute = location.state?.model;
    if (fromRoute) {
      setSelectedModel(fromRoute);
      localStorage.setItem('selectedModel', JSON.stringify(fromRoute));
    } else {
      const saved = localStorage.getItem('selectedModel');
      if (saved) {
        setSelectedModel(JSON.parse(saved));
      } else {
        setSelectedModel(DEFAULT_MODEL);
      }
    }
  }, [location.state]);


  const playHelloSound = () => {
    if (!audioRef.current) return;

    VoiceService.setSystemAudioState(true);
    setIsResponding(true);

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error("Audio play error:", e));

    const handleAudioEnd = () => {
      VoiceService.setSystemAudioState(false);
      setIsResponding(false);
    };

    audioRef.current.onended = handleAudioEnd;
    audioRef.current.onerror = handleAudioEnd;
  };

  const handleReverseClick = () => {
    setIsReversed(!isReversed);
    wanyaSound.play().catch(e => console.error("Failed to play audio:", e));
  };

  const handleModelChange = useCallback(async (modelName: string | HologramModel | null) => {
    if (!modelName) {
      setIsModelChanging(false);
      return;
    }

    try {
      setIsModelChanging(true);
      VoiceService.setSystemAudioState(true); // Pause recognition

      // If it's already a model object (from click)
      if (typeof modelName !== 'string') {
        setSelectedModel(modelName);
        await new Promise<void>((resolve) => {
          successSound.onended = () => resolve();
          successSound.onerror = () => resolve();
          successSound.play().catch(e => {
            console.error("Failed to play audio:", e);
            resolve();
          });
        });
        return;
      }

      // If it's a string (from voice command)
      const models = await fetchAvailableModels();
      const normalizedInput = modelName.toLowerCase().trim();

      const model = models.find(m =>
        m.name.toLowerCase() === normalizedInput ||
        m.name.toLowerCase().includes(normalizedInput)
      );

      if (model) {
        setSelectedModel(model);
        await new Promise<void>((resolve) => {
          successSound.onended = () => resolve();
          successSound.onerror = () => resolve();
          successSound.play().catch(e => {
            console.error("Failed to play audio:", e);
            resolve();
          });
        });
      }
    } catch (error) {
      console.error("Model change error:", error);
    } finally {
      VoiceService.setSystemAudioState(false); // Resume recognition
      setIsModelChanging(false);
    }
  }, []);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      setIsResponding(true);
      clearTimeout(responseTimeoutRef.current as NodeJS.Timeout);

      const result = await CommandList(command);

      if (result.action === 'changeModel' && result.model) {
        await handleModelChange(result.model);
      }

      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000);
    } catch (error) {
      console.error("Command error:", error);
      setIsResponding(false);
    }
  }, [handleModelChange]);

  useIonViewWillEnter(() => {
    document.activeElement instanceof HTMLElement && document.activeElement.blur();

    audioRef.current = new Audio(hello);
    audioRef.current.preload = 'auto';

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);

        const started = await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(started);
        started && playHelloSound();
      } catch (error) {
        console.error("Voice init error:", error);
        setPermissionGranted(false);
        setIsVoiceActive(false);
      }
    };
    initialize();

    if (audioRef.current) {
      audioRef.current.onended = () => setIsResponding(false);
      audioRef.current.onplay = () => setIsResponding(true);
    }
  });

  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setIsResponding(false);

    audioRef.current?.pause();
    audioRef.current = null;

    clearTimeout(responseTimeoutRef.current as NodeJS.Timeout);
    clearTimeout(modelChangeTimeout.current as NodeJS.Timeout);

    // Clear model from localStorage
    localStorage.removeItem('selectedModel');
  });

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
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
        <div className={`hologram-center ${isResponding ? 'pulse-effect' : ''}`}>
          <img
            src={reverseImage}
            alt="Reverse Hologram"
            className="center-image"
            onClick={handleReverseClick}
            onError={(e) => console.error("Failed to load center image")}
          />
          <div className={`reflection-base ${isReversed ? 'reversed' : ''}`}>
            {['top', 'right', 'bottom', 'left'].map((position) => (
              <div key={position} className={`reflection-image ${position}`}>
                <img
                  src={selectedModel.src}
                  alt={`${position} Reflection`}
                  onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
                />
              </div>
            ))}
          </div>
        </div>

        {!permissionGranted && (
          <div className="permission-warning">
            Microphone access required for voice commands
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;