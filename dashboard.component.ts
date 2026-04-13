// ============================================================
// 📁 hearings/hearing-form/hearing-form.component.ts
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HearingService } from '../../shared/services/hearing.service';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/models/models';

@Component({
  selector: 'app-hearing-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Hearing' : 'Schedule New Hearing' }}</h1>
      </div>

      <div class="card">
        <form [formGroup]="hearingForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Case</mat-label>
              <mat-select formControlName="case">
                @for (c of cases(); track c._id) {
                  <mat-option [value]="c._id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hearing Date</mat-label>
              <input matInput [matDatepicker]="datePicker" formControlName="date">
              <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
              <mat-datepicker #datePicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput formControlName="time" placeholder="10:30 AM">
              <mat-icon matPrefix>schedule</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court</mat-label>
              <input matInput formControlName="court" placeholder="Court name">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court Room</mat-label>
              <input matInput formControlName="courtRoom" placeholder="Room number (optional)">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="scheduled">Scheduled</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="adjourned">Adjourned</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width: 100%; margin-top: 8px;">
            <mat-label>Purpose</mat-label>
            <input matInput formControlName="purpose" placeholder="Purpose of this hearing">
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Outcome</mat-label>
            <textarea matInput formControlName="outcome" rows="2"
                      placeholder="Outcome of the hearing (fill after hearing)"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"
                      placeholder="Any additional notes"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="loading() || hearingForm.invalid">
              @if (loading()) { Saving... } @else { {{ isEditMode() ? 'Update' : 'Schedule' }} Hearing }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class HearingFormComponent implements OnInit {
  hearingForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  cases = signal<Case[]>([]);
  private hearingId = '';

  constructor(
    private fb: FormBuilder,
    private hearingService: HearingService,
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.hearingForm = this.fb.group({
      case: ['', [Validators.required]],
      date: [null, [Validators.required]],
      time: [''],
      court: ['', [Validators.required]],
      courtRoom: [''],
      purpose: ['', [Validators.required]],
      status: ['scheduled'],
      outcome: [''],
      notes: [''],
    });

    // Load cases for dropdown
    this.caseService.getCases({ limit: 100 }).subscribe({
      next: (res: any) => this.cases.set(res.data.cases),
    });

    // Pre-select case if coming from case detail page
    const caseId = this.route.snapshot.queryParams['caseId'];
    if (caseId) {
      this.hearingForm.patchValue({ case: caseId });
    }

    // Edit mode
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.hearingId = id;
      this.hearingService.getHearing(id).subscribe({
        next: (res) => {
          const h = res.data.hearing;
          this.hearingForm.patchValue({
            ...h,
            case: typeof h.case === 'object' ? (h.case as any)._id : h.case,
            date: h.date ? new Date(h.date) : null,
          });
        },
        error: () => this.router.navigate(['/hearings']),
      });
    }
  }

  onSubmit(): void {
    if (this.hearingForm.invalid) return;
    this.loading.set(true);

    const operation = this.isEditMode()
      ? this.hearingService.updateHearing(this.hearingId, this.hearingForm.value)
      : this.hearingService.createHearing(this.hearingForm.value);

    operation.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode() ? 'Hearing updated!' : 'Hearing scheduled!', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.router.navigate(['/hearings']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save.', 'Close', { duration: 5000 });
      },
    });
  }

  goBack(): void { this.router.navigate(['/hearings']); }
}
