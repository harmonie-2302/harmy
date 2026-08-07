import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-gate.component').then(m => m.AuthGateComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/catalogue/social-feed.component').then(m => m.SocialFeedComponent)
  },
  {
    path: 'catalogue',
    loadComponent: () => import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent)
  },
  {
    path: 'kente',
    loadComponent: () => import('./features/catalogue/kente-inspirations.component').then(m => m.KenteInspirationsComponent)
  },
  {
    path: 'atelier',
    loadComponent: () => import('./features/atelier/atelier-suite.component').then(m => m.AtelierSuiteComponent)
  },
  {
    path: 'atelier/kanban',
    canActivate: [authGuard],
    loadComponent: () => import('./features/atelier/atelier-kanban.component').then(m => m.AtelierKanbanComponent)
  },
  {
    path: 'client',
    loadComponent: () => import('./features/client/client-space.component').then(m => m.ClientSpaceComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/messagerie/message-center.component').then(m => m.MessageCenterComponent)
  },
  {
    path: 'messagerie',
    canActivate: [authGuard],
    loadComponent: () => import('./features/messagerie/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent)
  },
  {
    path: '**',
    redirectTo: 'feed'
  }
];
