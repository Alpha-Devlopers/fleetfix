import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, Vehicle, ServiceRecord } from '../../services/mock-api.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div *ngIf="vehicle()" class="vehicle-detail-layout">
      <!-- Back Button & Header -->
      <div class="flex items-center gap-2 mb-4">
        <a routerLink="/vehicles" class="btn btn-secondary btn-icon-sm" title="Back to list">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h2 class="mb-0 font-display font-bold">{{ vehicle()?.plate }} &bull; {{ vehicle()?.model }}</h2>
          <span class="text-muted">Vehicle Reference ID: {{ vehicle()?.id }}</span>
        </div>
      </div>

      <!-- Vehicle Cover Banner -->
      <div class="vehicle-banner-card glass-panel mb-4 p-0 overflow-hidden relative">
        <div class="banner-image-wrapper">
          <img [src]="vehicle()?.image" alt="Vehicle Banner" class="banner-img" />
          <div class="banner-overlay flex justify-between items-end p-4">
            <div class="banner-title-block">
              <span class="badge mb-2" [ngClass]="getStatusBadgeClass(vehicle()?.status || '')">
                {{ vehicle()?.status === 'Idle' ? 'Stopped' : vehicle()?.status }}
              </span>
              <h1 class="font-display font-bold text-white mb-0" style="margin: 0 0 4px 0;">{{ vehicle()?.plate }}</h1>
              <p class="text-secondary text-sm mb-0" style="margin: 0; opacity: 0.85;">{{ vehicle()?.company }} &bull; {{ vehicle()?.model }}</p>
            </div>
            
            <!-- Driver quick details -->
            <div class="banner-driver-block flex items-center gap-3 bg-black bg-opacity-60 backdrop-blur-md p-3 rounded-xl border border-white border-opacity-10" style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;">
              <img [src]="vehicle()?.driverPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" alt="Driver Avatar" class="banner-driver-avatar" />
              <div class="flex-col" style="display: flex; flex-direction: column;">
                <span style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight:600;">Assigned Operator</span>
                <span class="text-sm font-bold text-white block" style="font-size: 0.85rem; color: white; font-weight: 700; margin-top: 2px;">{{ vehicle()?.driverName || 'Depot Custodian' }}</span>
                <span class="text-xs text-secondary" style="font-size: 0.725rem; color: #cbd5e1; margin-top: 2px;" *ngIf="vehicle()?.driverPhone">{{ vehicle()?.driverPhone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid-cols-4 mb-4">
        <div class="glass-card stat-tile">
          <span class="tile-label">Current Status</span>
          <span class="badge badge-lg mt-2" [ngClass]="getStatusBadgeClass(vehicle()?.status || '')">
            {{ vehicle()?.status }}
          </span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Health Index</span>
          <span class="tile-val mt-1" [style.color]="getHealthColor(vehicle()?.health || 100)">
            {{ vehicle()?.health }}%
          </span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Odometer Reading</span>
          <span class="tile-val val-number mt-1">{{ vehicle()?.odometer | number }} km</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Fuel Level</span>
          <span class="tile-val val-number mt-1 text-cyan">{{ vehicle()?.fuelLevel }}%</span>
        </div>
      </div>

      <!-- Detail Grid split: Specs, Map coordinate details vs Service Logs -->
      <div class="detail-grid-split">
        <!-- Profile Spec & Location Card -->
        <div class="glass-card flex-col flex-1 gap-4">
          <h3>Specifications & Location</h3>
          
          <div class="spec-row">
            <span class="spec-label">Vehicle Type:</span>
            <span class="spec-value">{{ vehicle()?.type }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Assigned Driver:</span>
            <span class="spec-value text-indigo">{{ vehicle()?.driverName || 'None' }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Odometer:</span>
            <span class="spec-value">{{ vehicle()?.odometer | number }} km</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Last Serviced:</span>
            <span class="spec-value">{{ vehicle()?.lastService }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">GPS Latitude:</span>
            <span class="spec-value font-mono">{{ vehicle()?.latitude }}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">GPS Longitude:</span>
            <span class="spec-value font-mono">{{ vehicle()?.longitude }}</span>
          </div>
        </div>

        <!-- Service History Logs Table -->
        <div class="glass-card flex-col flex-2">
          <div class="flex justify-between items-center mb-4">
            <h3>Maintenance & Service Records</h3>
            <button class="btn btn-secondary btn-sm" (click)="showServiceForm.set(true)">
              Record Service
            </button>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service Performed</th>
                  <th>Cost</th>
                  <th>Mechanic Shop</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of serviceRecords()">
                  <td class="text-nowrap font-mono">{{ record.date }}</td>
                  <td>{{ record.description }}</td>
                  <td class="font-mono text-bold text-green">₹{{ record.cost | number }}</td>
                  <td>{{ record.mechanic }}</td>
                </tr>
                <tr *ngIf="serviceRecords().length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No service records registered for this vehicle.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Service Record Overlay Modal -->
      <div class="modal-overlay" *ngIf="showServiceForm()" (click)="showServiceForm.set(false)">
        <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Record Completed Maintenance</h3>
            <button class="btn-close-modal" (click)="showServiceForm.set(false)">&times;</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="serviceForm" (ngSubmit)="onServiceSubmit()">
              <div class="form-group">
                <label class="form-label" for="date">Completion Date</label>
                <input id="date" type="date" class="form-control" formControlName="date" />
              </div>

              <div class="form-group">
                <label class="form-label" for="description">Work Performed Description</label>
                <textarea id="description" class="form-control" formControlName="description" rows="3" placeholder="e.g. Changed air filter, brake caliper replacement..."></textarea>
              </div>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="cost">Total Cost (₹)</label>
                  <input id="cost" type="number" class="form-control" formControlName="cost" />
                </div>

                <div class="form-group">
                  <label class="form-label" for="mechanic">Mechanic / Service Shop</label>
                  <input id="mechanic" type="text" class="form-control" formControlName="mechanic" placeholder="e.g. Apex Diagnostics" />
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="serviceForm.invalid">
                Record Service Action
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!vehicle()" class="loading-state flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .vehicle-detail-layout {
      display: flex;
      flex-direction: column;
    }

    .vehicle-banner-card {
      height: 250px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    
    .banner-image-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #0f172a;
    }
    
    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.75;
    }
    
    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(15, 23, 42, 0.05) 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 24px;
      box-sizing: border-box;
    }
    
    .banner-driver-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary);
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
    
    /* Stats Tile Card */
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
    
    .text-green { color: var(--color-success) !important; }
    .text-nowrap { white-space: nowrap; }
    
    /* Split Details grid */
    .detail-grid-split {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    
    .flex-2 { flex: 2; }
    
    /* Specs Row */
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
      
      .spec-label {
        color: var(--text-secondary);
        font-weight: 500;
      }
      .spec-value {
        color: var(--text-primary);
        font-weight: 600;
      }
    }
    
    /* Dialog / Modal Overlays */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }
    .modal-card {
      width: 100%;
      max-width: 500px;
      border-radius: 16px;
      background: rgba(17, 23, 41, 0.9);
      box-shadow: var(--shadow-lg);
      padding: 0;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      h3 { margin-bottom: 0; font-size: 1.1rem; }
      .btn-close-modal {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.5rem;
        cursor: pointer;
        &:hover { color: var(--text-primary); }
      }
    }
    .modal-body { padding: 24px; }
    
    textarea.form-control {
      resize: vertical;
    }
    
    /* Helper status color badges */
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
export class VehicleDetailComponent implements OnInit {
  vehicleId: string | null = null;
  vehicle = signal<Vehicle | null>(null);
  serviceRecords = signal<ServiceRecord[]>([]);

  // Service form states
  serviceForm!: FormGroup;
  showServiceForm = signal(false);

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.loadVehicleDetails(this.vehicleId);
    }
    this.initServiceForm();
  }

  loadVehicleDetails(id: string) {
    this.mockApi.getVehicleById(id).subscribe(vehicle => {
      if (vehicle) {
        this.vehicle.set(vehicle);
        this.loadServiceHistory(vehicle.id);
      }
    });
  }

  loadServiceHistory(vId: string) {
    this.mockApi.getServiceHistory(vId).subscribe(records => {
      this.serviceRecords.set(records);
    });
  }

  initServiceForm() {
    this.serviceForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      description: ['', [Validators.required]],
      cost: [0, [Validators.required, Validators.min(0)]],
      mechanic: ['', [Validators.required]]
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Running': return 'badge-success';
      case 'Idle': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      default: return 'badge-danger';
    }
  }

  getHealthColor(health: number): string {
    if (health >= 85) return 'var(--color-success)';
    if (health >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  onServiceSubmit() {
    if (this.serviceForm.valid && this.vehicleId) {
      const record = {
        ...this.serviceForm.value,
        vehicleId: this.vehicleId
      };
      this.mockApi.addServiceRecord(record).subscribe(() => {
        // reload records and vehicle health update
        this.loadVehicleDetails(this.vehicleId!);
        this.showServiceForm.set(false);
        this.serviceForm.reset({
          date: new Date().toISOString().split('T')[0],
          description: '',
          cost: 0,
          mechanic: ''
        });
      });
    }
  }
}
