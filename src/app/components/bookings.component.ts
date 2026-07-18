import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockApiService, Vehicle, Garage, Booking, User } from '../services/mock-api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="bookings-container p-4">
      <div class="flex justify-between items-center mb-4" *ngIf="currentUser">
        <div>
          <h2 class="font-display font-bold text-white mb-0">Workshop Service Bookings</h2>
          <span class="text-secondary text-sm">
            {{ currentUser.role === 'fleet-owner' ? 'Request repair services at partner locations' : 'Manage customer service schedules' }}
          </span>
        </div>
        <button *ngIf="currentUser.role === 'fleet-owner' && !showForm()" (click)="showForm.set(true)" class="btn btn-primary btn-icon-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Book Service</span>
        </button>
      </div>

      <!-- FLEET OWNER BOOKING FORM -->
      <div *ngIf="showForm() && currentUser?.role === 'fleet-owner'" class="glass-card mb-4 animate-fade-in">
        <div class="flex justify-between items-center mb-4 border-b border-white border-opacity-5 pb-3">
          <h3 class="text-white text-bold mb-0">New Service Reservation</h3>
          <button (click)="showForm.set(false)" class="btn btn-secondary btn-icon-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Select Vehicle</label>
            <select class="form-control" formControlName="vehicleId">
              <option *ngFor="let v of myVehicles" [value]="v.id">{{ v.plate }} - {{ v.model }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Select Workshop Center</label>
            <select class="form-control" formControlName="garageId">
              <option *ngFor="let g of approvedGarages" [value]="g.id">{{ g.name }} ({{ g.city }})</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Service Type Required</label>
            <select class="form-control" formControlName="serviceType">
              <option value="General Checkup">General Inspection & Tune-up</option>
              <option value="Brake Overhaul">Brake Pads & Caliper Repair</option>
              <option value="Oil Filter Change">Oil Flush & Filter Replacement</option>
              <option value="Engine Diagnostics">OBD-II Fault Troubleshooting</option>
              <option value="Electrical Repair">Wiring harness/battery check</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Schedule Date</label>
            <input type="date" class="form-control" formControlName="date" />
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Additional Operator Notes</label>
            <textarea class="form-control" formControlName="notes" rows="2" placeholder="e.g. Engine combustion misfire alert on Cylinder 2..."></textarea>
          </div>

          <div class="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="bookingForm.invalid">Submit Booking Request</button>
          </div>
        </form>
      </div>

      <!-- BOOKINGS LISTING VIEW -->
      <div class="glass-card">
        <h3 class="text-white text-bold mb-4">Service Schedule Logs</h3>
        <div class="table-container">
          <table class="custom-table text-left">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Vehicle Details</th>
                <th>Service Center</th>
                <th>Job Description</th>
                <th>Scheduled Date</th>
                <th>Assigned Mechanic</th>
                <th>Status</th>
                <th *ngIf="currentUser?.role === 'service-center'">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bookings">
                <td class="font-mono text-xs text-muted">{{ b.id }}</td>
                <td>
                  <div class="flex-col">
                    <span class="text-white text-bold block">{{ b.vehiclePlate }}</span>
                    <span class="text-xxs text-secondary">{{ b.vehicleModel }}</span>
                  </div>
                </td>
                <td>{{ b.garageName }}</td>
                <td>
                  <div class="flex-col">
                    <span class="text-xs">{{ b.serviceType }}</span>
                    <span class="text-xxs text-muted" *ngIf="b.notes">Notes: {{ b.notes }}</span>
                  </div>
                </td>
                <td class="font-mono">{{ b.date }}</td>
                <td>
                  <span class="badge badge-secondary text-xxs" *ngIf="b.assignedMechanic">{{ b.assignedMechanic }}</span>
                  <span class="text-muted text-xs" *ngIf="!b.assignedMechanic">Not Assigned</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-secondary': b.status === 'Pending',
                    'badge-info': b.status === 'Confirmed',
                    'badge-warning': b.status === 'In Progress',
                    'badge-success': b.status === 'Completed',
                    'badge-danger': b.status === 'Rejected'
                  }">
                    {{ b.status }}
                  </span>
                </td>
                <td *ngIf="currentUser?.role === 'service-center'">
                  <div class="flex gap-1" *ngIf="b.status === 'Pending'">
                    <button class="btn btn-primary btn-xxs" (click)="updateStatus(b.id, 'Confirmed')">Confirm</button>
                    <button class="btn btn-secondary btn-xxs" (click)="updateStatus(b.id, 'Rejected')">Reject</button>
                  </div>
                  <div *ngIf="b.status === 'Confirmed'">
                    <button class="btn btn-warning btn-xxs" (click)="openAssignModal(b)">Start Job</button>
                  </div>
                  <div *ngIf="b.status === 'In Progress'">
                    <button class="btn btn-success btn-xxs" (click)="openCompleteModal(b)">Complete</button>
                  </div>
                  <span class="text-muted text-xs" *ngIf="b.status === 'Completed' || b.status === 'Rejected'">None</span>
                </td>
              </tr>
              <tr *ngIf="bookings.length === 0">
                <td colspan="8" class="text-center py-6 text-muted">No service bookings found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WORK ORDER ASSIGN MECHANIC MODAL -->
      <div class="modal-overlay flex items-center justify-center" *ngIf="activeAssignBooking()">
        <div class="glass-panel modal-card p-6 w-full max-w-md">
          <h3 class="text-white text-bold mb-4">Start Work & Assign Staff</h3>
          <div class="form-group">
            <label class="form-label">Select Floor Technician</label>
            <select class="form-control" [(ngModel)]="selectedMechanic">
              <option *ngFor="let m of mechanics" [value]="m.name">{{ m.name }} ({{ m.shop }})</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn btn-secondary" (click)="activeAssignBooking.set(null)">Cancel</button>
            <button class="btn btn-primary" (click)="confirmStartJob()">Dispatch Job</button>
          </div>
        </div>
      </div>

      <!-- WORK ORDER COMPLETE MODAL -->
      <div class="modal-overlay flex items-center justify-center" *ngIf="activeCompleteBooking()">
        <div class="glass-panel modal-card p-6 w-full max-w-md">
          <h3 class="text-white text-bold mb-4">Finalize Repair Job & Invoice</h3>
          <div class="form-group mb-3">
            <label class="form-label">Total Repair Cost Estimate (₹)</label>
            <input type="number" class="form-control" [(ngModel)]="completeCost" />
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn btn-secondary" (click)="activeCompleteBooking.set(null)">Cancel</button>
            <button class="btn btn-success" (click)="confirmCompleteJob()">Approve Completion</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .bookings-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10, 15, 25, 0.7);
      backdrop-filter: blur(8px);
      z-index: 9999;
    }
    .modal-card {
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
    }
    .col-span-2 { grid-column: span 2; }
    .btn-xxs {
      padding: 4px 8px;
      font-size: 0.7rem;
    }
    .text-xxs {
      font-size: 0.65rem;
    }
  `]
})
export class BookingsComponent implements OnInit {
  currentUser: User | null = null;
  bookings: Booking[] = [];
  approvedGarages: Garage[] = [];
  myVehicles: Vehicle[] = [];
  mechanics: any[] = [];

  showForm = signal(false);
  bookingForm!: FormGroup;

  // modal controls
  activeAssignBooking = signal<Booking | null>(null);
  selectedMechanic = '';

  activeCompleteBooking = signal<Booking | null>(null);
  completeCost = 5000;

  constructor(private mockApi: MockApiService, private fb: FormBuilder) {}

  ngOnInit() {
    this.mockApi.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadBookings();
        this.initBookingForm();
      }
    });

    this.mockApi.getGarages().subscribe(list => {
      this.approvedGarages = list.filter(g => g.status === 'Approved');
    });

    this.mechanics = this.mockApi.mechanics;
  }

  initBookingForm() {
    this.bookingForm = this.fb.group({
      vehicleId: ['', Validators.required],
      garageId: ['', Validators.required],
      serviceType: ['General Checkup', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });
  }

  loadBookings() {
    if (!this.currentUser) return;

    this.mockApi.getBookings().subscribe(list => {
      if (this.currentUser?.role === 'admin') {
        this.bookings = list;
      } else if (this.currentUser?.role === 'fleet-owner') {
        this.bookings = list.filter(b => b.customerEmail === this.currentUser?.email);
        
        // Also fetch user's company vehicles
        this.mockApi.getVehicles().subscribe(vehicles => {
          this.myVehicles = vehicles.filter(v => v.company.toLowerCase().includes(this.currentUser?.company?.toLowerCase() || 'owner'));
          if (this.myVehicles.length > 0 && this.bookingForm) {
            this.bookingForm.patchValue({ vehicleId: this.myVehicles[0].id });
          }
        });
      } else if (this.currentUser?.role === 'service-center') {
        this.mockApi.getGarages().subscribe(garages => {
          const myGarage = garages.find(g => g.email === this.currentUser?.email);
          if (myGarage) {
            this.bookings = list.filter(b => b.garageId === myGarage.id);
          }
        });
      }
    });
  }

  updateStatus(bookingId: string, status: Booking['status']) {
    this.mockApi.updateBookingStatus(bookingId, status).subscribe({
      next: () => this.loadBookings()
    });
  }

  openAssignModal(booking: Booking) {
    this.activeAssignBooking.set(booking);
    this.selectedMechanic = this.mechanics[0]?.name || '';
  }

  confirmStartJob() {
    const booking = this.activeAssignBooking();
    if (booking && this.selectedMechanic) {
      this.mockApi.updateBookingStatus(booking.id, 'In Progress', this.selectedMechanic).subscribe({
        next: () => {
          this.activeAssignBooking.set(null);
          this.loadBookings();
        }
      });
    }
  }

  openCompleteModal(booking: Booking) {
    this.activeCompleteBooking.set(booking);
    this.completeCost = 6500;
  }

  confirmCompleteJob() {
    const booking = this.activeCompleteBooking();
    if (booking) {
      this.mockApi.updateBookingStatus(booking.id, 'Completed', booking.assignedMechanic, this.completeCost).subscribe({
        next: () => {
          this.activeCompleteBooking.set(null);
          this.loadBookings();
          alert('Service complete. Paid invoice has been generated for Fleet Owner.');
        }
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid && this.currentUser) {
      const val = this.bookingForm.value;
      const vehicle = this.myVehicles.find(v => v.id === val.vehicleId);
      const garage = this.approvedGarages.find(g => g.id === val.garageId);

      if (vehicle && garage) {
        this.mockApi.addBooking({
          vehicleId: vehicle.id,
          vehiclePlate: vehicle.plate,
          vehicleModel: vehicle.model,
          garageId: garage.id,
          garageName: garage.name,
          customerName: this.currentUser.name,
          customerEmail: this.currentUser.email,
          serviceType: val.serviceType,
          date: val.date,
          notes: val.notes
        }).subscribe({
          next: () => {
            this.showForm.set(false);
            this.loadBookings();
            alert('Your service request has been posted successfully!');
          }
        });
      }
    }
  }
}
