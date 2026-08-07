import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

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
    <div class="min-h-screen flex items-center justify-center bg-noir-profond text-white p-4">
      <div class="max-w-md w-full bg-white text-gray-900 rounded-3xl p-8 shadow-2xl border border-gold-500/30">
        
        <!-- Branding Header -->
        <div class="text-center mb-8">
          <span class="p-3 rounded-2xl bg-gold-50 text-gold-600 inline-block mb-3 border border-gold-500/20">
            <span class="material-icons text-3xl">lock</span>
          </span>
          <h2 class="serif-header text-3xl font-extrabold text-gray-900">Harmy'sewing</h2>
          <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mt-1">Connexion Haute Couture</p>
        </div>

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
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onLogin() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.http.post<AuthResponse>('http://localhost:8080/api/v1/auth/login', {
      email: this.email,
      motDePasse: this.password
    }).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.loading.set(false);
        const role = res.user?.role;
        if (role === 'COUTURIERE') {
          this.router.navigate(['/atelier']);
        } else if (role === 'CLIENTE') {
          this.router.navigate(['/client']);
        } else {
          this.router.navigate(['/catalogue']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    });
  }
}
