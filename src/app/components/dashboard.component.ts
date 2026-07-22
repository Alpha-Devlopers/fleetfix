import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockApiService, User, Vehicle, FaultAlert } from '../services/mock-api.service';
import { Subscription } from 'rxjs';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Personalized Welcome Banner -->
      <div class="glass-card welcome-banner mb-4" *ngIf="currentUser">
        <div class="welcome-content-wrapper">
          <img [src]="currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" alt="User Avatar" class="welcome-avatar" />
          <div class="welcome-text-details">
            <h2>Welcome, {{ currentUser.name }}</h2>
            <p class="role-desc">Role: <span class="role-highlight">{{ getRoleLabel(currentUser.role) }}</span> | System Status: Active</p>
          </div>
          <div class="welcome-meta-details ml-auto text-right">
            <span class="last-login-label">Last Login: {{ lastLoginTime }}</span>
          </div>
        </div>
      </div>

      <!-- KPI Stats Grid -->
      <div class="grid-cols-4 gap-4 mb-4">
        <div class="glass-card kpi-card">
          <div class="kpi-icon total">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Total Vehicles</span>
            <span class="kpi-value">{{ totalVehicles() }}</span>
            <span class="kpi-trend positive">Fleet Inventory</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon running">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Active Vehicles</span>
            <span class="kpi-value">{{ activeVehicles() }}</span>
            <span class="kpi-trend positive">In Transit</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon health">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Drivers on Duty</span>
            <span class="kpi-value">{{ driversOnDuty() }}</span>
            <span class="kpi-trend positive">Assigned Trips</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon alerts" [class.has-critical]="vehiclesUnderRepair() > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Vehicles Under Repair</span>
            <span class="kpi-value">{{ vehiclesUnderRepair() }}</span>
            <span class="kpi-trend" [ngClass]="vehiclesUnderRepair() > 0 ? 'negative' : 'positive'">Workshop Bay</span>
          </div>
        </div>
      </div>

      <div class="grid-cols-4 gap-4 mb-4">
        <div class="glass-card kpi-card">
          <div class="kpi-icon running">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Maintenance Due</span>
            <span class="kpi-value">{{ maintenanceDue() }}</span>
            <span class="kpi-trend positive">Scheduled</span>
          </div>
        </div>

        <div class="glass-card kpi-card" [routerLink]="['/diagnostics']">
          <div class="kpi-icon alerts" [class.has-critical]="faultAlerts() > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Fault Alerts</span>
            <span class="kpi-value">{{ faultAlerts() }}</span>
            <span class="kpi-trend" [ngClass]="faultAlerts() > 0 ? 'negative' : 'positive'">OBD-II DTCs</span>
          </div>
        </div>

        <div class="glass-card kpi-card" [routerLink]="['/inventory']">
          <div class="kpi-icon total">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Available Spare Parts</span>
            <span class="kpi-value">{{ availableSpareParts() }}</span>
            <span class="kpi-trend positive">Inventory Stock</span>
          </div>
        </div>

        <div class="glass-card kpi-card">
          <div class="kpi-icon health">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Today's Repairs</span>
            <span class="kpi-value">{{ todaysRepairs() }}</span>
            <span class="kpi-trend positive">Jobs Completed</span>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div class="dashboard-grid">
        <!-- Mileage Chart Card -->
        <div class="glass-card chart-card flex-1">
          <h3>Fleet Operations - Weekly Distance Corridor (km)</h3>
          <div class="chart-container">
            <canvas id="mileageChart"></canvas>
          </div>
        </div>

        <!-- Fuel efficiency Chart -->
        <div class="glass-card chart-card flex-1">
          <h3>Individual Fuel Economy (L/100km)</h3>
          <div class="chart-container">
            <canvas id="fuelChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Layout split: Diagnostics & Maintenance -->
      <div class="dashboard-split mt-4">
        <!-- Recent Fault Alerts -->
        <div class="glass-card table-card flex-1">
          <div class="flex justify-between items-center mb-4">
            <h3>Active Diagnostic Faults (OBD-II Codes)</h3>
            <a routerLink="/diagnostics" class="btn btn-secondary btn-sm-text">Inspect All</a>
          </div>
          <div class="table-container">
            <table class="custom-table text-left">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>DTC</th>
                  <th>Severity</th>
                  <th>Time Detected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let alert of activeAlertsList">
                  <td>
                    <div class="flex items-center gap-2">
                      <img [src]="alert.vehicleImage" alt="Vehicle" style="width: 38px; height: 28px; border-radius: 4px; object-fit: cover;" />
                      <div class="flex flex-col">
                        <div class="text-bold" style="font-size: 0.85rem; color: var(--text-primary);">{{ alert.vehicleModel }}</div>
                        <div class="text-muted font-mono" style="font-size: 0.725rem;">{{ alert.vehiclePlate }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-bold text-red">{{ alert.dtc }}</td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + alert.severity.toLowerCase()">{{ alert.severity }}</span>
                  </td>
                  <td>{{ alert.time }}</td>
                  <td>
                    <span class="badge" [ngClass]="alert.status === 'Resolved' ? 'badge-success' : 'badge-warning'">
                      {{ alert.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="activeAlertsList.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">No diagnostic issues detected in Indian operations.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Maintenance List -->
        <div class="glass-card list-card flex-1">
          <div class="flex justify-between items-center mb-4">
            <h3>Upcoming Indian Fleet Servicing</h3>
            <a routerLink="/vehicles" class="btn btn-secondary btn-sm-text">Schedules</a>
          </div>
          <div class="maintenance-list">
            <div class="maintenance-item" *ngFor="let item of maintenanceList">
              <img [src]="item.image" alt="Truck" style="width: 44px; height: 34px; border-radius: 4px; object-fit: cover; flex-shrink: 0;" />
              <div class="m-details">
                <div class="m-title">{{ item.plate }} &bull; {{ item.model }}</div>
                <div class="m-desc flex items-center gap-1 mt-1 text-xs text-muted">
                  <img [src]="item.driverPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'" alt="Driver" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" />
                  <span>Odo: {{ item.odometer | number }} km &bull; Operator: {{ item.driverName || 'Depot' }}</span>
                </div>
              </div>
              <div class="m-date font-mono">
                Due: {{ item.nextMaintenance }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
    }
    
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      
      &:hover { transform: translateY(-3px); }
    }
    
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      &.total { background: rgba(99, 102, 241, 0.1); color: var(--color-primary); }
      &.running { background: rgba(6, 182, 212, 0.1); color: var(--color-secondary); }
      &.alerts { 
        background: rgba(16, 185, 129, 0.1); color: var(--color-success); 
        &.has-critical { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); animation: pulse 2s infinite; }
      }
      &.health { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    }
    
    .kpi-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      
      .kpi-title { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; }
      .kpi-value { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
      .kpi-trend { font-size: 0.725rem; font-weight: 600; &.positive { color: var(--color-success); } &.negative { color: var(--color-danger); } }
    }
    
    .health-progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      margin-top: 6px;
      width: 100%;
      overflow: hidden;
      
      .fill {
        height: 100%;
        border-radius: 2px;
        transition: width 1s ease-in-out;
        
        &.health-good { background: var(--color-success); }
        &.health-warn { background: var(--color-warning); }
        &.health-poor { background: var(--color-danger); }
      }
    }

    .dashboard-grid {
      display: flex;
      gap: 20px;
      @media (max-width: 1024px) { flex-direction: column; }
    }
    
    .chart-card {
      min-height: 320px;
      display: flex;
      flex-direction: column;
      h3 { font-size: 0.95rem; margin-bottom: 20px; color: var(--text-secondary); }
    }
    
    .chart-container {
      position: relative;
      flex: 1;
      width: 100%;
      height: 220px;
    }
    
    .dashboard-split {
      display: flex;
      gap: 20px;
      @media (max-width: 1024px) { flex-direction: column; }
    }
    
    .btn-sm-text { padding: 6px 12px; font-size: 0.75rem; }
    .text-red { color: var(--color-danger); font-weight: 700; }
    
    .maintenance-list { display: flex; flex-direction: column; gap: 12px; }
    
    .maintenance-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      
      .m-details {
        flex: 1;
        .m-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
        .m-desc { font-size: 0.75rem; color: var(--text-muted); }
      }
      .m-date { font-size: 0.75rem; color: var(--text-secondary); }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .welcome-banner {
      padding: 16px 24px;
      .welcome-content-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .welcome-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-primary);
      }
      .welcome-text-details {
        h2 { font-size: 1.2rem; margin-bottom: 2px; font-family: var(--font-display); }
        .role-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0;
          .role-highlight { color: var(--color-primary); font-weight: 600; }
        }
      }
      .welcome-meta-details {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Signals for state binding
  totalVehicles = signal(0);
  activeVehicles = signal(0);
  driversOnDuty = signal(0);
  vehiclesUnderRepair = signal(0);
  maintenanceDue = signal(0);
  faultAlerts = signal(0);
  availableSpareParts = signal(0);
  todaysRepairs = signal(0);

  activeAlertsList: any[] = [];
  maintenanceList: Vehicle[] = [];

  currentUser: User | null = null;
  lastLoginTime: string = '';

  private sub?: Subscription;
  private mileageChartInst: Chart | null = null;
  private fuelChartInst: Chart | null = null;

  constructor(private mockApi: MockApiService) {}

  getRoleLabel(role: string | undefined): string {
    if (!role) return '';
    if (role === 'fleet-owner') return 'Fleet Owner (Customer)';
    if (role === 'service-center') return 'Service Center (Shopkeeper)';
    if (role === 'admin') return 'System Administrator';
    return role;
  }

  ngOnInit() {
    this.mockApi.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        const now = new Date();
        this.lastLoginTime = now.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', today';
      }
    });

    this.sub = this.mockApi.getVehicles().subscribe(vehicles => {
      this.totalVehicles.set(vehicles.length);
      const active = vehicles.filter(v => v.status === 'Running').length;
      this.activeVehicles.set(active);
      this.vehiclesUnderRepair.set(vehicles.filter(v => v.status === 'Maintenance').length);
      this.maintenanceDue.set(vehicles.filter(v => v.health < 85 || v.maintenanceStatus?.includes('Due')).length);
      
      // Servicing list (health under 85 or Maintenance Status)
      this.maintenanceList = vehicles.filter(v => v.health < 85 || v.status === 'Maintenance').slice(0, 4);

      // Fetch drivers on duty
      this.mockApi.getDrivers().subscribe(drivers => {
        this.driversOnDuty.set(drivers.filter(d => d.status === 'On Trip').length);
      });

      // Fetch spare parts inventory
      this.mockApi.getParts().subscribe(parts => {
        const totalParts = parts.reduce((sum, p) => sum + p.stock, 0);
        this.availableSpareParts.set(totalParts);
      });

      // Map alerts with vehicle images
      this.mockApi.getFaultAlerts().subscribe(alerts => {
        const unres = alerts.filter(a => a.status !== 'Resolved').slice(0, 3);
        this.activeAlertsList = unres.map(a => {
          const matchingVehicle = vehicles.find(v => v.id === a.vehicleId);
          return {
            ...a,
            vehicleImage: matchingVehicle?.image,
            driverPhoto: matchingVehicle?.driverPhoto,
            driverName: matchingVehicle?.driverName
          } as any;
        });
        this.faultAlerts.set(alerts.filter(a => a.status === 'Unresolved').length);
        this.todaysRepairs.set(alerts.filter(a => a.status === 'Resolved').length || 4);
      });

      // Render charts dynamically after data is bound
      setTimeout(() => {
        this.renderCharts(vehicles);
      }, 50);
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.mileageChartInst) this.mileageChartInst.destroy();
    if (this.fuelChartInst) this.fuelChartInst.destroy();
  }

  getHealthClass(val: number): string {
    if (val >= 85) return 'health-good';
    if (val >= 60) return 'health-warn';
    return 'health-poor';
  }

  private renderCharts(vehicles: Vehicle[]) {
    // 1. Mileage Chart
    const milCanvas = document.getElementById('mileageChart') as HTMLCanvasElement;
    if (milCanvas) {
      if (this.mileageChartInst) this.mileageChartInst.destroy();
      const ctx = milCanvas.getContext('2d');
      if (ctx) {
        this.mileageChartInst = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Distance Driven (km)',
              data: [4200, 4650, 4900, 4380, 5250, 2450, 1200],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 3
            }]
          },
          options: this.getChartOptions()
        });
      }
    }

    // 2. Fuel Chart (First 6 Vehicles from dynamic list)
    const fuelCanvas = document.getElementById('fuelChart') as HTMLCanvasElement;
    if (fuelCanvas && vehicles.length > 0) {
      if (this.fuelChartInst) this.fuelChartInst.destroy();
      const ctx = fuelCanvas.getContext('2d');
      if (ctx) {
        const topVehicles = vehicles.slice(0, 6);
        const labels = topVehicles.map(v => v.plate);
        const values = topVehicles.map(v => v.type === 'Truck' ? 28.5 + (v.id.charCodeAt(3)%5) : 15.2 + (v.id.charCodeAt(3)%3));

        this.fuelChartInst = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Average L/100km',
              data: values,
              backgroundColor: '#06b6d4',
              borderRadius: 6
            }]
          },
          options: this.getChartOptions()
        });
      }
    }
  }

  private getChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };
  }
}
