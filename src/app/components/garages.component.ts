import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Garage, User } from '../services/mock-api.service';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="garages-container p-4">
      <div class="mb-4" *ngIf="currentUser">
        <h2 class="font-display font-bold text-white mb-0">
          {{ currentUser.role === 'admin' ? 'Workshop Partner Registrations' : 'Workshop Partner Directory' }}
        </h2>
        <span class="text-secondary text-sm">
          {{ currentUser.role === 'admin' ? 'Verify business registrations and approve new partner accounts' : 'View authorized workshop locations across India' }}
        </span>
      </div>

      <!-- ============================================== -->
      <!-- ADMIN VIEW: APPROVAL BOARD                     -->
      <!-- ============================================== -->
      <div *ngIf="currentUser?.role === 'admin'" class="admin-approval-board">
        <div class="grid-cols-2 gap-4">
          <div class="glass-card flex-col p-4 border border-white border-opacity-5" *ngFor="let g of pendingGarages">
            <div class="flex justify-between items-start mb-3 border-b border-white border-opacity-5 pb-2">
              <div>
                <h3 class="text-white text-bold mb-1">{{ g.name }}</h3>
                <span class="text-muted text-xs">GSTIN: <b>{{ g.gstNo || 'Not Provided' }}</b> &bull; Reg: {{ g.businessRegNo || 'N/A' }}</span>
              </div>
              <span class="badge badge-warning text-xxs">Pending Review</span>
            </div>

            <div class="grid-cols-2 gap-2 text-xs mb-4">
              <div><span class="text-muted">Owner:</span> <b class="text-white">{{ g.ownerName }}</b></div>
              <div><span class="text-muted">Mobile:</span> <b class="text-white">{{ g.phone }}</b></div>
              <div><span class="text-muted">Email:</span> <b class="text-white">{{ g.email }}</b></div>
              <div><span class="text-muted">State/City:</span> <b class="text-white">{{ g.state }}, {{ g.city }}</b></div>
              <div><span class="text-muted">Mechanics:</span> <b class="text-white">{{ g.mechanicsCount }}</b></div>
              <div><span class="text-muted">Bay Capacity:</span> <b class="text-white">{{ g.capacity }} slots</b></div>
            </div>

            <div class="garage-docs flex gap-2 my-2 p-2 rounded-lg bg-black bg-opacity-20">
              <div class="doc-icon text-cyan flex items-center gap-1 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>license_copy.pdf</span>
              </div>
              <div class="doc-icon text-indigo flex items-center gap-1 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>garage_facade.jpg</span>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 border-t border-white border-opacity-5 pt-3">
              <button class="btn btn-secondary btn-sm" (click)="reject(g.id)">Reject</button>
              <button class="btn btn-primary btn-sm" (click)="approve(g.id)">Approve Workshop Partner</button>
            </div>
          </div>
        </div>

        <div *ngIf="pendingGarages.length === 0" class="glass-card text-center text-muted py-8">
          No pending workshop registrations require approval.
        </div>
      </div>

      <!-- ============================================== -->
      <!-- FLEET OWNER / CUSTOMER VIEW: DIRECTORY         -->
      <!-- ============================================== -->
      <div *ngIf="currentUser?.role === 'fleet-owner'" class="owner-directory-board">
        <div class="grid-cols-3 gap-6">
          <div class="glass-card garage-card flex-col p-0 overflow-hidden" *ngFor="let g of approvedGarages">
            <div class="card-image-box relative" style="height: 140px; background: #0f172a;">
              <img [src]="g.imageUrl || 'https://images.unsplash.com/photo-1506015391300-4802db74de2e?w=500'" alt="Garage" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" />
              <div class="card-image-overlay absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); box-sizing: border-box;">
                <h3 class="text-white text-bold mb-0" style="font-size: 1rem;">{{ g.name }}</h3>
                <span class="text-xs text-secondary" style="font-size: 0.725rem; color: #cbd5e1;">{{ g.fullAddress }}</span>
              </div>
            </div>

            <div class="p-4 flex-col gap-3 text-xs leading-relaxed">
              <div class="flex justify-between items-center border-b border-white border-opacity-5 pb-2">
                <span class="text-muted">Bay Capacity:</span>
                <span class="text-white text-bold">{{ g.capacity }} slots</span>
              </div>
              <div class="flex justify-between items-center border-b border-white border-opacity-5 pb-2">
                <span class="text-muted">Working Hours:</span>
                <span class="text-white text-bold">{{ g.workingHours }}</span>
              </div>
              <div class="flex justify-between items-center border-b border-white border-opacity-5 pb-2">
                <span class="text-muted">Mechanics:</span>
                <span class="text-white text-bold">{{ g.mechanicsCount }} Technicians</span>
              </div>
              <div class="flex justify-between items-center border-b border-white border-opacity-5 pb-2">
                <span class="text-muted">Contact Partner:</span>
                <span class="text-cyan text-bold">{{ g.phone }}</span>
              </div>
              <div class="flex-col mt-2">
                <span class="text-muted block mb-1">Services Offered:</span>
                <div class="flex flex-wrap gap-1">
                  <span class="badge badge-secondary text-xxs" *ngFor="let s of g.servicesOffered">{{ s }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- SERVICE CENTER VIEW: MY WORKSHOP               -->
      <!-- ============================================== -->
      <div *ngIf="currentUser?.role === 'service-center'" class="service-center-profile-board">
        <div class="glass-card max-w-2xl mx-auto flex-col p-6" *ngIf="myGarage">
          <div class="flex gap-4 border-b border-white border-opacity-5 pb-4 mb-4">
            <img [src]="myGarage.logoUrl" alt="Logo" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.06);" />
            <div class="flex-col">
              <h2 class="text-white mb-1 font-display font-bold">{{ myGarage.name }}</h2>
              <span class="badge badge-success text-xxs">Approved Partner Workshop</span>
              <p class="text-muted text-xs mt-2 mb-0">GSTIN Reference: {{ myGarage.gstNo }}</p>
            </div>
          </div>

          <div class="grid-cols-2 gap-4 text-sm leading-relaxed">
            <div><span class="text-muted block">Owner Name</span> <b class="text-white">{{ myGarage.ownerName }}</b></div>
            <div><span class="text-muted block">Phone Contact</span> <b class="text-cyan">{{ myGarage.phone }}</b></div>
            <div><span class="text-muted block">Registered Email</span> <b class="text-white">{{ myGarage.email }}</b></div>
            <div><span class="text-muted block">Pincode & State</span> <b class="text-white">{{ myGarage.pincode }} - {{ myGarage.state }}</b></div>
            <div><span class="text-muted block">Floor Mechanics Count</span> <b class="text-white">{{ myGarage.mechanicsCount }} staff members</b></div>
            <div><span class="text-muted block">Service Bay capacity</span> <b class="text-white">{{ myGarage.capacity }} heavy vehicles</b></div>
            <div class="col-span-2"><span class="text-muted block">Full Workshop Address</span> <b class="text-white">{{ myGarage.fullAddress }}</b></div>
            <div class="col-span-2 mt-2">
              <span class="text-muted block mb-2">Supported Workshop Services</span>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-success" *ngFor="let s of myGarage.servicesOffered">{{ s }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .garages-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .col-span-2 { grid-column: span 2; }
    .text-xxs {
      font-size: 0.65rem;
    }
  `]
})
export class GaragesComponent implements OnInit {
  currentUser: User | null = null;
  pendingGarages: Garage[] = [];
  approvedGarages: Garage[] = [];
  myGarage: Garage | null = null;

  constructor(private mockApi: MockApiService) {}

  ngOnInit() {
    this.mockApi.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadGarages();
      }
    });
  }

  loadGarages() {
    this.mockApi.getGarages().subscribe(list => {
      this.pendingGarages = list.filter(g => g.status === 'Pending');
      this.approvedGarages = list.filter(g => g.status === 'Approved');
      
      if (this.currentUser?.role === 'service-center') {
        this.myGarage = list.find(g => g.email === this.currentUser?.email) || null;
      }
    });
  }

  approve(id: string) {
    this.mockApi.approveGarage(id).subscribe({
      next: () => {
        alert('Workshop registration approved successfully!');
        this.loadGarages();
      }
    });
  }

  reject(id: string) {
    this.mockApi.rejectGarage(id).subscribe({
      next: () => {
        alert('Workshop registration rejected.');
        this.loadGarages();
      }
    });
  }
}
