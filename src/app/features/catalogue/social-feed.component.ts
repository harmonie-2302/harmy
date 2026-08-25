import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Post } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ScrollFadeDirective } from '@shared/directives/scroll-fade.directive';
import { API_BASE_URL } from '@core/config/api.config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ScrollFadeDirective],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-pagne-subtle min-h-screen">
      
      <!-- Hero Section / Editorial Banner -->
      <div class="relative bg-pagne-dark rounded-3xl overflow-hidden mb-12 custom-shadow-lg border border-gold-500/30">
        
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold-500/15 via-emerald-800/10 to-transparent pointer-events-none"></div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
          
          <!-- Image Left Column -->
          <div class="md:col-span-5 xl:col-span-4 relative group">
            <div class="relative rounded-2xl overflow-hidden border-2 border-gold-500/40 aspect-[3/4] shadow-2xl">
              <img 
                src="/hero_couture_dress.jpg" 
                class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                alt="Robe Sirène Haute Couture"
                referrerpolicy="no-referrer">
              <div class="absolute top-4 left-4 bg-noir-profond/90 border border-gold-500/50 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5 shadow-lg">
                <span class="material-icons text-xs text-gold-500">auto_awesome</span> Haute Couture Africaine
              </div>
            </div>
          </div>

          <!-- Text Right Column -->
          <div class="md:col-span-7 xl:col-span-8 flex flex-col justify-center">
            <span class="inline-block self-start px-3.5 py-1 rounded-full bg-emerald-950/80 text-gold-300 text-xs font-semibold uppercase tracking-widest mb-4 border border-gold-500/30">
              Savoir-Faire & Élégance Africaine
            </span>
            <h1 class="serif-header text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Harmy'Swing — L'Art de la Couture Africaine
            </h1>
            <p class="text-sm sm:text-base text-gray-300 leading-relaxed font-light mb-6 max-w-xl">
              Découvrez les créations d'exception en Wax, Bazin, Kente et pagnes traditionnels confectionnées par nos maîtres couturiers.
            </p>
            <div class="flex flex-wrap gap-3.5">
              @if (authService.currentUser()?.role === 'COUTURIERE') {
                <button 
                  (click)="openPostModal.set(true)"
                  class="btn-gold px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-lg">
                  <span class="material-icons text-sm">add_circle</span> Publier un Nouveau Modèle
                </button>
              } @else if (!authService.isAuthenticated()) {
                <a 
                  routerLink="/auth/login"
                  class="btn-gold px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-lg">
                  <span class="material-icons text-sm">login</span> Connexion
                </a>
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
              (click)="selectTag(t.id)"
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
                <div class="w-10 h-10 rounded-full bg-gold-100 text-gold-800 font-bold flex items-center justify-center text-xs">
                  {{ (p.authorName || 'A')[0] }}
                </div>
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
              <img [src]="p.media[0] || '/hero_couture_dress.jpg'" (error)="onImgError($event)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Modèle" referrerpolicy="no-referrer">
              
              <div class="absolute top-3 right-3 bg-noir-profond/80 backdrop-blur-md px-3 py-1 rounded-full text-gold-400 text-xs font-extrabold border border-gold-500/30 shadow-md">
                {{ p.priceHint | number }} {{ p.currency || 'FC' }}
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

              <!-- Action Bar (Like & Comments count) -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center gap-4">
                  <!-- Like Button -->
                  <button 
                    (click)="toggleLike(p)"
                    class="flex items-center gap-1.5 hover:text-gold-600 font-medium transition-colors cursor-pointer"
                    [class.text-gold-600]="isLikedByMe(p)">
                    <span class="material-icons text-base">{{ isLikedByMe(p) ? 'favorite' : 'favorite_border' }}</span>
                    <span>{{ p.likeCount || 0 }} J'aime</span>
                  </button>

                  <!-- Comments Toggle Button -->
                  <button 
                    (click)="toggleCommentsDrawer(p.id)"
                    class="flex items-center gap-1.5 hover:text-gold-600 font-medium transition-colors cursor-pointer">
                    <span class="material-icons text-base">chat_bubble_outline</span>
                    <span>{{ p.comments.length || 0 }} Commentaires</span>
                  </button>
                </div>
              </div>

              <!-- Inline Comments Drawer -->
              @if (activeCommentPostId() === p.id) {
                <div class="mt-4 pt-3 border-t border-gold-500/10 space-y-3 animate-fade-in bg-pagne-subtle/50 p-3 rounded-2xl">
                  <h4 class="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Commentaires</h4>
                  
                  <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                    @for (c of p.comments || []; track c.id) {
                      <div class="p-2 bg-white rounded-xl border border-gray-100 text-xs">
                        <div class="flex justify-between items-center mb-1">
                          <strong class="text-gray-900 text-[11px]">{{ c.authorName }}</strong>
                        </div>
                        <p class="text-gray-600 font-light text-[11px]">{{ c.text }}</p>
                      </div>
                    }
                    @if (!p.comments || p.comments.length === 0) {
                      <p class="text-[10px] text-gray-400 italic">Aucun commentaire pour l'instant. Soyez le premier !</p>
                    }
                  </div>

                  <!-- Add Comment Form -->
                  @if (authService.isAuthenticated()) {
                    <div class="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        #commentInput
                        placeholder="Écrire un commentaire..." 
                        class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                        (keyup.enter)="submitComment(p, commentInput.value); commentInput.value = ''">
                      <button 
                        (click)="submitComment(p, commentInput.value); commentInput.value = ''"
                        class="btn-gold px-3 py-1.5 text-xs font-bold shadow">
                        Envoyer
                      </button>
                    </div>
                  } @else {
                    <p class="text-[10px] text-gold-700 italic pt-1">
                      <a routerLink="/auth/login" class="underline font-bold">Connectez-vous</a> pour réagir et publier un commentaire.
                    </p>
                  }
                </div>
              }

            </div>

          </div>
        }
        @if (posts().length === 0) {
          <div class="col-span-full py-12 text-center text-xs text-gray-400 italic">
            Aucun modèle publié dans le catalogue pour le moment.
          </div>
        }
      </div>

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

          <h2 class="serif-header text-xl font-bold text-gray-900 mb-1">Publier une Création Haute Couture</h2>
          <p class="text-xs text-gray-500 mb-6">Mettez en valeur le savoir-faire de votre atelier dans le catalogue Harmy'Swing.</p>

          <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Légende & Description du Modèle</label>
              <textarea 
                formControlName="caption" 
                rows="3" 
                placeholder="Décrivez le modèle, les tissus utilisés (Bazin, Wax, Kente)..."
                class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Prix Estimé (FC)</label>
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
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image du Modèle</label>
              <div class="space-y-2">
                <input 
                  type="file" 
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100">
                <input 
                  type="text" 
                  formControlName="mediaUrl"
                  placeholder="Ou collez directement une URL d'image"
                  class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              </div>
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
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  posts = signal<Post[]>([]);
  selectedTag = signal<string>('all');
  openPostModal = signal(false);
  activeCommentPostId = signal<string | null>(null);

  tags = [
    { id: 'all', label: 'Toutes les créations', icon: '✦' },
    { id: 'Wax', label: 'Motifs Wax', icon: '🎨' },
    { id: 'Bazin', label: 'Bazin Riche', icon: '✨' },
    { id: 'Kente', label: 'Kente Royal', icon: '❖' },
    { id: 'Mariage', label: 'Tenues de Mariage', icon: '💍' }
  ];

  postForm = this.fb.group({
    caption: ['', Validators.required],
    priceHint: [25000, [Validators.required, Validators.min(0)]],
    mediaUrl: ['/hero_couture_dress.jpg', Validators.required],
    tagsInput: ['Wax, Robe']
  });

  ngOnInit() {
    this.loadPosts();
  }

  selectTag(tagId: string) {
    this.selectedTag.set(tagId);
    this.loadPosts();
  }

  async loadPosts() {
    try {
      const tag = this.selectedTag() === 'all' ? undefined : this.selectedTag();
      const list = await this.api.getPosts(tag);
      this.posts.set(list || []);
    } catch (e) {
      console.error('Erreur de chargement du catalogue:', e);
    }
  }

  async toggleLike(post: Post) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const updated = await this.api.toggleLike(post.id);
      this.posts.update(arr => arr.map(p => p.id === post.id ? updated : p));
    } catch (e) {
      console.error(e);
    }
  }

  isLikedByMe(post: Post): boolean {
    const me = this.authService.currentUser();
    if (!me || !post.likes) return false;
    return post.likes.includes(me.id);
  }

  toggleCommentsDrawer(postId: string) {
    this.activeCommentPostId.update(current => current === postId ? null : postId);
  }

  async submitComment(post: Post, text: string) {
    if (!text || !text.trim()) return;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const updatedPost = await this.api.addComment(post.id, text.trim());
      this.posts.update(arr => arr.map(p => p.id === post.id ? updatedPost : p));
    } catch (e) {
      console.error(e);
    }
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== '/hero_couture_dress.jpg') {
      target.src = '/hero_couture_dress.jpg';
    }
  }

  async contactCouturiere(post: Post) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      await this.api.startConversation(post.authorId, post.atelierId);
      this.router.navigate(['/messagerie']);
    } catch (e) {
      console.error(e);
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const result = await this.api.uploadFile(file);
        if (result && (result.fileUrl || result.fileKey)) {
          this.postForm.patchValue({
            mediaUrl: result.fileUrl || `${API_BASE_URL}/storage/${result.fileKey}`
          });
        }
      } catch (e) {
        console.error('Erreur lors du téléversement vers Cloudflare R2:', e);
      }
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
        [mediaUrl || '']
      );
      this.openPostModal.set(false);
      this.postForm.reset({ priceHint: 25000, mediaUrl: '/hero_couture_dress.jpg', tagsInput: 'Wax, Robe' });
      await this.loadPosts();
    } catch (e) {
      console.error(e);
    }
  }
}
