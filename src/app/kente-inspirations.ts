import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HarmyApi } from './harmy-api';
import { ScrollFadeDirective } from './scroll-fade.directive';

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
                : 'bg-gold-50/50 text-gray-800 border border-gold-500/20 hover:bg-gold-100/60'">
              <span class="material-icons text-xs text-gold-600">{{ cat.icon }}</span>
              {{ cat.label }}
            </button>
          }
        </div>
        
        <div class="text-xs text-gray-500 font-medium">
          {{ filteredItems().length }} créations d'exception
        </div>
      </div>

      <!-- Photo Grid Section with Smooth Hover Effects -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        @for (item of filteredItems(); track item.id) {
          <div 
            appScrollFade
            (click)="openItemDetails(item)"
            (keydown.enter)="openItemDetails(item)"
            tabindex="0"
            class="bg-white rounded-2xl overflow-hidden border border-gold-500/20 custom-shadow hover:shadow-xl hover:translate-y-[-6px] transition-all duration-500 flex flex-col group cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-gold-500/50">
            
            <!-- Image Area -->
            <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">
              <img 
                [src]="item.imageUrl" 
                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                [alt]="item.title"
                referrerpolicy="no-referrer">
              
              <!-- Subtle Dark Glowing Overlay on Hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-noir-profond/90 via-noir-profond/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                <span class="text-[10px] uppercase font-extrabold tracking-widest text-gold-300 mb-1">
                  {{ item.culturalMeaning.split(':')[0] || 'Patrimoine' }}
                </span>
                <span class="text-gray-200 text-[10px] font-light leading-snug line-clamp-2">
                  {{ item.description }}
                </span>
              </div>

              <!-- Quick Top Badges -->
              <div class="absolute top-3 left-3 flex flex-col gap-1.5">
                <span class="btn-gold px-2.5 py-0.5 rounded-xl text-[9px] font-bold uppercase tracking-wider self-start flex items-center gap-1 shadow-md">
                  <span class="material-icons text-[10px]">auto_awesome</span> {{ item.categoryLabel }}
                </span>
                <span class="bg-noir-profond/90 border border-gold-500/30 text-gold-300 px-2 py-0.5 rounded-lg text-[8px] font-semibold tracking-wide self-start">
                  {{ item.difficulty }}
                </span>
              </div>

              <!-- Favorite Icon Button -->
              <button 
                (click)="toggleFavorite(item, $event)"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-gold-500/20 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-bordeaux-800 transition-all shadow-md flex items-center justify-center relative z-20"
                [title]="isFavorite(item.id) ? 'Retirer des favoris' : 'Sauvegarder l’inspiration'">
                <span class="material-icons text-base transition-transform duration-300 active:scale-125" [class.text-bordeaux-800]="isFavorite(item.id)">
                  {{ isFavorite(item.id) ? 'favorite' : 'favorite_border' }}
                </span>
              </button>
            </div>

            <!-- Content Area below Image -->
            <div class="p-4 flex-grow flex flex-col justify-between border-t border-gold-500/10">
              <div>
                <h4 class="serif-header text-sm font-bold text-gray-900 mb-1 group-hover:text-gold-600 transition-colors">
                  {{ item.title }}
                </h4>
                <p class="text-[11px] text-gray-600 font-light line-clamp-2 leading-relaxed">
                  {{ item.culturalMeaning }}
                </p>
              </div>

              <div class="pt-3.5 mt-3 border-t border-gold-500/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img [src]="item.designerAvatar" class="w-6 h-6 rounded-full object-cover border border-gold-500/30" referrerpolicy="no-referrer" alt="Couturière">
                  <span class="text-[10px] text-gray-700 font-semibold">{{ item.designerName }}</span>
                </div>
                <span class="text-[10px] text-gold-700 font-bold uppercase tracking-wide flex items-center gap-0.5">
                  <span class="material-icons text-xs">chevron_right</span> Voir
                </span>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Details Modal Dialog -->
      @if (selectedItem()) {
        @let item = selectedItem()!;
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-profond/70 backdrop-blur-md animate-fade-in">
          <div class="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gold-500/30 relative animate-scale-up grid grid-cols-1 md:grid-cols-12">
            
            <!-- Close Button -->
            <button 
              (click)="selectedItem.set(null)"
              class="absolute right-4 top-4 z-30 w-8 h-8 rounded-full bg-noir-profond text-white hover:bg-gold-600 transition-colors flex items-center justify-center shadow-lg border border-gold-500/30"
              title="Fermer">
              <span class="material-icons text-base">close</span>
            </button>

            <!-- Image Column -->
            <div class="md:col-span-5 relative bg-gray-100 aspect-[4/5] md:aspect-auto md:h-full">
              <img [src]="item.imageUrl" class="w-full h-full object-cover" [alt]="item.title" referrerpolicy="no-referrer">
              <div class="absolute inset-0 bg-gradient-to-t from-noir-profond/80 via-transparent to-transparent pointer-events-none"></div>
              
              <div class="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <span class="btn-gold px-2.5 py-0.5 rounded-xl text-[9px] font-bold uppercase tracking-wider self-start shadow-md">
                  {{ item.categoryLabel }}
                </span>
                <span class="text-white text-xs font-light">Temps estimé : {{ item.timeRequired }}</span>
              </div>
            </div>

            <!-- Info Column -->
            <div class="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] md:max-h-none overflow-y-auto">
              <div>
                <!-- Header details -->
                <div class="flex items-center justify-between gap-4 mb-3">
                  <span class="text-[9px] uppercase tracking-widest text-gold-700 font-extrabold bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-500/20">
                    Symbologie Traditionnelle
                  </span>
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gold-500 text-xs">speed</span>
                    <span class="text-[10px] text-gray-500">Complexité : {{ item.difficulty }}</span>
                  </div>
                </div>

                <h3 class="serif-header text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {{ item.title }}
                </h3>

                <!-- Cultural Meaning Card -->
                <div class="bg-gradient-to-br from-gold-50 to-emerald-50/30 rounded-2xl p-4 border border-gold-500/20 mb-5">
                  <div class="flex items-center gap-1.5 text-gold-800 text-xs font-bold mb-1.5 uppercase tracking-wide">
                    <span class="material-icons text-sm text-gold-600">bookmark</span> Signification Culturelle
                  </div>
                  <p class="text-xs text-gray-800 leading-relaxed font-light italic">
                    {{ item.culturalMeaning }}
                  </p>
                </div>

                <!-- Description & Details -->
                <div class="space-y-4 text-xs font-light text-gray-700">
                  <div>
                    <h5 class="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[10px]">Description & Texture</h5>
                    <p class="leading-relaxed">{{ item.description }}</p>
                  </div>
                  <div>
                    <h5 class="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[10px]">Recommandations d'usage</h5>
                    <p class="leading-relaxed">{{ item.bestFor }}</p>
                  </div>
                </div>

                <!-- Designer signature info -->
                <div class="mt-6 pt-5 border-t border-gold-500/10 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <img [src]="item.designerAvatar" class="w-10 h-10 rounded-full object-cover border-2 border-gold-500/40" referrerpolicy="no-referrer" alt="Couturière">
                    <div>
                      <h5 class="text-xs font-bold text-gray-900">{{ item.designerName }}</h5>
                      <p class="text-[9px] text-gold-600 uppercase tracking-widest font-bold">Atelier Maître</p>
                    </div>
                  </div>
                  
                  <button 
                    (click)="toggleFavorite(item, $event)"
                    class="flex items-center gap-1 bg-gold-50 hover:bg-gold-100 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border border-gold-500/20">
                    <span class="material-icons text-sm" [class.text-bordeaux-800]="isFavorite(item.id)">
                      {{ isFavorite(item.id) ? 'favorite' : 'favorite_border' }}
                    </span>
                    <span>{{ isFavorite(item.id) ? 'Enregistré' : 'Sauvegarder' }}</span>
                  </button>
                </div>
              </div>

              <!-- Main Call to Action: Booking a real sewing job -->
              <div class="mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                  (click)="contactDesigner(item)"
                  class="btn-gold flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2">
                  <span class="material-icons text-base">chat_bubble</span>
                  Contacter l'atelier de confection
                </button>
                
                <button 
                  (click)="selectedItem.set(null)"
                  class="px-5 py-3 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Fermer
                </button>
              </div>

            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .animate-scale-up {
      animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class KenteInspirations implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);

  selectedCategory = signal<string>('all');
  selectedItem = signal<KenteItem | null>(null);
  favorites = signal<Set<string>>(new Set());

  categories = [
    { id: 'all', label: 'Tout explorer', icon: 'grid_view' },
    { id: 'motif', label: 'Tissus & Motifs', icon: 'texture' },
    { id: 'creation', label: 'Robes & Cérémonies', icon: 'checkroom' },
    { id: 'detail', label: 'Coupes Modernes', icon: 'style' }
  ];

  kenteItems: KenteItem[] = [
    {
      id: 'bogolan_yellow_1',
      title: 'Veste Asymétrique Peplum Bogolan & Or Impérial',
      category: 'creation',
      categoryLabel: 'Haute Couture',
      imageUrl: '/bogolan_yellow_blazer.jpg',
      description: 'Veste peplum asymétrique d\'une élégance saisissante confectionnée dans un tissu Bogolan précieux aux teintes ocre safran et noir profond, rythmé de motifs géométriques ancestraux, d\'un col croisé V et d\'un bouton-bijou sculpté en or.',
      culturalMeaning: 'Les motifs géométriques Bogolan racontent la protection spirituelle, la noblesse du savoir-faire artisanal et la force souveraine transmise de génération en génération.',
      bestFor: 'Parfait pour un tailleur-pantalon de prestige, des tenues d\'apparat d\'affaires ou des apparitions publiques à forte identité esthétique.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '7 à 10 jours de haute couture'
    },
    {
      id: 'bogolan_emerald_2',
      title: 'Corsage Émeraude & Cowries Royale à Manches Cloches',
      category: 'creation',
      categoryLabel: 'Haute Couture',
      imageUrl: '/emerald_bogolan_top.jpg',
      description: 'Corsage épaules dénudées d\'une rare beauté aux spectaculaires manches cloches évasées. Le Tissu émeraude profond, noir et blanc est orné de symboles géométriques graphiques, de croix en losanges et de motifs de cauris symbolisant l\'abondance.',
      culturalMeaning: 'Le vert émeraude et le cauri sacré célèbrent la fécondité, la prospérité financière et l\'harmonie cosmique avec la nature.',
      bestFor: 'Associé à un pantalon évasé blanc cassé pour une tenue de cérémonie d\'élite, une soirée de gala ou des événements culturels de haut rang.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '8 à 12 jours de haute précision'
    },
    {
      id: 'kente_1',
      title: 'Or Royal Souverain (Sika Futuro)',
      category: 'motif',
      categoryLabel: 'Tissu & Motif',
      imageUrl: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800',
      description: 'Un kente traditionnel tissé main d\'un jaune safran éclatant marié à des fils de soie rouge brique et des reflets dorés. Sa structure tramée est d\'une finesse incomparable, réservée aux célébrations sacrées.',
      culturalMeaning: 'Sika Futuro (Or de l\'avenir) symbolise la richesse partagée, la prospérité économique et un destin glorieux sous la bénédiction royale.',
      bestFor: 'Idéal pour les grands boubous d\'apparat, les corsages de dot ou les drapés d\'épaules impériaux chez l\'homme et la femme.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '3 à 5 semaines de tissage'
    },
    {
      id: 'kente_2',
      title: 'Robe Sirène Impériale Papillon',
      category: 'creation',
      categoryLabel: 'Création d\'Exception',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
      description: 'Sublime robe fourreau sirène contemporaine mariant à merveille le tissu Kente orné de sequins scintillants rose fuchsia et orange corail, rehaussée de manches sculpturales en forme d\'ailes de papillon.',
      culturalMeaning: 'Célébre la métamorphose et la renaissance culturelle de la femme africaine moderne, alliant audace esthétique et ancrage traditionnel.',
      bestFor: 'Robe de mariée de dot traditionnelle, soirées de gala internationales, cérémonies de prestige.',
      atelierId: 'atelier_2',
      designerName: 'Awa Koné',
      designerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      authorId: 'seamstress_2',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '10 à 15 jours de confection'
    },
    {
      id: 'kente_3',
      title: 'Drapés d\'Émeraude Royale',
      category: 'detail',
      categoryLabel: 'Coupe Moderne',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      description: 'Gros plan sur les coutures de haute précision et les drapés volumineux en satin de soie émeraude qui accompagnent majestueusement les motifs géométriques d\'un Kente d\'élite.',
      culturalMeaning: 'Le vert émeraude symbolise la croissance spirituelle, la fertilité, le renouveau et l\'abondance heureuse au sein du foyer.',
      bestFor: 'Parfait pour structurer les silhouettes en sablier avec une sur-jupe amovible ou pour concevoir un bustier asymétrique d\'une élégance rare.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Difficile',
      timeRequired: '7 à 10 jours de confection'
    },
    {
      id: 'kente_4',
      title: 'Alliance du Couple Impérial',
      category: 'creation',
      categoryLabel: 'Création d\'Exception',
      imageUrl: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800',
      description: 'Un ensemble assorti d\'une splendeur divine pour couple d\'honneur : Robe sirène drapée avec ceinture Kente brodée main pour elle, et grand boubou agbada traditionnel avec broderies royales or pour lui.',
      culturalMeaning: 'L\'unité parfaite, le respect partagé de l\'héritage et la promesse d\'un soutien indéfectible au sein du mariage.',
      bestFor: 'Idéal pour les cérémonies de dot, mariages traditionnels africains de prestige, ou banquets de réception officiels.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '3 à 4 semaines de travail d\'atelier'
    },
    {
      id: 'kente_5',
      title: 'Fourreau Cannelle Perlée',
      category: 'detail',
      categoryLabel: 'Coupe Moderne',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      description: 'Robe de prestige transparente couleur cannelle ornée de motifs perlés ivoire dessinant de délicats ramages d\'inspiration royale sur les hanches et l\'ourlet.',
      culturalMeaning: 'La couleur cannelle/terre symbolise la stabilité, la patience de la mère patrie et l\'élégance discrète et intemporelle.',
      bestFor: 'Robes de cocktail semi-formelles, banquets mondains, lancements de collections couture.',
      atelierId: 'atelier_2',
      designerName: 'Awa Koné',
      designerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      authorId: 'seamstress_2',
      difficulty: 'Difficile',
      timeRequired: '8 à 12 jours de couture'
    },
    {
      id: 'kente_6',
      title: 'Soleil de Bronze Solaire',
      category: 'motif',
      categoryLabel: 'Tissu & Motif',
      imageUrl: 'https://images.unsplash.com/photo-1572495537021-a67b12938b8b?w=800',
      description: 'Robe de soirée drapée en satin de soie marron bronze avec un corset sculpté rayonnant de fines broderies dorées en forme de soleil, évoquant la texture noble du Kente brillant.',
      culturalMeaning: 'Le bronze et l\'or célèbrent la lumière divine de l\'astre solaire, transmettant force, rayonnement social et charisme suprême.',
      bestFor: 'Confection de robes de soirée drapées pour dîners d\'affaires haut de gamme ou remises de diplômes universitaires.',
      atelierId: 'atelier_2',
      designerName: 'Awa Koné',
      designerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      authorId: 'seamstress_2',
      difficulty: 'Moyen',
      timeRequired: '5 à 8 jours de confection'
    },
    {
      id: 'kente_7',
      title: 'Chocolat Cacao & Tissage d\'Or',
      category: 'creation',
      categoryLabel: 'Création d\'Exception',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      description: 'Ensemble fourreau haut de gamme marron cacao perlé de jais sur l\'encolure bateau, et bas sirène drapé en motif Kente traditionnel orné d\'une traîne fluide.',
      culturalMeaning: 'Le marron cacao rend hommage à la terre fertile de l\'Afrique de l\'Ouest, source d\'abondance, unie à l\'or de la couronne.',
      bestFor: 'Soirées de bienfaisance, anniversaires de prestige, événements institutionnels.',
      atelierId: 'atelier_1',
      designerName: 'Fatoumata Diallo',
      designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorId: 'seamstress_1',
      difficulty: 'Difficile',
      timeRequired: '12 à 18 jours de travail de perlage'
    },
    {
      id: 'kente_8',
      title: 'Création Royale Violette (Majesté)',
      category: 'detail',
      categoryLabel: 'Coupe Moderne',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
      description: 'Robe de cérémonie sirène en dentelle perlée et velours dégradé de pourpre et de violet impérial, avec un rappel tissé Kente sur la lisière et des manches bouffantes romantiques.',
      culturalMeaning: 'Le violet impérial incarne la grâce féminine ultime, la sagesse héritée des reines mères de l\'ancien Empire Ashanti.',
      bestFor: 'Robe de mariée civile de dot, célébrations nationales, concerts de musique traditionnelle.',
      atelierId: 'atelier_2',
      designerName: 'Awa Koné',
      designerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      authorId: 'seamstress_2',
      difficulty: 'Chef-d\'œuvre',
      timeRequired: '14 à 20 jours de confection'
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
      try {
        localStorage.setItem('kente_favorites', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
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
      // Create actual chat connection
      await this.api.startConversation(item.authorId, item.atelierId);
      this.selectedItem.set(null);
      this.router.navigate(['/chat']);
    } catch (e) {
      console.error(e);
    }
  }
}
