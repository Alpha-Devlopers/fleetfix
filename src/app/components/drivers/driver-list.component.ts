import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, Driver, Vehicle } from '../../services/mock-api.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="page-header-actions mb-4">
      <div class="search-filters">
        <input 
          type="text" 
          class="form-control filter-search" 
          placeholder="Search drivers by name, email or mobile..." 
          (input)="onSearch($event)"
        />
        <select class="form-control filter-select" (change)="onStatusFilter($event)">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
        </select>
      </div>
      
      <button class="btn btn-primary" (click)="openAddModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Register Driver
      </button>
    </div>

    <!-- Drivers Cards Grid -->
    <div class="drivers-grid">
      <div class="glass-card driver-profile-card" *ngFor="let driver of filteredDrivers()">
        <div class="driver-card-header">
          <img [src]="driver.avatarUrl || '/images/drivers/sai_kiran.png'" alt="Avatar" class="driver-avatar" />
          <div class="driver-header-text">
            <h3 class="mb-0">{{ driver.name }}</h3>
            <span class="badge mt-1" [ngClass]="getStatusBadgeClass(driver.status)">{{ driver.status }}</span>
          </div>
        </div>

        <div class="driver-card-body mt-4">
          <div class="info-row">
            <span class="info-label">Email Address</span>
            <span class="info-value font-mono text-xs">{{ driver.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">License Number</span>
            <span class="info-value font-mono">{{ driver.licenseNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Indian Mobile</span>
            <span class="info-value">{{ driver.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Experience</span>
            <span class="info-value text-bold text-cyan">{{ driver.experience }} Years</span>
          </div>
          <div class="info-row">
            <span class="info-label">Assigned Vehicle</span>
            <span class="info-value text-bold text-indigo">{{ driver.assignedVehiclePlate || 'No assignment' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Safety Rating</span>
            <span class="info-value text-bold text-cyan">★ {{ driver.rating }} / 5.0</span>
          </div>
          <div class="info-row">
            <span class="info-label">Monthly Salary</span>
            <span class="info-value text-bold text-green">₹{{ driver.salary | number }} / mo</span>
          </div>
        </div>

        <div class="driver-card-footer mt-4">
          <button class="btn btn-secondary btn-sm" [routerLink]="['/drivers', driver.id]">
            Trip Ledger
          </button>
          <div class="footer-actions">
            <button class="btn-action-icon edit" (click)="openEditModal(driver)" title="Edit profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn-action-icon delete" (click)="deleteDriver(driver.id)" title="Remove driver">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="filteredDrivers().length === 0" class="no-results glass-card w-full text-center py-8 text-muted">
        No drivers found matching search queries.
      </div>
    </div>

    <!-- Registration / Modification Modal -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode() ? 'Edit Driver Profile' : 'Register New Driver' }}</h3>
          <button class="btn-close-modal" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="driverForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="name">Driver Full Name</label>
              <input id="name" type="text" class="form-control" formControlName="name" placeholder="e.g. Ramesh Patel" />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Indian Phone Number</label>
              <input id="phone" type="text" class="form-control" formControlName="phone" placeholder="e.g. +91 9876543210" />
            </div>

            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label" for="licenseNo">License No. (e.g. DL-MH12)</label>
                <input id="licenseNo" type="text" class="form-control" formControlName="licenseNo" placeholder="e.g. DL-MH1234" />
              </div>

              <div class="form-group">
                <label class="form-label" for="experience">Driving Experience (Years)</label>
                <input id="experience" type="number" class="form-control" formControlName="experience" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="salary">Monthly Salary (INR ₹)</label>
              <input id="salary" type="number" class="form-control" formControlName="salary" placeholder="e.g. 35000" />
            </div>

            <div class="form-group">
              <label class="form-label" for="assignedVehicleId">Assign Fleet Truck</label>
              <select id="assignedVehicleId" class="form-control" formControlName="assignedVehicleId">
                <option [value]="null">No Assignment</option>
                <option *ngFor="let v of vehicles" [value]="v.id">{{ v.plate }} ({{ v.model }})</option>
              </select>
            </div>

            <div class="form-group" *ngIf="isEditMode()">
              <label class="form-label" for="status">On-Duty Status</label>
              <select id="status" class="form-control" formControlName="status">
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="driverForm.invalid">
              Save Driver Profile
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
    .btn-icon-svg { margin-right: 6px; }

    /* Cards Grid */
    .drivers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    
    .driver-profile-card {
      display: flex;
      flex-direction: column;
      padding: 24px;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
    
    .driver-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .driver-avatar {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.15);
        object-fit: cover;
      }
      
      .driver-header-text {
        h3 { font-size: 1.05rem; }
      }
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.85rem;
      
      .info-label { color: var(--text-muted); }
      .info-value { color: var(--text-primary); }
    }
    
    .driver-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    
    .footer-actions {
      display: flex;
      gap: 6px;
    }
    
    .btn-action-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover { transform: scale(1.08); }
      &.edit:hover { background: rgba(99, 102, 241, 0.1); color: var(--color-primary); }
      &.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
    }

    /* Modal Overlay */
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
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      h3 { margin-bottom: 0; }
      .btn-close-modal {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.5rem;
        cursor: pointer;
      }
    }
    .modal-body { padding: 24px; }
  `]
})
export class DriverListComponent implements OnInit {
  drivers = signal<Driver[]>([]);
  filteredDrivers = signal<Driver[]>([]);
  vehicles: Vehicle[] = [];

  // Filter States
  searchQuery = '';
  statusFilter = '';

  // Form State
  driverForm!: FormGroup;
  showModal = signal(false);
  isEditMode = signal(false);
  selectedDriverId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.loadDrivers();
    this.mockApi.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
    });

    this.initForm();
  }

  loadDrivers() {
    this.mockApi.getDrivers().subscribe(drivers => {
      this.drivers.set(drivers);
      this.applyFilters();
    });
  }

  initForm() {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      licenseNo: ['', [Validators.required]],
      experience: [5, [Validators.required, Validators.min(0)]],
      salary: [30000, [Validators.required, Validators.min(0)]],
      assignedVehicleId: [null],
      status: ['Available']
    });
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
    let result = this.drivers();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.phone.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter) {
      result = result.filter(d => d.status === this.statusFilter);
    }
    this.filteredDrivers.set(result);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'On Trip': return 'badge-info';
      default: return 'badge-danger';
    }
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.selectedDriverId = null;
    this.driverForm.reset({
      name: '',
      phone: '',
      licenseNo: '',
      experience: 5,
      salary: 30000,
      assignedVehicleId: null,
      status: 'Available'
    });
    this.showModal.set(true);
  }

  openEditModal(driver: Driver) {
    this.isEditMode.set(true);
    this.selectedDriverId = driver.id;
    this.driverForm.patchValue({
      name: driver.name,
      phone: driver.phone,
      licenseNo: driver.licenseNo,
      experience: driver.experience,
      salary: driver.salary,
      assignedVehicleId: driver.assignedVehicleId || null,
      status: driver.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.driverForm.valid) {
      const formValue = this.driverForm.value;
      if (this.isEditMode() && this.selectedDriverId) {
        const driver = this.drivers().find(d => d.id === this.selectedDriverId);
        if (driver) {
          const updated: Driver = {
            ...driver,
            ...formValue
          };
          this.mockApi.updateDriver(updated).subscribe(() => {
            this.loadDrivers();
            this.closeModal();
          });
        }
      } else {
        const emailVal = `${formValue.name.toLowerCase().replace(/\s+/g, '.')}@fleetfix.com`;
        const payload = {
          ...formValue,
          email: emailVal
        };
        this.mockApi.addDriver(payload).subscribe(() => {
          this.loadDrivers();
          this.closeModal();
        });
      }
    }
  }

  deleteDriver(id: string) {
    if (confirm('Are you sure you want to remove this driver profile?')) {
      this.mockApi.deleteDriver(id).subscribe(() => {
        this.loadDrivers();
      });
    }
  }
}
