import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockApiService, FaultAlert, AIOrder, Vehicle } from '../services/mock-api.service';

@Component({
  selector: 'app-repair-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="repair-order-container" *ngIf="order()">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-4">
        <a routerLink="/diagnostics" class="btn btn-secondary btn-icon-sm" title="Back to diagnostics">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h2 class="mb-0 font-display font-bold">AI Repair Order &bull; DTC Code {{ order()?.dtc }}</h2>
        </div>
      </div>

      <!-- Affected Vehicle Profile Summary Card -->
      <div class="glass-card flex gap-4 items-center mb-4 p-3" *ngIf="vehicle()">
        <img [src]="vehicle()?.image" alt="Truck" style="width: 80px; height: 60px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color);" />
        <div class="flex-1">
          <h4 class="font-mono text-bold mb-1" style="color: var(--text-primary); margin: 0;">{{ vehicle()?.plate }} &bull; {{ vehicle()?.model }}</h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="badge badge-sm badge-info" style="font-size: 0.65rem; padding: 2px 6px;">{{ vehicle()?.type }}</span>
            <span class="text-xs text-muted">Odometer: {{ vehicle()?.odometer | number }} km &bull; Fuel Level: {{ vehicle()?.fuelLevel }}%</span>
          </div>
        </div>
        <div class="flex items-center gap-3 bg-opacity-10 bg-white border border-white border-opacity-5 p-2 rounded-lg" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
          <img [src]="vehicle()?.driverPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'" alt="Driver" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
          <div class="flex flex-col">
            <span class="text-xs text-muted" style="font-size: 0.65rem; text-transform: uppercase; font-weight:600;">Driver Operator</span>
            <span class="text-xs text-bold" style="color: var(--text-primary); font-size: 0.775rem;">{{ vehicle()?.driverName || 'Unassigned' }}</span>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="grid-cols-4 mb-4">
        <div class="glass-card stat-tile">
          <span class="tile-label">Repair Status</span>
          <span class="badge badge-lg mt-2" [ngClass]="getOrderStatusBadgeClass(order()?.status || '')">
            {{ order()?.status }}
          </span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Est. Time Required</span>
          <span class="tile-val mt-1 text-cyan font-display">{{ order()?.timeEstimate }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Est. Parts & Labor Cost</span>
          <span class="tile-val val-number mt-1 font-display">₹{{ order()?.costEstimate | number }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">DTC Severity</span>
          <span class="badge badge-lg mt-2" [ngClass]="'badge-' + (alert()?.severity?.toLowerCase() || 'low')">
            {{ alert()?.severity }}
          </span>
        </div>
      </div>

      <!-- Body columns -->
      <div class="repair-body-grid">
        <!-- Left: Procedure -->
        <div class="glass-card flex-col flex-2">
          <h3>AI Recommended Repair Procedure</h3>
          <p class="text-muted mb-4">These steps are generated based on OBD-II telemetry parameters and typical manufacturer repair protocols.</p>
          
          <div class="procedure-steps">
            <div class="step-item" *ngFor="let step of order()?.procedure; let idx = index">
              <div class="step-num">{{ idx + 1 }}</div>
              <div class="step-text">{{ step }}</div>
            </div>
          </div>
        </div>

        <!-- Right: Tools, Parts, Action Panel -->
        <div class="flex-col flex-1 gap-4">
          <!-- Required Tools -->
          <div class="glass-card">
            <h3>Required Specialty Tools</h3>
            <ul class="tools-list mt-3">
              <li *ngFor="let tool of order()?.tools">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tool-bullet"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {{ tool }}
              </li>
            </ul>
          </div>

          <!-- Required Parts -->
          <div class="glass-card">
            <h3>Spare Parts Check</h3>
            <div class="parts-container mt-3">
              <div class="part-item" *ngFor="let part of order()?.parts">
                <div class="part-details">
                  <div class="part-name">{{ part.name }}</div>
                  <div class="part-meta">Qty Required: {{ part.quantity }} &bull; Est. cost: ₹{{ part.cost | number }}</div>
                </div>
                <span class="badge badge-success">In Stock</span>
              </div>
            </div>
          </div>

          <!-- Action Board -->
          <div class="glass-card action-board-card">
            <h3>Diagnostic Resolution Board</h3>
            <div class="board-action mt-3">
              <!-- Unresolved / Generated state -->
              <div *ngIf="order()?.status === 'Generated'" class="action-prompt">
                <p class="mb-3">Review complete. Ready to dispatch repair order to maintenance department?</p>
                <button class="btn btn-primary w-full" (click)="updateStatus('In Progress')">
                  Approve & Dispatch Order
                </button>
              </div>

              <!-- In Progress state -->
              <div *ngIf="order()?.status === 'In Progress' || order()?.status === 'Approved'" class="action-prompt">
                <p class="mb-3">Repair work is ongoing. Once the mechanic has completed all steps, mark this task complete to clear the vehicle OBD code.</p>
                <button class="btn btn-accent w-full" (click)="updateStatus('Completed')">
                  Mark Repair Completed
                </button>
              </div>

              <!-- Completed state -->
              <div *ngIf="order()?.status === 'Completed'" class="completed-banner text-center py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="completed-icon mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h4 class="text-green">DTC Fault Code Cleared</h4>
                <p class="text-sm mt-1">Vehicle health index has been recovered. Service log successfully filed in system records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!order()" class="loading-state flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .repair-order-container {
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
        font-size: 1.5rem;
        font-weight: 700;
      }
      .val-number { color: var(--text-primary); }
    }
    
    .badge-lg { padding: 6px 12px; font-size: 0.85rem; }
    
    /* Body Grid */
    .repair-body-grid {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    .flex-2 { flex: 2; }
    .flex-1 { flex: 1; }
    
    /* Procedure Steps */
    .procedure-steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .step-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      align-items: flex-start;
      
      .step-num {
        width: 28px;
        height: 28px;
        background: var(--gradient-primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
        flex-shrink: 0;
      }
      
      .step-text {
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--text-primary);
      }
    }
    
    /* Tools & Parts */
    .tools-list {
      list-style: none;
      
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        
        .tool-bullet { color: var(--color-secondary); }
      }
    }
    
    .parts-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .part-item {
      display: flex;
      justify-content: justify-between;
      align-items: center;
      padding: 8px;
      border-radius: 6px;
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.03);
      width: 100%;
      
      .part-details {
        flex: 1;
        .part-name { font-size: 0.85rem; font-weight: 500; }
        .part-meta { font-size: 0.725rem; color: var(--text-muted); }
      }
    }
    
    /* Resolution Board */
    .action-board-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.5) 100%);
      border-color: rgba(99, 102, 241, 0.2);
    }
    
    .action-prompt {
      p { font-size: 0.85rem; }
    }
    
    .completed-banner {
      .completed-icon { color: var(--color-success); }
      .text-green { color: var(--color-success); }
      p { font-size: 0.8rem; }
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
export class RepairOrderComponent implements OnInit {
  alertId: string | null = null;
  alert = signal<FaultAlert | null>(null);
  order = signal<AIOrder | null>(null);
  vehicle = signal<Vehicle | null>(null);

  constructor(
    private route: ActivatedRoute,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.alertId = this.route.snapshot.paramMap.get('id');
    if (this.alertId) {
      this.loadAlertDetails(this.alertId);
    }
  }

  loadAlertDetails(id: string) {
    this.mockApi.getAlertById(id).subscribe(alert => {
      if (alert) {
        this.alert.set(alert);
        // Load full vehicle specifications
        this.mockApi.getVehicleById(alert.vehicleId).subscribe(v => {
          this.vehicle.set(v || null);
        });
        // load generated order
        this.mockApi.generateAIRepairOrder(id).subscribe(order => {
          this.order.set(order);
        });
      }
    });
  }

  getOrderStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'In Progress': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  updateStatus(newStatus: AIOrder['status']) {
    if (this.alertId) {
      this.mockApi.updateAIOrderStatus(this.alertId, newStatus).subscribe(order => {
        this.order.set(order);
        if (this.alert()) {
          // reload status synced details
          this.mockApi.getAlertById(this.alertId!).subscribe(a => this.alert.set(a || null));
        }
      });
    }
  }
}
