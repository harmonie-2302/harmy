import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auth-gate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 bg-white py-12">
      <div class="w-full max-w-lg bg-white p-8 rounded-3xl custom-shadow-lg border border-gold-500/20 animate-fade-in">
        
        <!-- Luxury Branding -->
        <div class="text-center mb-8">
          <span class="inline-block p-3.5 rounded-2xl bg-gold-50 text-gold-600 mb-3 border border-gold-500/20">
            <span class="material-icons text-3xl">brush</span>
          </span>
          <h1 class="serif-header text-3xl font-bold text-gray-900 tracking-wide">Harmy'Swing</h1>
          <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mt-1">Création de Compte Atelier & Cliente</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-6 p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs text-center border border-red-200 font-medium">
            {{ errorMessage() }}
          </div>
        }

        <!-- Registration Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="space-y-4">
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Prénom</label>
                <input 
                  formControlName="prenom"
                  type="text" 
                  placeholder="Ex. Fatoumata"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gold-500 text-xs">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nom</label>
                <input 
                  formControlName="nom"
                  type="text" 
                  placeholder="Ex. Diallo"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gold-500 text-xs">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Adresse Email</label>
              <input 
                formControlName="email"
                type="email" 
                placeholder="Ex. fatoumata@harmysewing.com"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gold-500 text-xs">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mot de passe</label>
              <input 
                formControlName="motDePasse"
                type="password" 
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gold-500 text-xs">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Téléphone</label>
              <input 
                formControlName="telephone"
                type="text" 
                placeholder="Ex. +243 81 123 4567"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gold-500 text-xs">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Sélectionner votre Rôle</label>
              <div class="grid grid-cols-2 gap-3">
                <label 
                  class="flex items-center justify-between p-4 border rounded-2xl cursor-pointer hover:bg-gold-50/50 transition-all"
                  [class.border-gold-500]="registerForm.get('role')?.value === 'COUTURIERE'"
                  [class.bg-gold-50/60]="registerForm.get('role')?.value === 'COUTURIERE'">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-gold-600">cut</span>
                    <div class="text-left">
                      <p class="text-xs font-bold text-gray-900">Couturière</p>
                      <p class="text-[9px] text-gray-500">Atelier & Commandes</p>
                    </div>
                  </div>
                  <input type="radio" formControlName="role" value="COUTURIERE" class="accent-gold-500">
                </label>

                <label 
                  class="flex items-center justify-between p-4 border rounded-2xl cursor-pointer hover:bg-gold-50/50 transition-all"
                  [class.border-gold-500]="registerForm.get('role')?.value === 'CLIENTE'"
                  [class.bg-gold-50/60]="registerForm.get('role')?.value === 'CLIENTE'">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-bordeaux-800">accessibility</span>
                    <div class="text-left">
                      <p class="text-xs font-bold text-gray-900">Cliente</p>
                      <p class="text-[9px] text-gray-500">Mesures & Suivi</p>
                    </div>
                  </div>
                  <input type="radio" formControlName="role" value="CLIENTE" class="accent-gold-500">
                </label>
              </div>
            </div>

          </div>

          <button 
            type="submit"
            [disabled]="registerForm.invalid || loading()"
            class="btn-gold w-full mt-6 py-3.5 text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            @if (loading()) {
              <span class="material-icons animate-spin text-sm">sync</span> Inscription en cours...
            } @else {
              <span class="material-icons text-sm">person_add</span> Créer mon compte Harmy'sewing
            }
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500 font-light">
            Déjà inscrit ? 
            <a routerLink="/auth/login" class="text-gold-700 font-bold hover:underline ml-1">Se connecter</a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class AuthGateComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  registerForm = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    telephone: [''],
    role: ['CLIENTE', Validators.required]
  });

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.post<AuthResponse>('http://localhost:8080/api/v1/auth/register', this.registerForm.value).subscribe({
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
        this.errorMessage.set(err.error?.message || 'Erreur lors de la création du compte.');
      }
    });
  }
}
