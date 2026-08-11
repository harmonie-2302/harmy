import { ChangeDetectionStrategy, Component, inject, signal, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HarmyApiService as HarmyApi, Order, CustomerAtelier, Task, FinanceSummary } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-atelier-suite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-white min-h-screen">
      
      <!-- Guard Banner (If Not Authenticated) -->
      @if (!authService.isAuthenticated()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8 shadow-xl">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 border border-gold-500/30">
            <span class="material-icons text-4xl">store</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Espace SaaS d'Atelier Couture</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Connectez-vous avec votre compte Couturière pour accéder au tableau Kanban, carnet de mesures et suivi financier.
          </p>
          <button 
            (click)="router.navigate(['/auth/login'])"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter
          </button>
        </div>
      } @else {

        <!-- Dashboard Header -->
        <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="material-icons text-gold-600">cutting</span>
              <h1 class="serif-header text-2xl font-bold text-gray-900">Espace Suite Atelier</h1>
            </div>
            <p class="text-xs text-gray-500 font-light">Gestion globale de la production, fiches clientes & comptabilité</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button 
              (click)="openClientModal.set(true)"
              class="px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5">
              <span class="material-icons text-sm">person_add</span>
              <span>Nouvelle Cliente</span>
            </button>
            <button 
              (click)="openOrderModal.set(true)"
              class="btn-gold px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5">
              <span class="material-icons text-sm">add_shopping_cart</span>
              <span>Créer une Commande</span>
            </button>
          </div>
        </header>

        <!-- Financial Summary Banner -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-5 rounded-2xl border border-gold-500/20 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recettes Globales</span>
              <span class="material-icons text-gold-600 text-lg">account_balance_wallet</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 serif-header">
              {{ finance()?.totalRevenue || 0 | number }} {{ finance()?.currency || 'FC' }}
            </h3>
            <p class="text-[10px] text-gray-500 mt-1 font-light">Commandes livrées + acomptes</p>
          </div>

          <div class="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-600/20 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Acomptes en Caisse</span>
              <span class="material-icons text-emerald-700 text-lg">monetization_on</span>
            </div>
            <h3 class="text-xl font-bold text-emerald-900 serif-header">
              {{ finance()?.totalDeposits || 0 | number }} {{ finance()?.currency || 'FC' }}
            </h3>
            <p class="text-[10px] text-emerald-800 mt-1 font-light">Garanties financières de production</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Soldes à Recouvrer</span>
              <span class="material-icons text-red-500 text-lg">schedule</span>
            </div>
            <h3 class="text-xl font-bold text-gray-700 serif-header">
              {{ finance()?.totalBalancesDue || 0 | number }} {{ finance()?.currency || 'FC' }}
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 font-light">À percevoir à la remise finale</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activité de Coupe</span>
              <span class="material-icons text-gray-400 text-lg">style</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 serif-header">
              {{ finance()?.activeOrderCount || 0 }} / {{ finance()?.orderCount || 0 }}
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 font-light">Commandes actives en atelier</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-gray-100 mb-6 gap-8">
          <button 
            (click)="activeTab.set('kanban')"
            class="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2"
            [class]="activeTab() === 'kanban' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-400 hover:text-gray-600'">
            <span class="material-icons text-sm">view_kanban</span> Suivi Kanban
          </button>
          <button 
            (click)="activeTab.set('clients')"
            class="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2"
            [class]="activeTab() === 'clients' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-400 hover:text-gray-600'">
            <span class="material-icons text-sm">group</span> Répertoire & Mesures Clientes
          </button>
          <button 
            (click)="activeTab.set('tasks')"
            class="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2"
            [class]="activeTab() === 'tasks' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-400 hover:text-gray-600'">
            <span class="material-icons text-sm">task_alt</span> Tâches Atelier
          </button>
        </div>

        <!-- TAB CONTENT: KANBAN BOARD -->
        @if (activeTab() === 'kanban') {
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <!-- Column: Tissu Reçu -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span> Tissu Reçu
                </h3>
                <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {{ getOrdersByStatus('TISSU_RECU').length }}
                </span>
              </div>
              <div class="space-y-3">
                @for (o of getOrdersByStatus('TISSU_RECU'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column: En Couture -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-orange-500"></span> En Couture
                </h3>
                <span class="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                  {{ getOrdersByStatus('EN_COUTURE').length }}
                </span>
              </div>
              <div class="space-y-3">
                @for (o of getOrdersByStatus('EN_COUTURE'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column: Prêt pour Essayage -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-purple-500"></span> Prêt Essayage
                </h3>
                <span class="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  {{ getOrdersByStatus('PRET_POUR_ESSAYAGE').length }}
                </span>
              </div>
              <div class="space-y-3">
                @for (o of getOrdersByStatus('PRET_POUR_ESSAYAGE'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column: Livré -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Livré
                </h3>
                <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  {{ getOrdersByStatus('LIVRE').length }}
                </span>
              </div>
              <div class="space-y-3">
                @for (o of getOrdersByStatus('LIVRE'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB CONTENT: CLIENTS & MEASUREMENTS -->
        @if (activeTab() === 'clients') {
          <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 class="serif-header text-lg font-bold text-gray-900 mb-6">Répertoire des Fiches Clientes</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (c of customers(); track c.id) {
                <div class="bg-pagne-subtle p-5 rounded-2xl border border-gold-500/20 shadow-sm relative">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="font-bold text-sm text-gray-900">{{ c.name }}</h3>
                      <span class="text-[10px] text-gray-500 font-mono">{{ c.phone }}</span>
                    </div>
                    <button 
                      (click)="editClient(c)"
                      class="text-xs text-gold-600 font-bold hover:underline">
                      Éditer
                    </button>
                  </div>
                  
                  <p class="text-xs text-gray-600 font-light mb-4 line-clamp-2">{{ c.notes || 'Aucune note particulière.' }}</p>

                  <div class="grid grid-cols-4 gap-2 text-center text-[10px] pt-3 border-t border-gold-500/10">
                    <div class="bg-white p-2 rounded-lg">
                      <span class="block text-gray-400 uppercase">Poitrine</span>
                      <strong class="text-gray-800">{{ c.measurements?.bust }} cm</strong>
                    </div>
                    <div class="bg-white p-2 rounded-lg">
                      <span class="block text-gray-400 uppercase">Taille</span>
                      <strong class="text-gray-800">{{ c.measurements?.waist }} cm</strong>
                    </div>
                    <div class="bg-white p-2 rounded-lg">
                      <span class="block text-gray-400 uppercase">Hanches</span>
                      <strong class="text-gray-800">{{ c.measurements?.hips }} cm</strong>
                    </div>
                    <div class="bg-white p-2 rounded-lg">
                      <span class="block text-gray-400 uppercase">Bras</span>
                      <strong class="text-gray-800">{{ c.measurements?.arm }} cm</strong>
                    </div>
                  </div>
                </div>
              }
              @if (customers().length === 0) {
                <div class="col-span-full py-12 text-center text-xs text-gray-400 italic">
                  Aucune fiche cliente enregistrée.
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB CONTENT: TASKS -->
        @if (activeTab() === 'tasks') {
          <div class="bg-white rounded-2xl border border-gray-100 p-6 max-w-3xl">
            <h2 class="serif-header text-lg font-bold text-gray-900 mb-6">Tâches de Couture à Accomplir</h2>

            <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="flex gap-3 mb-6">
              <input 
                type="text" 
                formControlName="title" 
                placeholder="Ex. Acheter du fil doré, Repasser la doublure..." 
                class="flex-grow px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              <button 
                type="submit" 
                [disabled]="taskForm.invalid"
                class="btn-gold px-5 py-2 text-xs font-bold shadow-sm disabled:opacity-50">
                Ajouter
              </button>
            </form>

            <div class="space-y-2">
              @for (t of tasks(); track t.id) {
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      [checked]="t.completed" 
                      (change)="toggleTask(t.id)"
                      class="rounded text-gold-600 focus:ring-gold-500">
                    <span [class]="t.completed ? 'line-through text-gray-400 text-xs' : 'text-xs text-gray-800 font-medium'">
                      {{ t.title }}
                    </span>
                  </div>
                  <button (click)="deleteTask(t.id)" class="text-gray-400 hover:text-red-500">
                    <span class="material-icons text-sm">delete</span>
                  </button>
                </div>
              }
              @if (tasks().length === 0) {
                <p class="text-xs text-gray-400 italic text-center py-6">Toutes les tâches ont été accomplies !</p>
              }
            </div>
          </div>
        }

      }

    </div>

    <!-- MODAL: ORDER CREATION -->
    @if (openOrderModal()) {
      <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-gold-500/30 shadow-2xl">
          <h2 class="serif-header text-lg font-bold text-gray-900 mb-4">Créer une Commande</h2>
          <form [formGroup]="orderForm" (ngSubmit)="submitOrder()" class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Cliente</label>
              <select formControlName="customerRefId" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
                <option value="" disabled>Sélectionner une cliente</option>
                @for (c of customers(); track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.phone }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Description Modèle</label>
              <input type="text" formControlName="modelCaption" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Prix Total (FC)</label>
                <input type="number" formControlName="total" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Acompte Versé (FC)</label>
                <input type="number" formControlName="deposit" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Date de Livraison Prévue</label>
              <input type="date" formControlName="dueDate" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button type="button" (click)="openOrderModal.set(false)" class="px-4 py-2 text-xs font-bold text-gray-500">Annuler</button>
              <button type="submit" [disabled]="orderForm.invalid" class="btn-gold px-5 py-2 text-xs font-bold shadow-sm">Créer la commande</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- MODAL: CLIENT CREATION / EDITION -->
    @if (openClientModal()) {
      <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-gold-500/30 shadow-2xl">
          <h2 class="serif-header text-lg font-bold text-gray-900 mb-4">{{ isEditingClient() ? 'Modifier Fiche Cliente' : 'Nouvelle Cliente' }}</h2>
          <form [formGroup]="clientForm" (ngSubmit)="submitClient()" class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Nom Complet</label>
              <input type="text" formControlName="name" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Téléphone</label>
              <input type="text" formControlName="phone" placeholder="+243 81 000 0000" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-700 uppercase mb-1">Notes</label>
              <input type="text" formControlName="notes" class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl">
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div>
                <label class="block text-[9px] font-bold text-gray-600 uppercase mb-1">Poitrine</label>
                <input type="number" formControlName="bust" class="w-full px-2 py-1.5 text-xs bg-gray-50 border rounded-lg">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-600 uppercase mb-1">Taille</label>
                <input type="number" formControlName="waist" class="w-full px-2 py-1.5 text-xs bg-gray-50 border rounded-lg">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-600 uppercase mb-1">Hanches</label>
                <input type="number" formControlName="hips" class="w-full px-2 py-1.5 text-xs bg-gray-50 border rounded-lg">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-600 uppercase mb-1">Bras</label>
                <input type="number" formControlName="arm" class="w-full px-2 py-1.5 text-xs bg-gray-50 border rounded-lg">
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button type="button" (click)="openClientModal.set(false); isEditingClient.set(null)" class="px-4 py-2 text-xs font-bold text-gray-500">Annuler</button>
              <button type="submit" [disabled]="clientForm.invalid" class="btn-gold px-5 py-2 text-xs font-bold shadow-sm">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ORDER CARD REUSABLE TEMPLATE -->
    <ng-template #orderCard let-o>
      <div class="pagne-card bg-white p-4 rounded-xl border border-gold-500/20 shadow-sm space-y-2">
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-xs text-gray-900">{{ o.customerName || 'Cliente' }}</h4>
          <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-gold-50 text-gold-800 border border-gold-500/30">
            {{ o.status || o.statut }}
          </span>
        </div>
        <p class="text-xs text-gray-600 font-light line-clamp-2">
          {{ o.modelCaption || o.modelPostId || 'Confection sur mesure' }}
        </p>

        <!-- Pricing info -->
        <div class="bg-gray-50 p-2 rounded-xl border border-gray-100 text-[10px] space-y-1 mb-3">
          <div class="flex justify-between text-gray-500">
            <span>Total :</span>
            <strong class="text-gray-800">{{ o.pricing?.total || 0 }} {{ o.pricing?.currency || 'FC' }}</strong>
          </div>
          <div class="flex justify-between text-emerald-700 font-bold">
            <span>Acompte :</span>
            <span>{{ o.pricing?.deposit || 0 }} {{ o.pricing?.currency || 'FC' }}</span>
          </div>
          <div class="flex justify-between font-bold" [class]="o.pricing?.balance > 0 ? 'text-red-500' : 'text-emerald-600'">
            <span>Solde restant :</span>
            <span>{{ o.pricing?.balance || 0 }} {{ o.pricing?.currency || 'FC' }}</span>
          </div>
        </div>

        <!-- Status Change Dropdown -->
        <div class="flex gap-1.5 items-center">
          <select 
            [value]="o.status || o.statut"
            (change)="updateStatus(o.id, $any($event.target).value)"
            class="w-full px-2 py-1 text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-gold-500">
            <option value="TISSU_RECU">Tissu Reçu</option>
            <option value="EN_COUTURE">En Couture</option>
            <option value="PRET_POUR_ESSAYAGE">Prêt Essayage</option>
            <option value="LIVRE">Livré</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>
    </ng-template>
  `
})
export class AtelierSuiteComponent implements OnInit {
  api = inject(HarmyApi);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  activeTab = signal<'kanban' | 'clients' | 'tasks'>('kanban');
  
  orders = signal<Order[]>([]);
  customers = signal<CustomerAtelier[]>([]);
  tasks = signal<Task[]>([]);
  finance = signal<FinanceSummary | null>(null);

  openOrderModal = signal(false);
  openClientModal = signal(false);
  isEditingClient = signal<CustomerAtelier | null>(null);

  clientForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    notes: [''],
    bust: [90, Validators.required],
    waist: [70, Validators.required],
    hips: [100, Validators.required],
    arm: [30, Validators.required]
  });

  orderForm = this.fb.group({
    customerRefId: ['', Validators.required],
    modelCaption: ['Confection sur mesure', Validators.required],
    total: [35000, [Validators.required, Validators.min(0)]],
    deposit: [15000, [Validators.required, Validators.min(0)]],
    dueDate: ['2026-08-20']
  });

  taskForm = this.fb.group({
    title: ['', Validators.required],
    dueDate: ['']
  });

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadData();
    }
  }

  async loadData() {
    try {
      const [ordList, custMap, tskList, finSum] = await Promise.all([
        this.api.getOrders(),
        this.api.getCustomers(),
        this.api.getTasks(),
        this.api.getFinanceSummary()
      ]);
      this.orders.set(ordList || []);
      this.customers.set(custMap || []);
      this.tasks.set(tskList || []);
      this.finance.set(finSum || null);
    } catch (e) {
      console.error('Erreur chargement données atelier:', e);
    }
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders().filter(o => (o.status === status || o.statut === status));
  }

  async updateStatus(orderId: string, status: string) {
    try {
      const updated = await this.api.updateOrderStatus(orderId, status);
      this.orders.update(arr => arr.map(o => o.id === orderId ? updated : o));
      this.loadData();
    } catch (e) {
      console.error(e);
    }
  }

  editClient(c: CustomerAtelier) {
    this.isEditingClient.set(c);
    this.clientForm.patchValue({
      name: c.name,
      phone: c.phone,
      notes: c.notes,
      bust: c.measurements?.bust || 0,
      waist: c.measurements?.waist || 0,
      hips: c.measurements?.hips || 0,
      arm: c.measurements?.arm || 0
    });
    this.openClientModal.set(true);
  }

  async submitClient() {
    if (this.clientForm.invalid) return;
    const { name, phone, notes, bust, waist, hips, arm } = this.clientForm.value;
    const measurements = {
      bust: Number(bust) || 0,
      waist: Number(waist) || 0,
      hips: Number(hips) || 0,
      arm: Number(arm) || 0
    };

    try {
      const editing = this.isEditingClient();
      if (editing) {
        const updated = await this.api.updateCustomer(editing.id, {
          name: name || '',
          phone: phone || '',
          notes: notes || '',
          measurements
        });
        this.customers.update(arr => arr.map(c => c.id === editing.id ? updated : c));
      } else {
        const newCust = await this.api.createCustomer(
          name || '',
          phone || '',
          notes || '',
          measurements
        );
        this.customers.update(arr => [...arr, newCust]);
        this.orderForm.patchValue({ customerRefId: newCust.id });
      }
      this.openClientModal.set(false);
      this.isEditingClient.set(null);
      this.clientForm.reset();
    } catch (e) {
      console.error(e);
    }
  }

  async submitOrder() {
    if (this.orderForm.invalid) return;
    const { customerRefId, modelCaption, total, deposit, dueDate } = this.orderForm.value;

    let isoDueDate: string | undefined = undefined;
    if (dueDate) {
      isoDueDate = dueDate.includes('T') ? dueDate : `${dueDate}T00:00:00`;
    }

    try {
      const newOrder = await this.api.createOrder({
        customerRefId: customerRefId || '',
        modelCaption: modelCaption || 'Confection sur mesure',
        total: Number(total) || 0,
        deposit: Number(deposit) || 0,
        dueDate: isoDueDate,
        fabricReceived: true
      });
      this.orders.update(arr => [newOrder, ...arr]);
      this.openOrderModal.set(false);
      this.orderForm.reset({
        total: 35000,
        deposit: 15000,
        modelCaption: 'Confection sur mesure',
        dueDate: '2026-08-20'
      });
      await this.loadData();
    } catch (e) {
      console.error('Erreur création commande:', e);
    }
  }

  async submitTask() {
    if (this.taskForm.invalid) return;
    const { title, dueDate } = this.taskForm.value;

    try {
      const newTask = await this.api.createTask(
        title || '',
        dueDate || undefined
      );
      this.tasks.update(arr => [newTask, ...arr]);
      this.taskForm.reset();
    } catch (e) {
      console.error(e);
    }
  }

  async toggleTask(id: string) {
    try {
      const updated = await this.api.toggleTask(id);
      this.tasks.update(arr => arr.map(t => t.id === id ? updated : t));
    } catch (e) {
      console.error(e);
    }
  }

  async deleteTask(id: string) {
    try {
      await this.api.deleteTask(id);
      this.tasks.update(arr => arr.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  }
}
