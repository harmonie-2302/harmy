import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { OrderService, OrderDto } from '@core/services/order.service';

export interface KanbanColumn {
  id: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE';
  title: string;
  badgeColor: string;
  icon: string;
}

@Component({
  selector: 'app-atelier-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="p-6 bg-gray-900 min-h-screen text-gray-100">
      
      <!-- Top Title Bar -->
      <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div>
          <h1 class="text-3xl font-extrabold text-amber-500 tracking-wide flex items-center gap-3">
            <span>✂️</span> Harmy'Swing — Kanban Atelier Couture
          </h1>
          <p class="text-sm text-gray-400 mt-1">Gestion réactive des confections via Angular Signals & Spring Boot</p>
        </div>

        <button 
          (click)="refresh()"
          class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl shadow-lg transition flex items-center gap-2">
          <span class="material-icons text-sm">refresh</span> Actualiser
        </button>
      </div>

      @if (errorMessage()) {
        <div class="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-xl text-sm font-medium">
          ⚠️ {{ errorMessage() }}
        </div>
      }

      <!-- Loading State -->
      @if (orderService.loading()) {
        <div class="flex items-center justify-center py-12 text-amber-400 gap-3 font-semibold">
          <span class="material-icons animate-spin">sync</span> Chargement des commandes en cours...
        </div>
      }

      <!-- Kanban Columns Board -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        @for (col of columns; track col.id) {
          <div class="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 flex flex-col min-h-[500px]">
            
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ col.icon }}</span>
                <h2 class="text-base font-bold text-white">{{ col.title }}</h2>
              </div>
              <span [class]="'px-2.5 py-0.5 text-xs font-extrabold rounded-full ' + col.badgeColor">
                {{ getOrdersForColumn(col.id).length }}
              </span>
            </div>

            <!-- Drag & Drop Container -->
            <div
              cdkDropList
              [id]="col.id"
              [cdkDropListData]="getOrdersForColumn(col.id)"
              [cdkDropListConnectedTo]="connectedDropLists"
              (cdkDropListDropped)="onDrop($event, col.id)"
              class="flex-1 space-y-3 min-h-[400px]">

              @for (order of getOrdersForColumn(col.id); track order.id) {
                <div 
                  cdkDrag
                  class="bg-gray-700 hover:bg-gray-650 border border-gray-600 rounded-xl p-4 shadow-md cursor-grab active:cursor-grabbing transition transform hover:-translate-y-0.5">
                  
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {{ order.reference }}
                    </span>
                    <span class="text-xs text-gray-400 font-medium">
                      Livraison: {{ order.dateLivraisonPrevue || 'N/A' }}
                    </span>
                  </div>

                  <p class="text-sm font-semibold text-gray-200 mb-3 line-clamp-2">
                    {{ order.description || 'Confection sur mesure' }}
                  </p>

                  <div class="flex justify-between items-center text-xs pt-2 border-t border-gray-650">
                    <span class="text-gray-400">Total: <strong class="text-white">{{ order.prixTotal | number }} FC</strong></span>
                    <span [class]="order.soldeRestant > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'">
                      {{ order.soldeRestant > 0 ? 'Reste: ' + (order.soldeRestant | number) + ' FC' : 'Payé' }}
                    </span>
                  </div>
                </div>
              }

              @if (getOrdersForColumn(col.id).length === 0) {
                <div class="h-32 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 text-xs italic">
                  Aucune commande
                </div>
              }

            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class AtelierKanbanComponent implements OnInit {

  orderService = inject(OrderService);
  errorMessage = signal<string | null>(null);

  columns: KanbanColumn[] = [
    { id: 'TISSU_RECU', title: 'Tissu Reçu', badgeColor: 'bg-blue-950 text-blue-400 border border-blue-800', icon: '🧵' },
    { id: 'EN_COUTURE', title: 'En Couture', badgeColor: 'bg-purple-950 text-purple-400 border border-purple-800', icon: '🪡' },
    { id: 'PRET_POUR_ESSAYAGE', title: 'Prêt Essayage', badgeColor: 'bg-amber-950 text-amber-400 border border-amber-800', icon: '👗' },
    { id: 'LIVRE', title: 'Livré', badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800', icon: '✅' }
  ];

  connectedDropLists = ['TISSU_RECU', 'EN_COUTURE', 'PRET_POUR_ESSAYAGE', 'LIVRE'];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.orderService.fetchOrders();
  }

  getOrdersForColumn(columnId: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE'): OrderDto[] {
    switch (columnId) {
      case 'TISSU_RECU': return this.orderService.ordersTissuRecu();
      case 'EN_COUTURE': return this.orderService.ordersEnCouture();
      case 'PRET_POUR_ESSAYAGE': return this.orderService.ordersPretEssayage();
      case 'LIVRE': return this.orderService.ordersLivre();
      default: return [];
    }
  }

  onDrop(event: CdkDragDrop<OrderDto[]>, targetStatus: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE'): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedOrder = event.previousContainer.data[event.previousIndex];
      if (!movedOrder) return;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.orderService.updateOrderStatus(movedOrder.id, targetStatus).subscribe({
        error: (err) => {
          this.errorMessage.set(err.message);
        }
      });
    }
  }
}
