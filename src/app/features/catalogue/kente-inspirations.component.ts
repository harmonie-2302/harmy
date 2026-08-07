import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HarmyApiService as HarmyApi } from '@core/services/harmy-api.service';
import { ScrollFadeDirective } from '@shared/directives/scroll-fade.directive';

interface KenteItem {
  id: string;
  title: string;
  category: 'motif' | 'creation' | 'detail';
  categoryLabel: string;
  imageUrl: string;
  description: string;
  culturalMeaning: string;
  bestFor: string;
  atelierId: string;
  designerName: string;
  designerAvatar: string;
  authorId: string;
  difficulty: 'Moyen' | 'Difficile' | 'Chef-d\'œuvre';
  timeRequired: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kente-inspirations',
  standalone: true,
  imports: [CommonModule, ScrollFadeDirective],
  template: `
    <div id="kente-inspirations-container" class="my-16 py-12 bg-white rounded-3xl border border-gold-500/20 px-6 sm:px-8 lg:px-12 relative overflow-hidden pagne-card">
      
      <!-- Subtle geometric pagne section divider line top -->
      <div class="pagne-divider mb-8"></div>

      <!-- Ambient light effect -->
      <div class="absolute -right-16 top-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 bottom-0 w-80 h-80 bg-emerald-800/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Section -->
      <div class="max-w-3xl mb-10 relative z-10">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-50 text-gold-700 text-xs font-extrabold uppercase tracking-widest mb-4 border border-gold-500/30">
          <span class="material-icons text-sm text-gold-600">stars</span> Patrimoine & Art du Tissage
        </span>
        <h2 class="serif-header text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Inspirations Kente & Pagnes Nobles
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-light mt-3">
          Explorez notre galerie consacrée au **Kente royal** tissé de fils d'or et aux confections d'exception. Chaque motif géométrique véhicule une symbolique d'authenticité et de prestige. Sélectionnez un style pour découvrir son histoire et programmer votre confection sur-mesure.
        </p>
      </div>

      <!-- Filters Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gold-500/20 relative z-10">
        <div class="flex flex-wrap gap-2.5">
          @for (cat of categories; track cat.id) {
            <button 
              (click)="selectedCategory.set(cat.id)"
              class="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              [class]="selectedCategory() === cat.id
                ? 'btn-gold shadow-md'
                : 'bg-gold-50/50 text-gray-700 hover:bg-gold-100 hover:text-gold-900 border border-gold-500/20'">
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          }
        </div>
        
        <div class="text-xs text-gold-800 font-bold uppercase tracking-wider bg-gold-50/80 px-3 py-1.5 rounded-xl border border-gold-500/20">
          {{ filteredItems().length }} Inspiration{{ filteredItems().length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Grid Display of Kente Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        @for (item of filteredItems(); track item.id) {
          <div 
            appScrollFade
            (click)="openItemDetails(item)"
            class="group bg-white rounded-3xl overflow-hidden border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 custom-shadow hover:shadow-xl flex flex-col cursor-pointer transform hover:-translate-y-1">
            
            <!-- Card Image Container -->
            <div class="relative aspect-[4/3] overflow-hidden bg-noir-profond">
              <img 
                [src]="item.imageUrl" 
                [alt]="item.title"
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                referrerpolicy="no-referrer">
              
              <div class="absolute inset-0 bg-gradient-to-t from-noir-profond/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

              <!-- Category Badge -->
              <span class="absolute top-3 left-3 bg-noir-profond/90 text-gold-400 border border-gold-500/40 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                {{ item.categoryLabel }}
              </span>

              <!-- Favorite Button -->
              <button 
                (click)="toggleFavorite(item, $event)"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-noir-profond/80 border border-gold-500/40 text-gold-400 flex items-center justify-center hover:bg-gold-500 hover:text-noir-profond transition-all shadow-md">
                <span class="material-icons text-sm">
                  {{ isFavorite(item.id) ? 'favorite' : 'favorite_border' }}
                </span>
              </button>

              <!-- Designer Attribution Tag -->
              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div class="flex items-center gap-2 bg-noir-profond/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30">
                  <img [src]="item.designerAvatar" class="w-5 h-5 rounded-full object-cover border border-gold-400" referrerpolicy="no-referrer" alt="Avatar">
                  <span class="text-[10px] font-semibold text-gold-200 truncate max-w-[120px]">{{ item.designerName }}</span>
                </div>
                <span class="text-[10px] font-bold text-gold-400 bg-bordeaux-900/80 px-2 py-0.5 rounded-md border border-gold-500/30">
                  {{ item.difficulty }}
                </span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="p-5 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-gold-50/20">
              <div>
                <h3 class="serif-header text-lg font-bold text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-1 mb-2">
                  {{ item.title }}
                </h3>
                
                <p class="text-xs text-gray-600 line-clamp-2 font-light leading-relaxed mb-4">
                  {{ item.description }}
                </p>
              </div>

              <!-- Cultural Symbolism snippet -->
              <div class="pt-3 border-t border-gold-500/15 flex items-center justify-between text-[11px]">
                <span class="text-gold-700 font-medium flex items-center gap-1">
                  <span class="material-icons text-xs text-gold-600">auto_awesome</span> {{ item.culturalMeaning }}
                </span>
                <span class="text-gray-600 font-bold hover:text-gold-700 transition-colors">
                  Voir &rarr;
                </span>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Modal Detail View -->
      @if (selectedItem(); as item) {
        <div class="fixed inset-0 bg-noir-profond/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gold-500/40 shadow-2xl relative">
            
            <button 
              (click)="selectedItem.set(null)"
              class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-noir-profond/80 text-gold-400 border border-gold-500/40 flex items-center justify-center hover:bg-gold-500 hover:text-noir-profond transition-all">
              <span class="material-icons text-base">close</span>
            </button>

            <div class="relative aspect-video w-full overflow-hidden bg-noir-profond">
              <img [src]="item.imageUrl" [alt]="item.title" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-noir-profond via-transparent to-transparent opacity-80"></div>
              <div class="absolute bottom-4 left-6 right-6 text-white">
                <span class="text-[10px] uppercase font-bold text-gold-400 tracking-widest bg-noir-profond/80 border border-gold-500/30 px-3 py-1 rounded-full">
                  {{ item.categoryLabel }}
                </span>
                <h2 class="serif-header text-2xl font-bold text-white mt-2">{{ item.title }}</h2>
              </div>
            </div>

            <div class="p-6 sm:p-8 space-y-6">
              <div>
                <h4 class="text-xs font-bold text-gold-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span class="material-icons text-sm text-gold-600">auto_awesome</span> Symbolique & Héritage Culturel
                </h4>
                <p class="text-sm font-semibold text-gray-900 bg-gold-50/60 p-3.5 rounded-2xl border border-gold-500/20">
                  {{ item.culturalMeaning }}
                </p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Description Technique</h4>
                <p class="text-xs text-gray-700 leading-relaxed font-light">{{ item.description }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4 bg-pagne-subtle p-4 rounded-2xl border border-gold-500/20 text-xs">
                <div>
                  <span class="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Recommandé pour</span>
                  <strong class="text-gray-900 font-semibold">{{ item.bestFor }}</strong>
                </div>
                <div>
                  <span class="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Temps de Confection</span>
                  <strong class="text-gray-900 font-semibold">{{ item.timeRequired }}</strong>
                </div>
              </div>

              <!-- Action button: Contact Designer for Order -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2.5">
                  <img [src]="item.designerAvatar" class="w-9 h-9 rounded-full object-cover border border-gold-500/30">
                  <div>
                    <h5 class="text-xs font-bold text-gray-900">{{ item.designerName }}</h5>
                    <span class="text-[10px] text-gold-600 font-semibold">Maison de Couture Partenaire</span>
                  </div>
                </div>

                <button 
                  (click)="contactDesigner(item)"
                  class="btn-gold px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5">
                  <span class="material-icons text-sm">chat</span> Commander ce style
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class KenteInspirationsComponent implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);

  categories = [
    { id: 'all', label: 'Toutes les Inspirations', icon: '✦' },
    { id: 'motif', label: 'Motifs Royaux Kente', icon: '❖' },
    { id: 'creation', label: 'Confections Complètes', icon: '👗' },
    { id: 'detail', label: 'Finitions & Broderies', icon: '✂' }
  ];

  selectedCategory = signal<string>('all');
  selectedItem = signal<KenteItem | null>(null);
  favorites = signal<Set<string>>(new Set());

  // Static rich database of Kente & Pagne inspirations
  kenteItems: KenteItem[] = [
    {
      id: 'kente-1',
      title: 'Sika Futoro (L\'Or Pur en Poussière)',
      category: 'motif',
      categoryLabel: 'Motif Royal Kente',
      imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800',
      description: 'Tissage traditionnel ghanéen à bandes dorées et jaunes symbolisant la richesse, l’élégance, la prospérité financière et la royauté sacrée des cérémonies d’apparat.',
      culturalMeaning: 'Éléphant et Poussière d\'Or — Représente la noblesse et l’abondance spirituelle.',
      bestFor: 'Mariages traditionnels, Dots royales et galas de prestige',
      atelierId: 'atelier-fatoumata',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'user-fatoumata',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '3 à 4 Semaines'
    },
    {
      id: 'kente-2',
      title: 'Robe Sirène en Bazin & Incrustations Kente',
      category: 'creation',
      categoryLabel: 'Confection Complète',
      imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      description: 'Robe de mariée de prestige associant un Bazin riche violet impérial teinté à la main et des découpes géométriques Kente dorées sur le bustier et la traîne.',
      culturalMeaning: 'Harmonie des Époux — Union de la royauté du Bazin et du prestige Ashanti.',
      bestFor: 'Réceptions nuptiales et tenues de grandes cérémonies',
      atelierId: 'atelier-fatoumata',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'user-fatoumata',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '2 à 3 Semaines'
    },
    {
      id: 'kente-3',
      title: 'Obi Nkyefo Mmoa (L\'Union Fait la Force)',
      category: 'motif',
      categoryLabel: 'Motif Géométrique',
      imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800',
      description: 'Lignes entrelacées de teintes émeraude, rubis et or massif. Représente la solidarité communautaire et la pérennité des alliances familiales.',
      culturalMeaning: 'Force Collective & Sagesse Ancestrale — Nul ne peut vivre en isolation.',
      bestFor: 'Tenues de famille (Aso Ebi) et célébrations de jubilé',
      atelierId: 'atelier-fatoumata',
      designerName: 'Maison Diallo Couture',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'user-fatoumata',
      difficulty: 'Difficile',
      timeRequired: '2 Semaines'
    },
    {
      id: 'kente-4',
      title: 'Ensemble Blazer & Pantalon Wax Drapé',
      category: 'creation',
      categoryLabel: 'Prêt-à-Porter Chic',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      description: 'Coupe moderne d’un costume structuré confectionné dans un piqué Wax Hollandais à col châle en soie brodée.',
      culturalMeaning: 'Modernité & Affirmation — L\'Afrique contemporaine au sommet du style business.',
      bestFor: 'Événements corporatifs, cocktails d’affaires et défilés',
      atelierId: 'atelier-fatoumata',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'user-fatoumata',
      difficulty: 'Moyen',
      timeRequired: '7 à 10 Jours'
    },
    {
      id: 'kente-5',
      title: 'Bordures Tissées Main & Broderies Fil d\'Or',
      category: 'detail',
      categoryLabel: 'Finitions d\'Atelier',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      description: 'Gros-plan sur la finition artisanale des ourlets et des cols cousus de perles de rocailles et de passementeries dorées.',
      culturalMeaning: 'Perfection du Geste — L’excellence des détails cachés de la Haute Couture.',
      bestFor: 'Personnalisation de cols, manches et empiècements de boubous',
      atelierId: 'atelier-fatoumata',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'user-fatoumata',
      difficulty: 'Difficile',
      timeRequired: '5 Jours'
    }
  ];

  filteredItems = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') {
      return this.kenteItems;
    }
    return this.kenteItems.filter(item => item.category === cat);
  });

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const stored = localStorage.getItem('kente_favorites');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        this.favorites.set(new Set(parsed));
      }
    } catch (e) {
      console.error('Erreur de chargement des favoris', e);
    }
  }

  isFavorite(id: string): boolean {
    return this.favorites().has(id);
  }

  toggleFavorite(item: KenteItem, event: Event) {
    event.stopPropagation();
    this.favorites.update(set => {
      const next = new Set(set);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('kente_favorites', JSON.stringify(Array.from(next)));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  }

  openItemDetails(item: KenteItem) {
    this.selectedItem.set(item);
  }

  async contactDesigner(item: KenteItem) {
    const me = this.api.currentUser();
    if (!me) {
      this.router.navigate(['/auth']);
      return;
    }

    if (item.authorId === me.id) {
      alert("C'est votre propre création d'inspiration !");
      return;
    }

    try {
      await this.api.startConversation(item.authorId, item.atelierId);
      this.selectedItem.set(null);
      this.router.navigate(['/chat']);
    } catch (e) {
      console.error(e);
    }
  }
}
