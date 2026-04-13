// ============================================================
// 📁 hearings/hearing-list/hearing-list.component.ts
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HearingService } from '../../shared/services/hearing.service';
import { Hearing, Pagination } from '../../shared/models/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hearing-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatPaginatorModule,
    MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Hearings</h1>
        <button mat-raised-button color="primary" routerLink="/hearings/new">
          <mat-icon>add</mat-icon> Add Hearing
        </button>
      </div>

      <!-- Filter -->
      <div class="card" style="padding: 12px 16px; margin-bottom: 16px; display: flex; gap: 12px;">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadHearings()">
            <mat-option value="">All</mat-option>
            <mat-option value="scheduled">Scheduled</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="adjourned">Adjourned</mat-option>
            <mat-option value="cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Hearing Cards -->
      @if (loading()) {
        <p style="text-align: center; color: var(--text-light); padding: 48px;">Loading hearings...</p>
      } @else if (hearings().length === 0) {
        <div class="card" style="text-align: center; padding: 48px;">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px; opacity: 0.3;">event</mat-icon>
          <p style="margin-top: 12px; color: var(--text-light);">No hearings found.</p>
        </div>
      } @else {
        <div class="hearings-grid">
          @for (h of hearings(); track h._id) {
            <div class="card hearing-card">
              <div class="hearing-card-header">
                <div class="hearing-date-block">
                  <span class="day">{{ h.date | date:'dd' }}</span>
                  <span class="month">{{ h.date | date:'MMM' }}</span>
                  <span class="year">{{ h.date | date:'yyyy' }}</span>
                </div>
                <div class="hearing-main">
                  <strong>{{ h.purpose }}</strong>
                  <span class="court-info">{{ h.court }} {{ h.courtRoom ? '· Room ' + h.courtRoom : '' }}</span>
                  @if (h.time) { <span class="time-info">{{ h.time }}</span> }
                </div>
                <span class="status-badge" [class]="h.status">{{ h.status }}</span>
              </div>

              @if (h.case && typeof h.case === 'object') {
                <div class="hearing-case-info">
                  <mat-icon>gavel</mat-icon>
                  <span>{{ (h.case as any).caseNumber }} — {{ (h.case as any).title }}</span>
                </div>
              }

              @if (h.outcome) {
                <p class="hearing-outcome"><strong>Outcome:</strong> {{ h.outcome }}</p>
              }

              <div class="hearing-actions">
                <button mat-icon-button [routerLink]="['/hearings/edit', h._id]"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="confirmDelete(h)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          }
        </div>

        <mat-paginator [length]="pagination()?.total || 0" [pageSize]="10"
                        (page)="onPageChange($event)" showFirstLastButtons
                        style="margin-top: 16px;">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .hearings-grid { display: flex; flex-direction: column; gap: 12px; }

    .hearing-card { transition: transform 0.15s; &:hover { transform: translateY(-1px); } }

    .hearing-card-header { display: flex; align-items: center; gap: 16px; }

    .hearing-date-block {
      display: flex; flex-direction: column; align-items: center;
      min-width: 56px; padding: 10px 8px;
      background: var(--primary); color: #fff; border-radius: 10px;
      .day { font-size: 1.3rem; font-weight: 700; line-height: 1; }
      .month { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; }
      .year { font-size: 0.6rem; opacity: 0.7; }
    }

    .hearing-main {
      flex: 1;
      strong { display: block; font-size: 0.95rem; }
      .court-info { display: block; font-size: 0.8rem; color: var(--text-light); }
      .time-info { font-size: 0.8rem; color: var(--accent-dark); font-weight: 600; }
    }

    .hearing-case-info {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding: 8px 12px;
      background: #f8f9fc; border-radius: 6px;
      font-size: 0.8rem; color: var(--primary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .hearing-outcome { margin-top: 8px; font-size: 0.8rem; color: var(--success); }

    .hearing-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class HearingListComponent implements OnInit {
  hearings = signal<Hearing[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  statusFilter = '';

  constructor(
    private hearingService: HearingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.loadHearings(); }

  loadHearings(page = 1): void {
    this.loading.set(true);
    this.hearingService.getHearings({ page, limit: 10, status: this.statusFilter }).subscribe({
      next: (res: any) => {
        this.hearings.set(res.data.hearings);
        this.pagination.set(res.data.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent): void { this.loadHearings(event.pageIndex + 1); }

  confirmDelete(h: Hearing): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Hearing', message: `Delete this hearing?` },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.hearingService.deleteHearing(h._id).subscribe({
          next: () => { this.snackBar.open('Hearing deleted.', 'Close', { duration: 3000 }); this.loadHearings(); },
        });
      }
    });
  }
}
