// ============================================================
// 📁 clients/client-list/client-list.component.ts
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientService } from '../../shared/services/client.service';
import { Client, Pagination } from '../../shared/models/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe, MatTableModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
    MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Clients</h1>
        <button mat-raised-button color="primary" routerLink="/clients/new">
          <mat-icon>person_add</mat-icon> Add Client
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar card">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search clients by name, phone, or email...</mat-label>
          <input matInput [(ngModel)]="searchQuery"
                 (keyup.enter)="loadClients()"
                 placeholder="Type and press Enter">
        </mat-form-field>
      </div>

      <!-- Table -->
      <div class="data-table-container">
        <table mat-table [dataSource]="clients()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let client">
              <strong>{{ client.name }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let client">{{ client.phone }}</td>
          </ng-container>

          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let client">{{ client.city }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Added</th>
            <td mat-cell *matCellDef="let client">
              {{ client.createdAt | date:'mediumDate' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let client">
              <button mat-icon-button [routerLink]="['/clients/edit', client._id]" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="confirmDelete(client)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        @if (clients().length === 0 && !loading()) {
          <div class="empty-state" style="padding: 48px; text-align: center;">
            <mat-icon style="font-size: 48px; width: 48px; height: 48px; opacity: 0.3;">people</mat-icon>
            <p style="margin-top: 12px; color: var(--text-light);">No clients found. Add your first client!</p>
          </div>
        }

        <mat-paginator
          [length]="pagination()?.total || 0"
          [pageSize]="10"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .search-bar {
      margin-bottom: 16px;
      padding: 12px 16px;
      mat-form-field { width: 100%; }
    }
  `],
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  searchQuery = '';
  displayedColumns = ['name', 'phone', 'city', 'createdAt', 'actions'];

  constructor(
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(page = 1): void {
    this.loading.set(true);
    this.clientService.getClients({ page, limit: 10, search: this.searchQuery }).subscribe({
      next: (res: any) => {
        this.clients.set(res.data.clients);
        this.pagination.set(res.data.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadClients(event.pageIndex + 1);
  }

  confirmDelete(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Client', message: `Are you sure you want to delete "${client.name}"?` },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clientService.deleteClient(client._id).subscribe({
          next: () => {
            this.snackBar.open('Client deleted.', 'Close', { duration: 3000 });
            this.loadClients();
          },
          error: () => this.snackBar.open('Failed to delete client.', 'Close', { duration: 3000 }),
        });
      }
    });
  }
}
