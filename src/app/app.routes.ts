import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Public ---
  {
    path: '',
    title: "Harmy'Swing — Haute couture & ateliers",
    loadComponent: () => import('./features/home/landing-home.component').then(m => m.LandingHomeComponent)
  },
  {
    path: 'auth',
    title: "Créer un compte — Harmy'Swing",
    loadComponent: () => import('./features/auth/auth-gate.component').then(m => m.AuthGateComponent)
  },
  {
    path: 'auth/login',
    title: "Connexion — Harmy'Swing",
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    // Feed social : consultation libre, interactions réservées aux comptes connectés.
    path: 'catalogue',
    title: "Catalogue — Harmy'Swing",
    loadComponent: () => import('./features/catalogue/social-feed.component').then(m => m.SocialFeedComponent)
  },
  { path: 'feed', redirectTo: 'catalogue', pathMatch: 'full' },

  // --- Compte (tous rôles) ---
  {
    path: 'profil',
    canActivate: [authGuard],
    title: "Mon profil — Harmy'Swing",
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'messagerie',
    canActivate: [authGuard],
    title: "Messagerie — Harmy'Swing",
    loadComponent: () => import('./features/messagerie/message-center.component').then(m => m.MessageCenterComponent)
  },

  // --- Espace couturière ---
  {
    path: 'atelier/kanban',
    canActivate: [roleGuard(['COUTURIERE'])],
    title: "Tableau de production — Harmy'Swing",
    loadComponent: () => import('./features/atelier/atelier-kanban.component').then(m => m.AtelierKanbanComponent)
  },
  {
    path: 'atelier',
    canActivate: [roleGuard(['COUTURIERE'])],
    title: "Mon atelier — Harmy'Swing",
    loadComponent: () => import('./features/atelier/atelier-suite.component').then(m => m.AtelierSuiteComponent)
  },

  // --- Espace cliente ---
  {
    path: 'client',
    canActivate: [roleGuard(['CLIENTE'])],
    title: "Mon espace — Harmy'Swing",
    loadComponent: () => import('./features/client/client-space.component').then(m => m.ClientSpaceComponent)
  },

  // --- Administration ---
  {
    path: 'admin',
    canActivate: [roleGuard(['ADMIN'])],
    title: "Administration — Harmy'Swing",
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent)
  },

  { path: '**', redirectTo: '' }
];
