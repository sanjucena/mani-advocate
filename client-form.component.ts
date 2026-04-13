// ============================================================
// 📁 app.component.ts — Root Component
// ============================================================
// INTERVIEW TIP: "The root component is the entry point of the
// Angular component tree. Every other component is a child of
// this one. It decides the overall layout: if the user is logged
// in, show sidebar + content. If not, show just the auth page."
// ============================================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <!-- INTERVIEW TIP: "@if is Angular's new built-in control flow
         (replaced *ngIf in Angular 17+). It's faster and more readable." -->
    @if (auth.isLoggedIn()) {
      <div class="app-layout">
        <app-sidebar />
        <div class="main-area">
          <app-header />
          <main class="main-content">
            <router-outlet />
          </main>
        </div>
      </div>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding: var(--spacing-lg);
      background: var(--bg);
    }

    @media (max-width: 768px) {
      .main-area {
        margin-left: 0;
      }
    }
  `],
})
export class AppComponent {
  // INTERVIEW TIP: "We inject AuthService as public so the
  // template can access it directly. If it were private,
  // the template couldn't use auth.isLoggedIn()."
  constructor(public auth: AuthService) {}
}
