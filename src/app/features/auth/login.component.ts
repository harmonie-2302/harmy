import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div class="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <h2 class="text-3xl font-extrabold text-amber-500 mb-6 text-center">Harmy'sewing</h2>
        <p class="text-gray-400 text-center mb-8">Connexion à votre espace couture</p>

        <form (ngSubmit)="onLogin()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Adresse Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition">
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50">
            {{ loading() ? 'Connexion...' : 'Se Connecter' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);

  onLogin() {
    this.loading.set(true);
    // Simulation token / API Call
    setTimeout(() => {
      this.authService.setToken('fake-jwt-token-for-demo');
      this.loading.set(false);
      this.router.navigate(['/atelier']);
    }, 1000);
  }
}
