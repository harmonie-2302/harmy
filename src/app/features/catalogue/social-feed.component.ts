import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Post } from '@core/services/harmy-api.service';
import { CommonModule } from '@angular/common';
import { KenteInspirationsComponent as KenteInspirations } from '@features/catalogue/kente-inspirations.component';
import { ScrollFadeDirective } from '@shared/directives/scroll-fade.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, KenteInspirations, ScrollFadeDirective],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle">
      
      <!-- Hero Section / Editorial Banner with Warm African Fashion Vibe -->
      <div class="relative bg-pagne-dark rounded-3xl overflow-hidden mb-12 custom-shadow-lg border border-gold-500/30">
        
        <!-- Abstract glowing light source in background for warm ambience -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold-500/15 via-emerald-800/10 to-transparent pointer-events-none"></div>
        <div class="absolute -right-12 -bottom-12 w-72 h-72 bg-bordeaux-800/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
          
          <!-- Image Left Column -->
          <div class="md:col-span-5 xl:col-span-4 relative group">
            <div class="absolute inset-0 bg-gradient-to-tr from-gold-500/30 via-emerald-800/30 to-bordeaux-800/30 rounded-2xl filter blur-md group-hover:blur-lg transition-all duration-300"></div>
            <div class="relative rounded-2xl overflow-hidden border-2 border-gold-500/40 aspect-[3/4] shadow-2xl">
              <img 
                src="/hero_couture_dress.jpg" 
                class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                alt="Robe Sirène Haute Couture"
                referrerpolicy="no-referrer">
              <!-- Overlay with golden badge -->
              <div class="absolute top-4 left-4 bg-noir-profond/90 border border-gold-500/50 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5 shadow-lg">
                <span class="material-icons text-xs text-gold-500">auto_awesome</span> Collection Haute Couture
              </div>
            </div>
          </div>

          <!-- Text Right Column -->
          <div class="md:col-span-7 xl:col-span-8 flex flex-col justify-center">
            <span class="inline-block self-start px-3.5 py-1 rounded-full bg-emerald-950/80 text-gold-300 text-xs font-semibold uppercase tracking-widest mb-4 border border-gold-500/30">
              Savoir-Faire & Élégance Africaine
            </span>
            <h1 class="serif-header text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              L'Art de la Couture Africaine
            </h1>
            <p class="text-sm sm:text-base text-gray-300 leading-relaxed font-light mb-6 max-w-xl">
              Découvrez les créations d'exception en Wax, Bazin, Kente et pagnes traditionnels confectionnées par nos maîtres couturiers. Explorez les collections, préservez l'authenticité textile et commandez sur-mesure.
            </p>
            <div class="flex flex-wrap gap-3.5">
              @if (api.currentUser()?.role === 'seamstress') {
                <button 
                  (click)="openPostModal.set(true)"
                  class="btn-gold px-5 py-3 text-sm font-bold flex items-center gap-2">
                  <span class="material-icons text-sm">add_circle</span> Publier un modèle
                </button>
              } @else if (!api.currentUser()) {
                <button 
                  (click)="router.navigate(['/auth'])"
                  class="btn-gold px-5 py-3 text-sm font-bold flex items-center gap-2">
                  <span class="material-icons text-sm">login</span> Se connecter / S'inscrire
                </button>
              }
            </div>
          </div>

        </div>
      </div>

      <!-- Tag Filter Buttons -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gold-500/20">
        <div class="flex flex-wrap gap-2">
          @for (t of tags; track t.id) {
            <button 
              (click)="selectedTag.set(t.id)"
              class="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              [class]="selectedTag() === t.id 
                ? 'btn-gold shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gold-50 hover:text-gold-900 border border-gold-500/20'">
              <span>{{ t.icon }}</span>
              <span>{{ t.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Main Feed Posts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        @for (p of posts(); track p.id) {
          <div appScrollFade class="pagne-card bg-white rounded-3xl overflow-hidden border border-gold-500/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            
            <!-- Post Header Author Info -->
            <div class="p-4 flex items-center justify-between border-b border-gray-100">
              <div class="flex items-center gap-3">
                <img [src]="p.authorAvatar" class="w-10 h-10 rounded-full object-cover border border-gold-500/30" referrerpolicy="no-referrer" alt="Avatar">
                <div>
                  <h3 class="text-xs font-bold text-gray-900 leading-tight">{{ p.authorName }}</h3>
                  <span class="text-[10px] text-gold-600 font-semibold">Maison de Couture</span>
                </div>
              </div>
              <button 
                (click)="contactCouturiere(p)"
                class="px-3 py-1.5 bg-gold-50 text-gold-700 hover:bg-gold-500 hover:text-noir-profond border border-gold-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1">
                <span class="material-icons text-xs">chat</span> Échanger
              </button>
            </div>

            <!-- Media Carousel / Image -->
            <div class="relative aspect-[4/3] bg-noir-profond overflow-hidden">
              <img [src]="p.media[0]" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Modèle" referrerpolicy="no-referrer">
              
              <div class="absolute top-3 right-3 bg-noir-profond/80 backdrop-blur-md px-3 py-1 rounded-full text-gold-400 text-xs font-extrabold border border-gold-500/30 shadow-md">
                {{ p.priceHint | number }} {{ p.currency }}
              </div>
            </div>

            <!-- Caption & Actions -->
            <div class="p-5 flex-grow flex flex-col justify-between">
              <div>
                <p class="text-xs text-gray-700 font-light leading-relaxed mb-4 line-clamp-3">
                  {{ p.caption }}
                </p>

                <!-- Tags Badges -->
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (tag of p.tags; track tag) {
                    <span class="px-2.5 py-0.5 rounded-md bg-gold-50 text-gold-800 text-[10px] font-semibold border border-gold-500/20">
                      #{{ tag }}
                    </span>
                  }
                </div>
              </div>

              <!-- Action Bar (Like, Comment, Save) -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center gap-4">
                  <button 
                    (click)="toggleLike(p)"
                    class="flex items-center gap-1 hover:text-gold-600 font-medium transition-colors"
                    [class.text-gold-600]="isLikedByMe(p)">
                    <span class="material-icons text-base">{{ isLikedByMe(p) ? 'favorite' : 'favorite_border' }}</span>
                    <span>{{ p.likeCount }}</span>
                  </button>

                  <button 
                    (click)="toggleComments(p.id)"
                    class="flex items-center gap-1 hover:text-gold-600 font-medium transition-colors">
                    <span class="material-icons text-base">chat_bubble_outline</span>
                    <span>{{ p.commentCount }}</span>
                  </button>
                </div>

                <button 
                  (click)="toggleSave(p.id)"
                  class="text-gray-400 hover:text-gold-600 transition-colors">
                  <span class="material-icons text-base">{{ isSaved(p.id) ? 'bookmark' : 'bookmark_border' }}</span>
                </button>
              </div>

              <!-- Comments Section Collapse -->
              @if (openCommentPostId() === p.id) {
                <div class="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
                  <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                    @for (c of p.comments; track c.id) {
                      <div class="p-2 bg-gray-50 rounded-xl text-xs flex gap-2">
                        <img [src]="c.authorAvatar" class="w-6 h-6 rounded-full object-cover">
                        <div>
                          <strong class="text-gray-900 text-[11px] block">{{ c.authorName }}</strong>
                          <p class="text-gray-600 font-light text-[11px]">{{ c.text }}</p>
                        </div>
                      </div>
                    }
                  </div>

                  <form [formGroup]="commentForm" (ngSubmit)="submitComment(p.id)" class="flex gap-2">
                    <input 
                      type="text" 
                      formControlName="text" 
                      placeholder="Ajouter un commentaire..." 
                      class="flex-grow px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
                    <button type="submit" class="btn-gold px-3 py-1.5 text-xs font-bold">Publier</button>
                  </form>
                </div>
              }

            </div>

          </div>
        }
      </div>

      <!-- Include Kente Inspirations Section -->
      <app-kente-inspirations></app-kente-inspirations>

    </div>

    <!-- Create Post Modal for Seamstresses -->
    @if (openPostModal()) {
      <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gold-500/40 shadow-2xl relative">
          
          <button 
            (click)="openPostModal.set(false)"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>

          <h2 class="serif-header text-xl font-bold text-gray-900 mb-1">Publier une Création</h2>
          <p class="text-xs text-gray-500 mb-6">Mettez en valeur le savoir-faire de votre atelier auprès de la communauté.</p>

          <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Légende & Description</label>
              <textarea 
                formControlName="caption" 
                rows="3" 
                placeholder="Décrivez le modèle, les tissus utilisés (Bazin, Wax, Kente)..."
                class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Prix Estimé (FCFA)</label>
                <input 
                  type="number" 
                  formControlName="priceHint"
                  class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tags (séparés par des virgules)</label>
                <input 
                  type="text" 
                  formControlName="tagsInput" 
                  placeholder="Wax, Robe, Mariage"
                  class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">URL de l'image de démonstration</label>
              <input 
                type="text" 
                formControlName="mediaUrl"
                class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                (click)="openPostModal.set(false)" 
                class="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900">
                Annuler
              </button>
              <button 
                type="submit" 
                [disabled]="postForm.invalid"
                class="btn-gold px-5 py-2 text-xs font-bold shadow-md">
                Publier la Création
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class SocialFeedComponent implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  posts = signal<Post[]>([]);
  selectedTag = signal<string>('all');
  openCommentPostId = signal<string | null>(null);
  savedPostIds = signal<Set<string>>(new Set());
  openPostModal = signal(false);

  tags = [
    { id: 'all', label: 'Toutes les créations', icon: '✦' },
    { id: 'Wax', label: 'Motifs Wax', icon: '🎨' },
    { id: 'Bazin', label: 'Bazin Riche', icon: '✨' },
    { id: 'Kente', label: 'Kente Royal', icon: '❖' },
    { id: 'Mariage', label: 'Tenues de Mariage', icon: '💍' }
  ];

  commentForm = this.fb.group({
    text: ['', Validators.required]
  });

  postForm = this.fb.group({
    caption: ['', Validators.required],
    priceHint: [25000, [Validators.required, Validators.min(0)]],
    mediaUrl: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', Validators.required],
    tagsInput: ['Wax, Robe']
  });

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    try {
      const tag = this.selectedTag() === 'all' ? undefined : this.selectedTag();
      const list = await this.api.getPosts(tag);
      this.posts.set(list);
    } catch (e) {
      console.error(e);
    }
  }

  async toggleLike(post: Post) {
    try {
      const updated = await this.api.toggleLike(post.id);
      this.posts.update(arr => arr.map(p => p.id === post.id ? updated : p));
    } catch (e) {
      console.error(e);
    }
  }

  isLikedByMe(post: Post): boolean {
    const me = this.api.currentUser();
    if (!me) return false;
    return post.likes.includes(me.id);
  }

  toggleComments(postId: string) {
    if (this.openCommentPostId() === postId) {
      this.openCommentPostId.set(null);
    } else {
      this.openCommentPostId.set(postId);
      this.commentForm.reset();
    }
  }

  async submitComment(postId: string) {
    if (this.commentForm.invalid) return;
    const text = this.commentForm.value.text || '';
    try {
      const updated = await this.api.addComment(postId, text);
      this.posts.update(arr => arr.map(p => p.id === postId ? updated : p));
      this.commentForm.reset();
    } catch (e) {
      console.error(e);
    }
  }

  toggleSave(postId: string) {
    this.savedPostIds.update(set => {
      const next = new Set(set);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }

  isSaved(postId: string): boolean {
    return this.savedPostIds().has(postId);
  }

  async contactCouturiere(post: Post) {
    const me = this.api.currentUser();
    if (!me) {
      this.router.navigate(['/auth']);
      return;
    }

    if (post.authorId === me.id) {
      alert("C'est votre propre publication !");
      return;
    }

    try {
      await this.api.startConversation(post.authorId, post.atelierId);
      this.router.navigate(['/chat']);
    } catch (e) {
      console.error(e);
    }
  }

  async submitPost() {
    if (this.postForm.invalid) return;
    const { caption, priceHint, mediaUrl, tagsInput } = this.postForm.value;

    const tags = (tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      await this.api.createPost(
        caption || '',
        priceHint || 0,
        tags,
        [mediaUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800']
      );
      this.openPostModal.set(false);
      this.postForm.reset({
        caption: '',
        priceHint: 20000,
        mediaUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        tagsInput: ''
      });
      await this.loadPosts();
    } catch (e) {
      console.error(e);
    }
  }
}
