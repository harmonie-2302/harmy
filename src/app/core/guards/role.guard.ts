import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export type AppRole = 'COUTURIERE' | 'CLIENTE' | 'ADMIN';

/**
 * Garde de rôle : exige un JWT valide **et** un rôle autorisé.
 * Utilisation : `canActivate: [roleGuard(['COUTURIERE'])]`.
 *
 * - Sans session : redirection vers /auth/login en conservant returnUrl.
 * - Session valide mais rôle non autorisé : redirection vers l'espace
 *   correspondant au rôle réel, jamais un écran vide.
 */
export const roleGuard = (allowed: AppRole[]): CanActivateFn => {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const role = authService.currentUser()?.role;
    if (role && allowed.includes(role)) {
      return true;
    }

    router.navigate([homeForRole(role)]);
    return false;
  };
};

/** Écran d'accueil naturel d'un rôle donné. */
export const homeForRole = (role?: string | null): string => {
  switch (role) {
    case 'COUTURIERE':
      return '/atelier';
    case 'CLIENTE':
      return '/client';
    case 'ADMIN':
      return '/admin';
    default:
      return '/catalogue';
  }
};
