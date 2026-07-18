import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Vehicle } from '../services/mock-api.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracking-layout">
      <!-- Sidebar List -->
      <div class="map-sidebar glass-panel">
        <div class="sidebar-header">
          <h3>Active Fleet Directory</h3>
          <span class="badge badge-success">{{ activeCount() }} Running</span>
        </div>
        <div class="vehicle-mini-list">
          <div 
            class="mini-item flex gap-3 items-center" 
            *ngFor="let vehicle of vehicles()" 
            [class.selected]="selectedVehicleId() === vehicle.id"
            (click)="selectVehicle(vehicle)"
          >
            <!-- Vehicle Image Thumbnail -->
            <img [src]="vehicle.image" alt="Truck" class="mini-vehicle-thumb" />

            <div class="flex-col flex-1 min-w-0">
              <div class="flex justify-between items-center w-full">
                <span class="font-mono text-bold truncate">{{ vehicle.plate }}</span>
                <span class="badge badge-sm" [ngClass]="getStatusBadgeClass(vehicle.status)">
                  {{ vehicle.status === 'Idle' ? 'Stopped' : vehicle.status }}
                </span>
              </div>
              <div class="mini-meta mt-1 flex justify-between items-center text-xs">
                <span class="truncate text-muted">{{ vehicle.model }}</span>
                <span class="font-bold text-cyan">{{ vehicle.status === 'Running' ? vehicle.currentSpeed + ' km/h' : '0 km/h' }}</span>
              </div>
              <!-- Driver info row -->
              <div class="mini-driver-row mt-1 flex items-center gap-2">
                <img [src]="vehicle.driverPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'" alt="Driver" class="mini-driver-avatar" />
                <span class="text-xs text-muted truncate">{{ vehicle.driverName || 'Unassigned' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-view-container glass-panel">
        <div id="map" class="leaflet-map-element"></div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-layout {
      display: flex;
      gap: 20px;
      height: calc(100vh - 150px);
      min-height: 520px;
      
      @media (max-width: 900px) {
        flex-direction: column-reverse;
      }
    }
    
    .map-sidebar {
      width: 330px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      padding: 0;
      overflow: hidden;
      
      @media (max-width: 900px) {
        width: 100%;
        height: 250px;
      }
    }
    
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 { margin-bottom: 0; font-size: 0.95rem; }
    }
    
    .vehicle-mini-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .mini-item {
      padding: 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(99, 102, 241, 0.2);
      }
      
      &.selected {
        background: rgba(99, 102, 241, 0.08);
        border-color: var(--color-primary);
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
      }
    }
    
    .mini-vehicle-thumb {
      width: 55px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .mini-driver-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      object-fit: cover;
    }

    .mini-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    /* Map Container */
    .map-view-container {
      flex: 1;
      padding: 0;
      overflow: hidden;
      position: relative;
      
      @media (max-width: 900px) {
        height: 400px;
        width: 100%;
      }
    }
    
    .leaflet-map-element {
      width: 100%;
      height: 100%;
      z-index: 10;
    }

    /* Custom DivIcon Markers styles inside Leaflet */
    ::ng-deep {
      .map-truck-marker {
        width: 32px;
        height: 32px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .marker-core {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          border: 2px solid white;
          z-index: 2;
        }
        
        .marker-pulse {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          opacity: 0.6;
          animation: mapPulse 2s infinite;
          z-index: 1;
        }
        
        &.status-running {
          .marker-core { background: var(--gradient-accent); }
          .marker-pulse { background: rgba(6, 182, 212, 0.4); }
        }
        &.status-idle {
          .marker-core { background: var(--gradient-primary); }
          .marker-pulse { background: rgba(99, 102, 241, 0.4); }
        }
        &.status-maintenance {
          .marker-core { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
          .marker-pulse { background: rgba(245, 158, 11, 0.4); }
        }
        &.status-out {
          .marker-core { background: var(--gradient-danger); }
          .marker-pulse { background: rgba(239, 68, 68, 0.4); }
        }
      }
      
      @keyframes mapPulse {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.4); opacity: 0; }
      }

      /* Dark theme popup bubbles */
      .leaflet-popup-content-wrapper {
        background: #111729 !important;
        color: #f8fafc !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        padding: 0 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
      }
      .leaflet-popup-tip {
        background: #111729 !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      .leaflet-container a.leaflet-popup-close-button {
        color: #94a3b8 !important;
        font-size: 16px !important;
        top: 8px !important;
        right: 8px !important;
      }
    }
  `]
})
export class TrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markersMap = new Map<string, L.Marker>();
  private sub?: Subscription;

  vehicles = signal<Vehicle[]>([]);
  activeCount = signal(0);
  selectedVehicleId = signal<string | null>(null);

  constructor(private mockApi: MockApiService) {}

  ngOnInit() {
    this.sub = this.mockApi.getVehicles().subscribe(vehicles => {
      this.vehicles.set(vehicles);
      this.activeCount.set(vehicles.filter(v => v.status === 'Running').length);
      this.updateMarkersOnMap(vehicles);
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  initMap() {
    // Center map on India (Mumbai/Central logistics networks)
    this.map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([20.5937, 78.9629], 5);

    // Dark-themed tiles for premium logistics visual looks
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    // Initial markers load
    this.updateMarkersOnMap(this.vehicles());
  }

  updateMarkersOnMap(vehicles: Vehicle[]) {
    if (!this.map) return;

    vehicles.forEach(vehicle => {
      const latLng: L.LatLngExpression = [vehicle.latitude, vehicle.longitude];
      
      const customHtml = `
        <div class="map-truck-marker status-${vehicle.status === 'Out of Service' ? 'out' : vehicle.status.toLowerCase()}">
          <div class="marker-pulse"></div>
          <div class="marker-core">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        html: customHtml,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (this.markersMap.has(vehicle.id)) {
        const marker = this.markersMap.get(vehicle.id)!;
        marker.setLatLng(latLng);
        marker.setIcon(divIcon);
        marker.setPopupContent(this.createPopupContent(vehicle));
      } else {
        const marker = L.marker(latLng, { icon: divIcon })
          .addTo(this.map)
          .bindPopup(this.createPopupContent(vehicle));
          
        marker.on('click', () => {
          this.selectedVehicleId.set(vehicle.id);
        });

        this.markersMap.set(vehicle.id, marker);
      }
    });

    // remove deleted vehicles
    const activeIds = new Set(vehicles.map(v => v.id));
    this.markersMap.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        this.markersMap.delete(id);
      }
    });
  }

  createPopupContent(vehicle: Vehicle): string {
    return `
      <div style="font-family: 'Inter', sans-serif; padding: 0; min-width: 230px; color: #f8fafc;">
        <div style="width: 100%; height: 95px; background: #0f172a; overflow: hidden; border-radius: 6px 6px 0 0; position: relative;">
          <img src="${vehicle.image}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" />
          <span style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; background: ${vehicle.status === 'Running' ? '#10b981' : (vehicle.status === 'Idle' ? '#06b6d4' : '#f59e0b')}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
            ${vehicle.status === 'Idle' ? 'Stopped' : vehicle.status}
          </span>
        </div>
        <div style="padding: 10px; background: #111729; border-radius: 0 0 6px 6px;">
          <h4 style="margin: 0 0 8px 0; font-weight: 700; font-size: 0.875rem; color: #ffffff; font-family: monospace;">${vehicle.plate}</h4>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <img src="${vehicle.driverPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.725rem; color: #94a3b8; font-weight: 500;">Driver</span>
              <span style="font-size: 0.775rem; color: #e2e8f0; font-weight: 600;">${vehicle.driverName || 'Unassigned'}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.75rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.65rem; text-transform: uppercase;">Speed</span>
              <span style="color: #38bdf8; font-weight: 700;">${vehicle.status === 'Running' ? vehicle.currentSpeed + ' km/h' : '0 km/h'}</span>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.65rem; text-transform: uppercase;">Fuel</span>
              <span style="color: #fbbf24; font-weight: 700;">${vehicle.fuelLevel}%</span>
            </div>
            <div style="grid-column: span 2; margin-top: 4px;">
              <span style="color: #94a3b8; display: block; font-size: 0.65rem; text-transform: uppercase;">Odometer</span>
              <span style="color: #e2e8f0; font-family: monospace;">${Math.round(vehicle.odometer).toLocaleString()} km</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicleId.set(vehicle.id);
    if (this.map) {
      this.map.flyTo([vehicle.latitude, vehicle.longitude], 12, {
        animate: true,
        duration: 1.5
      });
      
      const marker = this.markersMap.get(vehicle.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Running': return 'badge-success';
      case 'Idle': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      default: return 'badge-danger';
    }
  }
}
