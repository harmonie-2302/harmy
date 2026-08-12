import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HarmyApiService } from '@core/services/harmy-api.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authService = inject(AuthService);
  api = inject(HarmyApiService);
  router = inject(Router);

  /** Ouverture du menu compte (desktop). */
  menuOpen = signal(false);

  constructor() {
    // Dès qu'une session existe, on récupère le profil réel depuis
    // PostgreSQL : l'en-tête n'affiche jamais autre chose que des
    // données renvoyées par le backend.
    effect(() => {
      if (this.authService.isAuthenticated() && !this.api.currentUser()) {
        this.api.getMe().catch(() => this.api.currentUser.set(null));
      }
    });
  }

  /** Nom affiché : profil backend en priorité, sinon contenu du JWT. */
  displayName = computed(() => {
    const profile = this.api.currentUser();
    if (profile) {
      return profile.displayName || `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim() || profile.email;
    }
    const token = this.authService.currentUser();
    if (!token) return '';
    return `${token.prenom ?? ''} ${token.nom ?? ''}`.trim() || token.email;
  });

  role = computed(() => this.api.currentUser()?.role ?? this.authService.currentUser()?.role ?? null);

  photoURL = computed(() => this.api.currentUser()?.photoURL || '');

  initials = computed(() => {
    const name = this.displayName();
    if (!name) return '?';
    return name
      .split(/[\s.@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  });

  /** Route d'espace personnel selon le rôle réel. */
  spaceLink = computed(() => {
    switch (this.role()) {
      case 'COUTURIERE':
        return { path: '/atelier', label: 'Mon Atelier', icon: 'cut' };
      case 'CLIENTE':
        return { path: '/client', label: 'Mon Espace', icon: 'straighten' };
      case 'ADMIN':
        return { path: '/admin', label: 'Administration', icon: 'admin_panel_settings' };
      default:
        return null;
    }
  });

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
    this.api.currentUser.set(null);
    this.api.allUsers.set([]);
    this.router.navigate(['/auth/login']);
  }
}
