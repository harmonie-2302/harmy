import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'seamstress' | 'customer' | 'admin';
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

export interface Atelier {
  id: string;
  ownerId: string;
  name: string;
  location: { city: string; country: string };
  bio: string;
  pricing: string;
  portfolioCoverURL: string;
  createdAt: string;
  rating: number;
  reviews: { authorName: string; rating: number; text: string; createdAt: string }[];
}

export interface CustomerAtelier {
  id: string;
  atelierId: string;
  type: 'local' | 'registered';
  registeredUserId: string | null;
  name: string;
  phone: string;
  notes: string;
  measurements: { bust: number; waist: number; hips: number; arm: number };
  createdAt: string;
}

export interface MeasureBook {
  customerUserId: string;
  measurements: { bust: number; waist: number; hips: number; arm: number };
  shares: string[];
  updatedAt: string;
}

export interface Comment {
  id: string;
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
  atelierId: string;
  customerRefId: string;
  customerName: string;
  customerPhone: string;
  customerType: 'local' | 'registered';
  modelPostId: string | null;
  modelCaption: string;
  status: 'FABRIC_RECEIVED' | 'SEWING' | 'FITTING_READY' | 'DELIVERED' | 'ARCHIVED';
  fabricReceived: boolean;
  dueDate: string;
  pricing: { total: number; deposit: number; balance: number; currency: string };
  timestamps: { createdAt: string; updatedAt: string; deliveredAt: string | null };
  events: { type: string; byUserId: string; text: string; createdAt: string }[];
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
export class HarmyApi {
  private http = inject(HttpClient);

  // Core global signals for reactive state
  currentUser = signal<User | null>(null);
  allUsers = signal<User[]>([]);

  constructor() {
    this.refreshSession();
    this.fetchUsersList();
  }

  async refreshSession() {
    try {
      const user = await firstValueFrom(this.http.get<User>('/api/auth/current'));
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async fetchUsersList() {
    try {
      const list = await firstValueFrom(this.http.get<User[]>('/api/users/list'));
      this.allUsers.set(list);
    } catch {
      this.allUsers.set([]);
    }
  }

  async register(displayName: string, email: string, role: 'seamstress' | 'customer' | 'admin', phone: string): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/register', { displayName, email, role, phone }));
    this.currentUser.set(user);
    await this.fetchUsersList();
    return user;
  }

  async login(email: string): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/login', { email }));
    this.currentUser.set(user);
    return user;
  }

  async switchUser(userId: string): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/switch-user', { userId }));
    this.currentUser.set(user);
    return user;
  }

  // --- Posts ---
  async getPosts(tag?: string): Promise<Post[]> {
    const url = tag ? `/api/posts?tag=${encodeURIComponent(tag)}` : '/api/posts';
    return firstValueFrom(this.http.get<Post[]>(url));
  }

  async createPost(caption: string, priceHint: number, tags: string[], media: string[]): Promise<Post> {
    return firstValueFrom(this.http.post<Post>('/api/posts', { caption, priceHint, tags, media }));
  }

  async toggleLike(postId: string): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`/api/posts/${postId}/like`, {}));
  }

  async addComment(postId: string, text: string): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(`/api/posts/${postId}/comment`, { text }));
  }

  // --- Ateliers ---
  async getAteliers(): Promise<Atelier[]> {
    return firstValueFrom(this.http.get<Atelier[]>('/api/ateliers'));
  }

  async getAtelier(id: string): Promise<Atelier> {
    return firstValueFrom(this.http.get<Atelier>(`/api/ateliers/${id}`));
  }

  async updateAtelier(id: string, data: Partial<Atelier>): Promise<Atelier> {
    return firstValueFrom(this.http.put<Atelier>(`/api/ateliers/${id}`, data));
  }

  async addAtelierReview(id: string, rating: number, text: string): Promise<Atelier> {
    return firstValueFrom(this.http.post<Atelier>(`/api/ateliers/${id}/reviews`, { rating, text }));
  }

  // --- Customers ---
  async getCustomers(): Promise<CustomerAtelier[]> {
    return firstValueFrom(this.http.get<CustomerAtelier[]>('/api/customers'));
  }

  async createCustomer(name: string, phone: string, notes: string, measurements: { bust: number; waist: number; hips: number; arm: number }, type?: 'local' | 'registered', registeredUserId?: string): Promise<CustomerAtelier> {
    return firstValueFrom(this.http.post<CustomerAtelier>('/api/customers', { name, phone, notes, measurements, type, registeredUserId }));
  }

  async updateCustomer(id: string, data: Partial<CustomerAtelier>): Promise<CustomerAtelier> {
    return firstValueFrom(this.http.put<CustomerAtelier>(`/api/customers/${id}`, data));
  }

  // --- Measurements Sharing ---
  async getMyMeasureBook(): Promise<MeasureBook> {
    return firstValueFrom(this.http.get<MeasureBook>('/api/measurements/my'));
  }

  async updateMyMeasureBook(measurements: { bust: number; waist: number; hips: number; arm: number }): Promise<MeasureBook> {
    return firstValueFrom(this.http.put<MeasureBook>('/api/measurements/my', { measurements }));
  }

  async toggleShare(atelierId: string, grant: boolean): Promise<MeasureBook> {
    return firstValueFrom(this.http.post<MeasureBook>('/api/measurements/my/shares', { atelierId, grant }));
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>('/api/orders'));
  }

  async createOrder(data: { customerRefId: string; modelPostId?: string | null; modelCaption?: string; total: number; deposit: number; dueDate?: string; fabricReceived?: boolean }): Promise<Order> {
    return firstValueFrom(this.http.post<Order>('/api/orders', data));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return firstValueFrom(this.http.put<Order>(`/api/orders/${id}/status`, { status }));
  }

  async addOrderPayment(id: string, amount: number): Promise<Order> {
    return firstValueFrom(this.http.put<Order>(`/api/orders/${id}/payment`, { amount }));
  }

  async deleteOrder(id: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`/api/orders/${id}`));
  }

  // --- Chat ---
  async getConversations(): Promise<Conversation[]> {
    return firstValueFrom(this.http.get<Conversation[]>('/api/conversations'));
  }

  async startConversation(otherUserId: string, atelierId?: string): Promise<Conversation> {
    return firstValueFrom(this.http.post<Conversation>('/api/conversations', { otherUserId, atelierId }));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return firstValueFrom(this.http.get<Message[]>(`/api/conversations/${conversationId}/messages`));
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    return firstValueFrom(this.http.post<Message>(`/api/conversations/${conversationId}/messages`, { text }));
  }

  // --- Finance ---
  async getFinanceSummary(): Promise<FinanceSummary> {
    return firstValueFrom(this.http.get<FinanceSummary>('/api/finance/summary'));
  }

  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    return firstValueFrom(this.http.get<Task[]>('/api/tasks'));
  }

  async createTask(title: string, dueDate?: string): Promise<Task> {
    return firstValueFrom(this.http.post<Task>('/api/tasks', { title, dueDate }));
  }

  async toggleTask(id: string): Promise<Task> {
    return firstValueFrom(this.http.put<Task>(`/api/tasks/${id}`, {}));
  }

  async deleteTask(id: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`/api/tasks/${id}`));
  }

  // --- Admin ---
  async getReports(): Promise<Report[]> {
    return firstValueFrom(this.http.get<Report[]>('/api/admin/reports'));
  }

  async reportPost(postId: string, reason: string): Promise<Report> {
    return firstValueFrom(this.http.post<Report>('/api/admin/reports', { postId, reason }));
  }

  async adminDeletePost(postId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`/api/admin/posts/${postId}`));
  }

  async adminToggleAtelierSubscription(atelierId: string): Promise<unknown> {
    return firstValueFrom(this.http.put<unknown>(`/api/admin/ateliers/${atelierId}/subscription`, {}));
  }
}
