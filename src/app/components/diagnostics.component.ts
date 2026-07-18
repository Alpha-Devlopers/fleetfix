import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MockApiService, FaultAlert } from '../services/mock-api.service';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="diagnostics-container">
      <!-- Top Overview Summary Cards -->
      <div class="grid-cols-3 mb-4">
        <div class="glass-card stat-tile">
          <span class="tile-label">Critical DTC Issues</span>
          <span class="tile-val mt-1 text-danger font-display">{{ criticalCount() }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Warning Level Issues</span>
          <span class="tile-val mt-1 text-warning font-display">{{ warningCount() }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Total Outstanding Faults</span>
          <span class="tile-val mt-1 font-display">{{ totalFaults() }}</span>
        </div>
      </div>

      <!-- Faults List Table -->
      <div class="glass-panel p-0">
        <div class="table-title-bar">
          <h3>Active Fleet Diagnostic Trouble Codes (DTC)</h3>
        </div>
        
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>DTC Code</th>
                <th>Vehicle Affected</th>
                <th>Diagnostic Description</th>
                <th>Severity</th>
                <th>Detected Time</th>
                <th>Repair Status</th>
                <th class="text-right">AI Assistant Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alert of alerts()">
                <td class="font-mono text-bold code-badge">{{ alert.dtc }}</td>
                <td>{{ alert.vehicleModel }} ({{ alert.vehiclePlate }})</td>
                <td>{{ alert.description }}</td>
                <td>
                  <span class="badge" [ngClass]="'badge-' + alert.severity.toLowerCase()">{{ alert.severity }}</span>
                </td>
                <td class="font-mono">{{ alert.time }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(alert.status)">{{ alert.status }}</span>
                </td>
                <td class="text-right">
                  <!-- Trigger AI generation if Unresolved -->
                  <button 
                    *ngIf="alert.status === 'Unresolved'" 
                    class="btn btn-accent btn-sm flex items-center gap-2" 
                    (click)="triggerAiOrder(alert.id)"
                    [disabled]="generatingId() === alert.id"
                  >
                    <span *ngIf="generatingId() !== alert.id">Generate AI Repair Order</span>
                    <span *ngIf="generatingId() === alert.id" class="flex items-center gap-2">
                      <div class="spinner-small"></div> Processing...
                    </span>
                  </button>

                  <!-- Open AI repair order if already generated -->
                  <button 
                    *ngIf="alert.status !== 'Unresolved'" 
                    class="btn btn-primary btn-sm" 
                    [routerLink]="['/repair-order', alert.id]"
                  >
                    View AI Repair Order
                  </button>
                </td>
              </tr>
              <tr *ngIf="alerts().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">All vehicles are healthy. No fault codes detected.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diagnostics-container {
      display: flex;
      flex-direction: column;
    }
    
    .table-title-bar {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      h3 { margin-bottom: 0; font-size: 0.95rem; }
    }
    
    .code-badge {
      font-size: 0.9rem;
      color: var(--color-secondary);
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
        font-size: 1.75rem;
        font-weight: 700;
      }
    }
    
    .text-danger { color: var(--color-danger) !important; }
    .text-warning { color: var(--color-warning) !important; }
    
    .spinner-small {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DiagnosticsComponent implements OnInit {
  alerts = signal<FaultAlert[]>([]);
  criticalCount = signal(0);
  warningCount = signal(0);
  totalFaults = signal(0);
  
  generatingId = signal<string | null>(null);

  constructor(
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.mockApi.getFaultAlerts().subscribe(alerts => {
      this.alerts.set(alerts);
      this.totalFaults.set(alerts.filter(a => a.status !== 'Resolved').length);
      this.criticalCount.set(alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length);
      this.warningCount.set(alerts.filter(a => a.severity === 'Warning' && a.status !== 'Resolved').length);
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Resolved': return 'badge-success';
      case 'Repairing': return 'badge-warning';
      default: return 'badge-danger';
    }
  }

  triggerAiOrder(alertId: string) {
    this.generatingId.set(alertId);
    
    this.mockApi.generateAIRepairOrder(alertId).subscribe({
      next: (order) => {
        this.generatingId.set(null);
        // Navigate to the AI repair order details page
        this.router.navigate(['/repair-order', alertId]);
      },
      error: () => {
        this.generatingId.set(null);
        alert('Failed to generate AI repair order. Please retry.');
      }
    });
  }
}
