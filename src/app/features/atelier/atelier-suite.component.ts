import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Order, CustomerAtelier, FinanceSummary, Task } from '@core/services/harmy-api.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-atelier-suite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle">
      
      <!-- Guard Banner (If Not Seamstress) -->
      @if (api.currentUser()?.role !== 'seamstress') {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 animate-bounce border border-gold-500/30">
            <span class="material-icons text-4xl">lock</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Espace Atelier Privé (SaaS)</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Cette section est exclusivement réservée aux ateliers de couture professionnels abonnés. Elle regroupe le suivi des mesures numériques, le tableau de bord Kanban et le bilan comptable.
          </p>
          <div class="p-4 bg-gold-50/80 rounded-2xl border border-gold-500/30 mb-6 text-left">
            <h4 class="text-xs font-bold text-gold-800 flex items-center gap-1.5 mb-1">
              <span class="material-icons text-sm text-gold-600">visibility</span> Mode Démo d'Harmy'sewing
            </h4>
            <p class="text-[11px] text-gray-700 font-light leading-normal">
              Pour explorer cet espace de gestion, connectez-vous instantanément en tant que <strong>Fatoumata Diallo (Couturière)</strong> à l'aide du bouton ci-dessous.
            </p>
          </div>
          <button 
            (click)="switchToDemostress()"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter comme Fatoumata Diallo
          </button>
        </div>
      } @else {

        <!-- Professional Suite Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gold-500/20">
          <div>
            <h1 class="serif-header text-2xl sm:text-3xl font-extrabold text-gray-900">
              Espace Maison de Couture
            </h1>
            <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mt-1">
              Pilotage, Carnet de Mesures & Kanban en temps réel
            </p>
          </div>
          <div class="flex gap-2.5 flex-wrap">
            <button 
              (click)="activeTab.set('kanban')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'kanban' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">view_week</span> Kanban Commandes
            </button>
            <button 
              (click)="activeTab.set('clients')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'clients' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">people</span> Mesures & Clients
            </button>
            <button 
              (click)="activeTab.set('tasks')"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              [class]="activeTab() === 'tasks' ? 'btn-black' : 'bg-white text-gray-700 hover:bg-gold-50 border border-gold-500/20'">
              <span class="material-icons text-sm text-gold-500">checklist</span> Tâches d'Atelier
            </button>
          </div>
        </div>

        <!-- Section: Finance Overview Widgets (FR-FIN) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div class="bg-gradient-to-br from-gold-50 to-white p-5 rounded-2xl border border-gold-500/30 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recettes Globales</span>
              <span class="material-icons text-gold-600 text-lg">account_balance_wallet</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 serif-header">
              {{ finance()?.totalRevenue | number }} {{ finance()?.currency }}
            </h3>
            <p class="text-[10px] text-gray-500 mt-1 font-light">Commandes livrées + acomptes</p>
          </div>

          <div class="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-600/20 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Acomptes en Caisse</span>
              <span class="material-icons text-emerald-700 text-lg">monetization_on</span>
            </div>
            <h3 class="text-xl font-bold text-emerald-900 serif-header">
              {{ finance()?.totalDeposits | number }} {{ finance()?.currency }}
            </h3>
            <p class="text-[10px] text-emerald-800 mt-1 font-light">Garanties financières de production</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Soldes à Recouvrer</span>
              <span class="material-icons text-red-500 text-lg">schedule</span>
            </div>
            <h3 class="text-xl font-bold text-gray-700 serif-header">
              {{ finance()?.totalBalancesDue | number }} {{ finance()?.currency }}
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 font-light">À percevoir à la remise finale</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 custom-shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activité de Coupe</span>
              <span class="material-icons text-gray-400 text-lg">style</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 serif-header">
              {{ finance()?.activeOrderCount }} / {{ finance()?.orderCount }}
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 font-light">Commandes actives en atelier</p>
          </div>
        </div>

        <!-- TAB CONTENT: KANBAN BOARD (FR-PIPE) -->
        @if (activeTab() === 'kanban') {
          <div class="mb-6 flex justify-between items-center flex-wrap gap-2">
            <h2 class="serif-header text-lg font-bold text-gray-800 flex items-center gap-2">
              <span class="material-icons text-mahogany-500 text-sm">layers</span> Suivi Kanban des Confections
            </h2>
            <button 
              (click)="openOrderModal.set(true)"
              class="bg-mahogany-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-mahogany-600 transition-all flex items-center gap-1">
              <span class="material-icons text-xs">add</span> Nouvelle Commande
            </button>
          </div>

          <!-- The Columns Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            
            <!-- Column 1: Tissu Reçu (FABRIC_RECEIVED) -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px]">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span> Tissu Reçu
                </span>
                <span class="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ ordersByStatus('FABRIC_RECEIVED').length }}
                </span>
              </div>
              
              <div class="space-y-3 flex-grow overflow-y-auto">
                @for (o of ordersByStatus('FABRIC_RECEIVED'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column 2: En Couture (SEWING) -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px]">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-gold-500"></span> En Couture
                </span>
                <span class="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ ordersByStatus('SEWING').length }}
                </span>
              </div>
              <div class="space-y-3 flex-grow overflow-y-auto">
                @for (o of ordersByStatus('SEWING'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column 3: Prêt pour Essayage (FITTING_READY) -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px]">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-purple-400"></span> Prêt Essayage
                </span>
                <span class="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ ordersByStatus('FITTING_READY').length }}
                </span>
              </div>
              <div class="space-y-3 flex-grow overflow-y-auto">
                @for (o of ordersByStatus('FITTING_READY'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column 4: Livré (DELIVERED) -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px]">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Livré (Clôturé)
                </span>
                <span class="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ ordersByStatus('DELIVERED').length }}
                </span>
              </div>
              <div class="space-y-3 flex-grow overflow-y-auto">
                @for (o of ordersByStatus('DELIVERED'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

            <!-- Column 5: Archivé (ARCHIVED) -->
            <div class="bg-gray-50/30 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px] opacity-75">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-gray-400"></span> Archivé
                </span>
                <span class="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ ordersByStatus('ARCHIVED').length }}
                </span>
              </div>
              <div class="space-y-3 flex-grow overflow-y-auto">
                @for (o of ordersByStatus('ARCHIVED'); track o.id) {
                  <ng-container *ngTemplateOutlet="orderCard; context: { $implicit: o }"></ng-container>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB CONTENT: CUSTOMERS & MEASUREMENTS (FR-MEASURE) -->
        @if (activeTab() === 'clients') {
          <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 class="serif-header text-xl font-bold text-gray-900">
                  Carnet Digital de Mesures Clients
                </h2>
                <p class="text-xs text-gray-500 font-light mt-0.5">
                  Gestion centralisée des mensurations d'atelier (Centimètres)
                </p>
              </div>
              <button 
                (click)="openClientModal.set(true); isEditingClient.set(null); clientForm.reset({ bust: 90, waist: 70, hips: 100, arm: 30 })"
                class="btn-gold px-4 py-2 text-xs font-bold flex items-center gap-1">
                <span class="material-icons text-sm">person_add</span> Ajouter un Client
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (c of customers(); track c.id) {
                <div class="p4 bg-pagne-subtle/50 rounded-2xl border border-gray-100 hover:border-gold-500/30 transition-all">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h4 class="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        {{ c.name }}
                        @if (c.type === 'registered') {
                          <span class="text-[9px] bg-gold-100 text-gold-800 font-bold px-1.5 py-0.5 rounded-full border border-gold-500/20">
                            Compte Réseau
                          </span>
                        } @else {
                          <span class="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-full">
                            Client Local
                          </span>
                        }
                      </h4>
                      <p class="text-[11px] text-gray-500 font-mono">{{ c.phone }}</p>
                    </div>
                    <button 
                      (click)="editClient(c)"
                      class="text-gold-600 hover:text-gold-800 text-xs font-bold">
                      Éditer
                    </button>
                  </div>

                  <!-- Measurements Grid -->
                  <div class="grid grid-cols-4 gap-1.5 text-center my-3 bg-white p-2.5 rounded-xl border border-gold-500/10 text-[11px]">
                    <div>
                      <span class="block text-[9px] text-gray-400 font-bold uppercase">Poitrine</span>
                      <strong class="text-gray-800">{{ c.measurements.bust }}</strong> <span class="text-[9px] text-gray-400">cm</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-gray-400 font-bold uppercase">Taille</span>
                      <strong class="text-gray-800">{{ c.measurements.waist }}</strong> <span class="text-[9px] text-gray-400">cm</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-gray-400 font-bold uppercase">Bassin</span>
                      <strong class="text-gray-800">{{ c.measurements.hips }}</strong> <span class="text-[9px] text-gray-400">cm</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-gray-400 font-bold uppercase">Bras</span>
                      <strong class="text-gray-800">{{ c.measurements.arm }}</strong> <span class="text-[9px] text-gray-400">cm</span>
                    </div>
                  </div>

                  @if (c.notes) {
                    <p class="text-[11px] text-gray-600 italic line-clamp-2 bg-white/50 p-2 rounded-lg text-xs">
                      "{{ c.notes }}"
                    </p>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB CONTENT: TASKS & AGENDA -->
        @if (activeTab() === 'tasks') {
          <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow mb-8">
            <h2 class="serif-header text-xl font-bold text-gray-900 mb-4">Tâches d'Atelier & Agenda</h2>
            
            <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="flex gap-2 mb-6">
              <input 
                type="text" 
                formControlName="title" 
                placeholder="Ex: Acheter fil de soie dorée Bazin..." 
                class="flex-grow px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              <button type="submit" class="btn-black px-4 py-2.5 text-xs font-bold">Ajouter Tâche</button>
            </form>

            <div class="space-y-2">
              @for (t of tasks(); track t.id) {
                <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gold-50/30 transition-all">
                  <div class="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      [checked]="t.completed" 
                      (change)="toggleTask(t.id)"
                      class="rounded text-gold-500 focus:ring-gold-400">
                    <span class="text-xs font-medium" [class.line-through]="t.completed" [class.text-gray-400]="t.completed" [class.text-gray-800]="!t.completed">
                      {{ t.title }}
                    </span>
                  </div>
                  <button (click)="deleteTask(t.id)" class="text-red-400 hover:text-red-600 text-xs">
                    <span class="material-icons text-sm">delete</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }

      }
    </div>

    <!-- Reusable Template: Order Card -->
    <ng-template #orderCard let-o>
      <div class="pagne-card bg-white p-3.5 rounded-2xl border border-gold-500/20 shadow-sm hover:shadow-md transition-all">
        <div class="flex justify-between items-start gap-1 mb-2">
          <div>
            <span class="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-500/20">
              #{{ o.id.substring(0,6) }}
            </span>
            <h4 class="font-bold text-gray-900 text-xs mt-1">{{ o.customerName }}</h4>
          </div>
          
          <button (click)="deleteOrder(o.id)" class="text-gray-400 hover:text-red-500 text-xs">
            <span class="material-icons text-xs">delete</span>
          </button>
        </div>

        <p class="text-[11px] text-gray-600 line-clamp-2 mb-2 font-light">
          {{ o.modelCaption }}
        </p>

        <!-- Pricing info -->
        <div class="bg-gray-50 p-2 rounded-xl border border-gray-100 text-[10px] space-y-1 mb-3">
          <div class="flex justify-between text-gray-500">
            <span>Total :</span>
            <strong class="text-gray-800">{{ o.pricing.total }} {{ o.pricing.currency }}</strong>
          </div>
          <div class="flex justify-between text-emerald-700 font-bold">
            <span>Acompte :</span>
            <span>{{ o.pricing.deposit }} {{ o.pricing.currency }}</span>
          </div>
          <div class="flex justify-between font-bold" [class]="o.pricing.balance > 0 ? 'text-red-500' : 'text-emerald-600'">
            <span>Solde restant :</span>
            <span>{{ o.pricing.balance }} {{ o.pricing.currency }}</span>
          </div>
        </div>

        <!-- Status Change Dropdown -->
        <div class="flex gap-1.5 items-center">
          <select 
            [value]="o.status"
            (change)="updateStatus(o.id, $any($event.target).value)"
            class="w-full px-2 py-1 text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-gold-500">
            <option value="FABRIC_RECEIVED">Tissu Reçu</option>
            <option value="SEWING">En Couture</option>
            <option value="FITTING_READY">Prêt Essayage</option>
            <option value="DELIVERED">Livré (Clôturer)</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>
    </ng-template>
  `
})
export class AtelierSuiteComponent implements OnInit {
  api = inject(HarmyApi);
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
    this.loadData();
  }

  async loadData() {
    try {
      const [ordList, custMap, tskList, finSum] = await Promise.all([
        this.api.getOrders(),
        this.api.getCustomers(),
        this.api.getTasks(),
        this.api.getFinanceSummary()
      ]);
      this.orders.set(ordList);
      this.customers.set(custMap);
      this.tasks.set(tskList);
      this.finance.set(finSum);
    } catch (e) {
      console.error(e);
    }
  }

  switchToDemostress() {
    this.api.login('fatoumata@couture.sen');
  }

  ordersByStatus(status: string): Order[] {
    return this.orders().filter(o => o.status === status);
  }

  async updateStatus(orderId: string, status: string) {
    try {
      const updated = await this.api.updateOrderStatus(orderId, status);
      this.orders.update(arr => arr.map(o => o.id === orderId ? updated : o));
      this.refreshFinance();
    } catch (e) {
      console.error(e);
    }
  }

  async deleteOrder(id: string) {
    if (!confirm('Voulez-vous annuler/supprimer cette commande ?')) return;
    try {
      await this.api.deleteOrder(id);
      this.orders.update(arr => arr.filter(o => o.id !== id));
      this.refreshFinance();
    } catch (e) {
      console.error(e);
    }
  }

  async refreshFinance() {
    try {
      const fin = await this.api.getFinanceSummary();
      this.finance.set(fin);
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
      bust: c.measurements.bust,
      waist: c.measurements.waist,
      hips: c.measurements.hips,
      arm: c.measurements.arm
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
      this.clientForm.reset({
        name: '',
        phone: '',
        notes: '',
        bust: 90,
        waist: 70,
        hips: 100,
        arm: 30
      });
    } catch (e) {
      console.error(e);
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
