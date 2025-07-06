import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonRow, IonCol, IonGrid
} from '@ionic/react';

// Import audio files
import Music1 from '../Musics/Bumble bee.mp3';
import Music2 from '../Musics/Chicken Dance.mp3';
import Music3 from '../Musics/Pretty little baby.mp3';
import Music4 from '../Musics/See tin.mp3';

// Import default music image
import MusicImage from '../images/Music.png';
import ModelSearch from '../components/ModelsProps/ModelSearch';
import MusicPassBackward from '../components/MusicsProps/MusicPassBackward';
import MusicRestartButton from '../components/MusicsProps/MusicRestartButton';
import MusicPlayButton from '../components/MusicsProps/MusicPlayButton';
import MusicPassforward from '../components/MusicsProps/MusicPassforward';
import MusicRepeatButton from '../components/MusicsProps/MusicRepeatButton';
import MusicPlayAll from '../components/MusicsProps/MusicPlayAll';
import MusicSpectrum from '../components/MusicsProps/MusicSpectrum';

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
  const [centeredCard, setCenteredCard] = useState<number | null>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [musicItems, setMusicItems] = useState<MusicItem[]>([
    { id: 1, title: 'Bumble Bee', audioSrc: Music1, isPlaying: false },
    { id: 2, title: 'Chicken Dance', audioSrc: Music2, isPlaying: false },
    { id: 3, title: 'Pretty Little Baby', audioSrc: Music3, isPlaying: false },
    { id: 4, title: 'See Tinh', audioSrc: Music4, isPlaying: false },
  ]);

  const [filteredMusicItems, setFilteredMusicItems] = useState<MusicItem[]>(musicItems);

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

  const handleSearch = (query: string) => {
    const filtered = musicItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMusicItems(filtered);
  };

  useEffect(() => {
    setFilteredMusicItems(musicItems);
  }, [musicItems]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const togglePlay = (id: number) => {
    if (isDragging) return;

    setMusicItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const audioRef = audioRefs[id - 1].current;
          if (!item.isPlaying) {
            prevItems.forEach((otherItem, index) => {
              if (otherItem.id !== id && audioRefs[index].current) {
                audioRefs[index].current?.pause();
                audioRefs[index].current!.currentTime = 0;
              }
            });
            audioRef?.play().catch(error =>
              console.error('Audio playback failed:', error)
            );
          } else {
            audioRef?.pause();
          }
          return { ...item, isPlaying: !item.isPlaying };
        }
        return { ...item, isPlaying: false };
      })
    );

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

  const restartMusic = (id: number) => {
    const audioRef = audioRefs[id - 1].current;
    if (audioRef) {
      audioRef.currentTime = 0;
      if (musicItems.find(item => item.id === id)?.isPlaying) {
        audioRef.play().catch(error => console.error('Audio playback failed:', error));
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Musics</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="music-page-container">
  {/* Search Bar */}
  <div className="search-container">
    <ModelSearch onSearch={handleSearch} />
  </div>

  {/* Horizontal Scrolling Cards (Original Behavior) */}
  <div
    className="music-container"
    ref={containerRef}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleMouseUp}
  >
    <div className="music-grid">
      <div className="music-row">
        {filteredMusicItems.map((item) => (
          <div key={item.id} className="music-col">
            <div
              className={`music-card ${centeredCard === item.id ? 'snap-center' : ''} ${item.isPlaying ? 'playing' : ''}`}
              onClick={() => togglePlay(item.id)}
            >
              <img src={MusicImage} className="music-image" alt={item.title} />
              <IonCardHeader>
                <IonCardTitle>{item.title}</IonCardTitle>
              </IonCardHeader>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Player Controls (Fixed Below) */}
  <IonCard className="music-player-card">
    <IonGrid>
      <IonRow className="ion-justify-content-center ion-align-items-center ion-padding">
        <IonCol size="2"><MusicPassBackward /></IonCol>
        <IonCol size="2"><MusicRestartButton /></IonCol>
        <IonCol size="2"><MusicPlayButton /></IonCol>
        <IonCol size="2"><MusicPassforward /></IonCol>
        <IonCol size="2"><MusicRepeatButton /></IonCol>
      </IonRow>
      <IonRow className="ion-justify-content-center ion-padding-top">
        <IonCol size="6"><MusicPlayAll /></IonCol>
        <IonCol size="6"><MusicSpectrum /></IonCol>
      </IonRow>
    </IonGrid>
  </IonCard>
</IonContent>
    </IonPage>
  );
};

export default Musics;