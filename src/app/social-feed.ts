import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApi, Post } from './harmy-api';
import { CommonModule } from '@angular/common';
import { KenteInspirations } from './kente-inspirations';
import { ScrollFadeDirective } from './scroll-fade.directive';

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
                  class="btn-gold px-5 py-3 text-sm font-bold">
                  Se connecter
                </button>
              }
              <button 
                (click)="selectedTag.set(null)"
                class="btn-emerald px-5 py-3 text-sm font-medium flex items-center gap-1.5">
                <span class="material-icons text-sm text-gold-400">grid_view</span> Explorer le catalogue
              </button>
            </div>
          </div>

        </div>

        <!-- Subtle geometric pagne section divider line -->
        <div class="pagne-divider"></div>
      </div>

      <!-- Section Inspirations Kente -->
      <app-kente-inspirations appScrollFade></app-kente-inspirations>

      <!-- Tags Filtering Bar -->
      <div class="mb-10" appScrollFade>
        <div class="flex items-center justify-between mb-4">
          <h2 class="serif-header text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span class="material-icons text-gold-600">style</span> Catalogue de Motifs & Styles
          </h2>
          @if (selectedTag()) {
            <button 
              (click)="selectedTag.set(null)"
              class="text-xs font-semibold text-bordeaux-800 hover:underline flex items-center gap-1">
              Réinitialiser le filtre <span class="material-icons text-xs">close</span>
            </button>
          }
        </div>
        <div class="flex flex-wrap gap-2.5 pb-4 border-b border-gold-500/20">
          @for (tag of popularTags; track tag) {
            <button 
              (click)="toggleTag(tag)"
              class="px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1"
              [class]="selectedTag() === tag 
                ? 'btn-gold shadow-md' 
                : 'bg-white text-gray-800 hover:bg-gold-50 border border-gold-500/20 shadow-sm'">
              #{{ tag }}
            </button>
          }
        </div>
      </div>

      <!-- Main Posts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (post of filteredPosts(); track post.id) {
          <div appScrollFade class="pagne-card overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all duration-300">
            
            <!-- Designer Header -->
            <div class="p-4 flex items-center justify-between border-b border-gold-500/10 bg-white">
              <div class="flex items-center gap-2.5">
                <img [src]="post.authorAvatar" class="w-10 h-10 rounded-full object-cover border-2 border-gold-500/40" referrerpolicy="no-referrer" alt="Créateur">
                <div>
                  <h4 class="text-xs font-bold text-gray-900">{{ post.authorName }}</h4>
                  <p class="text-[10px] text-gold-700 font-semibold flex items-center gap-0.5">
                    <span class="material-icons text-[10px] text-gold-500">verified</span> Atelier d'excellence
                  </p>
                </div>
              </div>
              <button 
                (click)="contactCouturiere(post)"
                class="text-xs text-bordeaux-800 font-semibold hover:text-gold-600 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bordeaux-50 border border-bordeaux-100">
                <span class="material-icons text-sm text-bordeaux-800">chat_bubble_outline</span> Contacter
              </button>
            </div>

            <!-- Post Image -->
            <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">
              <img 
                [src]="post.media[0]" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Création haute couture"
                referrerpolicy="no-referrer">
              <!-- Price Tag overlay -->
              <span class="absolute bottom-4 left-4 bg-noir-profond/90 text-gold-400 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-gold-500/30 shadow-lg flex items-center gap-1.5">
                <span class="material-icons text-gold-500 text-xs">sell</span>
                {{ post.priceHint | number }} {{ post.currency }}
              </span>
            </div>

            <!-- Post Body -->
            <div class="p-5 flex-grow flex flex-col justify-between">
              <div>
                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 mb-3">
                  @for (t of post.tags; track t) {
                    <button 
                      type="button"
                      (click)="selectedTag.set(t); $event.stopPropagation()"
                      class="text-[10px] font-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-500/20 hover:bg-gold-100 cursor-pointer">
                      #{{ t }}
                    </button>
                  }
                </div>
                <!-- Caption -->
                <p class="text-xs text-gray-700 leading-relaxed font-light mb-4">
                  {{ post.caption }}
                </p>
              </div>

              <!-- Interactions Footer -->
              <div class="pt-4 border-t border-gold-500/10 flex items-center justify-between text-gray-600">
                <div class="flex gap-4">
                  <!-- Like Button -->
                  <button 
                    (click)="likePost(post.id)"
                    class="flex items-center gap-1.5 text-xs hover:text-bordeaux-800 transition-colors"
                    [class.text-bordeaux-800]="hasLiked(post)">
                    <span class="material-icons text-base">{{ hasLiked(post) ? 'favorite' : 'favorite_border' }}</span>
                    <span class="font-semibold">{{ post.likeCount }}</span>
                  </button>

                  <!-- Comments Trigger -->
                  <button 
                    (click)="openCommentsFor(post)"
                    class="flex items-center gap-1.5 text-xs hover:text-gold-600 transition-colors">
                    <span class="material-icons text-base text-gold-500">chat</span>
                    <span class="font-semibold">{{ post.commentCount }}</span>
                  </button>
                </div>

                <!-- Save to Inspiration Folder -->
                <button 
                  (click)="saveToInspirations(post)"
                  class="flex items-center gap-1.5 text-xs hover:text-emerald-800 transition-colors"
                  [class.text-emerald-800]="isSaved(post.id)">
                  <span class="material-icons text-base">{{ isSaved(post.id) ? 'bookmark' : 'bookmark_border' }}</span>
                  <span class="font-semibold">{{ isSaved(post.id) ? 'Sauvegardé' : 'Inspiration' }}</span>
                </button>
              </div>
            </div>

          </div>
        } @empty {
          <div class="col-span-full py-16 text-center text-gray-400">
            <span class="material-icons text-4xl mb-2">style</span>
            <p class="text-sm font-medium">Aucun modèle correspondant à votre recherche.</p>
          </div>
        }
      </div>

      <!-- Add Post Modal Dialog (For Seamstresses) -->
      @if (openPostModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-lg p-6 custom-shadow-lg border border-mahogany-100 animate-fade-in relative">
            <button 
              (click)="openPostModal.set(false)"
              class="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <span class="material-icons">close</span>
            </button>

            <h3 class="serif-header text-xl font-bold text-mahogany-500 mb-4">
              Publier une nouvelle création
            </h3>

            <form [formGroup]="postForm" (ngSubmit)="submitPost()">
              <div class="space-y-4">
                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Description / Histoire du Modèle</span>
                  <textarea 
                    formControlName="caption"
                    rows="3"
                    placeholder="Ex. Superbe ensemble trois pièces de mariage en tissu Kente brodé or..."
                    class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs"></textarea>
                  @if (postForm.get('caption')?.invalid && postForm.get('caption')?.touched) {
                    <p class="text-xs text-red-500 mt-1">La description est requise.</p>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Estimation Prix (XOF)</span>
                    <input 
                      formControlName="priceHint"
                      type="number"
                      placeholder="Ex. 25000"
                      class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-gray-600 mb-1">Photo d'illustration</span>
                    <select 
                      formControlName="mediaUrl"
                      class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                      <option value="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800">Wax Sirène Émeraude</option>
                      <option value="https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800">Bazin Royal Océan</option>
                      <option value="https://images.unsplash.com/photo-1572495537021-a67b12938b8b?w=800">Combinaison Kente Moderne</option>
                      <option value="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800">Robe Princesse Fleur Africaine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-gray-600 mb-1">Tags Culturels (Séparés par des virgules)</span>
                  <input 
                    formControlName="tagsInput"
                    type="text"
                    placeholder="Ex. Wax, Mariage, Chic"
                    class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  (click)="openPostModal.set(false)"
                  class="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button 
                  type="submit"
                  [disabled]="postForm.invalid"
                  class="px-5 py-2.5 bg-mahogany-500 text-white rounded-xl text-xs font-bold hover:bg-mahogany-600 disabled:opacity-50 transition-all">
                  Publier sur le Fil d'Actualité
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Detailed Comments Dialog Modal -->
      @if (activeCommentsPost()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-2xl w-full max-w-lg p-6 custom-shadow-lg border border-mahogany-100 relative">
            <button 
              (click)="activeCommentsPost.set(null)"
              class="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <span class="material-icons">close</span>
            </button>

            <h3 class="serif-header text-lg font-bold text-mahogany-500 mb-4 flex items-center gap-2">
              <span class="material-icons text-amber-500">comment</span> Commentaires ({{ activeCommentsPost()?.comments?.length }})
            </h3>

            <!-- Comment display board -->
            <div class="space-y-3 max-h-60 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-xl">
              @for (c of activeCommentsPost()?.comments; track c.id) {
                <div class="flex gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <img [src]="c.authorAvatar" class="w-8 h-8 rounded-full object-cover border border-mahogany-100" referrerpolicy="no-referrer" alt="Avatar">
                  <div>
                    <h5 class="text-xs font-bold text-gray-800">{{ c.authorName }}</h5>
                    <p class="text-[11px] text-gray-600 leading-relaxed font-light mt-0.5">{{ c.text }}</p>
                    <p class="text-[9px] text-gray-400 mt-1">{{ c.createdAt | date:'shortTime' }}</p>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-center text-gray-400 py-6 font-light">Soyez la première à commenter ce modèle !</p>
              }
            </div>

            <!-- New comment input -->
            <form (ngSubmit)="submitComment()">
              <div class="flex gap-2">
                <input 
                  [formControl]="commentCtrl"
                  type="text"
                  placeholder="Rédigez votre commentaire..."
                  class="flex-grow px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-mahogany-500 text-xs">
                <button 
                  type="submit"
                  [disabled]="!commentCtrl.value?.trim()"
                  class="px-4 py-2 bg-mahogany-500 text-white rounded-xl text-xs font-bold hover:bg-mahogany-600 disabled:opacity-50 transition-all flex items-center gap-1">
                  <span class="material-icons text-xs">send</span> Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class SocialFeed implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);
  fb = inject(FormBuilder);

  posts = signal<Post[]>([]);
  selectedTag = signal<string | null>(null);
  openPostModal = signal<boolean>(false);
  activeCommentsPost = signal<Post | null>(null);

  // Saved collection tracking
  savedPostIds = signal<Set<string>>(new Set());

  popularTags = ['Wax', 'Bazin', 'Kente', 'Mariage', 'HauteCouture', 'Moderne', 'Chic', 'Traditionnel'];

  postForm = this.fb.group({
    caption: ['', Validators.required],
    priceHint: [20000, [Validators.required, Validators.min(0)]],
    mediaUrl: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    tagsInput: ['']
  });

  commentCtrl = this.fb.control('');

  filteredPosts = computed(() => {
    const list = this.posts();
    const tag = this.selectedTag();
    if (!tag) return list;
    return list.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  });

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    try {
      const list = await this.api.getPosts();
      this.posts.set(list);
    } catch (e) {
      console.error(e);
    }
  }

  toggleTag(tag: string) {
    if (this.selectedTag() === tag) {
      this.selectedTag.set(null);
    } else {
      this.selectedTag.set(tag);
    }
  }

  async likePost(postId: string) {
    if (!this.api.currentUser()) {
      this.router.navigate(['/auth']);
      return;
    }
    try {
      const updated = await this.api.toggleLike(postId);
      // Update in local state list
      this.posts.update(arr => arr.map(p => p.id === postId ? updated : p));
    } catch (e) {
      console.error(e);
    }
  }

  hasLiked(post: Post): boolean {
    const user = this.api.currentUser();
    if (!user) return false;
    return post.likes.includes(user.id);
  }

  openCommentsFor(post: Post) {
    this.activeCommentsPost.set(post);
    this.commentCtrl.setValue('');
  }

  async submitComment() {
    const text = this.commentCtrl.value?.trim();
    const post = this.activeCommentsPost();
    if (!text || !post) return;

    if (!this.api.currentUser()) {
      this.router.navigate(['/auth']);
      return;
    }

    try {
      const updated = await this.api.addComment(post.id, text);
      this.posts.update(arr => arr.map(p => p.id === post.id ? updated : p));
      this.activeCommentsPost.set(updated);
      this.commentCtrl.setValue('');
    } catch (e) {
      console.error(e);
    }
  }

  saveToInspirations(post: Post) {
    if (!this.api.currentUser()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.savedPostIds.update(set => {
      const next = new Set(set);
      if (next.has(post.id)) {
        next.delete(post.id);
      } else {
        next.add(post.id);
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
