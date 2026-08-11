import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Order, MeasureBook, Atelier } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-client-space',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle">
      
      <!-- Guard Banner (If Not Authenticated) -->
      @if (!authService.isAuthenticated()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 border border-gold-500/30">
            <span class="material-icons text-4xl">face</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Espace Personnel Cliente</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Cet espace vous permet de configurer votre carnet de mesures et de suivre en temps réel la confection de vos vêtements.
          </p>
          <button 
            (click)="router.navigate(['/auth/login'])"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter à votre espace
          </button>
        </div>
      } @else {

        <!-- Client Space Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gold-500/20">
          <div>
            <h1 class="serif-header text-2xl sm:text-3xl font-extrabold text-gray-900">
              Mon Espace Créations & Mesures
            </h1>
            <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mt-1">
              Suivi de couture et partage de mensurations numériques
            </p>
          </div>
          <div class="flex gap-2.5 flex-wrap">
            <button 
              (click)="activeTab.set('measurements')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'measurements' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">accessibility</span> Mon Carnet de Mesures
            </button>
            <button 
              (click)="activeTab.set('tracking')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'tracking' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">local_shipping</span> Mes Confections & Suivi
            </button>
          </div>
        </div>

        <!-- TAB CONTENT: MY MEASUREMENTS & SHARING -->
        @if (activeTab() === 'measurements') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            <!-- Left 2 Cols: Form -->
            <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow">
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 class="serif-header text-xl font-bold text-gray-900">Mon Carnet de Mesures Privé</h2>
                  <p class="text-xs text-gray-500 font-light mt-0.5">Vos dimensions sauvegardées (en Centimètres)</p>
                </div>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span class="material-icons text-xs">lock</span> 100% Chiffré & Contrôlé
                </span>
              </div>

              <form [formGroup]="measureForm" (ngSubmit)="saveMeasurements()">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  
                  <div class="bg-pagne-subtle p-4 rounded-2xl border border-gray-100">
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tour de Poitrine (Bust)</label>
                    <div class="relative">
                      <input type="number" formControlName="bust" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-gold-500">
                      <span class="absolute right-3 top-3 text-xs text-gray-400 font-bold">cm</span>
                    </div>
                  </div>

                  <div class="bg-pagne-subtle p-4 rounded-2xl border border-gray-100">
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tour de Taille (Waist)</label>
                    <div class="relative">
                      <input type="number" formControlName="waist" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-gold-500">
                      <span class="absolute right-3 top-3 text-xs text-gray-400 font-bold">cm</span>
                    </div>
                  </div>

                  <div class="bg-pagne-subtle p-4 rounded-2xl border border-gray-100">
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tour de Bassin / Hanches (Hips)</label>
                    <div class="relative">
                      <input type="number" formControlName="hips" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-gold-500">
                      <span class="absolute right-3 top-3 text-xs text-gray-400 font-bold">cm</span>
                    </div>
                  </div>

                  <div class="bg-pagne-subtle p-4 rounded-2xl border border-gray-100">
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Longueur des Bras (Arm)</label>
                    <div class="relative">
                      <input type="number" formControlName="arm" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-gold-500">
                      <span class="absolute right-3 top-3 text-xs text-gray-400 font-bold">cm</span>
                    </div>
                  </div>

                </div>

                <div class="flex justify-end">
                  <button type="submit" class="btn-gold px-6 py-3 text-xs font-bold shadow-md flex items-center gap-2">
                    <span class="material-icons text-sm">save</span> Enregistrer mes Mesures
                  </button>
                </div>
              </form>
            </div>

            <!-- Right Col: Sharing Permissions -->
            <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow">
              <h3 class="serif-header text-lg font-bold text-gray-900 mb-1">Autorisations de Partage</h3>
              <p class="text-xs text-gray-500 font-light mb-6">Accordez ou révoquez l'accès direct de vos mesures aux maisons de couture partenaires.</p>

              <div class="space-y-4">
                @for (a of ateliers(); track a.id) {
                  <div class="p-3.5 rounded-2xl border border-gray-100 bg-pagne-subtle/30 flex items-center justify-between">
                    <div>
                      <h4 class="font-bold text-xs text-gray-900">{{ a.name }}</h4>
                      <p class="text-[10px] text-gray-500 font-light">{{ a.location?.city }}, {{ a.location?.country }}</p>
                    </div>

                    @if (isSharingWith(a)) {
                      <button 
                        (click)="toggleShareAccess(a, false)"
                        class="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-500/20 hover:bg-red-100 hover:text-red-700 hover:border-red-500/20 transition-all flex items-center gap-1">
                        <span class="material-icons text-xs">check_circle</span> Accès Autorisé
                      </button>
                    } @else {
                      <button 
                        (click)="toggleShareAccess(a, true)"
                        class="btn-black px-3 py-1.5 text-[10px] font-bold">
                        Partager
                      </button>
                    }
                  </div>
                }
                @if (ateliers().length === 0) {
                  <p class="text-xs text-gray-400 italic text-center py-4">Aucun atelier partenaire enregistré.</p>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB CONTENT: TRACKING ORDERS -->
        @if (activeTab() === 'tracking') {
          <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow mb-8">
            <h2 class="serif-header text-xl font-bold text-gray-900 mb-2">Suivi de mes Confections en Temps Réel</h2>
            <p class="text-xs text-gray-500 font-light mb-6">Suivez le statut de confection de vos tenues étape par étape.</p>

            <div class="space-y-6">
              @for (o of myOrders(); track o.id) {
                <div class="p-5 rounded-2xl border border-gold-500/20 bg-pagne-subtle/30 space-y-4">
                  <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span class="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-500/20">
                        Commande #{{ o.id.substring(0,6) }}
                      </span>
                      <h3 class="font-bold text-gray-900 text-sm mt-1">{{ o.reference || 'Confection sur mesure' }}</h3>
                    </div>
                    <span [class]="'text-xs font-bold px-3 py-1 rounded-full border ' + statusBadgeStyle(o.status || o.statut || '')">
                      {{ statusLabel(o.status || o.statut || '') }}
                    </span>
                  </div>

                  <!-- Timeline Progress Bar -->
                  <div class="relative py-4">
                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div [class]="'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ' + statusColor(o.status || o.statut || '')"
                           [style.width]="(o.status || o.statut) === 'TISSU_RECU' ? '25%' : (o.status || o.statut) === 'EN_COUTURE' ? '50%' : (o.status || o.statut) === 'PRET_POUR_ESSAYAGE' ? '75%' : '100%'">
                      </div>
                    </div>

                    <div class="grid grid-cols-4 text-center text-[10px] font-bold text-gray-500">
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'TISSU_RECU')">1. Tissu Reçu</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'EN_COUTURE')">2. En Couture</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'PRET_POUR_ESSAYAGE')">3. Prêt Essayage</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'LIVRE')">4. Livré</div>
                    </div>
                  </div>

                  <!-- Payment Summary -->
                  <div class="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                    <span class="text-gray-500 font-light">Total: <strong class="text-gray-900 font-bold">{{ o.pricing?.total || 0 }} {{ o.pricing?.currency || 'FC' }}</strong></span>
                    <span class="text-emerald-700 font-bold">Acompte: {{ o.pricing?.deposit || 0 }} {{ o.pricing?.currency || 'FC' }}</span>
                    <span [class]="(o.pricing?.balance || 0) > 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'">
                      Solde Restant: {{ o.pricing?.balance || 0 }} {{ o.pricing?.currency || 'FC' }}
                    </span>
                  </div>
                </div>
              }
              @if (myOrders().length === 0) {
                <div class="py-8 text-center text-xs text-gray-400 italic">
                  Aucune commande enregistrée pour votre compte.
                </div>
              }
            </div>
          </div>
        }

      }
    </div>
  `
})
export class ClientSpaceComponent implements OnInit {
  api = inject(HarmyApi);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  activeTab = signal<'measurements' | 'tracking'>('measurements');

  myOrders = signal<Order[]>([]);
  measureBook = signal<MeasureBook | null>(null);
  ateliers = signal<Atelier[]>([]);

  measureForm = this.fb.group({
    bust: [90, [Validators.required, Validators.min(0)]],
    waist: [70, [Validators.required, Validators.min(0)]],
    hips: [100, [Validators.required, Validators.min(0)]],
    arm: [30, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadAllData();
    }
  }

  async loadAllData() {
    try {
      const [orders, book, atList] = await Promise.all([
        this.api.getOrders(),
        this.api.getMyMeasureBook(),
        this.api.getAteliers()
      ]);
      this.myOrders.set(orders || []);
      this.measureBook.set(book || null);
      this.ateliers.set(atList || []);

      if (book && book.measurements) {
        this.measureForm.patchValue({
          bust: book.measurements.bust || 90,
          waist: book.measurements.waist || 70,
          hips: book.measurements.hips || 100,
          arm: book.measurements.arm || 30
        });
      }
    } catch (e) {
      console.error('Erreur chargement données cliente:', e);
    }
  }

  isSharingWith(atelier: Atelier): boolean {
    const book = this.measureBook();
    if (!book || !book.shares) return false;
    const targetId = atelier.couturiereId || atelier.ownerId || atelier.id;
    return book.shares.includes(targetId) || book.shares.includes(atelier.id);
  }

  async toggleShareAccess(atelier: Atelier, grant: boolean) {
    try {
      const targetId = atelier.couturiereId || atelier.ownerId || atelier.id;
      const updatedBook = await this.api.toggleShare(targetId, grant);
      this.measureBook.set(updatedBook);
    } catch (e) {
      console.error(e);
    }
  }

  async saveMeasurements() {
    if (this.measureForm.invalid) return;
    const { bust, waist, hips, arm } = this.measureForm.value;

    const measurements = {
      bust: Number(bust) || 0,
      waist: Number(waist) || 0,
      hips: Number(hips) || 0,
      arm: Number(arm) || 0
    };

    try {
      const updated = await this.api.updateMyMeasureBook(measurements);
      this.measureBook.set(updated);
      alert("Vos dimensions corporelles ont été enregistrées avec succès dans la base de données !");
    } catch (e) {
      console.error(e);
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'TISSU_RECU': return 'Tissu Reçu';
      case 'EN_COUTURE': return 'En Couture';
      case 'PRET_POUR_ESSAYAGE': return 'Prêt pour Essayage';
      case 'LIVRE': return 'Livré';
      default: return status;
    }
  }

  statusBadgeStyle(status: string): string {
    switch (status) {
      case 'TISSU_RECU': return 'bg-blue-100 text-blue-700';
      case 'EN_COUTURE': return 'bg-orange-100 text-orange-700';
      case 'PRET_POUR_ESSAYAGE': return 'bg-purple-100 text-purple-700';
      case 'LIVRE': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  statusColor(status: string): string {
    switch (status) {
      case 'TISSU_RECU': return 'bg-blue-400';
      case 'EN_COUTURE': return 'bg-orange-400';
      case 'PRET_POUR_ESSAYAGE': return 'bg-purple-400';
      case 'LIVRE': return 'bg-emerald-400';
      default: return 'bg-gray-400';
    }
  }

  isPastOrEqual(orderStatus: string, step: string): boolean {
    const sequence = ['TISSU_RECU', 'EN_COUTURE', 'PRET_POUR_ESSAYAGE', 'LIVRE'];
    return sequence.indexOf(orderStatus) >= sequence.indexOf(step);
  }
}
