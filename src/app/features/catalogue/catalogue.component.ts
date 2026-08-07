import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gray-900 text-white min-h-screen">
      <h1 class="text-3xl font-bold text-amber-500 mb-2">Catalogue & Inpirations Mode</h1>
      <p class="text-gray-400 mb-8">Modèles et créations africaines d'exception</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let item of items()" class="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
          <div class="h-48 bg-gray-700 flex items-center justify-center text-amber-400 font-bold">
            {{ item.title }}
          </div>
          <div class="p-4">
            <h3 class="text-xl font-bold text-gray-100 mb-2">{{ item.title }}</h3>
            <p class="text-gray-400 text-sm mb-4">{{ item.category }}</p>
            <span class="text-amber-500 font-extrabold text-lg">{{ item.price }} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogueComponent {
  items = signal([
    { id: 1, title: 'Robe de Gala en Bazin Rich', category: 'Haute Couture', price: 75000 },
    { id: 2, title: 'Ensemble Wax Moderne', category: 'Prêt-à-porter', price: 35000 },
    { id: 3, title: 'Boubou traditionnel brodé', category: 'Cérémonie', price: 60000 }
  ]);
}
