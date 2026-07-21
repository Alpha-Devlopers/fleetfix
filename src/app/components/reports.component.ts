import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { MockApiService } from '../services/mock-api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <!-- Selectors Panel -->
      <div class="glass-card mb-4">
        <div class="flex justify-between items-center gap-4 flex-wrap">
          <div class="flex gap-4">
            <div class="form-group mb-0">
              <label class="form-label" for="reportType">Report Scope</label>
              <select id="reportType" class="form-control filter-select" (change)="onReportTypeChange($event)">
                <option value="Fleet">Fleet Operations Report</option>
                <option value="Maintenance">Maintenance Cost Logs</option>
                <option value="Driver">Driver Performance Report</option>
                <option value="Vehicle">Individual Vehicle Report</option>
              </select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label" for="timeRange">Date Range</label>
              <select id="timeRange" class="form-control filter-select">
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last 12 Months</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-secondary" (click)="exportFile('excel')" [disabled]="exporting()">
              <span *ngIf="!exporting() || currentFormat() !== 'excel'">Export to Excel</span>
              <span *ngIf="exporting() && currentFormat() === 'excel'" class="flex items-center gap-2">
                <div class="spinner-small"></div> Exporting...
              </span>
            </button>
            <button class="btn btn-primary" (click)="exportFile('pdf')" [disabled]="exporting()">
              <span *ngIf="!exporting() || currentFormat() !== 'pdf'">Download PDF</span>
              <span *ngIf="exporting() && currentFormat() === 'pdf'" class="flex items-center gap-2">
                <div class="spinner-small"></div> Preparing...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Stats Cards -->
      <div class="grid-cols-4 mb-4" *ngIf="activeReport() === 'Fleet' || activeReport() === 'Vehicle'">
        <div class="glass-card stat-tile">
          <span class="tile-label">Total Fleet Distance</span>
          <span class="tile-val mt-1 font-display">24,580 km</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Fleet Fuel Consumption</span>
          <span class="tile-val mt-1 font-display">28.4 L/100km</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Average Safety Score</span>
          <span class="tile-val mt-1 text-cyan font-display">4.65 / 5.0</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Total Dispatch Orders</span>
          <span class="tile-val mt-1 font-display">84 Runs</span>
        </div>
      </div>

      <div class="grid-cols-4 mb-4" *ngIf="activeReport() === 'Maintenance'">
        <div class="glass-card stat-tile">
          <span class="tile-label">Total Repair Cost</span>
          <span class="tile-val mt-1 font-display">₹8,45,000</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Scheduled Maintenance</span>
          <span class="tile-val mt-1 text-green font-display">12 Jobs</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Unscheduled Breakdowns</span>
          <span class="tile-val mt-1 text-danger font-display">3 incidents</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Resolved Fault Alerts</span>
          <span class="tile-val mt-1 text-cyan font-display">18 Cleared</span>
        </div>
      </div>

      <!-- Charts Viewports -->
      <div class="reports-grid">
        <div class="glass-card chart-card flex-1">
          <h3>{{ getChartTitleLeft() }}</h3>
          <div class="chart-container">
            <canvas #chartLeft></canvas>
          </div>
        </div>

        <div class="glass-card chart-card flex-1">
          <h3>{{ getChartTitleRight() }}</h3>
          <div class="chart-container">
            <canvas #chartRight></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      display: flex;
      flex-direction: column;
    }
    
    .filter-select {
      height: 38px;
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
    }
    
    /* Charts Grid */
    .reports-grid {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    
    .chart-card {
      min-height: 340px;
      display: flex;
      flex-direction: column;
      
      h3 {
        font-size: 0.95rem;
        margin-bottom: 20px;
        color: var(--text-secondary);
      }
    }
    
    .chart-container {
      position: relative;
      flex: 1;
      width: 100%;
      height: 240px;
    }
    
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
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('chartLeft') chartLeftRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartRight') chartRightRef!: ElementRef<HTMLCanvasElement>;

  activeReport = signal<'Fleet' | 'Maintenance' | 'Driver' | 'Vehicle'>('Fleet');
  
  exporting = signal(false);
  currentFormat = signal<'excel' | 'pdf' | null>(null);

  // Dynamic Chart labels seeded from vehicles database
  vehiclesPlates: string[] = ['AP39TX4587', 'TS09AB6721', 'AP16CD9870', 'TS11GH2456'];
  driverNames: string[] = ['Sai Kiran', 'Venkatesh Reddy', 'Ravi Teja', 'Mahesh Reddy'];

  // Chart instances
  private chart1: Chart | null = null;
  private chart2: Chart | null = null;

  constructor(private mockApi: MockApiService) {}

  ngOnInit() {
    this.mockApi.getVehicles().subscribe(list => {
      if (list.length > 0) {
        this.vehiclesPlates = list.map(v => v.plate);
        this.driverNames = list.map(v => v.driverName || 'Unassigned');
        // Redraw charts dynamically if already in view
        if (this.chartLeftRef && this.chartRightRef) {
          this.renderCharts();
        }
      }
    });
  }

  ngAfterViewInit() {
    this.renderCharts();
  }

  onReportTypeChange(event: any) {
    this.activeReport.set(event.target.value);
    this.renderCharts();
  }

  getChartTitleLeft(): string {
    switch (this.activeReport()) {
      case 'Fleet': return 'Fleet Vehicle Utilization (%)';
      case 'Maintenance': return 'Monthly Maintenance Expenditure (₹)';
      case 'Driver': return 'Driver Performance Ratings';
      default: return 'Fuel Efficiency History (L/100km)';
    }
  }

  getChartTitleRight(): string {
    switch (this.activeReport()) {
      case 'Fleet': return 'Distance Driven by vehicle (km)';
      case 'Maintenance': return 'Type of Repair Breakdown';
      case 'Driver': return 'Total distance driven (km)';
      default: return 'Weekly Odometer Increments';
    }
  }

  renderCharts() {
    // Destroy previous instances to avoid canvas overlay bugs
    if (this.chart1) this.chart1.destroy();
    if (this.chart2) this.chart2.destroy();

    const ctx1 = this.chartLeftRef.nativeElement.getContext('2d');
    const ctx2 = this.chartRightRef.nativeElement.getContext('2d');

    if (!ctx1 || !ctx2) return;

    const report = this.activeReport();

    // Chart 1 Render
    if (report === 'Fleet') {
      this.chart1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Utilization %',
            data: [72, 85, 78, 92],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: this.getChartOptions()
      });
    } else if (report === 'Maintenance') {
      this.chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Expenditure (₹)',
            data: [120000, 85000, 240000, 150000, 60000, 190000],
            backgroundColor: '#6366f1'
          }]
        },
        options: this.getChartOptions()
      });
    } else if (report === 'Driver') {
      this.chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: this.driverNames,
          datasets: [{
            label: 'Driver Safety Rating',
            data: [4.8, 4.6, 4.2, 4.9],
            backgroundColor: '#10b981'
          }]
        },
        options: this.getChartOptions()
      });
    } else {
      // Vehicle
      this.chart1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Consumption',
            data: [28.2, 29.5, 27.8, 30.1, 28.5, 24.2, 25.0],
            borderColor: '#f59e0b',
            tension: 0.4
          }]
        },
        options: this.getChartOptions()
      });
    }

    // Chart 2 Render
    if (report === 'Fleet') {
      this.chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: this.vehiclesPlates,
          datasets: [{
            label: 'Distance (km)',
            data: [4500, 6200, 2900, 5400],
            backgroundColor: '#a855f7'
          }]
        },
        options: this.getChartOptions()
      });
    } else if (report === 'Maintenance') {
      this.chart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Engine/Fluids', 'Exhaust/Emission', 'Brakes/Lines', 'Tires/Suspension'],
          datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: ['#6366f1', '#06b6d4', '#ef4444', '#f59e0b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8' }
            }
          }
        }
      });
    } else if (report === 'Driver') {
      this.chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: this.driverNames,
          datasets: [{
            label: 'Total Distance Driven (km)',
            data: [12500, 9400, 16000, 11000],
            backgroundColor: '#06b6d4'
          }]
        },
        options: this.getChartOptions()
      });
    } else {
      this.chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Odometer Inc. (km)',
            data: [850, 1200, 950, 1100],
            backgroundColor: '#6366f1'
          }]
        },
        options: this.getChartOptions()
      });
    }
  }

  getChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
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

  exportFile(format: 'excel' | 'pdf') {
    this.exporting.set(true);
    this.currentFormat.set(format);

    setTimeout(() => {
      this.exporting.set(false);
      this.currentFormat.set(null);
      alert(`Report downloaded successfully in ${format === 'excel' ? 'Excel (.xlsx)' : 'PDF (.pdf)'} format!`);
    }, 1500);
  }
}
