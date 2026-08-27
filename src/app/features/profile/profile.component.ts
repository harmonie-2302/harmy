import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HarmyApiService, User } from '@core/services/harmy-api.service';

/**
 * Profil du compte connecté — commun aux couturières, clientes et admins.
 * Toutes les valeurs proviennent de GET /users/me ; rien n'est simulé.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      <!-- En-tête -->
      <header class="mb-8">
        <p class="text-[10px] uppercase tracking-[0.2em] text-gold-600 font-extrabold mb-2">Mon compte</p>
        <h1 class="serif-header text-3xl sm:text-4xl font-bold text-gray-900">Profil</h1>
        <p class="text-xs text-gray-500 font-light mt-2">
          Vos informations personnelles telles qu'elles sont enregistrées dans la base Harmy'Swing.
        </p>
      </header>

      @if (loading()) {
        <div class="py-20 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
          <span class="material-icons animate-spin text-base">sync</span> Chargement de votre profil…
        </div>
      } @else if (!profile()) {
        <div class="pagne-card p-8 text-center">
          <span class="material-icons text-4xl text-gray-300 mb-3 block">person_off</span>
          <p class="text-xs text-gray-600 font-light">
            Profil indisponible. {{ error() || 'Veuillez vous reconnecter.' }}
          </p>
        </div>
      } @else if (profile(); as me) {

        <div class="grid lg:grid-cols-3 gap-6">

          <!-- Carte identité -->
          <aside class="lg:col-span-1">
            <div class="pagne-card p-6 text-center">
              @if (form.photoURL) {
                <img [src]="form.photoURL" alt="" class="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gold-500/40 shadow-md" />
              } @else {
                <span class="w-24 h-24 rounded-full bg-noir-profond text-gold-400 flex items-center justify-center text-2xl font-extrabold mx-auto">
                  {{ initials() }}
                </span>
              }

              <h2 class="serif-header text-lg font-bold text-gray-900 mt-4">{{ me.displayName || me.email }}</h2>
              <p class="text-[10px] uppercase tracking-widest text-gold-600 font-extrabold mt-1">{{ me.role }}</p>

              <div class="mt-5 pt-5 border-t border-gray-100 space-y-2 text-left">
                <p class="flex items-center gap-2 text-[11px] text-gray-600">
                  <span class="material-icons text-sm text-gray-400">mail</span>
                  <span class="truncate">{{ me.email }}</span>
                </p>
                @if (me.createdAt) {
                  <p class="flex items-center gap-2 text-[11px] text-gray-600">
                    <span class="material-icons text-sm text-gray-400">event</span>
                    Membre depuis le {{ me.createdAt | date:'dd/MM/yyyy' }}
                  </p>
                }
                @if (me.atelierId) {
                  <p class="flex items-center gap-2 text-[11px] text-gray-600">
                    <span class="material-icons text-sm text-gray-400">storefront</span>
                    Atelier rattaché
                  </p>
                }
              </div>

              <!-- Téléversement de la photo -->
              <label class="mt-5 block cursor-pointer">
                <input type="file" accept="image/*" class="hidden" (change)="onPhotoSelected($event)" />
                <span class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gold-500/30 text-gold-700 text-[11px] font-bold hover:bg-gold-50 transition">
                  @if (uploading()) {
                    <span class="material-icons animate-spin text-sm">sync</span> Envoi…
                  } @else {
                    <span class="material-icons text-sm">photo_camera</span> Changer la photo
                  }
                </span>
              </label>
            </div>

            <!-- Abonnement -->
            @if (me.subscription; as sub) {
              <div class="pagne-card p-5 mt-5">
                <p class="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold mb-3">Abonnement</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-900">{{ sub.plan }}</span>
                  <span
                    class="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
                    [class]="sub.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-600/20'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'">
                    {{ sub.status === 'active' ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
                @if (sub.renewalDate) {
                  <p class="text-[10px] text-gray-500 mt-2">Renouvellement : {{ sub.renewalDate | date:'dd/MM/yyyy' }}</p>
                }
              </div>
            }

            @if (spaceLink(); as space) {
              <a [routerLink]="space.path"
                 class="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-noir-profond text-gold-400 text-[11px] font-bold hover:bg-gray-900 transition">
                <span class="material-icons text-sm">{{ space.icon }}</span> {{ space.label }}
              </a>
            }
          </aside>

          <!-- Formulaire -->
          <section class="lg:col-span-2">
            <form class="pagne-card p-6 sm:p-8" (ngSubmit)="save()">
              <h3 class="serif-header text-lg font-bold text-gray-900 mb-1">Informations personnelles</h3>
              <p class="text-[11px] text-gray-500 font-light mb-6">
                Ces coordonnées sont utilisées par les ateliers pour vous contacter.
              </p>

              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">Prénom</label>
                  <input type="text" name="prenom" [(ngModel)]="form.prenom"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-gold-500 transition" />
                </div>
                <div>
                  <label class="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">Nom</label>
                  <input type="text" name="nom" [(ngModel)]="form.nom"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-gold-500 transition" />
                </div>
                <div>
                  <label class="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">Téléphone</label>
                  <input type="tel" name="phone" [(ngModel)]="form.phone" placeholder="+243 …"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-gold-500 transition" />
                </div>
                <div>
                  <label class="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">WhatsApp</label>
                  <input type="tel" name="whatsapp" [(ngModel)]="form.whatsapp" placeholder="+243 …"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-gold-500 transition" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">Adresse email</label>
                  <input type="email" [value]="me.email" disabled
                         class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs text-gray-500 cursor-not-allowed" />
                  <p class="text-[10px] text-gray-400 mt-1.5">L'email d'identification n'est pas modifiable.</p>
                </div>
              </div>

              @if (message(); as msg) {
                <div class="mt-5 p-3 rounded-2xl text-[11px] font-medium text-center"
                     [class]="msg.ok
                       ? 'bg-emerald-50 text-emerald-800 border border-emerald-600/20'
                       : 'bg-red-50 text-red-700 border border-red-200'">
                  {{ msg.text }}
                </div>
              }

              <div class="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                <button type="submit" [disabled]="saving()"
                        class="btn-gold px-6 py-3 text-[11px] font-bold disabled:opacity-50 flex items-center gap-1.5">
                  @if (saving()) {
                    <span class="material-icons animate-spin text-sm">sync</span> Enregistrement…
                  } @else {
                    <span class="material-icons text-sm">save</span> Enregistrer
                  }
                </button>
                <button type="button" (click)="reset()"
                        class="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 text-[11px] font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          </section>

        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private api = inject(HarmyApiService);

  profile = signal<User | null>(null);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  message = signal<{ ok: boolean; text: string } | null>(null);

  form = { prenom: '', nom: '', phone: '', whatsapp: '', photoURL: '' };

  initials = computed(() => {
    const me = this.profile();
    const source = me?.displayName || me?.email || '';
    return source
      .split(/[\s.@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';
  });

  spaceLink = computed(() => {
    switch (this.profile()?.role) {
      case 'COUTURIERE':
        return { path: '/atelier', label: 'Ouvrir mon atelier', icon: 'cut' };
      case 'CLIENTE':
        return { path: '/client', label: 'Ouvrir mon espace', icon: 'straighten' };
      case 'ADMIN':
        return { path: '/admin', label: 'Console d\'administration', icon: 'admin_panel_settings' };
      default:
        return null;
    }
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const me = await this.api.getMe();
      this.profile.set(me);
      this.hydrate(me);
    } catch (e: unknown) {
      this.error.set(this.readError(e, 'Impossible de charger le profil.'));
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private hydrate(me: User): void {
    this.form = {
      prenom: me.prenom ?? '',
      nom: me.nom ?? '',
      phone: me.phone ?? '',
      whatsapp: me.whatsapp ?? '',
      photoURL: me.photoURL ?? ''
    };
  }

  reset(): void {
    const me = this.profile();
    if (me) this.hydrate(me);
    this.message.set(null);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set(null);
    try {
      const updated = await this.api.updateMe({
        prenom: this.form.prenom.trim(),
        nom: this.form.nom.trim(),
        phone: this.form.phone.trim(),
        whatsapp: this.form.whatsapp.trim(),
        photoURL: this.form.photoURL.trim()
      });
      this.profile.set(updated);
      this.hydrate(updated);
      this.message.set({ ok: true, text: 'Profil mis à jour.' });
    } catch (e: unknown) {
      this.message.set({ ok: false, text: this.readError(e, 'Échec de la mise à jour du profil.') });
    } finally {
      this.saving.set(false);
    }
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.message.set(null);
    try {
      const { fileUrl } = await this.api.uploadFile(file);
      this.form = { ...this.form, photoURL: fileUrl };
      await this.save();
    } catch (e: unknown) {
      this.message.set({ ok: false, text: this.readError(e, "Échec de l'envoi de la photo.") });
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  private readError(e: unknown, fallback: string): string {
    const message = (e as { error?: { message?: string } })?.error?.message;
    return message || fallback;
  }
}
