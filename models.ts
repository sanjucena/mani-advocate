// ============================================================
// 📁 auth/login/login.component.ts — Login Page
// ============================================================
// INTERVIEW TIP: "This component demonstrates:
//   1. Reactive Forms — FormGroup with validators
//   2. Service injection — AuthService for API call
//   3. Router navigation — redirect after successful login
//   4. Error handling — showing error messages to the user
//   5. Signals — using signal() for loading state"
// ============================================================

import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <!-- Left side — branding -->
        <div class="auth-brand">
          <div class="brand-content">
            <div class="brand-icon">M</div>
            <h1>Mani Advocate</h1>
            <p>Case Management System</p>
            <div class="brand-features">
              <div class="feature">
                <mat-icon>gavel</mat-icon>
                <span>Track Cases</span>
              </div>
              <div class="feature">
                <mat-icon>event</mat-icon>
                <span>Manage Hearings</span>
              </div>
              <div class="feature">
                <mat-icon>people</mat-icon>
                <span>Client Records</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side — login form -->
        <div class="auth-form-section">
          <h2>Sign In</h2>
          <p class="subtitle">Enter your credentials to continue</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="you@example.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password"
                     [type]="hidePassword() ? 'password' : 'text'"
                     placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="loading() || loginForm.invalid"
                    class="submit-btn">
              @if (loading()) {
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="auth-link">
            Don't have an account?
            <a routerLink="/register">Register here</a>
          </p>

          <div class="demo-creds">
            <strong>Demo Login:</strong>
            mani&#64;advocate.com / mani1234
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a2744 0%, #2d4a7c 100%);
      padding: 20px;
    }

    .auth-card {
      display: flex;
      width: 900px;
      max-width: 100%;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .auth-brand {
      flex: 1;
      background: var(--primary);
      color: #fff;
      padding: 48px 36px;
      display: flex;
      align-items: center;
    }

    .brand-icon {
      width: 56px;
      height: 56px;
      background: var(--accent);
      color: var(--primary-dark);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }

    .brand-content {
      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 4px;
      }
      p {
        color: rgba(255,255,255,0.6);
        font-size: 0.9rem;
        margin-bottom: 32px;
      }
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,0.8);
      font-size: 0.9rem;

      mat-icon {
        color: var(--accent);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .auth-form-section {
      flex: 1;
      padding: 48px 36px;

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 4px;
      }

      .subtitle {
        color: var(--text-light);
        font-size: 0.9rem;
        margin-bottom: 28px;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 8px;
      background: var(--primary) !important;
    }

    .auth-link {
      text-align: center;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--text-light);

      a {
        color: var(--primary);
        font-weight: 600;
      }
    }

    .demo-creds {
      margin-top: 20px;
      padding: 12px;
      background: #f8f9fc;
      border-radius: 8px;
      font-size: 0.8rem;
      color: var(--text-light);
      text-align: center;

      strong { color: var(--text); }
    }

    @media (max-width: 768px) {
      .auth-brand { display: none; }
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // INTERVIEW TIP: "FormBuilder is a shorthand for creating
    // FormGroup and FormControl instances. Validators.required
    // and Validators.email are built-in validation functions."
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: 'snack-success',
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: 'snack-error',
        });
      },
    });
  }
}
