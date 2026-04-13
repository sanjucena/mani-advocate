// ============================================================
// 📁 shared/interceptors/auth.interceptor.ts — HTTP Interceptor
// ============================================================
// INTERVIEW TIP: "An HTTP interceptor sits between the app and
// the server. Every outgoing request passes through it. We use
// it to:
//   1. Attach the JWT token to the Authorization header
//   2. Handle 401 errors globally (token expired → logout)
//
// Think of it as a 'security checkpoint' for all HTTP traffic."
//
// Modern Angular uses functional interceptors (since v15).
// The old pattern was a class implementing HttpInterceptor.
// ============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone the request and add the auth header if token exists
  // INTERVIEW TIP: "HTTP requests are immutable in Angular.
  // We can't modify the original request — we must clone it
  // with the changes we want. This prevents accidental side effects."
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Pass the request to the next handler and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If server returns 401, token is invalid/expired → logout
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
