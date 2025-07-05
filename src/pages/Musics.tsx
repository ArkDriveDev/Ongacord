import React, { useState, useRef, useEffect } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonRow, IonCol, IonGrid 
} from '@ionic/react';
import { play, pause } from 'ionicons/icons';
import './Musics.css';

// Import audio files
import Music1 from '../Musics/Bumble bee.mp3';
import Music2 from '../Musics/Chicken Dance.mp3';
import Music3 from '../Musics/Pretty little baby.mp3';
import Music4 from '../Musics/See tin.mp3';

// Import default music image
import MusicImage from '../images/Music.png';

interface MusicItem {
  id: number;
  title: string;
  audioSrc: string;
  isPlaying: boolean;
}

const Musics: React.FC = () => {
  const audioRefs = [
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null)
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [centeredCard, setCenteredCard] = useState<number | null>(1); // Default to first card

  const [musicItems, setMusicItems] = useState<MusicItem[]>([
    { id: 1, title: 'Bumble Bee', audioSrc: Music1, isPlaying: false },
    { id: 2, title: 'Chicken Dance', audioSrc: Music2, isPlaying: false },
    { id: 3, title: 'Pretty Little Baby', audioSrc: Music3, isPlaying: false },
    { id: 4, title: 'See Tinh', audioSrc: Music4, isPlaying: false },
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerWidth = container.offsetWidth;
      const scrollPosition = container.scrollLeft + containerWidth / 2;
      
      const cards = Array.from(document.querySelectorAll('.music-card'));
      const centered = cards.find(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left - container.getBoundingClientRect().left + rect.width / 2;
        return Math.abs(cardCenter - containerWidth / 2) < 30;
      });

      if (centered) {
        const cardId = Number(centered.getAttribute('data-id'));
        setCenteredCard(cardId);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePlay = (id: number) => {
    setMusicItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const audioRef = audioRefs[id-1].current;
          if (!item.isPlaying) {
            // Stop all other tracks
            prevItems.forEach((otherItem, index) => {
              if (otherItem.id !== id && audioRefs[index].current) {
                audioRefs[index].current?.pause();
                audioRefs[index].current!.currentTime = 0;
              }
            });
            // Play this track
            audioRef?.play().catch(error => 
              console.error('Audio playback failed:', error)
            );
          } else {
            // Pause this track
            audioRef?.pause();
          }
          return { ...item, isPlaying: !item.isPlaying };
        }
        return { ...item, isPlaying: false };
      })
    );

    // Scroll to center the selected card
    const cardElement = document.querySelector(`.music-card[data-id="${id}"]`);
    if (cardElement && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const cardRect = cardElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollTo = cardRect.left - containerRect.left + container.scrollLeft - (containerWidth / 2) + (cardRect.width / 2);
      
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Musics</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="music-container" ref={containerRef}>
          <IonGrid className="music-grid">
            <IonRow className="music-row">
              {musicItems.map((item, index) => (
                <IonCol key={item.id} className="music-col">
                  <IonCard 
                    className={`music-card ${centeredCard === item.id ? 'snap-center' : ''} ${item.isPlaying ? 'playing' : ''}`}
                    data-id={item.id}
                  >
                    <img 
                      alt="Music cover" 
                      src={MusicImage} 
                      className="music-image"
                    />
                    <IonCardHeader>
                      <IonCardTitle>{item.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonButton 
                        expand="block" 
                        onClick={() => togglePlay(item.id)}
                        color={item.isPlaying ? 'danger' : 'success'}
                        className="play-button"
                      >
                        <IonIcon 
                          slot="start" 
                          icon={item.isPlaying ? pause : play} 
                        />
                        {item.isPlaying ? 'Pause' : 'Play'}
                      </IonButton>
                      <audio
                        ref={audioRefs[index]}
                        src={item.audioSrc}
                        onEnded={() => togglePlay(item.id)}
                        onError={(e) => console.error('Audio error:', e)}
                      />
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Musics;