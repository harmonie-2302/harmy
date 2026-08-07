import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HarmyApiService as HarmyApi, Report, Atelier } from '@core/services/harmy-api.service';
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
            <p class="text-[9px] text-gray-400 font-light mt-0.5">Ateliers référencés sur le réseau</p>
          </div>

          <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Signalements en attente</h4>
            <p class="text-2xl font-black text-amber-500">{{ reports().length }}</p>
            <p class="text-[9px] text-gray-400 font-light mt-0.5">Publications signalées par la communauté</p>
          </div>
        </div>

        <!-- Subscriptions & Atelier Moderation -->
        <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow mb-8">
          <h2 class="serif-header text-xl font-bold text-gray-900 mb-4">Gestion des Abonnements Ateliers (SaaS)</h2>
          <div class="space-y-3">
            @for (a of ateliers(); track a.id) {
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-gray-900">{{ a.name }}</h4>
                  <p class="text-xs text-gray-500 font-light">{{ a.location.city }}, {{ a.location.country }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span [class]="getAtelierSubStatus(a) === 'active' ? 'text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700' : 'text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700'">
                    {{ getAtelierSubStatus(a) === 'active' ? 'Abonnement Actif' : 'Abonnement Inactif' }}
                  </span>
                  <button (click)="toggleSubscription(a)" class="btn-gold px-3 py-1.5 text-xs font-bold">
                    Changer Statut
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Reports Moderation Section -->
        <div class="bg-white rounded-3xl p-6 border border-gold-500/20 custom-shadow">
          <h2 class="serif-header text-xl font-bold text-gray-900 mb-4">Signalements de Contenu</h2>
          <div class="space-y-3">
            @for (r of reports(); track r.id) {
              <div class="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-xs text-gray-900">{{ r.postTitle }}</h4>
                  <p class="text-xs text-red-600 font-light">Raison: {{ r.reason }}</p>
                </div>
                <button (click)="suppressPost(r.postId)" class="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-700">
                  Supprimer Modèle
                </button>
              </div>
            }
            @if (reports().length === 0) {
              <p class="text-xs text-gray-400 italic">Aucun signalement en attente.</p>
            }
          </div>
        </div>

      }
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
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
      await this.api.fetchUsersList();
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
