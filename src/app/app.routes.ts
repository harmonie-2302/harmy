import {Routes} from '@angular/router';
import {SocialFeed} from './social-feed';
import {AtelierSuite} from './atelier-suite';
import {ClientSpace} from './client-space';
import {MessageCenter} from './message-center';
import {AdminPanel} from './admin-panel';
import {AuthGate} from './auth-gate';

export const routes: Routes = [
  { path: '', component: SocialFeed },
  { path: 'atelier', component: AtelierSuite },
  { path: 'client', component: ClientSpace },
  { path: 'chat', component: MessageCenter },
  { path: 'admin', component: AdminPanel },
  { path: 'auth', component: AuthGate },
  { path: '**', redirectTo: '' }
];
