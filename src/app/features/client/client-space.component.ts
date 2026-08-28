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
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle min-h-screen">
      
      <!-- Guard Banner (If Not Authenticated) -->
      @if (!authService.isAuthenticated()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 border border-gold-500/30">
            <span class="material-icons text-4xl">face</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Espace Cliente Harmy'Swing</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Connectez-vous à votre compte cliente pour gérer votre carnet de mesures, autoriser vos ateliers favoris et suivre vos confections en direct.
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
              Harmy'Swing — Carnet de mensurations & suivi de confections
            </p>
          </div>
          <div class="flex gap-2.5 flex-wrap">
            <button 
              (click)="openOrderModal.set(true)"
              class="btn-gold px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer">
              <span class="material-icons text-sm">add_shopping_cart</span> Commander une Confection
            </button>
            <button 
              (click)="activeTab.set('measurements')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'measurements' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">accessibility</span> Carnet de Mesures
            </button>
            <button 
              (click)="activeTab.set('tracking')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'tracking' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">local_shipping</span> Mes Confections ({{ myOrders().length }})
            </button>
          </div>
        </div>

        <!-- TAB CONTENT: MY MEASUREMENTS & SHARING -->
        @if (activeTab() === 'measurements') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            <!-- Left 2 Cols: Form -->
            <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div class="min-w-0">
                  <h2 class="serif-header text-xl font-bold text-gray-900">Mon Carnet de Mesures Privé</h2>
                  <p class="text-xs text-gray-500 font-light mt-0.5">Vos mensurations de haute couture (en Centimètres)</p>
                </div>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span class="material-icons text-xs">lock</span> Accès Sécurisé
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
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tour de Hanches (Hips)</label>
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

            <!-- Right Col: Sharing & Reviews Permissions -->
            <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow flex flex-col justify-between">
              <div>
                <h3 class="serif-header text-lg font-bold text-gray-900 mb-1">Maisons de Couture Partenaires</h3>
                <p class="text-xs text-gray-500 font-light mb-6">Autorisez l'accès à votre carnet de mesures et déposez un avis après vos confections.</p>

                <div class="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  @for (a of ateliers(); track a.id) {
                    <div class="p-3.5 rounded-2xl border border-gray-100 bg-pagne-subtle/30 space-y-2">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="min-w-0">
                          <h4 class="font-bold text-xs text-gray-900 break-words">{{ a.name }}</h4>
                          <p class="text-[10px] text-gray-500 font-light">{{ a.location.city }}, {{ a.location.country }}</p>
                        </div>

                        @if (isSharingWith(a)) {
                          <button 
                            (click)="toggleShareAccess(a, false)"
                            class="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-500/20 hover:bg-red-100 hover:text-red-700 hover:border-red-500/20 transition-all flex items-center justify-center gap-1">
                            <span class="material-icons text-xs">check_circle</span> Accès Autorisé
                          </button>
                        } @else {
                          <button 
                            (click)="toggleShareAccess(a, true)"
                            class="w-full sm:w-auto btn-black px-3 py-1.5 text-[10px] font-bold">
                            Partager Mesures
                          </button>
                        }
                      </div>

                      <div class="flex justify-end pt-1 border-t border-gray-100 gap-3">
                        <button
                          (click)="contactAtelier(a)"
                          class="text-[10px] font-bold text-gold-700 hover:text-gold-800 flex items-center gap-1">
                          <span class="material-icons text-xs text-gold-600">chat</span> Envoyer un message au couturier
                        </button>
                        <button 
                          (click)="openReviewForAtelier(a)"
                          class="text-[10px] font-bold text-gray-600 hover:text-gold-800 flex items-center gap-1">
                          <span class="material-icons text-xs text-gold-500">star</span> Laisser un avis
                        </button>
                      </div>
                    </div>
                  }
                  @if (ateliers().length === 0) {
                    <p class="text-xs text-gray-400 italic text-center py-4">Aucun atelier partenaire enregistré.</p>
                  }
                </div>
              </div>
            </div>

          </div>
        }

        <!-- TAB CONTENT: TRACKING ORDERS -->
        @if (activeTab() === 'tracking') {
          <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 class="serif-header text-xl font-bold text-gray-900 mb-1">Suivi de mes Confections en Temps Réel</h2>
                <p class="text-xs text-gray-500 font-light">Statut d'avancement étape par étape de vos tenues sur mesure.</p>
              </div>
              <button (click)="openOrderModal.set(true)" class="btn-gold px-4 py-2 text-xs font-bold shadow flex items-center gap-1">
                <span class="material-icons text-sm">add</span> Nouvelle Commande
              </button>
            </div>

            <div class="space-y-6">
              @for (o of myOrders(); track o.id) {
                <div class="p-5 rounded-2xl border border-gold-500/20 bg-pagne-subtle/30 space-y-4">
                  <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span class="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-500/20">
                        Commande #{{ o.id.substring(0,8) }}
                      </span>
                      <h3 class="font-bold text-gray-900 text-sm mt-1">{{ o.reference || o.modelCaption || 'Confection sur mesure' }}</h3>
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

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-2 text-center text-[10px] font-bold text-gray-500">
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'TISSU_RECU')">1. Tissu Reçu</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'EN_COUTURE')">2. En Couture</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'PRET_POUR_ESSAYAGE')">3. Prêt Essayage</div>
                      <div [class.text-gold-700]="isPastOrEqual(o.status || o.statut || '', 'LIVRE')">4. Livré</div>
                    </div>
                  </div>

                  <!-- Payment Summary -->
                  <div class="bg-white p-3.5 rounded-xl border border-gray-100 flex flex-wrap justify-between items-center text-xs gap-2">
                    <span class="text-gray-500 font-light">Total: <strong class="text-gray-900 font-bold">{{ o.pricing?.total || o.prixTotal || 0 | number }} FC</strong></span>
                    <span class="text-emerald-700 font-bold">Acompte: {{ o.pricing?.deposit || o.acompteVerse || 0 | number }} FC</span>
                    <span [class]="(o.pricing?.balance ?? o.soldeRestant ?? 0) > 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'">
                      Solde Restant: {{ o.pricing?.balance ?? o.soldeRestant ?? 0 | number }} FC
                    </span>
                  </div>

                  <div class="flex justify-end pt-2">
                    <button 
                      (click)="contactAtelierByOrder(o)"
                      class="btn-gold px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <span class="material-icons text-[12px]">chat</span> Envoyer un message au couturier
                    </button>
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

        <!-- MODAL 1: DEMANDE DE CONFECTION SUR MESURE -->
        @if (openOrderModal()) {
          <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div class="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 border border-gold-500/40 shadow-2xl relative">
              <button (click)="openOrderModal.set(false)" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <span class="material-icons text-xl">close</span>
              </button>

              <h2 class="serif-header text-xl font-bold text-gray-900 mb-1">Nouvelle Commande sur Mesure</h2>
              <p class="text-xs text-gray-500 font-light mb-6">Confiez votre projet de tenue à l'un des ateliers partenaires Harmy'Swing.</p>

              <form [formGroup]="orderForm" (ngSubmit)="createOrderSubmit()">
                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Choisir la Maison de Couture</label>
                    <select formControlName="atelierId" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gold-500">
                      <option value="">Sélectionner un atelier...</option>
                      @for (a of ateliers(); track a.id) {
                        <option [value]="a.id">{{ a.name }} ({{ a.location.city }})</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Modèle de Tenue</label>
                    <input type="text" formControlName="modelCaption" placeholder="Ex. Robe sirène en Pagne Wax avec broderies d'or" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gold-500">
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Budget Total (FC)</label>
                      <input type="number" formControlName="total" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gold-500">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Acompte Proposé (FC)</label>
                      <input type="number" formControlName="deposit" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gold-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Date d'Essayage / Livraison Souhaitée</label>
                    <input type="date" formControlName="dueDate" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gold-500">
                  </div>
                </div>

                <div class="flex justify-end gap-3">
                  <button type="button" (click)="openOrderModal.set(false)" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
                  <button type="submit" class="btn-gold px-5 py-2 text-xs font-bold shadow-md">Envoyer la Commande</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- MODAL 2: AVIS & EVALUATION ATELIER -->
        @if (openReviewModal() && selectedAtelier()) {
          <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div class="bg-white rounded-3xl max-w-md w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 border border-gold-500/40 shadow-2xl relative">
              <button (click)="openReviewModal.set(false)" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <span class="material-icons text-xl">close</span>
              </button>

              <h2 class="serif-header text-xl font-bold text-gray-900 mb-1 pr-10 break-words">Évaluer {{ selectedAtelier()?.name }}</h2>
              <p class="text-xs text-gray-500 font-light mb-6">Partagez votre expérience de couture avec la communauté Harmy'Swing.</p>

              <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Note de Satisfaction</label>
                    <div class="flex items-center gap-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button 
                          type="button" 
                          (click)="reviewForm.patchValue({ rating: star })"
                          class="text-2xl transition transform hover:scale-110"
                          [class.text-gold-500]="(reviewForm.value.rating ?? 5) >= star"
                          [class.text-gray-300]="(reviewForm.value.rating ?? 5) < star">
                          ★
                        </button>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Votre Commentaire</label>
                    <textarea formControlName="text" rows="4" placeholder="Qualité des finitions, respect des délais, accueil..." class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gold-500"></textarea>
                  </div>
                </div>

                <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button type="button" (click)="openReviewModal.set(false)" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
                  <button type="submit" class="btn-gold px-5 py-2 text-xs font-bold shadow-md">Publier l'Avis</button>
                </div>
              </form>
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

  openOrderModal = signal(false);
  openReviewModal = signal(false);
  selectedAtelier = signal<Atelier | null>(null);

  measureForm = this.fb.group({
    bust: [90, [Validators.required, Validators.min(0)]],
    waist: [70, [Validators.required, Validators.min(0)]],
    hips: [100, [Validators.required, Validators.min(0)]],
    arm: [30, [Validators.required, Validators.min(0)]]
  });

  orderForm = this.fb.group({
    atelierId: ['', Validators.required],
    modelCaption: ['', Validators.required],
    total: [150000, [Validators.required, Validators.min(1)]],
    deposit: [50000, [Validators.required, Validators.min(0)]],
    dueDate: ['']
  });

  reviewForm = this.fb.group({
    rating: [5, Validators.required],
    text: ['', [Validators.required, Validators.minLength(5)]]
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
      alert("Vos mensurations ont été enregistrées avec succès dans Harmy'Swing !");
    } catch (e) {
      console.error(e);
    }
  }

  async createOrderSubmit() {
    if (this.orderForm.invalid) return;
    const val = this.orderForm.value;
    try {
      await this.api.createOrder({
        atelierId: val.atelierId || undefined,
        modelCaption: val.modelCaption || undefined,
        total: Number(val.total) || 0,
        deposit: Number(val.deposit) || 0,
        dueDate: val.dueDate || undefined
      });
      this.openOrderModal.set(false);
      this.orderForm.reset({ total: 150000, deposit: 50000 });
      this.loadAllData();
      alert("Votre demande de confection a été envoyée avec succès à la maison de couture !");
    } catch (e) {
      console.error(e);
    }
  }

  async contactAtelier(atelier: Atelier) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const ownerId = atelier.ownerId || atelier.couturiereId || '';
      const conv = await this.api.startConversation(ownerId, atelier.id);
      this.router.navigate(['/messagerie'], { queryParams: { convId: conv.id } });
    } catch (e) {
      console.error(e);
    }
  }

  async contactAtelierByOrder(order: Order) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!order.atelierId) return;
    try {
      const conv = await this.api.startConversation('', order.atelierId);
      this.router.navigate(['/messagerie'], { queryParams: { convId: conv.id } });
    } catch (e) {
      console.error(e);
    }
  }

  openReviewForAtelier(atelier: Atelier) {
    this.selectedAtelier.set(atelier);
    this.reviewForm.reset({ rating: 5, text: '' });
    this.openReviewModal.set(true);
  }

  async submitReview() {
    if (this.reviewForm.invalid) return;
    const atelier = this.selectedAtelier();
    if (!atelier) return;
    const { rating, text } = this.reviewForm.value;
    try {
      await this.api.addAtelierReview(atelier.id, Number(rating) || 5, text || '');
      this.openReviewModal.set(false);
      alert("Votre avis a été soumis avec succès ! Merci de contribuer à la communauté Harmy'Swing.");
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
