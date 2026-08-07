import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface OrderDto {
  id: string;
  reference: string;
  clientId?: string;
  atelierId?: string;
  carnetMesureId: string;
  statut: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE';
  prixTotal: number;
  acompteVerse: number;
  soldeRestant: number;
  description?: string;
  dateCommande: string;
  dateLivraisonPrevue?: string;
}

export interface CreateOrderRequest {
  reference?: string;
  clientId?: string;
  atelierId?: string;
  carnetMesureId: string;
  prixTotal: number;
  acompteVerse?: number;
  description?: string;
  dateLivraisonPrevue?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  // Signals réactifs pour l'état des commandes (initialement vide, alimenté exclusivement par le backend)
  private ordersSignal = signal<OrderDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly orders = computed(() => this.ordersSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // Computes orders by status
  readonly ordersTissuRecu = computed(() => this.ordersSignal().filter(o => o.statut === 'TISSU_RECU'));
  readonly ordersEnCouture = computed(() => this.ordersSignal().filter(o => o.statut === 'EN_COUTURE'));
  readonly ordersPretEssayage = computed(() => this.ordersSignal().filter(o => o.statut === 'PRET_POUR_ESSAYAGE'));
  readonly ordersLivre = computed(() => this.ordersSignal().filter(o => o.statut === 'LIVRE'));

  fetchOrders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<OrderDto[]>(this.apiUrl).pipe(
      tap((orders) => {
        this.ordersSignal.set(orders || []);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Erreur lors du chargement des commandes.');
        return throwError(() => err);
      })
    ).subscribe();
  }

  fetchOrdersByAtelier(atelierId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<OrderDto[]>(`${this.apiUrl}/atelier/${atelierId}`).pipe(
      tap((orders) => {
        this.ordersSignal.set(orders || []);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Erreur lors du chargement des commandes.');
        return throwError(() => err);
      })
    ).subscribe();
  }

  createOrder(req: CreateOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.apiUrl, req).pipe(
      tap((newOrder) => {
        this.ordersSignal.update(orders => [...orders, newOrder]);
      }),
      catchError((err) => {
        const errorMsg = err.error?.message || 'Échec de la création de la commande.';
        this.errorSignal.set(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  updateOrderStatus(orderId: string, newStatus: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE'): Observable<OrderDto> {
    const previousOrders = [...this.ordersSignal()];
    this.ordersSignal.update(orders =>
      orders.map(order => order.id === orderId ? { ...order, statut: newStatus } : order)
    );

    return this.http.patch<OrderDto>(`${this.apiUrl}/${orderId}/status`, { statut: newStatus }).pipe(
      tap((updatedOrder) => {
        this.ordersSignal.update(orders =>
          orders.map(order => order.id === orderId ? updatedOrder : order)
        );
      }),
      catchError((err) => {
        this.ordersSignal.set(previousOrders);
        const errorMsg = err.error?.message || 'Échec de la mise à jour du statut.';
        this.errorSignal.set(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
