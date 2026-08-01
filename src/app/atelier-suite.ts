import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApi, Order, CustomerAtelier, FinanceSummary, Task } from './harmy-api';
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
                  <span class="w-2 h-2 rounded-full bg-orange-400"></span> En Couture
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
                  <span class="w-2 h-2 rounded-full bg-purple-400"></span> Essayage Prêt
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
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Livré
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

            <!-- Column 5: Archivés (ARCHIVED) -->
            <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col min-h-[450px]">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-gray-400"></span> Archivés
                </span>
                <span class="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
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

        <!-- TAB CONTENT: CLIENTS & MEASUREMENTS BOOK (FR-MEAS) -->
        @if (activeTab() === 'clients') {
          <div class="mb-6 flex justify-between items-center flex-wrap gap-2">
            <h2 class="serif-header text-lg font-bold text-gray-800 flex items-center gap-2">
              <span class="material-icons text-mahogany-500 text-sm">groups</span> Carnet de Mesures des Clientes
            </h2>
            <button 
              (click)="openClientModal.set(true)"
              class="bg-mahogany-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-mahogany-600 transition-all flex items-center gap-1">
              <span class="material-icons text-xs">person_add</span> Enregistrer une Cliente
            </button>
          </div>

          <!-- Clients Table / List -->
          <div class="bg-white rounded-2xl border border-gray-100 custom-shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-mahogany-50 border-b border-mahogany-100 text-xs font-bold text-mahogany-700 uppercase tracking-wider">
                    <th class="p-4">Type</th>
                    <th class="p-4">Nom de la Cliente</th>
                    <th class="p-4">Téléphone</th>
                    <th class="p-4">Buste (cm)</th>
                    <th class="p-4">Taille (cm)</th>
                    <th class="p-4">Hanches (cm)</th>
                    <th class="p-4">Bras (cm)</th>
                    <th class="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-xs text-gray-700">
                  @for (c of customers(); track c.id) {
                    <tr class="hover:bg-mahogany-50/20 transition-all">
                      <td class="p-4">
                        <span 
                          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          [class]="c.type === 'registered' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'">
                          {{ c.type === 'registered' ? 'Connectée' : 'Locale' }}
                        </span>
                      </td>
                      <td class="p-4 font-semibold">{{ c.name }}</td>
                      <td class="p-4 font-mono text-gray-500">{{ c.phone }}</td>
                      <td class="p-4 font-semibold text-mahogany-500">{{ c.measurements.bust || '-' }}</td>
                      <td class="p-4 font-semibold text-mahogany-500">{{ c.measurements.waist || '-' }}</td>
                      <td class="p-4 font-semibold text-mahogany-500">{{ c.measurements.hips || '-' }}</td>
                      <td class="p-4 font-semibold text-mahogany-500">{{ c.measurements.arm || '-' }}</td>
                      <td class="p-4 text-center">
                        <div class="flex justify-center gap-1.5">
                          <button 
                            (click)="editMeasurements(c)"
                            class="p-1 text-mahogany-500 hover:bg-mahogany-100 rounded-lg transition-colors"
                            title="Modifier les dimensions">
                            <span class="material-icons text-base">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="p-8 text-center text-gray-400">
                        <span class="material-icons text-3xl mb-1">people_outline</span>
                        <p class="text-xs">Aucune cliente enregistrée dans votre carnet.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- TAB CONTENT: TASKS & CHECKLIST (FR-COMM) -->
        @if (activeTab() === 'tasks') {
          <div class="mb-6">
            <h2 class="serif-header text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
              <span class="material-icons text-mahogany-500 text-sm">checklist</span> Checklist Technique de l'Atelier
            </h2>
            <p class="text-xs text-gray-400 font-light">Planifiez vos travaux de coupe, patronage, assemblage et rendez-vous d'essayage de la journée.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Add Task form -->
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 h-fit">
              <h3 class="serif-header text-sm font-bold text-mahogany-500 mb-4">Créer une tâche</h3>
              <form [formGroup]="taskForm" (ngSubmit)="submitTask()">
                <div class="space-y-4">
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Libellé de la tâche</span>
                    <input 
                      formControlName="title"
                      type="text"
                      placeholder="Ex. Monter la fermeture éclair de la robe..."
                      class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Date d'échéance</span>
                    <input 
                      formControlName="dueDate"
                      type="date"
                      class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                  </div>
                  <button 
                    type="submit"
                    [disabled]="taskForm.invalid"
                    class="w-full bg-mahogany-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-mahogany-600 transition-all disabled:opacity-50">
                    Enregistrer la tâche
                  </button>
                </div>
              </form>
            </div>

            <!-- Tasks List -->
            <div class="md:col-span-2 space-y-3 bg-white p-6 rounded-2xl border border-gray-100 custom-shadow">
              <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide">Tâches en cours</h4>
                <span class="text-[10px] text-gray-400">{{ tasks().length }} au total</span>
              </div>

              @for (t of tasks(); track t.id) {
                <div class="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-mahogany-50/10 transition-all">
                  <div class="flex items-center gap-3">
                    <button 
                      (click)="toggleTask(t.id)"
                      class="p-1 rounded-full border flex items-center justify-center transition-colors"
                      [class]="t.completed ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'border-gray-300 text-transparent hover:border-mahogany-500'">
                      <span class="material-icons text-xs">check</span>
                    </button>
                    <div>
                      <p 
                        class="text-xs font-semibold text-gray-800"
                        [class.line-through]="t.completed"
                        [class.text-gray-400]="t.completed">
                        {{ t.title }}
                      </p>
                      <p class="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <span class="material-icons text-[10px]">event</span> Échéance: {{ t.dueDate }}
                      </p>
                    </div>
                  </div>
                  <button 
                    (click)="deleteTask(t.id)"
                    class="text-gray-400 hover:text-red-500 p-1">
                    <span class="material-icons text-base">delete</span>
                  </button>
                </div>
              } @empty {
                <div class="text-center py-10 text-gray-400">
                  <span class="material-icons text-3xl mb-1">done_all</span>
                  <p class="text-xs font-light">Toutes les tâches de l'atelier sont complétées !</p>
                </div>
              }
            </div>
          </div>
        }

      }

      <!-- TEMPLATE: ORDER CARD -->
      <ng-template #orderCard let-o>
        <div class="bg-white p-4 rounded-xl border border-gray-100 custom-shadow hover:border-mahogany-200 transition-all flex flex-col justify-between gap-3 relative group">
          <div>
            <!-- Client & Due Date -->
            <div class="flex justify-between items-start">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Ref #{{ o.id.substring(6) }}</span>
              <span class="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Délai: {{ o.dueDate }}
              </span>
            </div>

            <!-- Order Title/Model -->
            <h4 class="text-xs font-bold text-gray-800 mt-2 line-clamp-1">{{ o.modelCaption }}</h4>
            <p class="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <span class="material-icons text-xs text-gray-400">person</span> {{ o.customerName }}
            </p>

            <!-- Finance Details (FR-FIN) -->
            <div class="mt-3 pt-2.5 border-t border-gray-50 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
              <div>
                <p class="text-[8px] text-gray-400 uppercase font-bold">Total</p>
                <p class="text-[10px] font-extrabold text-gray-700">{{ o.pricing.total | number }} {{ o.pricing.currency }}</p>
              </div>
              <div class="text-right">
                @if (o.pricing.balance > 0) {
                  <p class="text-[8px] text-amber-600 uppercase font-bold">Reste</p>
                  <p class="text-[10px] font-extrabold text-amber-500">{{ o.pricing.balance | number }} {{ o.pricing.currency }}</p>
                } @else {
                  <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <span class="material-icons text-[10px]">check_circle</span> Payé
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Quick Move Action bar inside Card -->
          <div class="pt-2 border-t border-gray-50 flex justify-between items-center">
            
            <!-- Quick payment button (if balance > 0) -->
            @if (o.pricing.balance > 0) {
              <button 
                (click)="payOrderBalance(o)"
                class="text-[9px] font-bold text-mahogany-500 hover:underline flex items-center gap-0.5">
                <span class="material-icons text-[11px]">payments</span> Encaisser Solde
              </button>
            } @else {
              <span class="text-[9px] text-gray-400">Règlement complété</span>
            }

            <!-- Kanban column changers -->
            <div class="flex gap-1">
              @if (o.status !== 'FABRIC_RECEIVED' && o.status !== 'ARCHIVED') {
                <button 
                  (click)="moveOrderStatus(o, 'back')"
                  class="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center"
                  title="Revenir à l'étape précédente">
                  <span class="material-icons text-xs">chevron_left</span>
                </button>
              }
              @if (o.status !== 'ARCHIVED') {
                <button 
                  (click)="moveOrderStatus(o, 'forward')"
                  class="p-1 rounded bg-mahogany-500 hover:bg-mahogany-600 text-white flex items-center"
                  title="Avancer d'étape">
                  <span class="material-icons text-xs">chevron_right</span>
                </button>
              }
            </div>

          </div>

          <!-- Delete order trigger (hover state) -->
          <button 
            (click)="deleteOrder(o.id)"
            class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity">
            <span class="material-icons text-[11px]">delete</span>
          </button>
        </div>
      </ng-template>

      <!-- ORDER CREATION MODAL -->
      @if (openOrderModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 custom-shadow border border-mahogany-100 relative">
            <button (click)="openOrderModal.set(false)" class="absolute right-4 top-4 text-gray-400"><span class="material-icons">close</span></button>
            <h3 class="serif-header text-lg font-bold text-mahogany-500 mb-4">Nouvelle commande</h3>
            
            <form [formGroup]="orderForm" (ngSubmit)="submitOrder()">
              <div class="space-y-4">
                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Sélectionner la cliente</span>
                  <select formControlName="customerRefId" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                    @for (c of customers(); track c.id) {
                      <option [value]="c.id">{{ c.name }} ({{ c.phone }})</option>
                    }
                  </select>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Libellé du vêtement / Modèle</span>
                  <input formControlName="modelCaption" type="text" placeholder="Ex. Robe sirène wax émeraude" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Prix Total (XOF)</span>
                    <input formControlName="total" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Acompte Perçu (XOF)</span>
                    <input formControlName="deposit" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                  </div>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Date limite de livraison</span>
                  <input formControlName="dueDate" type="date" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-2">
                <button type="button" (click)="openOrderModal.set(false)" class="px-4 py-2 border border-gray-200 rounded-xl text-xs">Annuler</button>
                <button type="submit" [disabled]="orderForm.invalid" class="px-4 py-2 bg-mahogany-500 text-white rounded-xl text-xs font-bold hover:bg-mahogany-600">Enregistrer la commande</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- CLIENT CREATION / MEASUREMENT MODAL -->
      @if (openClientModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-2xl w-full max-w-lg p-6 custom-shadow border border-mahogany-100 relative">
            <button (click)="openClientModal.set(false); isEditingClient.set(null);" class="absolute right-4 top-4 text-gray-400"><span class="material-icons">close</span></button>
            <h3 class="serif-header text-lg font-bold text-mahogany-500 mb-4">
              {{ isEditingClient() ? 'Modifier les Mesures de ' + isEditingClient()?.name : 'Enregistrer une nouvelle cliente' }}
            </h3>
            
            <form [formGroup]="clientForm" (ngSubmit)="submitClient()">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Nom Complet</span>
                    <input formControlName="name" type="text" placeholder="Ex. Aminata Touré" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs">
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Téléphone</span>
                    <input formControlName="phone" type="text" placeholder="Ex. +221 77..." class="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs">
                  </div>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Notes atelier spécifiques</span>
                  <textarea formControlName="notes" rows="2" placeholder="Ex. Adore les broderies fines aux fils d'or" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs"></textarea>
                </div>

                <div class="p-4 bg-mahogany-50/50 rounded-xl border border-mahogany-100">
                  <h4 class="text-xs font-bold text-mahogany-500 uppercase tracking-wider mb-3">Dimensions Anatomiques (cm)</h4>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span class="block text-[10px] text-gray-500 mb-1">Tour Poitrine</span>
                      <input formControlName="bust" type="number" class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                    </div>
                    <div>
                      <span class="block text-[10px] text-gray-500 mb-1">Tour Taille</span>
                      <input formControlName="waist" type="number" class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                    </div>
                    <div>
                      <span class="block text-[10px] text-gray-500 mb-1">Tour Hanches</span>
                      <input formControlName="hips" type="number" class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                    </div>
                    <div>
                      <span class="block text-[10px] text-gray-500 mb-1">Longueur Bras</span>
                      <input formControlName="arm" type="number" class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-2">
                <button type="button" (click)="openClientModal.set(false); isEditingClient.set(null);" class="px-4 py-2 border border-gray-200 rounded-xl text-xs">Annuler</button>
                <button type="submit" [disabled]="clientForm.invalid" class="px-4 py-2 bg-mahogany-500 text-white rounded-xl text-xs font-bold hover:bg-mahogany-600">
                  {{ isEditingClient() ? 'Sauvegarder les Mesures' : 'Enregistrer la Cliente' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class AtelierSuite implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  activeTab = signal<'kanban' | 'clients' | 'tasks'>('kanban');
  orders = signal<Order[]>([]);
  customers = signal<CustomerAtelier[]>([]);
  tasks = signal<Task[]>([]);
  finance = signal<FinanceSummary | null>(null);

  openOrderModal = signal<boolean>(false);
  openClientModal = signal<boolean>(false);
  isEditingClient = signal<CustomerAtelier | null>(null);

  orderForm = this.fb.group({
    customerRefId: ['', Validators.required],
    modelCaption: ['', Validators.required],
    total: [25000, [Validators.required, Validators.min(0)]],
    deposit: [10000, [Validators.required, Validators.min(0)]],
    dueDate: ['']
  });

  clientForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    notes: [''],
    bust: [90, [Validators.required, Validators.min(0)]],
    waist: [70, [Validators.required, Validators.min(0)]],
    hips: [100, [Validators.required, Validators.min(0)]],
    arm: [30, [Validators.required, Validators.min(0)]]
  });

  taskForm = this.fb.group({
    title: ['', Validators.required],
    dueDate: ['']
  });

  ngOnInit() {
    if (this.api.currentUser()?.role === 'seamstress') {
      this.loadAllData();
    }
  }

  async loadAllData() {
    try {
      const [ordList, custList, fin, tskList] = await Promise.all([
        this.api.getOrders(),
        this.api.getCustomers(),
        this.api.getFinanceSummary(),
        this.api.getTasks()
      ]);
      this.orders.set(ordList);
      this.customers.set(custList);
      this.finance.set(fin);
      this.tasks.set(tskList);

      // Pre-fill first customer in dropdown if list is present
      if (custList.length > 0 && !this.orderForm.value.customerRefId) {
        this.orderForm.patchValue({ customerRefId: custList[0].id });
      }
    } catch (e) {
      console.error(e);
    }
  }

  ordersByStatus(status: string): Order[] {
    return this.orders().filter(o => o.status === status);
  }

  async switchToDemostress() {
    try {
      const demoUser = this.api.allUsers().find(u => u.role === 'seamstress');
      if (demoUser) {
        await this.api.switchUser(demoUser.id);
        this.loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Kanban Moving logic
  async moveOrderStatus(order: Order, direction: 'forward' | 'back') {
    const statuses = ['FABRIC_RECEIVED', 'SEWING', 'FITTING_READY', 'DELIVERED', 'ARCHIVED'];
    const currentIdx = statuses.indexOf(order.status);
    const nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1;

    if (nextIdx < 0 || nextIdx >= statuses.length) return;

    try {
      const updated = await this.api.updateOrderStatus(order.id, statuses[nextIdx]);
      this.orders.update(arr => arr.map(o => o.id === order.id ? updated : o));
      // Refresh finances
      const fin = await this.api.getFinanceSummary();
      this.finance.set(fin);
    } catch (e) {
      console.error(e);
    }
  }

  async payOrderBalance(order: Order) {
    const amountStr = prompt(`Saisir le montant du paiement pour le solde de ${order.customerName} (Solde actuel: ${order.pricing.balance} XOF) :`, String(order.pricing.balance));
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Montant de paiement invalide.");
      return;
    }

    try {
      const updated = await this.api.addOrderPayment(order.id, amount);
      this.orders.update(arr => arr.map(o => o.id === order.id ? updated : o));
      // Refresh finances
      const fin = await this.api.getFinanceSummary();
      this.finance.set(fin);
    } catch (e) {
      console.error(e);
    }
  }

  async deleteOrder(id: string) {
    if (!confirm("Êtes-vous sûre de vouloir supprimer cette commande de l'atelier ?")) return;
    try {
      await this.api.deleteOrder(id);
      this.orders.update(arr => arr.filter(o => o.id !== id));
      const fin = await this.api.getFinanceSummary();
      this.finance.set(fin);
    } catch (e) {
      console.error(e);
    }
  }

  editMeasurements(client: CustomerAtelier) {
    this.isEditingClient.set(client);
    this.clientForm.patchValue({
      name: client.name,
      phone: client.phone,
      notes: client.notes,
      bust: client.measurements.bust,
      waist: client.measurements.waist,
      hips: client.measurements.hips,
      arm: client.measurements.arm
    });
    this.openClientModal.set(true);
  }

  async submitOrder() {
    if (this.orderForm.invalid) return;
    const { customerRefId, modelCaption, total, deposit, dueDate } = this.orderForm.value;

    try {
      const newOrd = await this.api.createOrder({
        customerRefId: customerRefId || '',
        modelCaption: modelCaption || 'Création sur mesure',
        total: Number(total) || 0,
        deposit: Number(deposit) || 0,
        dueDate: dueDate || undefined
      });
      this.orders.update(arr => [newOrd, ...arr]);
      this.openOrderModal.set(false);
      this.orderForm.reset({
        customerRefId: customerRefId || '',
        modelCaption: '',
        total: 25000,
        deposit: 10000,
        dueDate: ''
      });
      const fin = await this.api.getFinanceSummary();
      this.finance.set(fin);
    } catch (e) {
      console.error(e);
    }
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
        // Edit customer
        const updated = await this.api.updateCustomer(editing.id, {
          name: name || '',
          phone: phone || '',
          notes: notes || '',
          measurements
        });
        this.customers.update(arr => arr.map(c => c.id === editing.id ? updated : c));
      } else {
        // Add new customer
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
