import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Conversation, Message } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-message-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-white">
      
      <!-- Guard Banner (If Not Authenticated) -->
      @if (!authService.isAuthenticated()) {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-gold-500/20 rounded-3xl pagne-card p-8">
          <span class="inline-block p-4 rounded-2xl bg-gold-50 text-gold-600 mb-4 border border-gold-500/30">
            <span class="material-icons text-4xl">chat_bubble_outline</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-gray-900 mb-2">Messagerie Privée Harmy'Swing</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-light mb-6">
            Vous devez être connecté(e) pour échanger des messages avec vos couturières ou clientes.
          </p>
          <button 
            (click)="router.navigate(['/auth/login'])"
            class="btn-gold px-6 py-3 text-xs font-bold shadow-md">
            Se connecter
          </button>
        </div>
      } @else {

        <!-- Message Center Frame -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[70vh] bg-white rounded-3xl overflow-hidden border border-gold-500/20 custom-shadow-lg">
          
          <!-- Inbox Sidebar List -->
          <div class="p-6 border-r border-gray-100 flex flex-col justify-between">
            <div>
              <h2 class="serif-header text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span class="material-icons text-gold-600 text-sm">forum</span> Conversations
              </h2>
              <p class="text-[10px] text-gray-400 font-light mb-6">Vos échanges de couture d'exception</p>
              
              <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                @for (conv of conversations(); track conv.id) {
                  <button 
                    (click)="selectConversation(conv)"
                    class="w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 relative"
                    [class]="selectedConv()?.id === conv.id 
                      ? 'border-gold-500 bg-gold-50/45 custom-shadow' 
                      : 'border-gray-100 bg-gray-50/50 hover:bg-gold-50/20 hover:border-gold-300'">
                    
                    <div class="w-10 h-10 rounded-full bg-gold-100 text-gold-800 font-bold flex items-center justify-center text-xs">
                      {{ (getPartnerDetail(conv).name || 'C')[0] }}
                    </div>
                    <div class="flex-grow">
                      <div class="flex justify-between items-start">
                        <h4 class="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">{{ getPartnerDetail(conv).name }}</h4>
                        <span class="text-[8px] text-gray-400 font-mono">{{ conv.lastMessageAt | date:'shortTime' }}</span>
                      </div>
                      <p class="text-[10px] text-gray-500 font-light line-clamp-1 mt-0.5">{{ conv.lastMessagePreview }}</p>
                    </div>
                  </button>
                }
                @if (conversations().length === 0) {
                  <p class="text-xs text-gray-400 italic text-center py-8">Aucune conversation enregistrée.</p>
                }
              </div>
            </div>

            <!-- Current User Badge -->
            <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-noir-profond text-gold-400 font-bold flex items-center justify-center text-xs">
                  {{ (authService.currentUser()?.nom || 'U')[0] }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-800">{{ authService.currentUser()?.nom || authService.currentUser()?.email }}</h4>
                  <span class="text-[9px] font-extrabold text-gold-600 uppercase tracking-wider">
                    {{ authService.currentUser()?.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Thread View -->
          <div class="md:col-span-2 flex flex-col justify-between bg-pagne-subtle/30">
            @if (selectedConv(); as conv) {
              
              <!-- Chat Header -->
              <div class="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gold-100 text-gold-800 font-bold flex items-center justify-center text-xs">
                    {{ (getPartnerDetail(conv).name || 'C')[0] }}
                  </div>
                  <div>
                    <h3 class="text-xs font-bold text-gray-900">{{ getPartnerDetail(conv).name }}</h3>
                    <p class="text-[9px] text-gray-400 font-light">Canal sécurisé</p>
                  </div>
                </div>
              </div>

              <!-- Message History Scroll -->
              <div id="chat-messages-container" class="p-6 overflow-y-auto space-y-4 flex-grow max-h-[55vh]">
                @for (msg of messages(); track msg.id) {
                  <div [class]="isMe(msg.from) ? 'flex justify-end' : 'flex justify-start'">
                    <div 
                      class="max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm font-light"
                      [class]="isMe(msg.from) 
                        ? 'bg-gold-600 text-white rounded-br-none font-normal' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'">
                      <p>{{ msg.text }}</p>
                      <span class="block text-[8px] mt-1 text-right opacity-70 font-mono">
                        {{ msg.createdAt | date:'shortTime' }}
                      </span>
                    </div>
                  </div>
                }
                @if (messages().length === 0) {
                  <p class="text-xs text-gray-400 italic text-center py-8">Aucun message dans cette discussion.</p>
                }
              </div>

              <!-- Input Bar -->
              <form [formGroup]="messageForm" (ngSubmit)="sendMsg()" class="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input 
                  type="text" 
                  formControlName="text"
                  placeholder="Écrivez votre message..." 
                  class="flex-grow px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500 font-light">
                <button 
                  type="submit" 
                  [disabled]="messageForm.invalid"
                  class="btn-gold px-5 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1">
                  <span class="material-icons text-sm">send</span> Envoyer
                </button>
              </form>

            } @else {
              <!-- Empty State -->
              <div class="h-full flex flex-col items-center justify-center p-8 text-center">
                <span class="material-icons text-5xl text-gold-300 mb-3">forum</span>
                <h3 class="serif-header text-lg font-bold text-gray-700">Sélectionnez une discussion</h3>
                <p class="text-xs text-gray-400 max-w-sm mt-1">
                  Choisissez une conversation dans la liste de gauche.
                </p>
              </div>
            }
          </div>

        </div>

      }
    </div>
  `
})
export class MessageCenterComponent implements OnInit, OnDestroy {
  api = inject(HarmyApi);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  conversations = signal<Conversation[]>([]);
  selectedConv = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);

  messageForm = this.fb.group({
    text: ['', Validators.required]
  });

  private pollInterval: any;

  constructor() {
    effect(() => {
      const conv = this.selectedConv();
      if (conv) {
        this.loadMessages(conv.id);
      }
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadInbox();
      if (typeof window !== 'undefined') {
        this.pollInterval = setInterval(() => {
          this.loadInbox();
          const active = this.selectedConv();
          if (active) {
            this.loadMessages(active.id);
          }
        }, 5000);
      }
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
      this.conversations.set(list || []);
    } catch (e) {
      console.error(e);
    }
  }

  async loadMessages(convId: string) {
    try {
      const list = await this.api.getMessages(convId);
      this.messages.set(list || []);
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
    return fromId === this.authService.currentUser()?.id;
  }

  getPartnerDetail(conv: Conversation) {
    const meId = this.authService.currentUser()?.id;
    const partnerId = conv.members?.find(m => m !== meId) || '';
    return conv.memberDetails?.[partnerId] || { name: 'Interlocuteur', photoURL: '', role: 'USER' };
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
