import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Part } from '../services/mock-api.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <!-- Overview stats -->
      <div class="grid-cols-3 mb-4">
        <div class="glass-card stat-tile">
          <span class="tile-label">Total Unique Parts</span>
          <span class="tile-val mt-1 font-display">{{ totalParts() }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Low Stock Alerts</span>
          <span class="tile-val mt-1 text-warning font-display">{{ lowStockCount() }}</span>
        </div>
        <div class="glass-card stat-tile">
          <span class="tile-label">Inventory Net Valuation</span>
          <span class="tile-val mt-1 text-cyan font-display">₹{{ totalValue() | number }}</span>
        </div>
      </div>

      <!-- Header actions -->
      <div class="page-header-actions mb-4">
        <div class="search-filters">
          <input 
            type="text" 
            class="form-control filter-search" 
            placeholder="Search parts by name or model number..." 
            (input)="onSearch($event)"
          />
        </div>
        
        <div class="stock-alerts-banner badge-warning badge" *ngIf="lowStockCount() > 0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Warning: {{ lowStockCount() }} parts are running below safety threshold!
        </div>
      </div>

      <!-- Parts Inventory Table -->
      <div class="glass-panel p-0">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Part Name</th>
                <th>In Stock</th>
                <th>Unit Price</th>
                <th>Subtotal Value</th>
                <th>Warehouse Rack</th>
                <th>Reorder Trigger</th>
                <th class="text-right">Stock Control</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let part of filteredParts()">
                <td class="font-mono text-bold">{{ part.partNumber }}</td>
                <td>{{ part.name }}</td>
                <td>
                  <span class="text-bold" [ngClass]="part.stock <= part.minThreshold ? 'text-danger' : 'text-primary'">
                    {{ part.stock }} units
                  </span>
                </td>
                <td class="font-mono">₹{{ part.price }}</td>
                <td class="font-mono text-bold text-cyan">₹{{ (part.stock * part.price) | number }}</td>
                <td class="font-mono">{{ part.rackLocation }}</td>
                <td>
                  <span class="badge" [ngClass]="part.stock <= part.minThreshold ? 'badge-danger' : 'badge-success'">
                    {{ part.stock <= part.minThreshold ? 'Low Stock' : 'Sufficient' }}
                  </span>
                </td>
                <td class="text-right stock-actions">
                  <button class="btn btn-secondary btn-sm-icon" (click)="adjustStock(part.id, -1)" [disabled]="part.stock === 0">-</button>
                  <span class="adjust-label font-mono">{{ part.stock }}</span>
                  <button class="btn btn-secondary btn-sm-icon" (click)="adjustStock(part.id, 1)">+</button>
                </td>
              </tr>
              <tr *ngIf="filteredParts().length === 0">
                <td colspan="8" class="text-center py-4 text-muted">No spare parts matched search query.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-container {
      display: flex;
      flex-direction: column;
    }
    
    .page-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .search-filters {
      flex: 1;
      max-width: 440px;
    }
    
    .stock-alerts-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      padding: 8px 16px;
    }
    
    .alert-icon {
      animation: flash 1s infinite alternate;
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
    
    /* Stock control */
    .stock-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .btn-sm-icon {
      width: 24px;
      height: 24px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .adjust-label {
      min-width: 24px;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    @keyframes flash {
      from { opacity: 0.7; }
      to { opacity: 1; }
    }
  `]
})
export class InventoryComponent implements OnInit {
  parts = signal<Part[]>([]);
  filteredParts = signal<Part[]>([]);

  // Overview summary metrics
  totalParts = signal(0);
  lowStockCount = signal(0);
  totalValue = signal(0);

  searchQuery = '';

  constructor(private mockApi: MockApiService) { }

  ngOnInit() {
    this.loadParts();
  }

  loadParts() {
    this.mockApi.getParts().subscribe(parts => {
      this.parts.set(parts);
      this.applyFilters();
      this.calculateSummary(parts);
    });
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.parts();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q));
    }
    this.filteredParts.set(result);
  }

  calculateSummary(parts: Part[]) {
    this.totalParts.set(parts.length);
    this.lowStockCount.set(parts.filter(p => p.stock <= p.minThreshold).length);

    const value = parts.reduce((sum, p) => sum + (p.stock * p.price), 0);
    this.totalValue.set(value);
  }

  adjustStock(partId: string, delta: number) {
    this.mockApi.updatePartStock(partId, delta).subscribe(() => {
      this.loadParts();
    });
  }
}
