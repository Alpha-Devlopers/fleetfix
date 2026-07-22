import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, Vehicle, Driver } from '../../services/mock-api.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="page-header-actions mb-4">
      <div class="search-filters">
        <input 
          type="text" 
          class="form-control filter-search" 
          placeholder="Search by registration plate, company or model..." 
          (input)="onSearch($event)"
        />
        <select class="form-control filter-select" (change)="onStatusFilter($event)">
          <option value="">All Statuses</option>
          <option value="Running">Running</option>
          <option value="Idle">Stopped (Idle)</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>
      
      <div class="view-toggles flex gap-2">
        <button class="btn btn-secondary btn-icon-only" [class.active]="viewMode() === 'cards'" (click)="setViewMode('cards')" title="Card Grid View">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button class="btn btn-secondary btn-icon-only" [class.active]="viewMode() === 'table'" (click)="setViewMode('table')" title="Table Spreadsheet View">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>

      <div class="active-fleet-indicator glass-panel px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <span class="pulse-indicator status-running"></span>
        Fleet: 4 Active Commercial Vehicles
      </div>
    </div>

    <!-- 1. Cards Grid View (Default) -->
    <div class="vehicle-cards-grid" *ngIf="viewMode() === 'cards'">
      <div class="glass-card vehicle-card" *ngFor="let vehicle of filteredVehicles()">
        <!-- Vehicle Cover Photo & Status Overlay -->
        <div class="vehicle-image-wrapper">
          <img [src]="vehicle.image" alt="Vehicle Photo" class="vehicle-photo-img" />
          <span class="badge vehicle-status-overlay" [ngClass]="getStatusBadgeClass(vehicle.status)">
            {{ getStatusText(vehicle.status) }}
          </span>
          <div class="vehicle-company-badge">{{ vehicle.company }}</div>
        </div>

        <!-- Card Body -->
        <div class="vehicle-card-body">
          <div class="flex justify-between items-center mb-3">
            <div>
              <h3 class="plate-number font-mono mb-1">{{ vehicle.plate }}</h3>
              <span class="text-xs text-secondary font-display font-semibold">{{ vehicle.model }}</span>
            </div>
            <span class="badge badge-info">{{ vehicle.type }}</span>
          </div>

          <!-- Driver Profile Block -->
          <div class="driver-profile-block mb-3">
            <img [src]="vehicle.driverPhoto || '/images/drivers/sai_kiran.png'" alt="Driver Avatar" class="driver-avatar-thumb" />
            <div class="driver-profile-info">
              <span class="driver-title-label">Assigned Driver</span>
              <span class="driver-name-val">{{ vehicle.driverName || 'Unassigned' }}</span>
              <a href="tel:{{ vehicle.driverPhone }}" class="driver-phone-link" *ngIf="vehicle.driverPhone">
                {{ vehicle.driverPhone }}
              </a>
            </div>
          </div>

          <!-- Specs details -->
          <div class="specs-grid mb-3">
            <div class="spec-cell">
              <span class="spec-lbl">Location</span>
              <span class="spec-val text-cyan">{{ vehicle.location || 'Depot' }}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-lbl">Engine Health</span>
              <span class="spec-val" [ngClass]="{'text-success': vehicle.engineHealth === 'Excellent' || vehicle.engineHealth === 'Healthy', 'text-danger': vehicle.engineHealth !== 'Excellent' && vehicle.engineHealth !== 'Healthy'}">{{ vehicle.engineHealth || 'Unknown' }}</span>
            </div>
            <div class="spec-cell" style="grid-column: span 2;">
              <span class="spec-lbl">Maintenance Status</span>
              <span class="spec-val" [ngClass]="{'text-success': vehicle.maintenanceStatus === 'Completed' || vehicle.maintenanceStatus === 'Not Required', 'text-warning': vehicle.maintenanceStatus === 'Due in 15 Days', 'text-danger': vehicle.maintenanceStatus === 'In Progress'}">{{ vehicle.maintenanceStatus || 'N/A' }}</span>
            </div>
          </div>

          <!-- Gauges (Speed / Temp) -->
          <div class="gauges-row mb-3">
            <div class="gauge-item">
              <span class="gauge-label">Live Speed</span>
              <span class="gauge-val font-display">{{ vehicle.currentSpeed }} km/h</span>
            </div>
            <div class="gauge-item">
              <span class="gauge-label">Engine Temp</span>
              <span class="gauge-val font-display" [ngClass]="{'text-danger': vehicle.engineTemp > 100}">
                {{ vehicle.engineTemp }}°C
              </span>
            </div>
            <div class="gauge-item">
              <span class="gauge-label">Health Score</span>
              <span class="gauge-val font-display" [style.color]="getHealthColor(vehicle.health)">
                {{ vehicle.health }}%
              </span>
            </div>
          </div>

          <!-- Fuel Progress -->
          <div class="fuel-card-section mb-3">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-secondary">Fuel Percentage</span>
              <span class="text-bold">{{ vehicle.fuelLevel }}%</span>
            </div>
            <div class="fuel-progress-wrapper">
              <div class="fuel-progress-bar" [style.width.%]="vehicle.fuelLevel" [ngClass]="getFuelClass(vehicle.fuelLevel)"></div>
            </div>
          </div>

          <!-- Location Info -->
          <div class="location-coord mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loc-icon"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span class="font-mono text-xs">GPS: {{ vehicle.latitude.toFixed(4) }}, {{ vehicle.longitude.toFixed(4) }}</span>
          </div>

          <!-- Maintenance Timelines -->
          <div class="dates-row">
            <div class="date-col">
              <span class="date-lbl">Last Serviced</span>
              <span class="date-val font-mono">{{ vehicle.lastService }}</span>
            </div>
            <div class="date-col">
              <span class="date-lbl">Next Maintenance</span>
              <span class="date-val font-mono text-cyan">{{ vehicle.nextMaintenance }}</span>
            </div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="vehicle-card-actions">
          <button class="btn btn-primary btn-sm w-full" [routerLink]="['/vehicles', vehicle.id]">View Details</button>
          <div class="flex gap-2" style="margin-left: 8px;">
            <button class="btn-action-icon edit" (click)="openEditModal(vehicle)" title="Edit Vehicle">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Table Spreadsheet View -->
    <div class="glass-panel p-0" *ngIf="viewMode() === 'table'">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Model</th>
              <th>Type</th>
              <th>Company Logistics</th>
              <th>Fuel</th>
              <th>Health</th>
              <th>Driver</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vehicle of filteredVehicles()">
              <td class="font-mono text-bold">{{ vehicle.plate }}</td>
              <td>{{ vehicle.model }}</td>
              <td>{{ vehicle.type }}</td>
              <td>{{ vehicle.company }}</td>
              <td>
                <div class="fuel-indicator">
                  <div class="fuel-fill" [style.width.%]="vehicle.fuelLevel" [ngClass]="getFuelClass(vehicle.fuelLevel)"></div>
                  <span class="fuel-text">{{ vehicle.fuelLevel }}%</span>
                </div>
              </td>
              <td>
                <span class="health-indicator" [ngClass]="getHealthBadgeClass(vehicle.health)">
                  {{ vehicle.health }}%
                </span>
              </td>
              <td>{{ vehicle.driverName || 'Unassigned' }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusBadgeClass(vehicle.status)">
                  {{ getStatusText(vehicle.status) }}
                </span>
              </td>
              <td class="text-right actions-cell">
                <button class="btn-action-icon view" [routerLink]="['/vehicles', vehicle.id]" title="View History">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-action-icon edit" (click)="openEditModal(vehicle)" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredVehicles().length === 0">
              <td colspan="9" class="text-center py-4 text-muted">No vehicles found matching filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form overlay -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode() ? 'Edit Vehicle details' : 'Register New Vehicle' }}</h3>
          <button class="btn-close-modal" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="vehicleForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="plate">License Plate Number (Indian Format)</label>
              <input id="plate" type="text" class="form-control" formControlName="plate" placeholder="e.g. MH12KL5432" />
            </div>

            <div class="form-group">
              <label class="form-label" for="model">Vehicle Commercial Model</label>
              <select id="model" class="form-control" formControlName="model">
                <option value="Tata Prima Truck">Tata Prima Truck</option>
                <option value="Ashok Leyland Truck">Ashok Leyland Truck</option>
                <option value="BharatBenz Truck">BharatBenz Truck</option>
                <option value="Eicher Pro Truck">Eicher Pro Truck</option>
                <option value="Mahindra Blazo Truck">Mahindra Blazo Truck</option>
                <option value="Tata Signa Truck">Tata Signa Truck</option>
                <option value="Ashok Leyland Dost">Ashok Leyland Dost</option>
                <option value="Mahindra Bolero Pickup">Mahindra Bolero Pickup</option>
                <option value="Tata Ace Gold">Tata Ace Gold</option>
                <option value="Force Traveller">Force Traveller</option>
                <option value="Eicher Bus">Eicher Bus</option>
                <option value="BharatBenz Bus">BharatBenz Bus</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="company">Logistics Operator Company</label>
              <input id="company" type="text" class="form-control" formControlName="company" placeholder="e.g. Safexpress India" />
            </div>

            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label" for="type">Class Type</label>
                <select id="type" class="form-control" formControlName="type">
                  <option value="Truck">Truck</option>
                  <option value="Trailer">Trailer (Bus)</option>
                  <option value="Van">Light Van / Cargo</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="odometer">Odometer (km)</label>
                <input id="odometer" type="number" class="form-control" formControlName="odometer" />
              </div>
            </div>

            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label" for="fuelLevel">Fuel Level (%)</label>
                <input id="fuelLevel" type="number" class="form-control" formControlName="fuelLevel" min="0" max="100" />
              </div>

              <div class="form-group">
                <label class="form-label" for="driverId">Assign Indian Driver</label>
                <select id="driverId" class="form-control" formControlName="driverId">
                  <option [value]="null">No Driver</option>
                  <option *ngFor="let driver of drivers" [value]="driver.id">{{ driver.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group" *ngIf="isEditMode()">
              <label class="form-label" for="status">Operational Status</label>
              <select id="status" class="form-control" formControlName="status">
                <option value="Running">Running</option>
                <option value="Idle">Stopped (Idle)</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="vehicleForm.invalid">
              Save Vehicle Specifications
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .search-filters {
      display: flex;
      gap: 12px;
      flex: 1;
      max-width: 500px;
    }
    .filter-search { flex: 2; }
    .filter-select { flex: 1; min-width: 140px; }
    
    .btn-icon-only {
      width: 38px;
      height: 38px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.active {
        background: var(--gradient-primary);
        border-color: transparent;
        color: white;
      }
    }

    /* Cards Grid default layout */
    .vehicle-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .vehicle-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px);
      }
    }
    
    .vehicle-image-wrapper {
      position: relative;
      width: 100%;
      height: 180px;
      background: #000;
      
      .vehicle-photo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.85;
      }
      
      .vehicle-status-overlay {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 600;
      }
      
      .vehicle-company-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.725rem;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
    
    .vehicle-card-body {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .plate-number {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    /* Driver profile overlay */
    .driver-profile-block {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      border-radius: 8px;
      
      .driver-avatar-thumb {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-primary);
      }
      
      .driver-profile-info {
        display: flex;
        flex-direction: column;
        
        .driver-title-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .driver-name-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .driver-phone-link {
          font-size: 0.75rem;
          color: var(--color-secondary);
          
          &:hover { text-decoration: underline; }
        }
      }
    }
    
    /* Gauges Row */
    .gauges-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.03);
      padding: 10px 4px;
      border-radius: 8px;
      text-align: center;
      
      .gauge-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .gauge-label {
        font-size: 0.65rem;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      
      .gauge-val {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
    
    .fuel-progress-wrapper {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .fuel-progress-bar {
      height: 100%;
      border-radius: 3px;
      
      &.fuel-high { background: var(--color-success); }
      &.fuel-medium { background: var(--color-warning); }
      &.fuel-low { background: var(--color-danger); }
    }
    
    .location-coord {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      
      .loc-icon { color: var(--color-secondary); }
    }
    
    .dates-row {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      padding-top: 12px;
      margin-top: auto;
      
      .date-col { display: flex; flex-direction: column; gap: 2px; }
      .date-lbl { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }
      .date-val { font-size: 0.75rem; color: var(--text-primary); font-weight: 500; }
    }
    
    .vehicle-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-top: 1px solid var(--border-color);
      background: rgba(0, 0, 0, 0.15);
    }
    
    /* Table View styles */
    .fuel-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 110px;
      height: 18px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    .fuel-fill {
      height: 100%;
      &.fuel-high { background: rgba(16, 185, 129, 0.3); }
      &.fuel-medium { background: rgba(245, 158, 11, 0.3); }
      &.fuel-low { background: rgba(239, 68, 68, 0.3); }
    }
    .fuel-text {
      position: absolute;
      left: 0; top: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.725rem; font-weight: 600;
    }
    
    .health-indicator {
      font-weight: 600; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px;
      &.health-high { color: var(--color-success); background: rgba(16, 185, 129, 0.1); }
      &.health-medium { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); }
      &.health-low { color: var(--color-danger); background: rgba(239, 68, 68, 0.1); }
    }

    .actions-cell { display: flex; justify-content: flex-end; gap: 6px; }
    .btn-action-icon {
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast);
      &:hover { transform: scale(1.08); }
      &.view:hover { background: rgba(6, 182, 212, 0.1); color: var(--color-secondary); }
      &.edit:hover { background: rgba(99, 102, 241, 0.1); color: var(--color-primary); }
      &.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal-card {
      width: 100%; max-width: 520px; border-radius: 16px;
      background: rgba(17, 23, 41, 0.9); box-shadow: var(--shadow-lg); padding: 0;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
      h3 { margin-bottom: 0; }
      .btn-close-modal {
        background: transparent; border: none; color: var(--text-muted);
        font-size: 1.5rem; cursor: pointer;
      }
    }
    .modal-body { padding: 24px; }
    
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      padding: 10px 12px;
      border-radius: 8px;
    }
    .spec-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .spec-lbl {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .spec-val {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .active-fleet-indicator {
      border: 1px solid var(--border-glow);
      box-shadow: 0 0 10px var(--border-glow);
      background: var(--bg-surface);
      backdrop-filter: blur(8px);
      border-radius: 8px;
    }
    .pulse-indicator {
      width: 8px; height: 8px; border-radius: 50%;
      display: inline-block;
      &.status-running {
        background-color: var(--color-success);
        box-shadow: 0 0 8px var(--color-success);
        animation: pulse 1.5s infinite;
      }
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.5; }
    }
  `]
})
export class VehicleListComponent implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  filteredVehicles = signal<Vehicle[]>([]);
  drivers: Driver[] = [];

  // Display state
  viewMode = signal<'cards' | 'table'>('cards');

  // Filter States
  searchQuery = '';
  statusFilter = '';

  // Form State
  vehicleForm!: FormGroup;
  showModal = signal(false);
  isEditMode = signal(false);
  selectedVehicleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.loadVehicles();
    this.mockApi.getDrivers().subscribe(drivers => {
      this.drivers = drivers.filter(d => d.status === 'Available' || !d.assignedVehicleId);
    });

    this.initForm();
  }

  loadVehicles() {
    this.mockApi.getVehicles().subscribe(vehicles => {
      this.vehicles.set(vehicles);
      this.applyFilters();
    });
  }

  initForm() {
    this.vehicleForm = this.fb.group({
      plate: ['', [Validators.required]],
      model: ['Tata Prima Truck', [Validators.required]],
      company: ['', [Validators.required]],
      type: ['Truck', [Validators.required]],
      odometer: [0, [Validators.required, Validators.min(0)]],
      fuelLevel: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      driverId: [null],
      status: ['Idle']
    });
  }

  setViewMode(mode: 'cards' | 'table') {
    this.viewMode.set(mode);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  onStatusFilter(event: any) {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.vehicles();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(v => 
        v.plate.toLowerCase().includes(q) || 
        v.model.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter) {
      result = result.filter(v => v.status === this.statusFilter);
    }
    this.filteredVehicles.set(result);
  }

  getFuelClass(fuel: number): string {
    if (fuel >= 60) return 'fuel-high';
    if (fuel >= 20) return 'fuel-medium';
    return 'fuel-low';
  }

  getHealthColor(health: number): string {
    if (health >= 85) return 'var(--color-success)';
    if (health >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  getHealthBadgeClass(health: number): string {
    if (health >= 85) return 'health-high';
    if (health >= 60) return 'health-medium';
    return 'health-low';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Running': return 'badge-success';
      case 'Idle': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      default: return 'badge-danger';
    }
  }

  getStatusText(status: string): string {
    if (status === 'Idle') return 'Stopped';
    return status;
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.selectedVehicleId = null;
    this.vehicleForm.reset({
      plate: '',
      model: 'Tata Prima Truck',
      company: '',
      type: 'Truck',
      odometer: 0,
      fuelLevel: 100,
      driverId: null,
      status: 'Idle'
    });
    this.showModal.set(true);
  }

  openEditModal(vehicle: Vehicle) {
    this.isEditMode.set(true);
    this.selectedVehicleId = vehicle.id;
    this.vehicleForm.patchValue({
      plate: vehicle.plate,
      model: vehicle.model,
      company: vehicle.company,
      type: vehicle.type,
      odometer: vehicle.odometer,
      fuelLevel: vehicle.fuelLevel,
      driverId: vehicle.driverId || null,
      status: vehicle.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const formValue = this.vehicleForm.value;
      if (this.isEditMode() && this.selectedVehicleId) {
        const vehicle = this.vehicles().find(v => v.id === this.selectedVehicleId);
        if (vehicle) {
          const updated: Vehicle = {
            ...vehicle,
            ...formValue
          };
          this.mockApi.updateVehicle(updated).subscribe(() => {
            this.loadVehicles();
            this.closeModal();
          });
        }
      } else {
        this.mockApi.addVehicle(formValue).subscribe(() => {
          this.loadVehicles();
          this.closeModal();
        });
      }
    }
  }

  deleteVehicle(id: string) {
    if (confirm('Are you sure you want to delete this vehicle from the fleet?')) {
      this.mockApi.deleteVehicle(id).subscribe(() => {
        this.loadVehicles();
      });
    }
  }
}
