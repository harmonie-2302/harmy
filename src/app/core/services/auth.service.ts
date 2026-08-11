import { Injectable, signal, computed } from '@angular/core';

export interface UserTokenPayload {
  id: string;
  email: string;
  role: 'COUTURIERE' | 'CLIENTE' | 'ADMIN';
  nom?: string;
  prenom?: string;
  atelierId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'harmy_jwt_token';

  // Signals pour l'état d'authentification réactif (Angular 17+)
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private currentUserSignal = signal<UserTokenPayload | null>(null);

  readonly token = computed(() => this.tokenSignal());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor() {
    if (this.getStoredToken()) {
      this.decodeAndSetUser(this.getStoredToken()!);
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
    this.decodeAndSetUser(token);
  }

  login(token: string): void {
    this.setToken(token);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private decodeAndSetUser(token: string): void {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }
        const decodedJson = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const rawPayload = JSON.parse(decodedJson);
        const user: UserTokenPayload = {
          id: rawPayload.id || rawPayload.userId,
          email: rawPayload.email || rawPayload.sub,
          role: rawPayload.role,
          nom: rawPayload.nom,
          prenom: rawPayload.prenom,
          atelierId: rawPayload.atelierId
        };
        this.currentUserSignal.set(user);
      }
    } catch (e) {
      console.warn('Impossible de décoder le token JWT:', e);
    }
  }
}
