import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from './services/chat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[600px] max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden text-white">

      <!-- Header Chat -->
      <header class="p-4 bg-gray-800/90 border-b border-gray-700 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center font-bold text-gray-950 text-lg shadow-md">
            💬
          </div>
          <div>
            <h2 class="font-bold text-lg text-gray-100">Discussion Commande #CMD-101</h2>
            <p class="text-xs text-gray-400 flex items-center gap-2">
              <span [class]="chatService.isConnected() ? 'w-2 h-2 rounded-full bg-emerald-500' : 'w-2 h-2 rounded-full bg-red-500'"></span>
              {{ chatService.isConnected() ? 'En ligne (Socket.IO)' : 'Hors ligne' }}
            </p>
          </div>
        </div>

        <span class="text-xs px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full font-mono">
          Room: {{ activeRoom() }}
        </span>
      </header>

      <!-- Zone Messages -->
      <div #messageContainer class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-950/60">
        <div *ngIf="chatService.messages().length === 0" class="text-center text-gray-500 text-sm my-12 italic">
          Aucun message pour le moment. Lancez la conversation !
        </div>

        <div *ngFor="let msg of chatService.messages()"
          [class]="isMyMessage(msg) ? 'flex flex-col items-end' : 'flex flex-col items-start'">
          <span class="text-[10px] text-gray-400 mb-1 px-1">
            {{ msg.senderName || 'Utilisateur' }} • {{ msg.timestamp | date:'HH:mm' }}
          </span>
          <div [class]="isMyMessage(msg)
            ? 'max-w-[75%] px-4 py-3 bg-amber-500 text-gray-950 font-medium rounded-2xl rounded-tr-none shadow-lg'
            : 'max-w-[75%] px-4 py-3 bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none border border-gray-700 shadow-md'">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- Input Message -->
      <footer class="p-4 bg-gray-900 border-t border-gray-800 flex gap-3 items-center">
        <input
          type="text"
          [(ngModel)]="newMessageText"
          (keyup.enter)="sendMessage()"
          placeholder="Écrivez votre message à la couturière..."
          class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition">
        
        <button
          (click)="sendMessage()"
          [disabled]="!newMessageText.trim() || !chatService.isConnected()"
          class="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50">
          Envoyer 🚀
        </button>
      </footer>

    </div>
  `
})
export class ChatComponent implements OnInit, AfterViewChecked {

  chatService = inject(ChatService);
  authService = inject(AuthService);

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  activeRoom = signal<string>('order_demo_101');
  newMessageText = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    const userId = user ? user.id : 'demo-user-1';
    this.chatService.joinRoom(this.activeRoom(), userId);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;

    const user = this.authService.currentUser();
    const senderId = user ? user.id : 'demo-user-1';

    this.chatService.sendMessage(this.activeRoom(), senderId, this.newMessageText);
    this.newMessageText = '';
  }

  isMyMessage(msg: ChatMessage): boolean {
    const user = this.authService.currentUser();
    const currentUserId = user ? user.id : 'demo-user-1';
    return msg.senderId === currentUserId;
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
