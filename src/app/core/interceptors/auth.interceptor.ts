import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Attache le JWT à chaque appel vers le backend et centralise la
 * gestion de l'expiration de session.
 *
 * Règle importante : seul un 401 (jeton absent / invalide / expiré)
 * provoque une déconnexion. Un 403 signifie « connecté mais pas
 * autorisé » : on laisse l'écran afficher le message d'erreur au lieu
 * de détruire la session de l'utilisateur.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  let authReq = req;
  if (token && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url, expired: 1 }
        });
      }
      return throwError(() => error);
    })
  );
};
