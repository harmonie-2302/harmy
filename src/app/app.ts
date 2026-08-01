import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HarmyApi } from './harmy-api';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  api = inject(HarmyApi);
  router = inject(Router);

  async onSwitchDemoUser(event: Event) {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;
    if (!userId) return;

    try {
      const u = await this.api.switchUser(userId);
      // Redirect based on simulated user role for optimal testing UX
      if (u.role === 'seamstress') {
        this.router.navigate(['/atelier']);
      } else if (u.role === 'customer') {
        this.router.navigate(['/client']);
      } else {
        this.router.navigate(['/admin']);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
