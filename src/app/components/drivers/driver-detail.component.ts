import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockApiService, Driver, TripRecord } from '../../services/mock-api.service';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="driver()" class="driver-detail-layout">
      <!-- Back Button & Header -->
      <div class="flex items-center gap-2 mb-4">
        <a routerLink="/drivers" class="btn btn-secondary btn-icon-sm" title="Back to directory">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h2 class="mb-0 font-display font-bold">Driver details &bull; {{ driver()?.name }}</h2>
          <span class="text-muted">Licensing Reference: ID {{ driver()?.id }}</span>
        </div>
      </div>

      <!-- Quick Info Cards -->
      <div class="grid-cols-4 mb-4">
        <div class="glass-card stat-tile text-center items-center justify-center">
          <img [src]="driver()?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" alt="Avatar" class="avatar-large" />
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Current Status</span>
          <span class="badge badge-lg mt-2" [ngClass]="getStatusBadgeClass(driver()?.status || '')">
            {{ driver()?.status }}
          </span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Safety Score Rating</span>
          <span class="tile-val mt-1 text-cyan">★ {{ driver()?.rating }} / 5.0</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Onboarding Date</span>
          <span class="tile-val val-number mt-1 font-mono">{{ driver()?.joinDate }}</span>
        </div>
      </div>

      <div class="detail-grid-split">
        <!-- Profile spec card -->
        <div class="glass-card flex-col flex-1 gap-4">
          <h3>Personal Credentials</h3>
          
          <div class="spec-row">
            <span class="spec-label">Full Name:</span>
            <span class="spec-value">{{ driver()?.name }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Mobile Contact:</span>
            <span class="spec-value text-indigo">{{ driver()?.phone }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">License Number:</span>
            <span class="spec-value font-mono">{{ driver()?.licenseNo }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Assigned Vehicle:</span>
            <span class="spec-value text-bold text-cyan">{{ driver()?.assignedVehiclePlate || 'Unassigned' }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Monthly Salary:</span>
            <span class="spec-value text-bold text-green">₹{{ driver()?.salary | number }} / month</span>
          </div>
        </div>

        <!-- Trip Log Table -->
        <div class="glass-card flex-col flex-2">
          <h3>Historical & Active Logged Trips</h3>
          
          <div class="table-container mt-4">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Route Description</th>
                  <th>Distance</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let trip of tripRecords()">
                  <td class="font-mono text-nowrap">{{ trip.date }}</td>
                  <td class="text-bold">{{ trip.route }}</td>
                  <td class="font-mono">{{ trip.distance }} km</td>
                  <td class="font-mono">{{ trip.duration }}</td>
                  <td>
                    <span class="badge" [ngClass]="getTripBadgeClass(trip.status)">{{ trip.status }}</span>
                  </td>
                </tr>
                <tr *ngIf="tripRecords().length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">No trip records found for this driver.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!driver()" class="loading-state flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .driver-detail-layout {
      display: flex;
      flex-direction: column;
    }
    
    .btn-icon-sm {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-large {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      border: 3px solid var(--color-primary);
      object-fit: cover;
    }
    
    /* Stats Tile */
    .stat-tile {
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
      
      .tile-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.05em;
      }
      
      .tile-val {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 700;
      }
      
      .val-number {
        color: var(--text-primary);
      }
    }
    
    /* Grid Split */
    .detail-grid-split {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    
    .flex-2 { flex: 2; }
    .text-nowrap { white-space: nowrap; }
    
    /* Specs Row */
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
      
      .spec-label { color: var(--text-secondary); font-weight: 500; }
      .spec-value { color: var(--text-primary); font-weight: 600; }
    }
    
    .badge-lg {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
    
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: var(--color-primary);
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DriverDetailComponent implements OnInit {
  driverId: string | null = null;
  driver = signal<Driver | null>(null);
  tripRecords = signal<TripRecord[]>([]);

  constructor(
    private route: ActivatedRoute,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.driverId = this.route.snapshot.paramMap.get('id');
    if (this.driverId) {
      this.loadDriverDetails(this.driverId);
    }
  }

  loadDriverDetails(id: string) {
    this.mockApi.getDriverById(id).subscribe(driver => {
      if (driver) {
        this.driver.set(driver);
        this.loadTripRecords(driver.id);
      }
    });
  }

  loadTripRecords(dId: string) {
    this.mockApi.getTripHistory(dId).subscribe(records => {
      this.tripRecords.set(records);
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge-success';
      case 'Off-duty': return 'badge-info';
      default: return 'badge-danger';
    }
  }

  getTripBadgeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Active': return 'badge-info';
      default: return 'badge-danger';
    }
  }
}
