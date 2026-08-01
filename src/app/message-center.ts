import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApi, Conversation, Message } from './harmy-api';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-message-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-white">
      
      <!-- Guard Banner (If Not Authenticated) -->
      @if (!api.currentUser()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-mahogany-100 rounded-2xl custom-shadow p-8">
          <span class="inline-block p-4 rounded-full bg-mahogany-50 text-mahogany-500 mb-4 animate-bounce">
            <span class="material-icons text-4xl">chat_bubble_outline</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-mahogany-500 mb-2">Messagerie Privée Sécurisée</h2>
          <p class="text-xs text-gray-500 leading-relaxed font-light mb-6">
            Vous devez être connectée pour initier des discussions directes avec les couturières et de suivre vos ajustements de vêtements.
          </p>
          <button 
            (click)="router.navigate(['/auth'])"
            class="bg-mahogany-500 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-mahogany-600 transition-all active:translate-y-px shadow-sm">
            Se connecter ou créer un compte
          </button>
        </div>
      } @else {

        <!-- Message Center Frame -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[70vh] bg-white rounded-2xl overflow-hidden border border-gray-100 custom-shadow-lg">
          
          <!-- Inbox Sidebar List -->
          <div class="p-6 border-r border-gray-100 flex flex-col justify-between">
            <div>
              <h2 class="serif-header text-lg font-bold text-mahogany-500 mb-1 flex items-center gap-2">
                <span class="material-icons text-amber-500 text-sm">forum</span> Conversations
              </h2>
              <p class="text-[10px] text-gray-400 font-light mb-6">Vos échanges privés de couture d'exception</p>
              
              <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                @for (conv of conversations(); track conv.id) {
                  <button 
                    (click)="selectConversation(conv)"
                    class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 relative"
                    [class]="selectedConv()?.id === conv.id 
                      ? 'border-mahogany-500 bg-mahogany-50/45 custom-shadow' 
                      : 'border-gray-50 bg-gray-50/50 hover:bg-mahogany-50/20 hover:border-mahogany-200'">
                    
                    <img [src]="getPartnerDetail(conv).photoURL" class="w-10 h-10 rounded-full object-cover border border-mahogany-100" referrerpolicy="no-referrer" alt="Avatar">
                    <div class="flex-grow">
                      <div class="flex justify-between items-start">
                        <h4 class="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">{{ getPartnerDetail(conv).name }}</h4>
                        <span class="text-[8px] text-gray-400 font-mono">{{ conv.lastMessageAt | date:'shortTime' }}</span>
                      </div>
                      <p class="text-[10px] text-gray-500 font-light line-clamp-1 mt-0.5">{{ conv.lastMessagePreview }}</p>
                    </div>
                  </button>
                } @empty {
                  <div class="text-center py-10 text-gray-400">
                    <span class="material-icons text-3xl mb-1">mark_chat_read</span>
                    <p class="text-xs font-light">Aucune conversation en cours.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Helpful tips -->
            <div class="p-4 bg-amber-50/60 rounded-xl border border-amber-100 text-left mt-4 hidden md:block">
              <h4 class="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">Interaction Live</h4>
              <p class="text-[10px] text-amber-600 font-light leading-snug">
                Envoyez un message pour tester la simulation. Le destinataire vous répondra automatiquement en moins d'une seconde !
              </p>
            </div>
          </div>

          <!-- Active Chat Window -->
          <div class="md:col-span-2 flex flex-col justify-between bg-gray-50/30">
            @if (selectedConv()) {
              <!-- Chat Header -->
              <div class="bg-white p-5 border-b border-gray-100 flex items-center gap-3">
                <img [src]="getPartnerDetail(selectedConv()!).photoURL" class="w-10 h-10 rounded-full object-cover border border-mahogany-100" referrerpolicy="no-referrer" alt="Avatar">
                <div>
                  <h3 class="text-xs font-bold text-gray-800">{{ getPartnerDetail(selectedConv()!).name }}</h3>
                  <span class="px-2 py-0.5 rounded bg-mahogany-50 text-[8px] font-bold text-mahogany-600 uppercase tracking-widest">
                    {{ getPartnerDetail(selectedConv()!).role === 'seamstress' ? 'Couturière' : 'Cliente' }}
                  </span>
                </div>
              </div>

              <!-- Messages Stream (Chronological) -->
              <div class="flex-grow p-6 overflow-y-auto space-y-4 max-h-[50vh] bg-white/50" id="chat-messages-container">
                @for (m of messages(); track m.id) {
                  <div class="flex flex-col" [class]="isMe(m.from) ? 'items-end' : 'items-start'">
                    <!-- Chat Bubble -->
                    <div 
                      class="max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed"
                      [class]="isMe(m.from) 
                        ? 'bg-mahogany-500 text-white rounded-br-none custom-shadow' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'">
                      {{ m.text }}
                    </div>
                    <!-- Time under bubble -->
                    <span class="text-[8px] text-gray-400 mt-1 font-mono px-1">
                      {{ m.createdAt | date:'shortTime' }}
                    </span>
                  </div>
                }
              </div>

              <!-- Message Input Footer -->
              <div class="p-4 bg-white border-t border-gray-100">
                <form [formGroup]="messageForm" (ngSubmit)="sendMsg()">
                  <div class="flex gap-2">
                    <input 
                      formControlName="text"
                      type="text"
                      placeholder="Tapez votre message ici..."
                      class="flex-grow px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs font-medium">
                    <button 
                      type="submit"
                      [disabled]="messageForm.invalid"
                      class="bg-mahogany-500 text-white px-5 rounded-xl font-bold hover:bg-mahogany-600 disabled:opacity-50 transition-all flex items-center justify-center">
                      <span class="material-icons text-lg">send</span>
                    </button>
                  </div>
                </form>
              </div>

            } @else {
              <!-- Chat Placeholder -->
              <div class="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <span class="material-icons text-5xl mb-3 text-mahogany-200">question_answer</span>
                <h3 class="serif-header text-sm font-bold text-gray-600">Aucune discussion active</h3>
                <p class="text-xs text-gray-400 font-light max-w-xs mt-1">Sélectionnez une conversation dans la liste de gauche ou parcourez le catalogue de créations pour contacter une couturière d'exception.</p>
              </div>
            }
          </div>

        </div>

      }

    </div>
  `
})
export class MessageCenter implements OnInit, OnDestroy {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  conversations = signal<Conversation[]>([]);
  selectedConv = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  messageForm = this.fb.group({
    text: ['', Validators.required]
  });

  constructor() {
    // Automatically re-fetch chat stream when conversation transitions
    effect(() => {
      const conv = this.selectedConv();
      if (conv) {
        this.loadMessages(conv.id);
      }
    });
  }

  ngOnInit() {
    if (this.api.currentUser()) {
      this.loadInbox();
      // Regular refresh for dynamic feeling (simulated chat socket)
      this.pollInterval = setInterval(() => {
        this.loadInbox();
        const active = this.selectedConv();
        if (active) {
          this.loadMessages(active.id);
        }
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  async loadInbox() {
    try {
      const list = await this.api.getConversations();
      this.conversations.set(list);
    } catch (e) {
      console.error(e);
    }
  }

  async loadMessages(convId: string) {
    try {
      const list = await this.api.getMessages(convId);
      this.messages.set(list);
      this.scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  }

  selectConversation(conv: Conversation) {
    this.selectedConv.set(conv);
    this.messageForm.reset();
  }

  isMe(fromId: string): boolean {
    return fromId === this.api.currentUser()?.id;
  }

  getPartnerDetail(conv: Conversation) {
    const meId = this.api.currentUser()?.id;
    const partnerId = conv.members.find(m => m !== meId) || '';
    return conv.memberDetails[partnerId] || { name: 'Créatrice Anonyme', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'seamstress' };
  }

  async sendMsg() {
    const active = this.selectedConv();
    if (this.messageForm.invalid || !active) return;

    const text = this.messageForm.value.text || '';
    try {
      const newMsg = await this.api.sendMessage(active.id, text);
      this.messages.update(arr => [...arr, newMsg]);
      this.messageForm.reset();
      this.scrollToBottom();

      // Trigger automatic reply and poll fresh inbox quickly
      setTimeout(() => {
        this.loadMessages(active.id);
        this.loadInbox();
      }, 1600);
    } catch (e) {
      console.error(e);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const element = document.getElementById('chat-messages-container');
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}
