import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HarmyApiService as HarmyApi } from '@core/services/harmy-api.service';
import { AuthService } from '@core/services/auth.service';
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
      
      <!-- Section Divider -->
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
          Explorez la galerie du Kente royal et des créations textiles d'exception.
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
            
            <div class="relative aspect-[4/3] overflow-hidden bg-noir-profond">
              <img 
                [src]="item.imageUrl" 
                [alt]="item.title"
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                referrerpolicy="no-referrer">
              
              <div class="absolute inset-0 bg-gradient-to-t from-noir-profond/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

              <span class="absolute top-3 left-3 bg-noir-profond/90 text-gold-400 border border-gold-500/40 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                {{ item.categoryLabel }}
              </span>

              <button 
                (click)="toggleFavorite(item, $event)"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-noir-profond/80 border border-gold-500/40 text-gold-400 flex items-center justify-center hover:bg-gold-500 hover:text-noir-profond transition-all shadow-md">
                <span class="material-icons text-sm">
                  {{ isFavorite(item.id) ? 'favorite' : 'favorite_border' }}
                </span>
              </button>

              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div class="flex items-center gap-2 bg-noir-profond/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30">
                  <span class="text-[10px] font-semibold text-gold-200 truncate max-w-[120px]">{{ item.designerName }}</span>
                </div>
                <span class="text-[10px] font-bold text-gold-400 bg-bordeaux-900/80 px-2 py-0.5 rounded-md border border-gold-500/30">
                  {{ item.difficulty }}
                </span>
              </div>
            </div>

            <div class="p-5 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-gold-50/20">
              <div>
                <h3 class="serif-header text-lg font-bold text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-1 mb-2">
                  {{ item.title }}
                </h3>
                
                <p class="text-xs text-gray-600 line-clamp-2 font-light leading-relaxed mb-4">
                  {{ item.description }}
                </p>
              </div>

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
        @if (filteredItems().length === 0) {
          <div class="col-span-full py-12 text-center text-xs text-gray-400 italic">
            Aucune inspiration disponible pour le moment.
          </div>
        }
      </div>

    </div>
  `
})
export class KenteInspirationsComponent implements OnInit {
  api = inject(HarmyApi);
  authService = inject(AuthService);
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
  kenteItemsSignal = signal<KenteItem[]>([]);

  filteredItems = computed(() => {
    const cat = this.selectedCategory();
    const items = this.kenteItemsSignal();
    if (cat === 'all') {
      return items;
    }
    return items.filter(item => item.category === cat);
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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      await this.api.startConversation(item.authorId, item.atelierId);
      this.selectedItem.set(null);
      this.router.navigate(['/messagerie']);
    } catch (e) {
      console.error(e);
    }
  }
}
