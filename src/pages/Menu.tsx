import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/react'
import {prismOutline} from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import Hologram from './Hologram';
const Menu: React.FC = () => {
  const path = [
    { name: 'Hologram', url: '/hologram', icon: prismOutline},
  ]

  const glow = {
    animation: 'blink 2s infinite',
    filter: 'drop-shadow(0 0 8px white)',
  };

  const h1Style = {
    ...glow,
    animationDelay: '0.1s',
    color: 'skyblue',
  };
  const h2Style = {
    display: 'flex',
    color: 'skyblue',
    margin: '3%'
  };

  const h3Style = {
    display: 'flex',
    color: 'skyblue',
  };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle style={h1Style}>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {path.map((item, index) => (
            <IonMenuToggle key={index}>
              <IonItem style={h2Style} routerLink={item.url} routerDirection="forward">
                <IonIcon style={h1Style} icon={item.icon} slot="start"></IonIcon>
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
              <IonMenuButton  style={h1Style}></IonMenuButton>
            </IonButtons>
            <IonTitle style={h3Style}>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonRouterOutlet id="main">
            <Route exact path="/hologram" component={Hologram} />

            <Route exact path="/hologram">
              <Redirect to="/hologram" />
            </Route>
          </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Menu;