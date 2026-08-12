import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { HarmyApiService, Post } from '@core/services/harmy-api.service';
import { ScrollFadeDirective } from '@shared/directives/scroll-fade.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollFadeDirective],
  template: `
    <div class="animate-fade-in text-gray-900 bg-pagne-subtle min-h-screen overflow-x-hidden">
      
      <!-- 1. HERO SECTION -->
      <section class="relative min-h-[85vh] flex items-center bg-gradient-to-tr from-noir-profond via-bordeaux-950 to-emerald-950 text-white overflow-hidden py-16 sm:py-24 border-b border-gold-500/30">
        
        <!-- Ambient Radial Glows -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent pointer-events-none"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Left Hero Content -->
            <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <!-- Trust Badge -->
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-gold-500/40 backdrop-blur-md text-gold-300 text-xs font-semibold uppercase tracking-widest custom-shadow">
                <span class="material-icons text-sm text-gold-400">verified</span>
                <span>Plus de carnets papier perdus • 100% Sécurisé & Responsive</span>
              </div>

              <!-- Main Title -->
              <h1 class="serif-header text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
                La première plateforme numérique dédiée à l'art de la 
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600">
                  couture sur-mesure africaine
                </span>.
              </h1>

              <!-- Subtitle -->
              <p class="text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Modernisez la gestion de votre atelier ou suivez la création de vos tenues en Wax, Bazin et Kente en temps réel.
              </p>

              <!-- Action CTAs -->
              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                @if (authService.isAuthenticated()) {
                  @if (authService.currentUser()?.role === 'COUTURIERE') {
                    <a routerLink="/atelier" class="btn-gold px-8 py-4 text-sm font-extrabold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform w-full sm:w-auto justify-center">
                      <span class="material-icons text-lg">cut</span>
                      <span>Accéder à Mon Atelier</span>
                    </a>
                  } @else {
                    <a routerLink="/client" class="btn-gold px-8 py-4 text-sm font-extrabold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform w-full sm:w-auto justify-center">
                      <span class="material-icons text-lg">accessibility</span>
                      <span>Accéder à Mon Espace</span>
                    </a>
                  }
                  <a routerLink="/catalogue" class="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-gold-500/40 text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition-all w-full sm:w-auto justify-center">
                    <span class="material-icons text-lg text-gold-400">style</span>
                    <span>Explorer le Catalogue</span>
                  </a>
                } @else {
                  <a routerLink="/auth" class="btn-gold px-8 py-4 text-sm font-extrabold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform w-full sm:w-auto justify-center">
                    <span class="material-icons text-lg">how_to_reg</span>
                    <span>Rejoindre la plateforme (Inscription Gratuite)</span>
                  </a>
                  <a routerLink="/catalogue" class="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-gold-500/40 text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition-all w-full sm:w-auto justify-center">
                    <span class="material-icons text-lg text-gold-400">style</span>
                    <span>Explorer le Catalogue de Modèles</span>
                  </a>
                }
              </div>

              <!-- Quick Micro Stats under Hero -->
              <div class="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span class="block text-2xl font-bold text-gold-400">100+</span>
                  <span class="text-xs text-gray-400">Ateliers numérisés</span>
                </div>
                <div>
                  <span class="block text-2xl font-bold text-gold-400">1000+</span>
                  <span class="text-xs text-gray-400">Carnets sécurisés</span>
                </div>
                <div>
                  <span class="block text-2xl font-bold text-gold-400">99%</span>
                  <span class="text-xs text-gray-400">Satisfaction</span>
                </div>
              </div>

            </div>

            <!-- Right Visual Branding Hero Card -->
            <div class="lg:col-span-5 relative flex justify-center">
              <div class="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-2 border-gold-500/40 custom-shadow-lg group">
                
                <!-- Background Image -->
                <img 
                  src="/hero_couture_dress.jpg" 
                  alt="Harmy'Swing Haute Couture" 
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">

                <!-- Dark Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-noir-profond via-noir-profond/40 to-transparent"></div>

                <!-- Circular Platform Logo Badge -->
                <div class="absolute top-6 left-6 flex items-center gap-3 bg-noir-profond/90 backdrop-blur-md p-2.5 pr-5 rounded-full border border-gold-500/50 shadow-2xl">
                  <img src="/logo.png" alt="Harmy'Swing Logo" class="w-12 h-12 rounded-full object-cover border border-gold-400 shadow-md">
                  <div>
                    <h2 class="serif-header text-sm font-bold text-white leading-none">Harmy'Swing</h2>
                    <span class="text-[9px] uppercase tracking-widest text-gold-400 font-extrabold block mt-0.5">Plateforme Officielle</span>
                  </div>
                </div>

                <!-- Floating Live Kanban Indicator -->
                <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-noir-profond/90 border border-gold-500/40 backdrop-blur-md shadow-2xl space-y-2">
                  <div class="flex items-center justify-between text-xs text-gold-300 font-bold">
                    <span class="flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Suivi Kanban en direct
                    </span>
                    <span class="text-[10px] text-gray-400">Statut : En Couture</span>
                  </div>
                  <div class="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gold-500/20">
                    <div class="bg-gradient-to-r from-gold-500 to-emerald-500 h-full w-3/4 rounded-full"></div>
                  </div>
                  <p class="text-[11px] text-gray-300 font-light">Robe Sirène en Bazin Riche • Livrée sous 4 jours</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 2. WHY CHOOSE US / VALUE PROPOSITION SECTION -->
      <section class="py-20 bg-white relative border-b border-gold-500/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span class="px-4 py-1.5 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
              Innovation & Excellence
            </span>
            <h2 class="serif-header text-3xl sm:text-4xl font-extrabold text-gray-900">
              Pourquoi choisir Harmy'Swing ?
            </h2>
            <p class="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
              Une suite d'outils numériques modernes conçue spécifiquement pour répondre aux exigences des couturiers et des clientes exigeantes.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <!-- Card 1 -->
            <div appScrollFade class="pagne-card bg-pagne-subtle p-8 rounded-3xl border border-gold-500/20 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noir-profond to-gold-600 text-gold-400 flex items-center justify-center mb-6 shadow-md border border-gold-500/30">
                  <span class="material-icons text-2xl">straighten</span>
                </div>
                <h3 class="serif-header text-lg font-bold text-gray-900 mb-3">Carnet de Mesures Numérique</h3>
                <p class="text-xs text-gray-600 font-light leading-relaxed">
                  Fini les erreurs de prise de mesure. Un carnet standardisé (tour de poitrine, taille, hanches, bras) et partageable en 1 clic.
                </p>
              </div>
              <div class="mt-6 pt-4 border-t border-gold-500/10 text-xs font-bold text-gold-700 flex items-center gap-1">
                <span>Zéro Carnet Perdu</span>
                <span class="material-icons text-sm">arrow_forward</span>
              </div>
            </div>

            <!-- Card 2 -->
            <div appScrollFade class="pagne-card bg-pagne-subtle p-8 rounded-3xl border border-gold-500/20 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noir-profond to-emerald-800 text-emerald-300 flex items-center justify-center mb-6 shadow-md border border-emerald-500/30">
                  <span class="material-icons text-2xl">view_kanban</span>
                </div>
                <h3 class="serif-header text-lg font-bold text-gray-900 mb-3">Tableau de Suivi en Temps Réel</h3>
                <p class="text-xs text-gray-600 font-light leading-relaxed">
                  Transparence totale du statut du vêtement (Tissu Reçu ➔ En Couture ➔ Prêt pour Essayage ➔ Livré) via Kanban dynamique.
                </p>
              </div>
              <div class="mt-6 pt-4 border-t border-gold-500/10 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <span>Transparence Totale</span>
                <span class="material-icons text-sm">arrow_forward</span>
              </div>
            </div>

            <!-- Card 3 -->
            <div appScrollFade class="pagne-card bg-pagne-subtle p-8 rounded-3xl border border-gold-500/20 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noir-profond to-bordeaux-900 text-gold-400 flex items-center justify-center mb-6 shadow-md border border-bordeaux-500/30">
                  <span class="material-icons text-2xl">account_balance_wallet</span>
                </div>
                <h3 class="serif-header text-lg font-bold text-gray-900 mb-3">Gestion Financière & Acomptes</h3>
                <p class="text-xs text-gray-600 font-light leading-relaxed">
                  Suivi exact des recettes de l'atelier en Francs Congolais (FC), des soldes restants et des encaissements sans risque d'erreur.
                </p>
              </div>
              <div class="mt-6 pt-4 border-t border-gold-500/10 text-xs font-bold text-bordeaux-800 flex items-center gap-1">
                <span>Soldes & Recettes Sécurisés</span>
                <span class="material-icons text-sm">arrow_forward</span>
              </div>
            </div>

            <!-- Card 4 -->
            <div appScrollFade class="pagne-card bg-pagne-subtle p-8 rounded-3xl border border-gold-500/20 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noir-profond via-gold-600 to-emerald-900 text-gold-300 flex items-center justify-center mb-6 shadow-md border border-gold-500/30">
                  <span class="material-icons text-2xl">auto_awesome</span>
                </div>
                <h3 class="serif-header text-lg font-bold text-gray-900 mb-3">Savoir-Faire Africain</h3>
                <p class="text-xs text-gray-600 font-light leading-relaxed">
                  Vitrine publique pour exposer ses plus belles créations en Wax et Bazin, attirer de nouvelles clientes et développer sa notoriété.
                </p>
              </div>
              <div class="mt-6 pt-4 border-t border-gold-500/10 text-xs font-bold text-gold-700 flex items-center gap-1">
                <span>Rayonnement International</span>
                <span class="material-icons text-sm">arrow_forward</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- 3. TWO UNIVERSES SECTION (COUTURIÈRES VS CLIENTES) -->
      <section class="py-20 bg-pagne-subtle relative border-b border-gold-500/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span class="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
              Ecosystème Sur-Mesure
            </span>
            <h2 class="serif-header text-3xl sm:text-4xl font-extrabold text-gray-900">
              Une plateforme conçue pour deux univers
            </h2>
            <p class="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
              Que vous soyez maître couturier cherchant à numériser votre atelier ou passionnée de mode désireuse de suivre vos créations.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <!-- Left Box: Couturières & Artisans -->
            <div appScrollFade class="bg-noir-profond text-white p-8 sm:p-10 rounded-3xl border-2 border-gold-500/40 custom-shadow-lg relative overflow-hidden flex flex-col justify-between">
              
              <div class="absolute -right-16 -top-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="px-3.5 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-extrabold uppercase tracking-widest border border-gold-500/30">
                    Espace SaaS Atelier
                  </span>
                  <span class="material-icons text-3xl text-gold-400">content_cut</span>
                </div>

                <h3 class="serif-header text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  Pour les Couturières & Ateliers
                </h3>

                <p class="text-sm text-gray-300 font-light leading-relaxed mb-6">
                  Gagnez un temps précieux, automatisez la gestion de votre clientèle et offrez une expérience haut de gamme à vos clientes.
                </p>

                <ul class="space-y-3.5 text-xs text-gray-200 mb-8">
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Gestion centralisée des fiches de mesures clients</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Kanban interactif pour l'avancement des commandes</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Comptabilité automatique et suivi des soldes en Francs Congolais (FC)</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Messagerie directe avec vos clientes et notifications</span>
                  </li>
                </ul>
              </div>

              <div>
                <a routerLink="/auth" [queryParams]="{ role: 'COUTURIERE' }" class="btn-gold w-full py-4 text-sm font-extrabold text-center block shadow-lg hover:scale-102 transition-transform">
                  Créer mon Espace Atelier
                </a>
              </div>

            </div>

            <!-- Right Box: Clientes & Passionnées -->
            <div appScrollFade class="bg-gradient-to-tr from-emerald-950 via-noir-profond to-bordeaux-950 text-white p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/40 custom-shadow-lg relative overflow-hidden flex flex-col justify-between">
              
              <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/30">
                    Marketplace & Suivi
                  </span>
                  <span class="material-icons text-3xl text-emerald-400">accessibility</span>
                </div>

                <h3 class="serif-header text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  Pour les Clientes & Passionnées
                </h3>

                <p class="text-sm text-gray-300 font-light leading-relaxed mb-6">
                  Conservez votre carnet de mesures personnel en sécurité, découvrez des modèles d'exception et suivez la couture de votre tenue.
                </p>

                <ul class="space-y-3.5 text-xs text-gray-200 mb-8">
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Carnet de mesures personnel accessible et réutilisable</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Partage sécurisé de ses mesures avec son atelier de confiance</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Suivi en temps réel de la confection sans avoir à appeler</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Catalogue d'inspirations Wax, Bazin Riche & Kente Royal</span>
                  </li>
                </ul>
              </div>

              <div>
                <a routerLink="/auth" [queryParams]="{ role: 'CLIENTE' }" class="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm text-center block shadow-lg hover:scale-102 transition-transform border border-emerald-400/40">
                  Créer mon Compte Cliente
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      <!-- 4. CATALOG PREVIEW SHOWCASE (REAL DATA POSTGRESQL) -->
      <section class="py-20 bg-white border-b border-gold-500/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <span class="px-4 py-1.5 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
                Inspirations & Haute Couture
              </span>
              <h2 class="serif-header text-3xl font-extrabold text-gray-900 mt-2">
                Découvrez les modèles phares de notre catalogue
              </h2>
            </div>
            <a routerLink="/catalogue" class="btn-gold px-6 py-3 text-xs font-extrabold flex items-center gap-2">
              <span>Voir tous les modèles</span>
              <span class="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (p of featuredPosts().slice(0, 3); track p.id) {
              <div appScrollFade class="pagne-card bg-white rounded-3xl overflow-hidden border border-gold-500/20 shadow-md hover:shadow-xl transition-all group">
                <div class="relative aspect-[3/4] overflow-hidden">
                  <img [src]="p.media[0] || '/hero_couture_dress.jpg'" [alt]="p.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                  <div class="absolute top-4 left-4 bg-noir-profond/90 border border-gold-500/50 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-bold text-gold-400">
                    {{ p.tags[0] || 'Haute Couture' }}
                  </div>
                </div>
                <div class="p-6">
                  <h3 class="serif-header text-base font-bold text-gray-900 mb-1 line-clamp-1">{{ p.caption }}</h3>
                  <p class="text-xs text-gray-500 font-light mb-3 line-clamp-2">Création d'exception réalisée sur-mesure par nos artisans.</p>
                  <div class="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                    <span class="font-extrabold text-gold-700">{{ p.priceHint | number }} FC</span>
                    <span class="text-gray-400 font-semibold">{{ p.authorName }}</span>
                  </div>
                </div>
              </div>
            }

            @if (featuredPosts().length === 0) {
              <div class="col-span-3 text-center py-12 bg-white rounded-3xl border border-gold-500/20 p-8 shadow-sm">
                <span class="material-icons text-4xl text-gold-500 mb-2">auto_awesome</span>
                <h3 class="serif-header text-lg font-bold text-gray-900">Vitrine d'Inspiration Harmy'Swing</h3>
                <p class="text-xs text-gray-500 font-light max-w-md mx-auto mt-1 mb-4">Soyez le premier atelier à publier vos créations en Wax, Bazin ou Kente sur la plateforme !</p>
                <a routerLink="/auth" class="btn-gold px-6 py-2.5 text-xs font-bold inline-block">Publier un modèle</a>
              </div>
            }
          </div>

        </div>
      </section>

      <!-- 5. STATS & TESTIMONIALS (PREUVE SOCIALE) -->
      <section class="py-20 bg-pagne-subtle border-b border-gold-500/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span class="px-4 py-1.5 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
              Témoignages & Preuve Sociale
            </span>
            <h2 class="serif-header text-3xl font-extrabold text-gray-900">
              Reconnu par les maîtres couturiers et leurs clientes
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Testimonial 1 -->
            <div appScrollFade class="bg-white p-8 rounded-3xl border border-gold-500/20 shadow-md relative">
              <div class="flex items-center gap-1 text-gold-500 mb-4">
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
              </div>
              <p class="text-xs text-gray-700 italic leading-relaxed mb-6 font-light">
                "Harmy'Swing a totalement transformé le fonctionnement de mon atelier. Je ne perds plus jamais la fiche de mesure d'une cliente, et le tableau Kanban permet à mes apprenties de savoir exactement ce qui doit être cousu en priorité."
              </p>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-gold-100 text-gold-900 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-900">Awa N.</h4>
                  <span class="text-[10px] text-gold-600 font-semibold">Maître Couturière</span>
                </div>
              </div>
            </div>

            <!-- Testimonial 2 -->
            <div appScrollFade class="bg-white p-8 rounded-3xl border border-gold-500/20 shadow-md relative">
              <div class="flex items-center gap-1 text-gold-500 mb-4">
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
                <span class="material-icons text-sm">star</span>
              </div>
              <p class="text-xs text-gray-700 italic leading-relaxed mb-6 font-light">
                "En tant que cliente, pouvoir suivre en direct le statut de ma robe de mariage (en couture, puis prête pour essayage) sans devoir téléphoner dix fois est un vrai bonheur. Une expérience moderne et ultra rassurante !"
              </p>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                  F
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-900">Fatou K.</h4>
                  <span class="text-[10px] text-emerald-700 font-semibold">Cliente Harmy'Swing</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- 6. FINAL CTA BANNER -->
      <section class="py-20 bg-gradient-to-r from-noir-profond via-bordeaux-950 to-emerald-950 text-white relative overflow-hidden border-b border-gold-500/30">
        
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent pointer-events-none"></div>

        <div class="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          
          <img src="/logo.png" alt="Harmy'Swing Logo" class="w-20 h-20 rounded-full mx-auto border-2 border-gold-400 shadow-2xl object-cover">

          <h2 class="serif-header text-3xl sm:text-5xl font-extrabold leading-tight text-white">
            Prêt(e) à révolutionner votre expérience de la couture ?
          </h2>

          <p class="text-sm sm:text-base text-gray-300 font-light max-w-2xl mx-auto">
            Rejoignez les dizaines d'ateliers et des centaines de clientes qui font confiance à Harmy'Swing pour sublimer la mode africaine.
          </p>

          <div class="pt-4">
            <a routerLink="/auth" class="btn-gold inline-flex items-center gap-3 px-10 py-5 text-base font-extrabold shadow-2xl hover:scale-105 transition-transform">
              <span class="material-icons text-xl">rocket_launch</span>
              <span>Démarrer Gratuitement Maintenant</span>
            </a>
          </div>

        </div>
      </section>

      <!-- 7. FOOTER INSTITUTIONNEL -->
      <footer class="bg-noir-profond text-gray-400 py-12 border-t border-gold-500/20 text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <!-- Brand Column -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <img src="/logo.png" alt="Harmy'Swing Logo" class="w-10 h-10 rounded-full object-cover border border-gold-500/50">
                <span class="serif-header text-lg font-bold text-white tracking-wide">Harmy'Swing</span>
              </div>
              <p class="text-gray-400 font-light leading-relaxed">
                La référence numérique de la couture sur-mesure et de la haute couture africaine.
              </p>
            </div>

            <!-- Navigation Links -->
            <div>
              <h3 class="text-gold-400 font-bold uppercase tracking-wider text-[11px] mb-4">Plateforme</h3>
              <ul class="space-y-2.5">
                <li><a routerLink="/catalogue" class="hover:text-gold-300 transition-colors">Catalogue de Modèles</a></li>
                <li><a routerLink="/auth" class="hover:text-gold-300 transition-colors">Créer un Compte</a></li>
                <li><a routerLink="/auth/login" class="hover:text-gold-300 transition-colors">Connexion</a></li>
              </ul>
            </div>

            <!-- Features Links -->
            <div>
              <h3 class="text-gold-400 font-bold uppercase tracking-wider text-[11px] mb-4">Fonctionnalités</h3>
              <ul class="space-y-2.5">
                <li><a routerLink="/atelier" class="hover:text-gold-300 transition-colors">Espace Atelier Couturière</a></li>
                <li><a routerLink="/client" class="hover:text-gold-300 transition-colors">Carnet de Mesures Cliente</a></li>
                <li><a routerLink="/messagerie" class="hover:text-gold-300 transition-colors">Messagerie en Direct</a></li>
              </ul>
            </div>

            <!-- Contact & Legal -->
            <div>
              <h3 class="text-gold-400 font-bold uppercase tracking-wider text-[11px] mb-4">Contact & Support</h3>
              <ul class="space-y-2.5">
                <li class="flex items-center gap-2">
                  <span class="material-icons text-xs text-gold-500">email</span>
                  <span>contact&#64;harmyswing.com</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="material-icons text-xs text-gold-500">phone</span>
                  <span>+243 81 000 0000</span>
                </li>
                <li class="pt-2 text-[10px] text-gray-500">
                  © 2026 Harmy'Swing. Tous droits réservés.
                </li>
              </ul>
            </div>

          </div>

          <div class="pt-8 border-t border-gray-800 text-center text-[10px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>Fait avec passion pour l'artisanat et la haute couture africaine.</span>
            <div class="flex gap-4">
              <a href="#" class="hover:text-gold-400">Mentions Légales</a>
              <a href="#" class="hover:text-gold-400">Politique de Confidentialité</a>
              <a href="#" class="hover:text-gold-400">CGU</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  `
})
export class LandingHomeComponent implements OnInit {
  authService = inject(AuthService);
  api = inject(HarmyApiService);

  featuredPosts = signal<Post[]>([]);

  async ngOnInit() {
    try {
      const posts = await this.api.getPosts();
      this.featuredPosts.set(posts || []);
    } catch (e) {
      console.error('Erreur chargement vitrine:', e);
    }
  }
}
