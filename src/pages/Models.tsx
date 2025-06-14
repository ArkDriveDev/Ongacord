import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModelSearch from '../components/ModelsProps/ModelSearch';

interface ImageData {
  id: number;
  name: string;
  src: string;
}

const APP_IMAGES = [
  { filename: 'Orb1.gif', name: 'Orb 1' },
  { filename: 'Orb2.gif', name: 'Orb 2' },
  { filename: 'Orb3.gif', name: 'Orb 3' },
  { filename: 'Orb4.gif', name: 'Orb 4' },
  { filename: 'JellyFish1.gif', name: 'Jelly Fish 1' },
  { filename: 'JellyFish2.gif', name: 'Jelly Fish 2' },
  { filename: 'JellyFish3.gif', name: 'Jelly Fish 3' },
  { filename: 'JellyFish4.gif', name: 'Jelly Fish 4' },
];

const Models: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          APP_IMAGES.map(async (img, index) => ({
            id: index + 1,
            name: img.name,
            src: (await import(`../images/${img.filename}`)).default
          }))
        );
        setImages(loadedImages);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    loadImages();
  }, []);

  const handleModelClick = (model: ImageData) => {
    history.push({
      pathname: '/hologram',
      state: { model }
    });
  };

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>3D Models</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <ModelSearch onSearch={setSearchQuery} />
        
        <IonGrid style={{ paddingTop: '20px' }}>
          {filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No models found</h3>
            </div>
          ) : (
            Array.from({ length: Math.ceil(filteredImages.length / 4) }).map((_, rowIndex) => (
              <IonRow key={rowIndex}>
                {filteredImages.slice(rowIndex * 4, rowIndex * 4 + 4).map((image) => (
                  <IonCol size="6" size-md="3" key={image.id}>
                    <IonCard 
                      button 
                      onClick={() => handleModelClick(image)}
                      style={{ 
                        height: '100%',
                        margin: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <IonCardContent style={{ textAlign: 'center' }}>
                        <IonImg 
                          src={image.src} 
                          alt={image.name}
                          style={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'contain',
                            padding: '10px'
                          }}
                        />
                        <h3 style={{ 
                          margin: '10px 0 5px',
                          fontSize: '1rem',
                          color: '#333'
                        }}>{image.name}</h3>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            ))
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Models;