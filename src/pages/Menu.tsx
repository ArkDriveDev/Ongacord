import {
  IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonMenu, IonMenuButton, IonMenuToggle, IonPage, IonTitle, IonToolbar,
  IonRouterOutlet
} from '@ionic/react';
import { prismOutline, cubeOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Hologram from './Hologram';
import Models from './Models';

const Menu: React.FC = () => {
  const glow = { animation: 'blink 2s infinite', filter: 'drop-shadow(0 0 8px white)' };

  const menuItems = [
    { name: 'Hologram', url: '/hologram', icon: prismOutline },
    { name: 'Models', url: '/models', icon: cubeOutline }
  ];

  const h1Style = { ...glow, color: 'skyblue' };
  const h2Style = { color: 'skyblue', margin: '3%' };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle style={h1Style}>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {menuItems.map((item, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem 
                routerLink={item.url} 
                routerDirection="none"
                style={h2Style}
              >
                <IonIcon icon={item.icon} slot="start" style={glow} />
                {item.name}
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton style={h1Style} />
            </IonButtons>
            <IonTitle style={{ color: 'skyblue' }}>Hologram App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonRouterOutlet>
          <Route path="/hologram" component={Hologram} exact />
          <Route path="/models" component={Models} exact />
          <Redirect exact from="/" to="/hologram" />
        </IonRouterOutlet>
      </IonPage>
    </>
  );
};

export default Menu;