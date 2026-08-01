import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApi, Order, MeasureBook, Atelier } from './harmy-api';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-client-space',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle">
      
      <!-- Guard Banner (If Not Customer) -->
      @if (api.currentUser()?.role !== 'customer') {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 animate-bounce border border-gold-500/30">
            <span class="material-icons text-4xl">face</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Espace Personnel Cliente</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Cet espace est destiné aux clientes d'exception. Il vous permet de configurer votre carnet de mesures, de partager l'accès de façon sécurisée avec l'atelier de votre choix, et de suivre en temps réel la confection de vos vêtements.
          </p>
          <div class="p-4 bg-gold-50/80 rounded-2xl border border-gold-500/30 mb-6 text-left">
            <h4 class="text-xs font-bold text-gold-800 flex items-center gap-1.5 mb-1">
              <span class="material-icons text-sm text-gold-600">visibility</span> Mode Démo d'Harmy'sewing
            </h4>
            <p class="text-[11px] text-gray-700 font-light leading-normal">
              Pour tester l'expérience d'une cliente connectée, changez de profil instantanément pour devenir <strong>Amina Bello (Cliente)</strong> ci-dessous.
            </p>
          </div>
          <button 
            (click)="switchToDemocustomer()"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter comme Amina Bello
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
              <span class="material-icons text-sm text-gold-500">timeline</span> Mes Vêtements en Confection
            </button>
          </div>
        </div>

        <!-- TAB CONTENT: MY MEASUREMENTS (FR-MEAS) -->
        @if (activeTab() === 'measurements') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Measurements Form Card -->
            <div class="lg:col-span-2 bg-white border border-gold-500/20 rounded-3xl pagne-card p-6 flex flex-col justify-between">
              <div>
                <h2 class="serif-header text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span class="material-icons text-gold-500">edit_note</span> Mes dimensions corporelles
                </h2>
                <p class="text-xs text-gray-600 font-light mb-6">
                  Modifiez vos dimensions en centimètres. Elles seront automatiquement actualisées en temps réel chez toutes les couturières autorisées.
                </p>

                <form [formGroup]="measureForm" (ngSubmit)="saveMeasurements()">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-mahogany-50/40 rounded-xl border border-mahogany-100/50 mb-6">
                    <div>
                      <span class="block text-xs font-semibold text-gray-600 mb-1">Tour de Poitrine (cm)</span>
                      <input 
                        formControlName="bust" 
                        type="number" 
                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs font-bold text-mahogany-700">
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-gray-600 mb-1">Tour de Taille / Ceinture (cm)</span>
                      <input 
                        formControlName="waist" 
                        type="number" 
                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs font-bold text-mahogany-700">
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-gray-600 mb-1">Tour de Hanches / Bassin (cm)</span>
                      <input 
                        formControlName="hips" 
                        type="number" 
                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs font-bold text-mahogany-700">
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-gray-600 mb-1">Longueur de Bras (cm)</span>
                      <input 
                        formControlName="arm" 
                        type="number" 
                        class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs font-bold text-mahogany-700">
                    </div>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-[10px] text-gray-400 font-mono">Dernière mise à jour : {{ measureBook()?.updatedAt | date:'short' }}</span>
                    <button 
                      type="submit" 
                      [disabled]="measureForm.invalid"
                      class="bg-mahogany-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-mahogany-600 active:translate-y-px transition-all">
                      Sauvegarder mes mesures
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Sharing and Access Control Sidebar (FR-MEAS-03) -->
            <div class="bg-gradient-to-br from-mahogany-50/50 to-white border border-mahogany-100 rounded-2xl p-6 custom-shadow">
              <h2 class="serif-header text-base font-bold text-mahogany-500 mb-1 flex items-center gap-1.5">
                <span class="material-icons text-amber-500">security</span> Partage d'Accès Sécurisé
              </h2>
              <p class="text-[10px] text-gray-500 font-light leading-relaxed mb-6">
                Contrôlez qui peut consulter vos mesures numériques en temps réel. Vous pouvez accorder ou révoquer l'accès de chaque atelier en un clic.
              </p>

              <div class="space-y-4">
                @for (atelier of ateliers(); track atelier.id) {
                  <div class="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-3">
                      <span class="material-icons text-mahogany-500 text-xl">store</span>
                      <div>
                        <h4 class="text-xs font-bold text-gray-800 leading-tight">{{ atelier.name }}</h4>
                        <p class="text-[9px] text-gray-400 font-light">{{ atelier.location.city }}, {{ atelier.location.country }}</p>
                      </div>
                    </div>
                    
                    <button 
                      (click)="toggleShareAccess(atelier.id, !isSharingWith(atelier.id))"
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      [class]="isSharingWith(atelier.id) 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-mahogany-100 text-mahogany-700 hover:bg-mahogany-200'">
                      {{ isSharingWith(atelier.id) ? 'Autorisé' : 'Partager' }}
                    </button>
                  </div>
                } @empty {
                  <p class="text-xs text-gray-400 text-center py-6">Aucun atelier disponible.</p>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB CONTENT: MY CLOTHES TRACKING (FR-PIPE / FR-MSG-04) -->
        @if (activeTab() === 'tracking') {
          <div class="mb-6">
            <h2 class="serif-header text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
              <span class="material-icons text-mahogany-500 text-sm">timeline</span> Suivi de Fabrication de mes Commandes
            </h2>
            <p class="text-xs text-gray-400 font-light">Suivez l'état d'avancement de vos vêtements à travers les différentes étapes de l'atelier de couture.</p>
          </div>

          <div class="space-y-8">
            @for (o of myOrders(); track o.id) {
              <div class="bg-white border border-gray-100 rounded-2xl custom-shadow p-6 relative overflow-hidden">
                
                <!-- Corner visual ribbon -->
                <div class="absolute top-0 right-0 h-2 w-full" [class]="statusColor(o.status)"></div>

                <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                  <div>
                    <h3 class="serif-header text-base font-bold text-mahogany-500 flex items-center gap-2">
                      <span class="material-icons text-base text-amber-500">cut</span> {{ o.modelCaption }}
                    </h3>
                    <p class="text-[10px] text-gray-400 mt-1">ID Commande : #{{ o.id.substr(6) }} &bull; Date de livraison estimée : <strong>{{ o.dueDate }}</strong></p>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 font-bold uppercase">Solde restant à payer</p>
                      <p class="text-sm font-extrabold text-mahogany-500">{{ o.pricing.balance | number }} {{ o.pricing.currency }}</p>
                    </div>
                    <span 
                      class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      [class]="statusBadgeStyle(o.status)">
                      {{ statusLabel(o.status) }}
                    </span>
                  </div>
                </div>

                <!-- Step-by-Step Progress Bar (Steppes) -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 relative pt-4 pb-2">
                  
                  <!-- Step 1: FABRIC_RECEIVED -->
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all"
                      [class]="isPastOrEqual(o.status, 'FABRIC_RECEIVED') 
                        ? 'bg-mahogany-500 border-mahogany-500 text-white' 
                        : 'border-gray-200 text-gray-400'">
                      1
                    </div>
                    <div>
                      <h4 class="text-xs font-bold" [class]="isPastOrEqual(o.status, 'FABRIC_RECEIVED') ? 'text-gray-800' : 'text-gray-400'">Tissu Déposé</h4>
                      <p class="text-[9px] text-gray-400 font-light">Tissu validé en atelier</p>
                    </div>
                  </div>

                  <!-- Step 2: SEWING -->
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all"
                      [class]="isPastOrEqual(o.status, 'SEWING') 
                        ? 'bg-mahogany-500 border-mahogany-500 text-white' 
                        : 'border-gray-200 text-gray-400'">
                      2
                    </div>
                    <div>
                      <h4 class="text-xs font-bold" [class]="isPastOrEqual(o.status, 'SEWING') ? 'text-gray-800' : 'text-gray-400'">En Couture</h4>
                      <p class="text-[9px] text-gray-400 font-light">Coupe & assemblage</p>
                    </div>
                  </div>

                  <!-- Step 3: FITTING_READY -->
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all animate-pulse"
                      [class]="isPastOrEqual(o.status, 'FITTING_READY') 
                        ? 'bg-mahogany-500 border-mahogany-500 text-white' 
                        : 'border-gray-200 text-gray-400'">
                      3
                    </div>
                    <div>
                      <h4 class="text-xs font-bold" [class]="isPastOrEqual(o.status, 'FITTING_READY') ? 'text-gray-800' : 'text-gray-400'">Prêt pour Essayage</h4>
                      <p class="text-[9px] text-gray-400 font-light">Venez valider les coupes</p>
                    </div>
                  </div>

                  <!-- Step 4: DELIVERED -->
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all"
                      [class]="isPastOrEqual(o.status, 'DELIVERED') 
                        ? 'bg-mahogany-500 border-mahogany-500 text-white' 
                        : 'border-gray-200 text-gray-400'">
                      4
                    </div>
                    <div>
                      <h4 class="text-xs font-bold" [class]="isPastOrEqual(o.status, 'DELIVERED') ? 'text-gray-800' : 'text-gray-400'">Vêtement Livré</h4>
                      <p class="text-[9px] text-gray-400 font-light">Couture complétée</p>
                    </div>
                  </div>

                </div>

                <!-- Historic Events timeline -->
                <div class="mt-6 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                  <h4 class="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span class="material-icons text-xs text-mahogany-500">history</span> Journal d'Atelier
                  </h4>
                  <div class="space-y-2">
                    @for (ev of o.events; track ev.createdAt) {
                      <div class="flex justify-between items-start text-xs text-gray-600 font-light">
                        <span class="flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-mahogany-500"></span> {{ ev.text }}
                        </span>
                        <span class="text-[9px] text-gray-400 font-mono">{{ ev.createdAt | date:'shortDate' }}</span>
                      </div>
                    }
                  </div>
                </div>

              </div>
            } @empty {
              <div class="text-center py-16 text-gray-400 bg-white border border-gray-100 rounded-2xl custom-shadow">
                <span class="material-icons text-4xl mb-2">timeline</span>
                <p class="text-sm font-medium">Vous n'avez pas de commande en cours de couture actuellement.</p>
                <button 
                  (click)="router.navigate(['/'])"
                  class="mt-4 bg-mahogany-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-mahogany-600">
                  Parcourir le catalogue d'inspirations
                </button>
              </div>
            }
          </div>
        }

      }

    </div>
  `
})
export class ClientSpace implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  activeTab = signal<'measurements' | 'tracking'>('measurements');
  measureBook = signal<MeasureBook | null>(null);
  ateliers = signal<Atelier[]>([]);
  myOrders = signal<Order[]>([]);

  measureForm = this.fb.group({
    bust: [0, [Validators.required, Validators.min(0)]],
    waist: [0, [Validators.required, Validators.min(0)]],
    hips: [0, [Validators.required, Validators.min(0)]],
    arm: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    if (this.api.currentUser()?.role === 'customer') {
      this.loadAllData();
    }
  }

  async loadAllData() {
    try {
      const [book, shopList, ordList] = await Promise.all([
        this.api.getMyMeasureBook(),
        this.api.getAteliers(),
        this.api.getOrders()
      ]);
      this.measureBook.set(book);
      this.ateliers.set(shopList);
      this.myOrders.set(ordList);

      this.measureForm.patchValue({
        bust: book.measurements.bust,
        waist: book.measurements.waist,
        hips: book.measurements.hips,
        arm: book.measurements.arm
      });
    } catch (e) {
      console.error(e);
    }
  }

  async switchToDemocustomer() {
    try {
      const demoUser = this.api.allUsers().find(u => u.role === 'customer');
      if (demoUser) {
        await this.api.switchUser(demoUser.id);
        this.loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  isSharingWith(atelierId: string): boolean {
    const book = this.measureBook();
    if (!book) return false;
    return book.shares.includes(atelierId);
  }

  async toggleShareAccess(atelierId: string, grant: boolean) {
    try {
      const updatedBook = await this.api.toggleShare(atelierId, grant);
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
      alert("Vos dimensions corporelles ont été enregistrées avec succès et synchronisées !");
    } catch (e) {
      console.error(e);
    }
  }

  // Tracking helpers
  statusLabel(status: string): string {
    switch (status) {
      case 'FABRIC_RECEIVED': return 'Tissu Reçu';
      case 'SEWING': return 'En Couture';
      case 'FITTING_READY': return 'Prêt pour Essayage';
      case 'DELIVERED': return 'Livré';
      case 'ARCHIVED': return 'Archivé';
      default: return status;
    }
  }

  statusBadgeStyle(status: string): string {
    switch (status) {
      case 'FABRIC_RECEIVED': return 'bg-blue-100 text-blue-700';
      case 'SEWING': return 'bg-orange-100 text-orange-700';
      case 'FITTING_READY': return 'bg-purple-100 text-purple-700 animate-pulse';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  statusColor(status: string): string {
    switch (status) {
      case 'FABRIC_RECEIVED': return 'bg-blue-400';
      case 'SEWING': return 'bg-orange-400';
      case 'FITTING_READY': return 'bg-purple-400';
      case 'DELIVERED': return 'bg-emerald-400';
      default: return 'bg-gray-400';
    }
  }

  isPastOrEqual(orderStatus: string, step: string): boolean {
    const sequence = ['FABRIC_RECEIVED', 'SEWING', 'FITTING_READY', 'DELIVERED', 'ARCHIVED'];
    return sequence.indexOf(orderStatus) >= sequence.indexOf(step);
  }
}
