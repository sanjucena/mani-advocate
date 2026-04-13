// ============================================================
// 📁 app.routes.ts — Application Routes
// ============================================================
// INTERVIEW TIP: "Routes map URL paths to components. Key concepts:
//   - canActivate: guards that run before loading the route
//   - loadComponent: lazy loading — the component's code is only
//     downloaded when the user navigates to that route
//   - redirectTo: sends users to a different route
//   - '**' wildcard: catches all unmatched routes (404)"
// ============================================================

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth routes (only accessible when NOT logged in)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // Protected routes (require login)
  // INTERVIEW TIP: "Lazy loading with loadComponent means the
  // browser only downloads the JavaScript for a page when the
  // user actually visits it. This improves initial load time."
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },

  // Client routes
  {
    path: 'clients',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./clients/client-list/client-list.component').then((m) => m.ClientListComponent),
  },
  {
    path: 'clients/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./clients/client-form/client-form.component').then((m) => m.ClientFormComponent),
  },
  {
    path: 'clients/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./clients/client-form/client-form.component').then((m) => m.ClientFormComponent),
  },

  // Case routes
  {
    path: 'cases',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./cases/case-list/case-list.component').then((m) => m.CaseListComponent),
  },
  {
    path: 'cases/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./cases/case-form/case-form.component').then((m) => m.CaseFormComponent),
  },
  {
    path: 'cases/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./cases/case-form/case-form.component').then((m) => m.CaseFormComponent),
  },
  {
    path: 'cases/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./cases/case-detail/case-detail.component').then((m) => m.CaseDetailComponent),
  },

  // Hearing routes
  {
    path: 'hearings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hearings/hearing-list/hearing-list.component').then((m) => m.HearingListComponent),
  },
  {
    path: 'hearings/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hearings/hearing-form/hearing-form.component').then((m) => m.HearingFormComponent),
  },
  {
    path: 'hearings/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hearings/hearing-form/hearing-form.component').then((m) => m.HearingFormComponent),
  },

  // 404
  { path: '**', redirectTo: '/dashboard' },
];
