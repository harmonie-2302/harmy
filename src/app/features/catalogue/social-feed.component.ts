import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HarmyApiService as HarmyApi, Post } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ScrollFadeDirective } from '@shared/directives/scroll-fade.directive';

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
          <div class="md:col-span-5 xl:col-span-4 relative group min-w-0">
            <div class="relative rounded-2xl overflow-hidden border-2 border-gold-500/40 aspect-[3/4] shadow-2xl bg-noir-profond">
              <img 
                src="/african_couture_hero.jpg" 
                (error)="onImgError($event)"
                class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                alt="Robe Sirène Haute Couture"
                referrerpolicy="no-referrer">
              <div class="absolute top-4 left-4 bg-noir-profond/90 border border-gold-500/50 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5 shadow-lg">
                <span class="material-icons text-xs text-gold-500">auto_awesome</span> Haute Couture Africaine
              </div>
            </div>
          </div>

          <!-- Text Right Column -->
          <div class="md:col-span-7 xl:col-span-8 flex flex-col justify-center min-w-0">
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
                    (click)="openCreateModal()"
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
      @if (actionError(); as erreur) {
        <div class="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
          <span class="material-icons text-base">warning</span>
          <span>{{ erreur }}</span>
        </div>
      }
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        @for (p of posts(); track p.id) {
          <div appScrollFade class="pagne-card bg-white rounded-3xl overflow-hidden border border-gold-500/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            
            <!-- Post Header Author Info -->
            <div class="p-4 flex items-center justify-between border-b border-gray-100">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-full bg-gold-100 text-gold-800 font-bold flex items-center justify-center text-xs shrink-0">
                  {{ (p.authorName || 'A')[0] }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-xs font-bold text-gray-900 leading-tight truncate">{{ p.authorName }}</h3>
                  <span class="text-[10px] text-gold-600 font-semibold">Maison de Couture</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                @if (isPostOwner(p)) {
                  <button
                    type="button"
                    (click)="openEditModal(p)"
                    title="Modifier cette publication"
                    class="w-8 h-8 bg-gray-50 text-gray-600 hover:bg-gold-100 hover:text-gold-800 border border-gray-200 rounded-xl flex items-center justify-center transition-colors">
                    <span class="material-icons text-sm">edit</span>
                  </button>
                  <button
                    type="button"
                    (click)="deletePost(p)"
                    title="Supprimer cette publication"
                    class="w-8 h-8 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200 rounded-xl flex items-center justify-center transition-colors">
                    <span class="material-icons text-sm">delete_outline</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="contactCouturiere(p)"
                    class="px-3 py-1.5 bg-gold-50 text-gold-700 hover:bg-gold-500 hover:text-noir-profond border border-gold-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1">
                    <span class="material-icons text-xs">chat</span> Échanger
                  </button>
                }
              </div>
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
                        placeholder="Écrire un commentaire public..." 
                        class="flex-1 min-w-0 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                        (keyup.enter)="submitComment(p, commentInput.value); commentInput.value = ''">
                      <button 
                        (click)="submitComment(p, commentInput.value); commentInput.value = ''"
                        class="btn-gold px-3 py-1.5 text-xs font-bold shadow">
                        Commenter
                      </button>
                    </div>

                    <!-- Add Direct Message Form -->
                    <div class="flex flex-col gap-2 pt-4 mt-3 border-t border-gray-100">
                      <h4 class="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                        <span class="material-icons text-xs text-gold-600">chat</span> Contacter en privé
                      </h4>
                      <div class="flex gap-2">
                        <input 
                          type="text" 
                          #messageInput
                          placeholder="Envoyer un message au couturier..." 
                          class="flex-1 min-w-0 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                          (keyup.enter)="sendDirectMessage(p, messageInput.value); messageInput.value = ''">
                        <button 
                          (click)="sendDirectMessage(p, messageInput.value); messageInput.value = ''"
                          class="bg-noir-profond text-gold-400 px-3 py-1.5 text-xs font-bold shadow rounded-xl">
                          Envoyer
                        </button>
                      </div>
                    </div>
                  } @else {
                    <p class="text-[10px] text-gold-700 italic pt-1">
                      <a routerLink="/auth/login" class="underline font-bold">Connectez-vous</a> pour réagir et contacter le couturier.
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
      <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-8 border border-gold-500/40 shadow-2xl relative">
          
          <button 
            (click)="closePostModal()"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>

          <h2 class="serif-header text-xl font-bold text-gray-900 mb-1">
            {{ editingPost() ? 'Modifier la Création' : 'Publier une Création Haute Couture' }}
          </h2>
          <p class="text-xs text-gray-500 mb-6">
            {{ editingPost() ? 'Actualisez les informations visibles dans le catalogue.' : 'Mettez en valeur le savoir-faire de votre atelier dans le catalogue Harmy\'Swing.' }}
          </p>

          <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Légende & Description du Modèle <span class="text-red-500">*</span>
              </label>
              <textarea 
                formControlName="caption" 
                rows="3" 
                placeholder="Décrivez le modèle, les tissus utilisés (Bazin, Wax, Kente)..."
                class="w-full px-4 py-2.5 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:border-gold-500 transition-colors"
                [class.border-red-400]="postForm.get('caption')?.touched && postForm.get('caption')?.invalid"
                [class.border-gray-200]="!postForm.get('caption')?.touched || !postForm.get('caption')?.invalid"></textarea>
              @if (postForm.get('caption')?.touched && postForm.get('caption')?.invalid) {
                <p class="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <span class="material-icons text-xs">error_outline</span>
                  <span>La description du modèle est obligatoire.</span>
                </p>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Prix Estimé (FC) <span class="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  formControlName="priceHint"
                  class="w-full px-4 py-2.5 text-xs bg-gray-50 border rounded-xl focus:outline-none focus:border-gold-500 transition-colors"
                  [class.border-red-400]="postForm.get('priceHint')?.touched && postForm.get('priceHint')?.invalid"
                  [class.border-gray-200]="!postForm.get('priceHint')?.touched || !postForm.get('priceHint')?.invalid">
                @if (postForm.get('priceHint')?.touched && postForm.get('priceHint')?.invalid) {
                  <p class="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <span class="material-icons text-xs">error_outline</span>
                    <span>Indiquez un prix supérieur ou égal à 0.</span>
                  </p>
                }
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
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Image du Modèle <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  (change)="onFileSelected($event)"
                  class="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100">

                <!-- Prévisualisation immédiate : l'aperçu est généré localement
                     (URL.createObjectURL) dès la sélection, sans attendre le
                     serveur, puis l'état du téléversement est affiché dessus. -->
                @if (previewUrl(); as preview) {
                  <div class="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[4/3]">
                    <img [src]="preview" class="w-full h-full object-contain" alt="Aperçu de la création">

                    @if (uploading()) {
                      <div class="absolute inset-0 bg-noir-profond/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <span class="material-icons text-gold-400 animate-spin text-2xl">progress_activity</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-gold-300">Envoi en cours…</span>
                      </div>
                    } @else if (uploadError()) {
                      <div class="absolute inset-0 bg-red-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <span class="material-icons text-red-200 text-2xl">error_outline</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-red-100">Échec de l'envoi</span>
                      </div>
                    } @else if (uploadedUrl()) {
                      <div class="absolute top-2 right-2 bg-emerald-600/95 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                        <span class="material-icons text-white text-xs">check_circle</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-white">Image envoyée</span>
                      </div>
                    }

                    <button
                      type="button"
                      (click)="clearSelectedImage()"
                      title="Retirer l'image"
                      class="absolute top-2 left-2 bg-noir-profond/80 hover:bg-noir-profond text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-lg">
                      <span class="material-icons text-sm">close</span>
                    </button>
                  </div>
                }

                @if (uploadError(); as erreur) {
                  <p class="text-[11px] font-semibold text-red-600 flex items-start gap-1.5">
                    <span class="material-icons text-sm mt-px">warning</span>
                    <span>{{ erreur }}</span>
                  </p>
                }

                <input 
                  type="text" 
                  formControlName="mediaUrl"
                  placeholder="Ou collez directement une URL d'image"
                  (input)="onMediaUrlTyped()"
                  class="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-500">
              </div>
            </div>

            @if (publishError(); as erreur) {
              <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                <span class="material-icons text-sm mt-0.5 shrink-0">error_outline</span>
                <span>{{ erreur }}</span>
              </div>
            }

            <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button 
                type="button" 
                (click)="closePostModal()"
                class="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900">
                Annuler
              </button>
              <button 
                type="submit" 
                [disabled]="uploading() || submitting()"
                class="btn-gold px-5 py-2 text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {{ uploading() ? 'Envoi de l\\'image…' : submitting() ? 'Enregistrement…' : editingPost() ? 'Enregistrer les modifications' : 'Publier la Création' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class SocialFeedComponent implements OnInit, OnDestroy {
  /** Visuel affiché lorsqu'une image de publication est illisible. */
  private static readonly IMAGE_DE_REPLI = '/hero_couture_dress.jpg';

  api = inject(HarmyApi);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  posts = signal<Post[]>([]);
  selectedTag = signal<string>('all');
  openPostModal = signal(false);
  activeCommentPostId = signal<string | null>(null);
  editingPost = signal<Post | null>(null);

  /** Aperçu affiché dans le formulaire : blob local, puis URL définitive. */
  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  uploadedUrl = signal<string | null>(null);
  submitting = signal(false);
  publishError = signal<string | null>(null);
  actionError = signal<string | null>(null);

  /** Blob à révoquer pour ne pas fuir de mémoire entre deux sélections. */
  private objectUrl: string | null = null;

  /** Types acceptés côté client, alignés sur UploadImageUseCase. */
  private static readonly TYPES_ACCEPTES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
  ];

  /** 15 Mo, identique à la limite du backend. */
  private static readonly TAILLE_MAX_OCTETS = 15 * 1024 * 1024;

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
    // Volontairement vide : pré-remplir ce champ avec l'image de démonstration
    // permettait de publier le visuel par défaut sans s'en apercevoir lorsque
    // le téléversement échouait.
    mediaUrl: ['', Validators.required],
    tagsInput: ['Wax, Robe']
  });

  openCreateModal() {
    this.editingPost.set(null);
    this.reinitialiserFormulaire();
    this.openPostModal.set(true);
  }

  openEditModal(post: Post) {
    if (!this.isPostOwner(post)) return;
    this.editingPost.set(post);
    this.uploadError.set(null);
    this.publishError.set(null);
    this.uploadedUrl.set(post.media?.[0] || null);
    this.previewUrl.set(post.media?.[0] || null);
    this.postForm.reset({
      caption: post.caption || '',
      priceHint: post.priceHint || 0,
      mediaUrl: post.media?.[0] || '',
      tagsInput: (post.tags || []).join(', ')
    });
    this.openPostModal.set(true);
  }

  isPostOwner(post: Post): boolean {
    const user = this.authService.currentUser();
    return !!user && (user.role === 'ADMIN' || user.id === post.authorId);
  }

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
    if (!target) return;
    // target.src renvoie une URL absolue : comparer à un chemin relatif serait
    // toujours faux et provoquerait une boucle si l'image de repli manquait.
    if (!target.dataset['fallbackApplied']) {
      target.dataset['fallbackApplied'] = 'true';
      target.src = SocialFeedComponent.IMAGE_DE_REPLI;
    }
  }

  async contactCouturiere(post: Post) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const conv = await this.api.startConversation(post.authorId, post.atelierId);
      this.router.navigate(['/messagerie'], { queryParams: { convId: conv.id } });
    } catch (e) {
      console.error(e);
    }
  }

  async sendDirectMessage(post: Post, text: string) {
    if (!text || text.trim().length === 0) return;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      // Create or get the conversation
      const conv = await this.api.startConversation(post.authorId, post.atelierId);
      // Send the message
      await this.api.sendMessage(conv.id, text.trim());
      // Show confirmation or navigate
      alert("Votre message a bien été envoyé au couturier !");
      this.router.navigate(['/messagerie'], { queryParams: { convId: conv.id } });
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'envoi du message.");
    }
  }

  /**
   * Prévisualisation immédiate puis téléversement.
   *
   * L'aperçu est produit localement par `URL.createObjectURL`, donc affiché
   * instantanément sans attendre le serveur. Le téléversement se poursuit en
   * arrière-plan et son résultat est rendu visible : tant qu'il n'a pas
   * abouti, `mediaUrl` reste vide et le formulaire refuse la publication.
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadError.set(null);
    this.uploadedUrl.set(null);
    this.publishError.set(null);
    this.postForm.patchValue({ mediaUrl: '' });

    if (!SocialFeedComponent.TYPES_ACCEPTES.includes(file.type)) {
      this.revokeObjectUrl();
      this.previewUrl.set(null);
      this.uploadError.set('Format non pris en charge. Choisissez une image JPEG, PNG, WebP, GIF ou AVIF.');
      input.value = '';
      return;
    }

    if (file.size > SocialFeedComponent.TAILLE_MAX_OCTETS) {
      this.revokeObjectUrl();
      this.previewUrl.set(null);
      const tailleMo = (file.size / (1024 * 1024)).toFixed(1);
      this.uploadError.set(`Image trop volumineuse (${tailleMo} Mo). La taille maximale est de 15 Mo.`);
      input.value = '';
      return;
    }

    // Aperçu instantané, avant tout appel réseau.
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl.set(this.objectUrl);

    this.uploading.set(true);
    try {
      const result = await this.api.uploadFile(file);
      if (!result?.fileUrl) {
        throw new Error("Le serveur n'a pas renvoyé d'URL pour l'image.");
      }
      this.postForm.patchValue({ mediaUrl: result.fileUrl });
      this.uploadedUrl.set(result.fileUrl);
    } catch (e: unknown) {
      this.uploadError.set(this.lireErreur(e, "Échec de l'envoi de l'image. Vérifiez votre connexion et réessayez."));
      this.postForm.patchValue({ mediaUrl: '' });
    } finally {
      this.uploading.set(false);
    }
  }

  /** Saisie manuelle d'une URL : elle sert alors d'aperçu. */
  onMediaUrlTyped() {
    const valeur = (this.postForm.value.mediaUrl || '').trim();
    this.uploadError.set(null);
    this.uploadedUrl.set(null);
    this.revokeObjectUrl();
    this.previewUrl.set(valeur.length > 0 ? valeur : null);
  }

  clearSelectedImage() {
    this.revokeObjectUrl();
    this.previewUrl.set(null);
    this.uploadedUrl.set(null);
    this.uploadError.set(null);
    this.postForm.patchValue({ mediaUrl: '' });
  }

  closePostModal() {
    this.openPostModal.set(false);
    this.reinitialiserFormulaire();
  }

  private revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private reinitialiserFormulaire() {
    this.revokeObjectUrl();
    this.editingPost.set(null);
    this.previewUrl.set(null);
    this.uploadedUrl.set(null);
    this.uploadError.set(null);
    this.publishError.set(null);
    this.postForm.reset({ caption: '', priceHint: 25000, mediaUrl: '', tagsInput: 'Wax, Robe' });
  }

  private lireErreur(e: unknown, parDefaut: string): string {
    const erreur = e as { error?: { message?: string }; message?: string; status?: number };
    if (erreur?.status === 401) {
      return 'Session expirée. Reconnectez-vous avant de publier.';
    }
    if (erreur?.status === 413) {
      return 'Image trop volumineuse. La taille maximale est de 15 Mo.';
    }
    return erreur?.error?.message || erreur?.message || parDefaut;
  }

  async submitPost() {
    if (this.uploading() || this.submitting()) return;

    this.postForm.markAllAsTouched();
    this.publishError.set(null);

    const { caption, priceHint, mediaUrl, tagsInput } = this.postForm.value;
    const desc = (caption || '').trim();
    if (!desc) {
      this.publishError.set("Veuillez renseigner la description de votre modèle.");
      return;
    }

    const image = (mediaUrl || '').trim();
    if (!image) {
      this.uploadError.set("Ajoutez une image avant de publier votre création.");
      this.publishError.set("Veuillez sélectionner ou fournir une image pour votre création.");
      return;
    }

    const price = Number(priceHint);
    if (priceHint === null || priceHint === undefined || isNaN(price) || price < 0) {
      this.publishError.set("Veuillez renseigner un prix estimé valide (supérieur ou égal à 0).");
      return;
    }

    const tags = (tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    this.submitting.set(true);
    try {
      if (this.editingPost()) {
        await this.api.updatePost(this.editingPost()!.id, {
          caption: desc,
          priceHint: price,
          tags,
          media: [image]
        });
      } else {
        await this.api.createPost(desc, price, tags, [image]);
      }
      this.openPostModal.set(false);
      this.reinitialiserFormulaire();
      await this.loadPosts();
    } catch (e: unknown) {
      this.publishError.set(this.lireErreur(e, 'La publication a échoué. Réessayez.'));
    } finally {
      this.submitting.set(false);
    }
  }

  async deletePost(post: Post) {
    if (!this.isPostOwner(post) || this.submitting()) return;
    const confirmation = window.confirm(
      `Supprimer définitivement « ${post.caption || 'cette publication'} » ?`
    );
    if (!confirmation) return;

    this.submitting.set(true);
    this.actionError.set(null);
    try {
      await this.api.deletePost(post.id);
      this.posts.update(posts => posts.filter(item => item.id !== post.id));
    } catch (e: unknown) {
      this.actionError.set(this.lireErreur(e, 'La suppression a échoué. Réessayez.'));
    } finally {
      this.submitting.set(false);
    }
  }

  ngOnDestroy() {
    this.revokeObjectUrl();
  }
}
