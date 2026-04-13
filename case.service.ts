// ============================================================
// 📁 clients/client-form/client-form.component.ts
// ============================================================
// INTERVIEW TIP: "This single component handles BOTH create
// and edit operations. We check if there's an :id in the route
// params — if yes, it's edit mode and we pre-fill the form."
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { ClientService } from '../../shared/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule,
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Client' : 'Add New Client' }}</h1>
      </div>

      <div class="card">
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Client full name">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="Primary phone number">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Alternate Phone</mat-label>
              <input matInput formControlName="alternatePhone" placeholder="Optional">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="client@example.com">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address" placeholder="Street address">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="City">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <mat-select formControlName="state">
                @for (state of states; track state) {
                  <mat-option [value]="state">{{ state }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pincode</mat-label>
              <input matInput formControlName="pincode" placeholder="600001">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width: 100%; margin-top: 8px;">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"
                      placeholder="Any additional notes about this client"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="loading() || clientForm.invalid">
              @if (loading()) { Saving... } @else {
                {{ isEditMode() ? 'Update Client' : 'Create Client' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  private clientId = '';

  states = [
    'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
    'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh',
    'West Bengal', 'Bihar', 'Odisha', 'Punjab', 'Haryana', 'Delhi',
    'Goa', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand',
    'Himachal Pradesh', 'Jammu & Kashmir', 'Meghalaya', 'Other',
  ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      alternatePhone: [''],
      email: ['', [Validators.email]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: [''],
      notes: [''],
    });

    // INTERVIEW TIP: "ActivatedRoute.params is an Observable that
    // emits whenever route params change. We subscribe to check
    // if there's an :id param for edit mode."
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.clientId = id;
      this.loadClient(id);
    }
  }

  loadClient(id: string): void {
    this.clientService.getClient(id).subscribe({
      next: (res) => this.clientForm.patchValue(res.data.client),
      error: () => {
        this.snackBar.open('Client not found.', 'Close', { duration: 3000 });
        this.router.navigate(['/clients']);
      },
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;
    this.loading.set(true);

    const operation = this.isEditMode()
      ? this.clientService.updateClient(this.clientId, this.clientForm.value)
      : this.clientService.createClient(this.clientForm.value);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Client updated!' : 'Client created!',
          'Close', { duration: 3000, panelClass: 'snack-success' }
        );
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save client.', 'Close', { duration: 5000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
