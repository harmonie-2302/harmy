import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId?: string;
  senderName?: string;
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {

  private authService = inject(AuthService);
  private socket!: Socket;
  private readonly SERVER_URL = 'http://localhost:9092'; // Endpoint Netty-SocketIO backend

  // Signals réactifs Angular 17 pour la messagerie
  private messagesSignal = signal<ChatMessage[]>([]);
  private isConnectedSignal = signal<boolean>(false);
  private currentRoomSignal = signal<string | null>(null);

  readonly messages = computed(() => this.messagesSignal());
  readonly isConnected = computed(() => this.isConnectedSignal());
  readonly currentRoom = computed(() => this.currentRoomSignal());

  // Observable RxJS pour notifications temps réel si nécessaire
  private messageSubject = new Subject<ChatMessage>();
  readonly message$ = this.messageSubject.asObservable();

  constructor() {
    this.initSocketConnection();
  }

  private initSocketConnection(): void {
    const token = this.authService.getToken();
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket', 'polling'],
      query: token ? { token } : {},
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO Client] Connecté au serveur Spring Boot (Session ID: ' + this.socket.id + ')');
      this.isConnectedSignal.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Déconnecté du serveur.');
      this.isConnectedSignal.set(false);
    });

    // Écoute des nouveaux messages temps réel envoyés par le backend
    this.socket.on('receive_message', (message: ChatMessage) => {
      console.log('[Socket.IO Client] Message reçu:', message);
      this.messagesSignal.update(current => [...current, message]);
      this.messageSubject.next(message);
    });
  }

  joinRoom(roomId: string, userId?: string): void {
    if (!roomId) return;
    this.currentRoomSignal.set(roomId);
    this.messagesSignal.set([]); // Réinitialise la liste pour le nouveau salon

    this.socket.emit('join_room', { roomId, userId });
    console.log(`[Socket.IO Client] Demande pour rejoindre la room: ${roomId}`);
  }

  sendMessage(roomId: string, senderId: string, content: string): void {
    if (!content || !content.trim()) return;

    const payload = {
      roomId,
      senderId,
      content
    };

    this.socket.emit('send_message', payload);
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
