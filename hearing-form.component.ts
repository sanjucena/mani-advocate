import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="register-card">
        <h2>Create Account</h2>
        <p class="subtitle">Set up your Mani Advocate account</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Your full name">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="9876543210">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="you@example.com">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password"
                   [type]="hidePassword() ? 'password' : 'text'"
                   placeholder="Minimum 6 characters">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button"
                    (click)="hidePassword.set(!hidePassword())">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit"
                  [disabled]="loading() || registerForm.invalid"
                  class="submit-btn">
            @if (loading()) { Creating account... } @else { Create Account }
          </button>
        </form>

        <p class="auth-link">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
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

    .register-card {
      width: 520px;
      max-width: 100%;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 48px 36px;

      h2 { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
      .subtitle { color: var(--text-light); font-size: 0.9rem; margin-bottom: 24px; }
    }

    form { display: flex; flex-direction: column; gap: 4px; }

    .form-row { display: flex; gap: 12px; }
    .form-row mat-form-field { flex: 1; }

    .submit-btn {
      height: 48px; font-size: 1rem; font-weight: 600;
      margin-top: 8px; background: var(--primary) !important;
    }

    .auth-link {
      text-align: center; margin-top: 20px;
      font-size: 0.85rem; color: var(--text-light);
      a { color: var(--primary); font-weight: 600; }
    }
  `],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Registration failed.', 'Close', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }
}
