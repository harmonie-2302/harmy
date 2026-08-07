import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDropListGroup,
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { OrderService, OrderDto } from '../../core/services/order.service';

interface KanbanColumn {
  id: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE';
  title: string;
  badgeColor: string;
  icon: string;
}

@Component({
  selector: 'app-atelier-kanban',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag
  ],
  template: `
    <div class="p-6 bg-gray-950 text-white min-h-screen">

      <!-- Toast Alert Error -->
      <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-900/80 border border-red-500 rounded-xl text-red-200 flex justify-between items-center shadow-lg animate-bounce">
        <span>⚠️ {{ errorMessage() }}</span>
        <button (click)="clearError()" class="text-red-300 hover:text-white font-bold text-xl">&times;</button>
      </div>

      <!-- Header Tableau de Bord -->
      <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-amber-500 tracking-tight flex items-center gap-3">
            <span>✂️</span> Tableau Kanban de l'Atelier
          </h1>
          <p class="text-gray-400 mt-1">Suivi réactif des commandes et du flux de couture</p>
        </div>

        <div class="flex items-center gap-3">
          <span class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs font-semibold text-gray-300">
            Total Commandes: <strong class="text-amber-400 text-sm ml-1">{{ orderService.orders().length }}</strong>
          </span>
          <button (click)="refresh()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2">
            <span>🔄</span> Rafraîchir
          </button>
        </div>
      </header>

      <!-- Zone Drag-and-Drop CDK -->
      <div cdkDropListGroup class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div *ngFor="let col of columns" class="bg-gray-900/90 rounded-2xl p-4 border border-gray-800 flex flex-col shadow-2xl">
          
          <!-- En-tête Colonne -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ col.icon }}</span>
              <h2 class="font-bold text-gray-200 text-base">{{ col.title }}</h2>
            </div>
            <span [class]="'px-2.5 py-1 rounded-full text-xs font-extrabold ' + col.badgeColor">
              {{ getOrdersForColumn(col.id).length }}
            </span>
          </div>

          <!-- Liste Droppable CDK -->
          <div
            cdkDropList
            [cdkDropListData]="getOrdersForColumn(col.id)"
            (cdkDropListDropped)="onDrop($event, col.id)"
            class="flex-1 min-h-[500px] space-y-4 rounded-xl p-1 transition-colors bg-gray-900/40">

            <div
              *ngFor="let order of getOrdersForColumn(col.id)"
              cdkDrag
              class="bg-gray-800/90 hover:bg-gray-800 rounded-xl p-4 border border-gray-700/70 hover:border-amber-500/60 shadow-xl cursor-grab active:cursor-grabbing transition duration-200 group">

              <!-- Reference & Badge Solde -->
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-mono font-bold px-2 py-0.5 bg-gray-900 border border-gray-700 text-amber-400 rounded">
                  {{ order.reference }}
                </span>
                <span [class]="order.soldeRestant === 0 ? 'text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800'">
                  {{ order.soldeRestant === 0 ? ' Payé' : ' Reste: ' + order.soldeRestant + ' FCFA' }}
                </span>
              </div>

              <!-- Description / Client -->
              <h3 class="text-sm font-semibold text-gray-100 mb-1 group-hover:text-amber-400 transition">
                {{ order.description || 'Commande de couture' }}
              </h3>

              <div class="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
                <span>Prix: <strong class="text-gray-200">{{ order.prixTotal }} FCFA</strong></span>
                <span class="text-[10px] bg-gray-900 px-2 py-1 rounded text-gray-400">
                  📅 {{ order.dateLivraisonPrevue || 'N/A' }}
                </span>
              </div>
            </div>

            <!-- Empty State Column -->
            <div *ngIf="getOrdersForColumn(col.id).length === 0" class="h-32 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl text-gray-600 text-xs italic">
              Déposez une commande ici
            </div>

          </div>
        </div>

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

  ngOnInit(): void {
    // Initialise avec des données de démonstration réactives
    this.orderService.setInitialMockOrders([
      {
        id: 'cmd-1',
        reference: 'CMD-2026-001',
        carnetMesureId: 'carnet-1',
        statut: 'TISSU_RECU',
        prixTotal: 50000,
        acompteVerse: 20000,
        soldeRestant: 30000,
        description: 'Robe de mariage Bazin brodé',
        dateCommande: '2026-08-01',
        dateLivraisonPrevue: '2026-08-15'
      },
      {
        id: 'cmd-2',
        reference: 'CMD-2026-002',
        carnetMesureId: 'carnet-2',
        statut: 'EN_COUTURE',
        prixTotal: 35000,
        acompteVerse: 35000,
        soldeRestant: 0,
        description: 'Ensemble Wax 2 Pièces',
        dateCommande: '2026-08-03',
        dateLivraisonPrevue: '2026-08-12'
      },
      {
        id: 'cmd-3',
        reference: 'CMD-2026-003',
        carnetMesureId: 'carnet-3',
        statut: 'PRET_POUR_ESSAYAGE',
        prixTotal: 40000,
        acompteVerse: 40000,
        soldeRestant: 0,
        description: 'Tenue de soirée Soie brodée',
        dateCommande: '2026-08-04',
        dateLivraisonPrevue: '2026-08-10'
      }
    ]);
  }

  getOrdersForColumn(status: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE'): OrderDto[] {
    switch (status) {
      case 'TISSU_RECU': return this.orderService.ordersTissuRecu();
      case 'EN_COUTURE': return this.orderService.ordersEnCouture();
      case 'PRET_POUR_ESSAYAGE': return this.orderService.ordersPretEssayage();
      case 'LIVRE': return this.orderService.ordersLivre();
    }
  }

  onDrop(event: CdkDragDrop<OrderDto[]>, targetStatus: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE'): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedOrder = event.previousContainer.data[event.previousIndex];

      // Règle métier stricte : Solde = 0 avant de passer à l'état LIVRE
      if (targetStatus === 'LIVRE' && movedOrder.soldeRestant > 0) {
        this.errorMessage.set(
          `Impossible de livrer la commande ${movedOrder.reference}. Le solde restant (${movedOrder.soldeRestant} FCFA) doit être égal à 0.`
        );
        return;
      }

      this.clearError();

      // Déplace visuellement dans le tableau CDK
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Appelle le service réactif qui envoie le PATCH vers Spring Boot
      this.orderService.updateOrderStatus(movedOrder.id, targetStatus).subscribe({
        error: (err) => {
          this.errorMessage.set(err.message || 'Erreur lors de la mise à jour.');
        }
      });
    }
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  refresh(): void {
    // Si besoin, recharge depuis le backend
    this.clearError();
  }
}
