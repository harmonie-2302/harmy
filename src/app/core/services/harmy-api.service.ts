import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface User {
  id: string;
  nom?: string;
  prenom?: string;
  displayName: string;
  email: string;
  role: 'COUTURIERE' | 'CLIENTE' | 'ADMIN';
  photoURL: string;
  phone: string;
  whatsapp: string;
  atelierId: string | null;
  subscription: {
    status: 'active' | 'inactive';
    plan: string;
    renewalDate: string;
  };
  createdAt: string;
}

export interface AtelierReview {
  id?: string;
  authorId?: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Atelier {
  id: string;
  ownerId: string;
  couturiereId?: string;
  ownerName?: string;
  ownerPhotoURL?: string;
  name: string;
  location: { city: string; country: string };
  bio: string;
  phone?: string;
  address?: string;
  pricing: string;
  portfolioCoverURL: string;
  createdAt: string;
  rating: number;
  reviewCount?: number;
  reviews: AtelierReview[];
}

export interface Measurements {
  bust: number;
  waist: number;
  hips: number;
  arm: number;
}

export interface CustomerAtelier {
  id: string;
  atelierId: string;
  type: 'local' | 'registered';
  registeredUserId: string | null;
  name: string;
  phone: string;
  notes: string;
  measurements: Measurements;
  createdAt: string;
}

export interface MeasureBook {
  id?: string;
  customerUserId: string;
  customerName?: string;
  measurements: Measurements;
  shares: string[];
  shareDetails?: { couturiereId: string; atelierId: string | null; atelierName: string | null; sharedAt: string }[];
  updatedAt: string;
}

/** Carnet qu'une cliente a partagé avec la couturière connectée. */
export interface SharedMeasureBook {
  id: string;
  customerName: string;
  customerUserId: string | null;
  phone: string | null;
  photoURL: string | null;
  measurements: Measurements;
  updatedAt: string;
}

export interface Comment {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  atelierId: string;
  caption: string;
  priceHint: number;
  currency: string;
  tags: string[];
  media: string[];
  likeCount: number;
  commentCount: number;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Order {
  id: string;
  reference?: string;
  atelierId?: string;
  clientId?: string;
  carnetMesureId?: string;
  customerRefId?: string;
  customerName?: string;
  modelCaption?: string;
  status: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE';
  statut?: 'TISSU_RECU' | 'EN_COUTURE' | 'PRET_POUR_ESSAYAGE' | 'LIVRE';
  fabricReceived?: boolean;
  dueDate?: string;
  description?: string;
  prixTotal?: number;
  acompteVerse?: number;
  soldeRestant?: number;
  measurements?: Measurements;
  pricing?: { total: number; deposit: number; balance: number; currency: string };
  timestamps?: { createdAt: string; updatedAt: string; deliveredAt: string | null };
  events?: { type: string; byUserId: string; text: string; createdAt: string }[];
}

export interface Message {
  id: string;
  conversationId: string;
  from: string;
  type: 'text' | 'image';
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  members: string[];
  memberDetails: Record<string, { name: string; photoURL: string; role: string }>;
  atelierId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export interface Task {
  id: string;
  atelierId: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Report {
  id: string;
  postId: string;
  postTitle: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
}

export interface FinanceSummary {
  currency: string;
  totalRevenue: number;
  totalDeposits: number;
  totalBalancesDue: number;
  orderCount: number;
  activeOrderCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class HarmyApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  // Signals réactifs pour l'état d'application (alimentés exclusivement par le backend)
  currentUser = signal<User | null>(null);
  allUsers = signal<User[]>([]);

  // --- Storage R2 ---
  async uploadFile(file: File): Promise<{ fileKey: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<{ fileKey: string; fileUrl: string }>(`${this.baseUrl}/storage/upload`, formData));
  }

  // --- Profil ---
  async getMe(): Promise<User> {
    const me = await firstValueFrom(this.http.get<User>(`${this.baseUrl}/users/me`));
    this.currentUser.set(me);
    return me;
  }

  async updateMe(data: { nom?: string; prenom?: string; phone?: string; whatsapp?: string; photoURL?: string }): Promise<User> {
    const me = await firstValueFrom(this.http.put<User>(`${this.baseUrl}/users/me`, data));
    this.currentUser.set(me);
    return me;
  }

  // --- Posts ---
  async getPosts(tag?: string): Promise<Post[]> {
    const url = tag ? `${this.baseUrl}/posts?tag=${encodeURIComponent(tag)}` : `${this.baseUrl}/posts`;
    return firstValueFrom(this.http.get<Post[]>(url));
  }

  /** Publications de l'atelier connecté (onglet « Mes créations »). */
  async getMyPosts(): Promise<Post[]> {
    return firstValueFrom(this.http.get<Post[]>(`${this.baseUrl}/posts/mine`));
  }

  async createPost(caption: string, priceHint: number, tags: string[], media: string[]): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`${this.baseUrl}/posts`, { caption, priceHint, tags, media }));
  }

  async updatePost(postId: string, data: { caption?: string; priceHint?: number; tags?: string[]; media?: string[] }): Promise<Post> {
    return firstValueFrom(this.http.put<Post>(`${this.baseUrl}/posts/${postId}`, data));
  }

  async deletePost(postId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${this.baseUrl}/posts/${postId}`));
  }

  async toggleLike(postId: string): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`${this.baseUrl}/posts/${postId}/like`, {}));
  }

  async addComment(postId: string, text: string): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`${this.baseUrl}/posts/${postId}/comment`, { text }));
  }

  async deleteComment(postId: string, commentId: string): Promise<Post> {
    return firstValueFrom(this.http.delete<Post>(`${this.baseUrl}/posts/${postId}/comments/${commentId}`));
  }

  // --- Ateliers ---
  async getAteliers(): Promise<Atelier[]> {
    return firstValueFrom(this.http.get<Atelier[]>(`${this.baseUrl}/ateliers`));
  }

  async getAtelier(id: string): Promise<Atelier> {
    return firstValueFrom(this.http.get<Atelier>(`${this.baseUrl}/ateliers/${id}`));
  }

  /** Atelier de la couturière connectée, créé au besoin. */
  async getMyAtelier(): Promise<Atelier> {
    return firstValueFrom(this.http.get<Atelier>(`${this.baseUrl}/ateliers/mine`));
  }

  async updateAtelier(id: string, data: Partial<Atelier> & { city?: string; country?: string }): Promise<Atelier> {
    return firstValueFrom(this.http.put<Atelier>(`${this.baseUrl}/ateliers/${id}`, data));
  }

  async addAtelierReview(id: string, rating: number, text: string): Promise<Atelier> {
    return firstValueFrom(this.http.post<Atelier>(`${this.baseUrl}/ateliers/${id}/reviews`, { rating, text }));
  }

  // --- Customers ---
  async getCustomers(): Promise<CustomerAtelier[]> {
    return firstValueFrom(this.http.get<CustomerAtelier[]>(`${this.baseUrl}/customers`));
  }

  async createCustomer(name: string, phone: string, notes: string, measurements: Measurements, type?: 'local' | 'registered', registeredUserId?: string): Promise<CustomerAtelier> {
    return firstValueFrom(this.http.post<CustomerAtelier>(`${this.baseUrl}/customers`, { name, phone, notes, measurements, type, registeredUserId }));
  }

  async updateCustomer(id: string, data: Partial<CustomerAtelier>): Promise<CustomerAtelier> {
    return firstValueFrom(this.http.put<CustomerAtelier>(`${this.baseUrl}/customers/${id}`, data));
  }

  async deleteCustomer(id: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${this.baseUrl}/customers/${id}`));
  }

  // --- Measurements Sharing ---
  async getMyMeasureBook(): Promise<MeasureBook> {
    return firstValueFrom(this.http.get<MeasureBook>(`${this.baseUrl}/measurements/my`));
  }

  async updateMyMeasureBook(measurements: Measurements): Promise<MeasureBook> {
    return firstValueFrom(this.http.put<MeasureBook>(`${this.baseUrl}/measurements/my`, { measurements }));
  }

  async toggleShare(atelierId: string, grant: boolean): Promise<MeasureBook> {
    return firstValueFrom(this.http.post<MeasureBook>(`${this.baseUrl}/measurements/my/shares`, { atelierId, grant }));
  }

  /** Carnets que des clientes ont partagés avec l'atelier connecté. */
  async getSharedMeasureBooks(): Promise<SharedMeasureBook[]> {
    return firstValueFrom(this.http.get<SharedMeasureBook[]>(`${this.baseUrl}/measurements/shared`));
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.baseUrl}/orders`));
  }

  async createOrder(data: { customerRefId?: string; atelierId?: string; modelPostId?: string | null; modelCaption?: string; total: number; deposit: number; dueDate?: string; fabricReceived?: boolean }): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${this.baseUrl}/orders`, data));
  }

  async updateOrder(id: string, data: { total?: number; deposit?: number; modelCaption?: string; dueDate?: string }): Promise<Order> {
    return firstValueFrom(this.http.put<Order>(`${this.baseUrl}/orders/${id}`, data));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return firstValueFrom(this.http.put<Order>(`${this.baseUrl}/orders/${id}/status`, { status }));
  }

  async addOrderPayment(id: string, amount: number): Promise<Order> {
    return firstValueFrom(this.http.put<Order>(`${this.baseUrl}/orders/${id}/payment`, { amount }));
  }

  async deleteOrder(id: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${this.baseUrl}/orders/${id}`));
  }

  // --- Chat ---
  async getConversations(): Promise<Conversation[]> {
    return firstValueFrom(this.http.get<Conversation[]>(`${this.baseUrl}/conversations`));
  }

  async startConversation(otherUserId: string, atelierId?: string): Promise<Conversation> {
    return firstValueFrom(this.http.post<Conversation>(`${this.baseUrl}/conversations`, { otherUserId, atelierId }));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return firstValueFrom(this.http.get<Message[]>(`${this.baseUrl}/conversations/${conversationId}/messages`));
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    return firstValueFrom(this.http.post<Message>(`${this.baseUrl}/conversations/${conversationId}/messages`, { text }));
  }

  // --- Finance ---
  async getFinanceSummary(): Promise<FinanceSummary> {
    return firstValueFrom(this.http.get<FinanceSummary>(`${this.baseUrl}/finance/summary`));
  }

  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    return firstValueFrom(this.http.get<Task[]>(`${this.baseUrl}/tasks`));
  }

  async createTask(title: string, dueDate?: string): Promise<Task> {
    return firstValueFrom(this.http.post<Task>(`${this.baseUrl}/tasks`, { title, dueDate }));
  }

  async toggleTask(id: string): Promise<Task> {
    return firstValueFrom(this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, {}));
  }

  async deleteTask(id: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${this.baseUrl}/tasks/${id}`));
  }

  // --- Admin ---
  async getReports(): Promise<Report[]> {
    return firstValueFrom(this.http.get<Report[]>(`${this.baseUrl}/admin/reports`));
  }

  async reportPost(postId: string, reason: string): Promise<Report> {
    return firstValueFrom(this.http.post<Report>(`${this.baseUrl}/admin/reports`, { postId, reason }));
  }

  async adminDeletePost(postId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${this.baseUrl}/admin/posts/${postId}`));
  }

  async adminToggleAtelierSubscription(atelierId: string): Promise<unknown> {
    return firstValueFrom(this.http.put<unknown>(`${this.baseUrl}/admin/ateliers/${atelierId}/subscription`, {}));
  }

  async loadAllUsers(): Promise<User[]> {
    try {
      const users = await firstValueFrom(this.http.get<User[]>(`${this.baseUrl}/admin/users`));
      this.allUsers.set(users || []);
      return users || [];
    } catch (e) {
      console.error('Erreur chargement utilisateurs admin:', e);
      return [];
    }
  }
}
