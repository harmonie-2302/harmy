import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { HarmyApiService } from '@core/services/harmy-api.service';
import { API_BASE_URL } from '@core/config/api.config';
import { homeForRole } from '@core/guards/role.guard';

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    role: 'COUTURIERE' | 'CLIENTE' | 'ADMIN';
    nom: string;
    prenom: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex items-center justify-center bg-noir-profond text-white px-3 sm:px-4 py-6 sm:py-12 w-full overflow-x-clip" style="min-height: 100vh; min-height: 100dvh;">
      <div class="max-w-md w-full bg-white text-gray-900 rounded-3xl p-4 sm:p-8 shadow-2xl border border-gold-500/30 box-border animate-fade-in">
        
        <!-- Branding Header -->
        <div class="text-center mb-8">
          <span class="p-3 rounded-2xl bg-gold-50 text-gold-600 inline-block mb-3 border border-gold-500/20">
            <span class="material-icons text-3xl">lock</span>
          </span>
          <h2 class="serif-header text-3xl font-extrabold text-gray-900">Harmy'Swing</h2>
          <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mt-1">Connexion Haute Couture</p>
        </div>

        @if (sessionExpired() && !error()) {
          <div class="mb-6 p-3.5 bg-gold-50 text-gold-800 rounded-2xl text-xs border border-gold-500/30 text-center font-medium">
            Votre session a expiré. Merci de vous reconnecter.
          </div>
        }

        @if (error()) {
          <div class="mb-6 p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs border border-red-200 text-center font-medium">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onLogin()" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Adresse Email</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required
              placeholder="ex. couturiere@harmysewing.com"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:border-gold-500 transition">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mot de passe</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:border-gold-500 transition">
          </div>

          <button 
            type="submit" 
            [disabled]="loading() || !email || !password"
            class="btn-gold w-full py-3.5 text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            @if (loading()) {
              <span class="material-icons animate-spin text-sm">sync</span> Connexion en cours...
            } @else {
              <span class="material-icons text-sm">login</span> Se Connecter
            }
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500 font-light">
            Pas encore de compte ? 
            <a routerLink="/auth" class="text-gold-700 font-bold hover:underline ml-1">S'inscrire</a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private api = inject(HarmyApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  /** Renseigné par l'intercepteur quand le jeton a expiré (401). */
  sessionExpired = signal(this.route.snapshot.queryParamMap.get('expired') === '1');

  onLogin() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.sessionExpired.set(false);

    this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
      email: this.email,
      motDePasse: this.password
    }).subscribe({
      next: async (res) => {
        this.authService.setToken(res.token);

        // Profil réel récupéré immédiatement : aucune donnée locale inventée.
        let role = res.user?.role ?? this.authService.currentUser()?.role;
        try {
          const me = await this.api.getMe();
          role = me.role;
        } catch {
          // Le rôle du JWT suffit pour orienter la navigation.
        }

        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || homeForRole(role));
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    });
  }
}
