import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from './services/chat.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 bg-pagne-subtle min-h-screen">
      
      @if (!authService.isAuthenticated()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 border border-gold-500/30">
            <span class="material-icons text-4xl">chat</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Messagerie Temps Réel WebSocket</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Connectez-vous pour accéder au chat en direct avec votre atelier de couture.
          </p>
          <button 
            (click)="router.navigate(['/auth/login'])"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter
          </button>
        </div>
      } @else {

        <div class="flex flex-col h-[650px] max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gold-500/20 overflow-hidden text-gray-900">

          <!-- Header Chat -->
          <header class="p-4 bg-noir-profond text-white border-b border-gold-500/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gold-500 text-noir-profond flex items-center justify-center font-bold text-lg shadow-md">
                💬
              </div>
              <div>
                <h2 class="font-bold text-sm text-gold-400">Canal de Messagerie Instantanée</h2>
                <p class="text-[10px] text-gray-300 flex items-center gap-2">
                  <span [class]="chatService.isConnected() ? 'w-2 h-2 rounded-full bg-emerald-500' : 'w-2 h-2 rounded-full bg-red-500'"></span>
                  {{ chatService.isConnected() ? 'Connecté à Netty-SocketIO (Port 9092)' : 'Connexion SocketIO...' }}
                </p>
              </div>
            </div>

            <span class="text-[10px] px-3 py-1 bg-gold-950 text-gold-400 border border-gold-500/40 rounded-full font-mono font-bold">
              Room: {{ activeRoom() }}
            </span>
          </header>

          <!-- Zone Messages -->
          <div #messageContainer class="flex-1 p-6 overflow-y-auto space-y-4 bg-pagne-subtle/30">
            @if (chatService.messages().length === 0) {
              <div class="text-center text-gray-400 text-xs my-12 italic">
                Aucun message en direct dans ce salon. Lancez la discussion !
              </div>
            }

            @for (msg of chatService.messages(); track $index) {
              <div [class]="isMyMessage(msg) ? 'flex flex-col items-end' : 'flex flex-col items-start'">
                <span class="text-[9px] text-gray-400 mb-1 px-1 font-mono">
                  {{ msg.senderName || 'Utilisateur' }} • {{ msg.timestamp | date:'HH:mm' }}
                </span>
                <div 
                  class="max-w-[75%] px-4 py-3 text-xs leading-relaxed shadow-md font-light"
                  [class]="isMyMessage(msg)
                    ? 'bg-gold-600 text-white rounded-2xl rounded-tr-none font-normal'
                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'">
                  {{ msg.content }}
                </div>
              </div>
            }
          </div>

          <!-- Input Message -->
          <footer class="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
            <input
              type="text"
              [(ngModel)]="newMessageText"
              (keyup.enter)="sendMessage()"
              placeholder="Écrivez votre message à la couturière..."
              class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold-500 transition">
            
            <button
              (click)="sendMessage()"
              [disabled]="!newMessageText.trim() || !chatService.isConnected()"
              class="btn-gold px-6 py-3 text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1">
              <span class="material-icons text-sm">send</span> Envoyer
            </button>
          </footer>

        </div>

      }
    </div>
  `
})
export class ChatComponent implements OnInit, AfterViewChecked {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  router = inject(Router);

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  activeRoom = signal<string>('general');
  newMessageText = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      const room = user.atelierId ? `atelier_${user.atelierId}` : `user_${user.id}`;
      this.activeRoom.set(room);
      this.chatService.joinRoom(room, user.id);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  isMyMessage(msg: ChatMessage): boolean {
    const user = this.authService.currentUser();
    return !!user && msg.senderId === user.id;
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;
    const user = this.authService.currentUser();
    if (!user) return;

    this.chatService.sendMessage(this.activeRoom(), user.id, this.newMessageText);
    this.newMessageText = '';
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
