import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HarmyApi, Report, Atelier } from './harmy-api';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-white">
      
      <!-- Guard Banner (If Not Admin) -->
      @if (api.currentUser()?.role !== 'admin') {
        <div class="text-center py-16 max-w-xl mx-auto bg-white border border-mahogany-100 rounded-2xl custom-shadow p-8">
          <span class="inline-block p-4 rounded-full bg-mahogany-50 text-mahogany-500 mb-4 animate-bounce">
            <span class="material-icons text-4xl">admin_panel_settings</span>
          </span>
          <h2 class="serif-header text-2xl font-bold text-mahogany-500 mb-2">Espace de Modération & Administration</h2>
          <p class="text-xs text-gray-500 leading-relaxed font-light mb-6">
            Cette section est exclusivement réservée à l'équipe de supervision de la plateforme Harmy'sewing. Elle permet de surveiller la conformité des contenus, de gérer les abonnements des ateliers et de suivre l'activité du réseau.
          </p>
          <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6 text-left">
            <h4 class="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-1">
              <span class="material-icons text-sm">visibility</span> Mode Démo d'Harmy'sewing
            </h4>
            <p class="text-[11px] text-amber-600 font-light leading-normal">
              Pour accéder aux fonctionnalités d'administration, connectez-vous instantanément en tant que <strong>Harmonie Nankaf (Admin)</strong> ci-dessous.
            </p>
          </div>
          <button 
            (click)="switchToDemoadmin()"
            class="bg-mahogany-500 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-mahogany-600 transition-all active:translate-y-px shadow-sm">
            Se connecter comme Harmonie Nankaf
          </button>
        </div>
      } @else {

        <!-- Admin Suite Header -->
        <div class="mb-8 pb-6 border-b border-gray-100">
          <h1 class="serif-header text-2xl sm:text-3xl font-bold text-mahogany-500">
            Console d'Administration Globale
          </h1>
          <p class="text-xs text-gray-500 uppercase tracking-widest mt-1">
            Supervision du contenu, abonnements de couture & modération
          </p>
        </div>

        <!-- Global Platform Indicators -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Utilisateurs</h4>
            <p class="text-2xl font-black text-gray-800">{{ api.allUsers().length }}</p>
            <p class="text-[9px] text-gray-400 font-light mt-0.5">Comptes couturières, clientes et administrateurs</p>
          </div>

          <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Maisons de Couture actives</h4>
            <p class="text-2xl font-black text-mahogany-500">{{ ateliers().length }}</p>
            <p class="text-[9px] text-gray-400 font-light mt-0.5">Ateliers inscrits avec vitrine publique</p>
          </div>

          <div class="bg-amber-50/40 p-5 rounded-2xl border border-amber-100">
            <h4 class="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Réseau d'Inspirations</h4>
            <p class="text-2xl font-black text-amber-600">3 confections</p>
            <p class="text-[9px] text-amber-500 font-light mt-0.5">Modèles publiés par nos artisans</p>
          </div>
        </div>

        <!-- Admin Workspace grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Column 1: Modération du Contenu (Reported Posts) -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 custom-shadow">
            <h2 class="serif-header text-base font-bold text-mahogany-500 mb-1 flex items-center gap-1.5">
              <span class="material-icons text-red-500">report_problem</span> Publications Signalées par la Communauté
            </h2>
            <p class="text-xs text-gray-400 font-light mb-6">Traitez les plaintes de conformité émises sous les créations.</p>

            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              @for (rep of reports(); track rep.id) {
                <div class="bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-center justify-between gap-3">
                  <div>
                    <h4 class="text-xs font-bold text-gray-800 line-clamp-1">Post: {{ rep.postTitle }}</h4>
                    <p class="text-[11px] text-red-700 font-medium mt-1">Motif: {{ rep.reason }}</p>
                    <p class="text-[9px] text-gray-400 font-light mt-0.5">Signnalé par {{ rep.reportedBy }} &bull; {{ rep.createdAt | date:'short' }}</p>
                  </div>
                  <div class="flex gap-1">
                    <button 
                      (click)="suppressPost(rep.postId)"
                      class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition-all">
                      Supprimer
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-10 text-gray-400">
                  <span class="material-icons text-3xl mb-1">done_outline</span>
                  <p class="text-xs font-light">Aucun signalement en attente. Tout est conforme !</p>
                </div>
              }
            </div>
          </div>

          <!-- Column 2: Subscription Monitoring -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 custom-shadow">
            <h2 class="serif-header text-base font-bold text-mahogany-500 mb-1 flex items-center gap-1.5">
              <span class="material-icons text-amber-500">star</span> Abonnements des Ateliers (SaaS)
            </h2>
            <p class="text-xs text-gray-400 font-light mb-6">Surveillez et gérez le statut de facturation des maisons de couture.</p>

            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              @for (a of ateliers(); track a.id) {
                <div class="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="material-icons text-mahogany-500">store</span>
                    <div>
                      <h4 class="text-xs font-bold text-gray-800">{{ a.name }}</h4>
                      <p class="text-[9px] text-gray-400 font-light">{{ a.location.city }}, {{ a.location.country }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <span 
                      class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                      [class]="getAtelierSubStatus(a) === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                      {{ getAtelierSubStatus(a) === 'active' ? 'Actif' : 'Suspendu' }}
                    </span>
                    
                    <button 
                      (click)="toggleSubscription(a)"
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-gray-200 hover:bg-gray-50">
                      Changer
                    </button>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-gray-400 text-center py-6">Aucun atelier enregistré.</p>
              }
            </div>
          </div>

        </div>

      }

    </div>
  `
})
export class AdminPanel implements OnInit {
  api = inject(HarmyApi);
  router = inject(Router);

  reports = signal<Report[]>([]);
  ateliers = signal<Atelier[]>([]);

  ngOnInit() {
    if (this.api.currentUser()?.role === 'admin') {
      this.loadAdminData();
    }
  }

  async loadAdminData() {
    try {
      const [reps, shops] = await Promise.all([
        this.api.getReports(),
        this.api.getAteliers()
      ]);
      this.reports.set(reps);
      this.ateliers.set(shops);
    } catch (e) {
      console.error(e);
    }
  }

  async switchToDemoadmin() {
    try {
      const demoUser = this.api.allUsers().find(u => u.role === 'admin');
      if (demoUser) {
        await this.api.switchUser(demoUser.id);
        this.loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  getAtelierSubStatus(atelier: Atelier): string {
    const owner = this.api.allUsers().find(u => u.id === atelier.ownerId);
    return owner?.subscription?.status || 'inactive';
  }

  async toggleSubscription(atelier: Atelier) {
    try {
      await this.api.adminToggleAtelierSubscription(atelier.id);
      await this.api.fetchUsersList(); // refresh global users list status
      this.loadAdminData();
    } catch (e) {
      console.error(e);
    }
  }

  async suppressPost(postId: string) {
    if (!confirm("Voulez-vous vraiment supprimer définitivement ce modèle pour non-conformité ?")) return;
    try {
      await this.api.adminDeletePost(postId);
      this.reports.update(arr => arr.filter(r => r.postId !== postId));
      alert("La publication a été supprimée avec succès.");
    } catch (e) {
      console.error(e);
    }
  }
}
