import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HarmyApiService as HarmyApi, Post } from '@core/services/harmy-api.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-pagne-subtle min-h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="serif-header text-3xl font-extrabold text-gray-900 mb-2">Catalogue & Inspirations Mode</h1>
        <p class="text-xs text-gold-700 font-bold uppercase tracking-widest mb-8">Modèles et créations africaines d'exception</p>

        @if (loading()) {
          <div class="py-12 text-center text-xs text-gold-600 font-bold flex items-center justify-center gap-2">
            <span class="material-icons animate-spin text-sm">sync</span> Chargement du catalogue depuis le backend...
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of posts(); track item.id) {
              <div class="pagne-card bg-white rounded-3xl overflow-hidden shadow-md border border-gold-500/20">
                <div class="h-56 bg-noir-profond flex items-center justify-center text-gold-400 font-bold overflow-hidden relative">
                  @if (item.media?.[0]) {
                    <img [src]="item.media[0]" class="w-full h-full object-cover" [alt]="item.caption">
                  } @else {
                    <span class="material-icons text-5xl text-gold-500/40">style</span>
                  }
                  <span class="absolute top-3 right-3 bg-noir-profond/80 text-gold-400 text-xs font-bold px-3 py-1 rounded-full border border-gold-500/30">
                    {{ item.priceHint | number }} {{ item.currency || 'FC' }}
                  </span>
                </div>
                <div class="p-5">
                  <h3 class="serif-header text-lg font-bold text-gray-900 mb-1">{{ item.authorName }}</h3>
                  <p class="text-xs text-gray-600 font-light line-clamp-2 mb-4">{{ item.caption }}</p>
                  <div class="flex flex-wrap gap-1">
                    @for (tag of item.tags; track tag) {
                      <span class="text-[10px] bg-gold-50 text-gold-800 font-semibold px-2 py-0.5 rounded-md border border-gold-500/20">
                        #{{ tag }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
            @if (posts().length === 0) {
              <div class="col-span-full py-16 text-center text-xs text-gray-400 italic bg-white rounded-3xl border border-gray-100 p-8">
                Aucun modèle disponible dans le catalogue pour le moment.
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  private api = inject(HarmyApi);

  posts = signal<Post[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    try {
      this.loading.set(true);
      const list = await this.api.getPosts();
      this.posts.set(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
