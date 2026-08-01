import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApi } from './harmy-api';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auth-gate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 bg-white">
      <div class="w-full max-w-lg bg-white p-8 rounded-2xl custom-shadow-lg border border-mahogany-100 animate-fade-in">
        
        <!-- Luxury Branding -->
        <div class="text-center mb-8">
          <span class="inline-block p-3 rounded-full bg-mahogany-50 text-mahogany-500 mb-3">
            <span class="material-icons text-3xl">brush</span>
          </span>
          <h1 class="serif-header text-3xl font-bold text-mahogany-500 tracking-wide">Harmy'sewing</h1>
          <p class="text-xs text-gray-500 uppercase tracking-widest mt-1">Atelier & Haute Couture Africaine</p>
        </div>

        <!-- Quick Seeding Switchers -->
        <div class="mb-8 p-4 bg-mahogany-50/50 rounded-xl border border-mahogany-100">
          <h2 class="serif-header text-sm font-semibold text-mahogany-500 mb-3 text-center">
            Connexion Instantanée (Mode Démo)
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            @for (u of api.allUsers(); track u.id) {
              <button 
                (click)="quickConnect(u.id)"
                class="flex flex-col items-center p-3 rounded-lg border border-mahogany-200/60 bg-white hover:bg-mahogany-100 hover:border-mahogany-500 transition-all text-center">
                <img [src]="u.photoURL" class="w-10 h-10 rounded-full object-cover border border-mahogany-100 mb-1" referrerpolicy="no-referrer" alt="Profil">
                <span class="text-[11px] font-semibold text-gray-800 line-clamp-1">{{ u.displayName }}</span>
                <span class="text-[9px] uppercase tracking-wider text-amber-500 font-semibold" style="font-size: 8px;">
                  {{ u.role === 'seamstress' ? 'Couturière' : u.role === 'admin' ? 'Admin' : 'Cliente' }}
                </span>
              </button>
            }
          </div>
        </div>

        <div class="relative flex py-4 items-center mb-6">
          <div class="flex-grow border-t border-gray-100"></div>
          <span class="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">Ou créer un compte</span>
          <div class="flex-grow border-t border-gray-100"></div>
        </div>

        <!-- Registration Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="space-y-4">
            <div>
              <span class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Nom Complet</span>
              <input 
                formControlName="displayName"
                type="text" 
                placeholder="Ex. Fatoumata Coulibaly"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-sm">
              @if (registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched) {
                <p class="text-xs text-red-500 mt-1">Le nom complet est obligatoire.</p>
              }
            </div>

            <div>
              <span class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Adresse Email</span>
              <input 
                formControlName="email"
                type="email" 
                placeholder="Ex. fatoumata@gmail.com"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-sm">
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="text-xs text-red-500 mt-1">Veuillez entrer un email valide.</p>
              }
            </div>

            <div>
              <span class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Téléphone (WhatsApp)</span>
              <input 
                formControlName="phone"
                type="text" 
                placeholder="Ex. +221 77 123 45 67"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-sm">
            </div>

            <div>
              <span class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Choisir mon rôle (Irréversible)</span>
              <div class="grid grid-cols-2 gap-3">
                <label 
                  class="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-mahogany-50 transition-all"
                  [class.border-mahogany-500]="registerForm.get('role')?.value === 'seamstress'"
                  [class.bg-mahogany-50/50]="registerForm.get('role')?.value === 'seamstress'">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-mahogany-500">cut</span>
                    <div class="text-left">
                      <p class="text-xs font-bold text-gray-800">Couturière</p>
                      <p class="text-[9px] text-gray-400">Atelier, mesures & commandes</p>
                    </div>
                  </div>
                  <input type="radio" formControlName="role" value="seamstress" class="accent-mahogany-500">
                </label>

                <label 
                  class="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-mahogany-50 transition-all"
                  [class.border-mahogany-500]="registerForm.get('role')?.value === 'customer'"
                  [class.bg-mahogany-50/50]="registerForm.get('role')?.value === 'customer'">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-amber-500">accessibility</span>
                    <div class="text-left">
                      <p class="text-xs font-bold text-gray-800">Cliente</p>
                      <p class="text-[9px] text-gray-400">Mesures, inspirations & suivi</p>
                    </div>
                  </div>
                  <input type="radio" formControlName="role" value="customer" class="accent-mahogany-500">
                </label>
              </div>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs text-center border border-red-100">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit"
            [disabled]="registerForm.invalid"
            class="w-full mt-6 bg-mahogany-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-mahogany-600 active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Créer mon compte Harmy'sewing
          </button>
        </form>

      </div>
    </div>
  `
})
export class AuthGate {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['customer', Validators.required]
  });

  async quickConnect(userId: string) {
    this.errorMessage.set(null);
    try {
      const u = await this.api.switchUser(userId);
      this.redirectByRole(u.role);
    } catch {
      this.errorMessage.set('Erreur de connexion instantanée.');
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) return;
    this.errorMessage.set(null);

    const { displayName, email, role, phone } = this.registerForm.value;
    try {
      const u = await this.api.register(
        displayName || '',
        email || '',
        role as 'seamstress' | 'customer',
        phone || ''
      );
      this.redirectByRole(u.role);
    } catch (e: unknown) {
      const err = e as { error?: { error?: string } };
      this.errorMessage.set(err.error?.error || 'Erreur lors de la création du compte.');
    }
  }

  redirectByRole(role: string) {
    if (role === 'seamstress') {
      this.router.navigate(['/atelier']);
    } else if (role === 'customer') {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/admin']);
    }
  }
}
