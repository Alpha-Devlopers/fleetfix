import { Component, OnInit, signal, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, Vehicle, ServiceRecord, Driver, TripRecord, FaultAlert } from '../../services/mock-api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div *ngIf="vehicle()" class="vehicle-detail-layout">
      <!-- Header Area -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <a routerLink="/vehicles" class="btn btn-secondary btn-icon-sm" title="Back to list">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </a>
          <div>
            <h2 class="mb-0 font-display font-bold">{{ vehicle()?.plate }} &bull; {{ vehicle()?.model }}</h2>
            <span class="text-muted">Operator: {{ vehicle()?.company }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" (click)="showServiceForm.set(true)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Record Maintenance
          </button>
        </div>
      </div>

      <!-- Vehicle Cover Banner -->
      <div class="vehicle-banner-card glass-panel mb-4 p-0 overflow-hidden relative">
        <div class="banner-image-wrapper">
          <img [src]="vehicle()?.image" alt="Vehicle Banner" class="banner-img" />
          <div class="banner-overlay flex justify-between items-end p-4">
            <div class="banner-title-block">
              <span class="badge mb-2" [ngClass]="getStatusBadgeClass(vehicle()?.status || '')">
                {{ vehicle()?.status === 'Idle' ? 'Stopped' : vehicle()?.status }}
              </span>
              <h1 class="font-display font-bold text-white mb-0" style="margin: 0 0 4px 0;">{{ vehicle()?.plate }}</h1>
              <p class="text-secondary text-sm mb-0" style="margin: 0; opacity: 0.85;">{{ vehicle()?.model }}</p>
            </div>
            
            <!-- Driver quick details -->
            <div class="banner-driver-block bg-black bg-opacity-60 backdrop-blur-md p-3 rounded-xl border border-white border-opacity-10" style="background: rgba(0, 0, 0, 0.65); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;">
              <img [src]="vehicle()?.driverPhoto || '/images/drivers/sai_kiran.png'" alt="Driver Avatar" class="banner-driver-avatar" />
              <div class="flex-col" style="display: flex; flex-direction: column;">
                <span style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight:600;">Assigned Operator</span>
                <span class="text-sm font-bold text-white" style="font-size: 0.85rem; color: white; font-weight: 700; margin-top: 2px;">{{ vehicle()?.driverName || 'Depot Custodian' }}</span>
                <span class="text-xs text-secondary" style="font-size: 0.725rem; color: #cbd5e1; margin-top: 2px;" *ngIf="vehicle()?.driverPhone">{{ vehicle()?.driverPhone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pill Tabs Control Navigation -->
      <div class="details-tab-nav mb-4">
        <button class="tab-btn" [class.active]="activeTab() === 'overview'" (click)="setTab('overview')">Overview & GPS</button>
        <button class="tab-btn" [class.active]="activeTab() === 'driver'" (click)="setTab('driver')">Assigned Driver</button>
        <button class="tab-btn" [class.active]="activeTab() === 'telemetry'" (click)="setTab('telemetry')">Engine & Telemetry</button>
        <button class="tab-btn" [class.active]="activeTab() === 'history'" (click)="setTab('history')">Operations & History</button>
      </div>

      <!-- Tab Viewports -->
      <!-- 1. Overview & GPS Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'overview'">
        <div class="detail-grid-split">
          <!-- Left: Specifications & Document Vault -->
          <div class="flex-col flex-1 gap-4">
            <div class="glass-card">
              <h3 class="mb-4">Specifications</h3>
              <div class="spec-row">
                <span class="spec-label">Class Category:</span>
                <span class="spec-value">{{ vehicle()?.type }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Manufacturer Model:</span>
                <span class="spec-value">{{ vehicle()?.model }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Odometer Reading:</span>
                <span class="spec-value val-number font-mono">{{ vehicle()?.odometer | number }} km</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Manufacturing Year:</span>
                <span class="spec-value font-mono">{{ vehicle()?.manufacturingYear }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Last Serviced Date:</span>
                <span class="spec-value font-mono">{{ vehicle()?.lastService }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Logistics Company:</span>
                <span class="spec-value text-indigo">{{ vehicle()?.company }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">RC Number:</span>
                <span class="spec-value font-mono">{{ vehicle()?.rcNumber }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">RC Owner Name:</span>
                <span class="spec-value text-indigo">{{ vehicle()?.rcOwnerName }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">RC Validity:</span>
                <span class="spec-value font-mono">{{ vehicle()?.rcValidity }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Insurance Policy:</span>
                <span class="spec-value font-mono">{{ vehicle()?.insurancePolicy }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Insurer:</span>
                <span class="spec-value">{{ vehicle()?.insuranceProvider }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Insurance Validity:</span>
                <span class="spec-value font-mono">{{ vehicle()?.insuranceValidity }}</span>
              </div>
            </div>

            <div class="glass-card">
              <h3 class="mb-3">Vehicle Document Center</h3>
              <div class="doc-item">
                <div class="doc-info">
                  <span class="doc-name">National Route Permit</span>
                  <span class="doc-meta font-mono text-xs">ID: NP-{{ vehicle()?.plate }}-342</span>
                </div>
                <div class="doc-actions">
                  <span class="badge badge-success text-xs">Active</span>
                  <button class="btn-icon-xs ml-2" (click)="simulateDownload('National Permit')" title="Download Permit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>

              <div class="doc-item">
                <div class="doc-info">
                  <span class="doc-name">Fitness Certificate</span>
                  <span class="doc-meta font-mono text-xs">Valid till: 2028-11-20</span>
                </div>
                <div class="doc-actions">
                  <span class="badge badge-success text-xs">Active</span>
                  <button class="btn-icon-xs ml-2" (click)="simulateDownload('Fitness Certificate')" title="Download Fitness">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>

              <div class="doc-item">
                <div class="doc-info">
                  <span class="doc-name">Pollution Under Control (PUC)</span>
                  <span class="doc-meta font-mono text-xs">ID: PUC-{{ vehicle()?.plate }}-989</span>
                </div>
                <div class="doc-actions">
                  <span class="badge badge-success text-xs">Active</span>
                  <button class="btn-icon-xs ml-2" (click)="simulateDownload('Emission PUC')" title="Download PUC">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: GPS Telemetry Map & AI Insights -->
          <div class="flex-col flex-2 gap-4">
            <div class="glass-card p-0 overflow-hidden relative" style="min-height: 300px;">
              <div class="map-title-overlay">
                <span class="map-title-txt">GPS Tracker: {{ vehicle()?.location }}</span>
                <span class="map-subtitle font-mono">LAT: {{ vehicle()?.latitude?.toFixed(4) }} | LNG: {{ vehicle()?.longitude?.toFixed(4) }}</span>
              </div>
              <div id="detail-map" style="width: 100%; height: 300px; z-index: 1;"></div>
            </div>

            <!-- AI Insights Panel -->
            <div class="glass-card ai-insights-card">
              <div class="flex items-center gap-2 mb-3">
                <div class="ai-stars">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" fill="#a855f7"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <h3 class="mb-0 text-purple">AI Smart Diagnostics & Suggestions</h3>
              </div>
              <ul class="insights-list">
                <li *ngIf="vehicle()?.engineHealth === 'Oil Service Required'" class="insight-danger">
                  <strong>Critical:</strong> Engine oil viscosity is below threshold. Schedule immediate lubrication flush at Vijayawada hub.
                </li>
                <li *ngIf="vehicle()?.maintenanceStatus === 'Due in 15 Days'" class="insight-warning">
                  <strong>Warning:</strong> Next periodic routine diagnostics check is due in 15 days. Plan schedule bookings.
                </li>
                <li *ngIf="vehicle()?.status === 'Running' && (vehicle()?.fuelLevel || 0) < 50">
                  <strong>Telemetry Tip:</strong> Fuel is at {{ vehicle()?.fuelLevel }}%. Suggest refueling stop at NH-44 Toll Plaza.
                </li>
                <li>
                  <strong>Route Optimizer:</strong> Traffic congestion detected on Hyderabad bypass. Diverting through outer ring road saves 18 minutes.
                </li>
                <li>
                  <strong>General Status:</strong> Telemetry systems show all tires pressure, brake lining, and battery voltage levels in safe thresholds.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Assigned Driver Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'driver'">
        <div class="detail-grid-split" *ngIf="driver()">
          <!-- Driver Portrait Card -->
          <div class="glass-card flex-1 flex-col items-center justify-center text-center p-6">
            <img [src]="driver()?.avatarUrl" alt="Driver Profile Avatar" class="driver-portrait-large mb-4" />
            <h2>{{ driver()?.name }}</h2>
            <span class="badge mb-3" [ngClass]="driver()?.status === 'On Trip' ? 'badge-success' : 'badge-secondary'">
              {{ driver()?.status }}
            </span>
            <div class="flex items-center justify-center gap-1 text-warning mb-2" style="font-size: 1.1rem; font-weight: 700;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {{ driver()?.rating }} / 5.0
            </div>
            <span class="text-muted text-sm">Rating based on 150+ fleet logistics operations</span>
          </div>

          <!-- Driver Records details -->
          <div class="glass-card flex-2 flex-col gap-4">
            <h3 class="mb-3">Logistics Driver Credentials</h3>
            <div class="spec-row">
              <span class="spec-label">Commercial License Number:</span>
              <span class="spec-value font-mono text-cyan">{{ driver()?.licenseNo }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Assigned Phone Number:</span>
              <span class="spec-value">{{ driver()?.phone }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Driver Email Address:</span>
              <span class="spec-value font-mono">{{ driver()?.email }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Logistics Route Experience:</span>
              <span class="spec-value">{{ driver()?.experience }} Years of Active Heavy Trucking</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Operator Company:</span>
              <span class="spec-value">{{ vehicle()?.company }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Registration Join Date:</span>
              <span class="spec-value font-mono">{{ driver()?.joinDate }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Active Salary Tier:</span>
              <span class="spec-value text-green font-mono">₹{{ driver()?.salary | number }}/month</span>
            </div>
          </div>
        </div>
        
        <div class="glass-card text-center py-8" *ngIf="!driver()">
          <span class="text-muted">No assigned operator data loaded.</span>
        </div>
      </div>

      <!-- 3. Engine & Telemetry Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'telemetry'">
        <!-- Telemetry Gauges Grid -->
        <div class="grid-cols-3 mb-4">
          <div class="glass-card telemetry-stat">
            <span class="lbl font-semibold">ENGINE HEALTH</span>
            <div class="health-gauge-box my-3">
              <div class="pulse-ring-outer" [ngClass]="{'status-good': (vehicle()?.health || 0) >= 80, 'status-bad': (vehicle()?.health || 0) < 80}"></div>
              <span class="val" [style.color]="getHealthColor(vehicle()?.health || 100)">{{ vehicle()?.health }}%</span>
            </div>
            <span class="text-center font-display font-semibold text-sm">{{ vehicle()?.engineHealth }}</span>
          </div>

          <div class="glass-card telemetry-stat">
            <span class="lbl font-semibold">FUEL LEVEL PARAMETERS</span>
            <div class="fuel-level-display my-3">
              <div class="tank-progress-bar bg-cyan" [style.height.%]="vehicle()?.fuelLevel"></div>
              <span class="val text-cyan">{{ vehicle()?.fuelLevel }}%</span>
            </div>
            <span class="text-center font-display text-xs text-muted">Tank Volume: 320L | Est. Range: {{ (vehicle()?.fuelLevel || 0) * 8.5 | number:'1.0-0' }} km</span>
          </div>

          <div class="glass-card telemetry-stat">
            <span class="lbl font-semibold">COOLANT TEMPERATURE</span>
            <div class="temp-gauge-box my-3">
              <span class="val" [ngClass]="{'text-danger': (vehicle()?.engineTemp || 0) > 100}">{{ vehicle()?.engineTemp }}°C</span>
            </div>
            <span class="text-center font-display text-sm text-secondary">Status: {{ (vehicle()?.engineTemp || 0) > 100 ? 'Overheating' : 'Optimal Temperature' }}</span>
          </div>
        </div>

        <div class="detail-grid-split">
          <!-- Telemetry Telematics specs -->
          <div class="glass-card flex-1">
            <h3 class="mb-3">Live Telematics</h3>
            <div class="spec-row">
              <span class="spec-label">Live Telemetry GPS Speed:</span>
              <span class="spec-value font-mono">{{ vehicle()?.currentSpeed }} km/h</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Ignition Ignition Status:</span>
              <span class="spec-value">
                <span class="badge" [ngClass]="vehicle()?.engineStatus === 'Active' ? 'badge-success' : 'badge-secondary'">
                  {{ vehicle()?.engineStatus === 'Active' ? 'ON' : 'OFF' }}
                </span>
              </span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Avg. Consumption Rate:</span>
              <span class="spec-value font-mono">28.5 L/100km</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Battery Voltage:</span>
              <span class="spec-value font-mono text-cyan">24.6V (Normal)</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Air Brake Air Pressure:</span>
              <span class="spec-value font-mono">8.2 bar (Safe)</span>
            </div>
          </div>

          <!-- Active Alerts in Telemetry -->
          <div class="glass-card flex-1">
            <h3 class="mb-3">Active Diagnostic Trouble Codes (DTC)</h3>
            <div *ngIf="activeAlerts().length > 0" class="alerts-stack">
              <div class="alert-dtc-item border-danger" *ngFor="let alert of activeAlerts()">
                <div class="flex justify-between items-center mb-1">
                  <span class="font-mono text-bold text-danger">{{ alert.dtc }}</span>
                  <span class="badge badge-danger text-xs">{{ alert.severity }}</span>
                </div>
                <p class="text-sm mb-0">{{ alert.description }}</p>
                <span class="text-xs text-muted font-mono mt-1 block">Detected: {{ alert.time }}</span>
              </div>
            </div>
            <div *ngIf="activeAlerts().length === 0" class="no-alerts-card flex items-center justify-center p-8 text-center border border-dashed rounded-lg" style="border: 1px dashed var(--border-color); border-radius: 8px;">
              <span class="text-muted">No diagnostic trouble codes detected in engine ECU module.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Operations & History Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'history'">
        <div class="flex-col gap-4">
          <!-- Maintenance Table -->
          <div class="glass-card">
            <div class="flex justify-between items-center mb-3">
              <h3>Maintenance Cost Logs</h3>
            </div>
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Maintenance Action</th>
                    <th>Total Cost</th>
                    <th>Service Workshop</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let record of serviceRecords()">
                    <td class="text-nowrap font-mono">{{ record.date }}</td>
                    <td>{{ record.description }}</td>
                    <td class="font-mono text-bold text-green">₹{{ record.cost | number }}</td>
                    <td>{{ record.mechanic }}</td>
                  </tr>
                  <tr *ngIf="serviceRecords().length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">No maintenance history registered.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Trip History Table -->
          <div class="glass-card">
            <h3>Recent Trip History</h3>
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route Highway</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let trip of driverTrips()">
                    <td class="font-mono">{{ trip.id }}</td>
                    <td>{{ trip.route }}</td>
                    <td class="font-mono text-bold">{{ trip.distance }} km</td>
                    <td class="font-mono">{{ trip.duration }}</td>
                    <td>
                      <span class="badge" [ngClass]="trip.status === 'Completed' ? 'badge-success' : (trip.status === 'Active' ? 'badge-info' : 'badge-danger')">
                        {{ trip.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="driverTrips().length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No recent trip records registered.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Service Record Overlay Modal -->
      <div class="modal-overlay" *ngIf="showServiceForm()" (click)="showServiceForm.set(false)">
        <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Record Completed Maintenance</h3>
            <button class="btn-close-modal" (click)="showServiceForm.set(false)">&times;</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="serviceForm" (ngSubmit)="onServiceSubmit()">
              <div class="form-group">
                <label class="form-label" for="date">Completion Date</label>
                <input id="date" type="date" class="form-control" formControlName="date" />
              </div>

              <div class="form-group">
                <label class="form-label" for="description">Work Performed Description</label>
                <textarea id="description" class="form-control" formControlName="description" rows="3" placeholder="e.g. Changed air filter, brake caliper replacement..."></textarea>
              </div>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="cost">Total Cost (₹)</label>
                  <input id="cost" type="number" class="form-control" formControlName="cost" />
                </div>

                <div class="form-group">
                  <label class="form-label" for="mechanic">Mechanic / Service Shop</label>
                  <input id="mechanic" type="text" class="form-control" formControlName="mechanic" placeholder="e.g. Apex Diagnostics" />
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="serviceForm.invalid">
                Record Service Action
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!vehicle()" class="loading-state flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .vehicle-detail-layout {
      display: flex;
      flex-direction: column;
    }

    .vehicle-banner-card {
      height: 250px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    
    .banner-image-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #0f172a;
    }
    
    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.75;
    }
    
    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(15, 23, 42, 0.05) 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 24px;
      box-sizing: border-box;
    }
    
    .banner-driver-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary);
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

    .btn-icon-xs {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &:hover { color: white; background: rgba(255, 255, 255, 0.1); }
    }
    
    /* Tabs navigation */
    .details-tab-nav {
      display: flex;
      gap: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      padding: 6px;
      border-radius: 10px;
      flex-wrap: wrap;
      
      .tab-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: 8px 16px;
        border-radius: 6px;
        font-family: var(--font-sans);
        font-weight: 500;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all var(--transition-fast);
        
        &:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        
        &.active {
          background: var(--gradient-primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }
      }
    }

    /* Document vault items */
    .doc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 8px;
      &:last-child { margin-bottom: 0; }
      
      .doc-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .doc-name {
        font-size: 0.85rem;
        font-weight: 600;
      }
      .doc-meta {
        color: var(--text-muted);
      }
      .doc-actions {
        display: flex;
        align-items: center;
      }
    }

    /* GPS overlay maps */
    .map-title-overlay {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(9, 13, 22, 0.85);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(8px);
      padding: 8px 12px;
      border-radius: 8px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .map-title-txt {
        font-size: 0.8rem;
        font-weight: 700;
      }
      .map-subtitle {
        font-size: 0.65rem;
        color: var(--text-muted);
      }
    }

    /* AI Suggestions */
    .ai-insights-card {
      border: 1px solid rgba(168, 85, 247, 0.2);
      background: linear-gradient(135deg, rgba(22, 28, 45, 0.7) 0%, rgba(168, 85, 247, 0.03) 100%);
    }
    .text-purple { color: #c084fc !important; }
    .insights-list {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      li {
        font-size: 0.85rem;
        color: var(--text-secondary);
        position: relative;
        padding-left: 14px;
        &::before {
          content: "•";
          color: #a855f7;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        &.insight-danger {
          color: #f87171;
          &::before { color: var(--color-danger); }
        }
        &.insight-warning {
          color: #fbbf24;
          &::before { color: var(--color-warning); }
        }
      }
    }

    /* Driver Profile Tab styles */
    .driver-portrait-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-primary);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }

    /* Telemetry gauges custom styles */
    .telemetry-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 20px;
      text-align: center;
      
      .lbl {
        font-size: 0.725rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .health-gauge-box, .temp-gauge-box {
      width: 80px; height: 80px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
      .val { font-size: 1.4rem; font-weight: 700; font-family: var(--font-display); }
    }

    .pulse-ring-outer {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      border-radius: 50%;
      border: 3px double transparent;
      &.status-good {
        border-color: rgba(16, 185, 129, 0.2);
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.1);
      }
      &.status-bad {
        border-color: rgba(239, 68, 68, 0.2);
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.1);
      }
    }

    .fuel-level-display {
      width: 50px; height: 80px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.02);
      
      .tank-progress-bar {
        position: absolute;
        bottom: 0; left: 0; width: 100%;
        background: linear-gradient(180deg, #22d3ee 0%, #0891b2 100%);
        transition: height 0.5s ease-out;
      }
      
      .val {
        position: relative;
        z-index: 2;
        font-size: 1.1rem;
        font-weight: 700;
        font-family: var(--font-display);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
      }
    }

    .alert-dtc-item {
      padding: 10px 12px;
      background: rgba(239, 68, 68, 0.02);
      border-left: 3px solid;
      border-radius: 0 8px 8px 0;
      margin-bottom: 8px;
    }
    
    .val-number {
      color: var(--text-primary);
    }

    .text-green { color: var(--color-success) !important; }
    .text-nowrap { white-space: nowrap; }
    
    .detail-grid-split {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    
    .flex-2 { flex: 2; }
    
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
      
      .spec-label {
        color: var(--text-secondary);
        font-weight: 500;
      }
      .spec-value {
        color: var(--text-primary);
        font-weight: 600;
      }
    }
    
    /* Dialog / Modal Overlays */
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
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      h3 { margin-bottom: 0; font-size: 1.1rem; }
      .btn-close-modal {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.5rem;
        cursor: pointer;
        &:hover { color: var(--text-primary); }
      }
    }
    .modal-body { padding: 24px; }
    
    textarea.form-control {
      resize: vertical;
    }
    
    .badge-lg {
      padding: 6px 12px;
      font-size: 0.85rem;
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
export class VehicleDetailComponent implements OnInit, AfterViewChecked, OnDestroy {
  vehicleId: string | null = null;
  vehicle = signal<Vehicle | null>(null);
  serviceRecords = signal<ServiceRecord[]>([]);
  driver = signal<Driver | null>(null);
  driverTrips = signal<TripRecord[]>([]);
  activeAlerts = signal<FaultAlert[]>([]);
  
  // Tab states
  activeTab = signal<string>('overview');

  // Service form states
  serviceForm!: FormGroup;
  showServiceForm = signal(false);

  private map?: L.Map;
  private mapInitialized = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.loadVehicleDetails(this.vehicleId);
    }
    this.initServiceForm();
  }

  ngAfterViewChecked() {
    // Only initialize map if we are on overview tab, have vehicle loaded, and map is not yet initialized
    if (this.activeTab() === 'overview' && this.vehicle() && !this.mapInitialized) {
      this.initDetailMap();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadVehicleDetails(id: string) {
    this.mockApi.getVehicleById(id).subscribe(vehicle => {
      if (vehicle) {
        this.vehicle.set(vehicle);
        this.loadServiceHistory(vehicle.id);
        
        // Load diagnostics codes for this vehicle
        this.mockApi.getFaultAlerts().subscribe(alerts => {
          this.activeAlerts.set(alerts.filter(a => a.vehicleId === vehicle.id && a.status !== 'Resolved'));
        });

        // Load Assigned Driver full records
        if (vehicle.driverId) {
          this.mockApi.getDriverById(vehicle.driverId).subscribe(d => {
            if (d) {
              this.driver.set(d);
              // Load Driver trips history
              this.mockApi.getTripHistory(d.id).subscribe(trips => {
                this.driverTrips.set(trips);
              });
            }
          });
        }
        
        // Trigger map re-init when vehicle loads
        this.mapInitialized = false;
      }
    });
  }

  loadServiceHistory(vId: string) {
    this.mockApi.getServiceHistory(vId).subscribe(records => {
      this.serviceRecords.set(records);
    });
  }

  initServiceForm() {
    this.serviceForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      description: ['', [Validators.required]],
      cost: [0, [Validators.required, Validators.min(0)]],
      mechanic: ['', [Validators.required]]
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    if (tab === 'overview') {
      this.mapInitialized = false; // Trigger map redraw
    }
  }

  initDetailMap() {
    const veh = this.vehicle();
    const mapElement = document.getElementById('detail-map');
    if (!veh || !mapElement) return;

    this.mapInitialized = true;

    if (this.map) {
      this.map.remove();
    }

    // Delay map initialization to ensure container layout dimensions are computed
    setTimeout(() => {
      if (!document.getElementById('detail-map')) {
        this.mapInitialized = false;
        return;
      }

      try {
        this.map = L.map('detail-map', {
          zoomControl: true,
          attributionControl: false
        }).setView([veh.latitude, veh.longitude], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18
        }).addTo(this.map);

        const markerHtml = `
          <div class="map-truck-marker status-${veh.status.toLowerCase()}">
            <div class="marker-pulse"></div>
            <div class="marker-core">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
          </div>
        `;

        const divIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([veh.latitude, veh.longitude], { icon: divIcon }).addTo(this.map);
      } catch (e) {
        console.error('Error initializing Leaflet map:', e);
        this.mapInitialized = false;
      }
    }, 150);
  }

  simulateDownload(docType: string) {
    alert(`Starting download: ${docType} for vehicle ${this.vehicle()?.plate}.`);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Running': return 'badge-success';
      case 'Idle': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      default: return 'badge-danger';
    }
  }

  getHealthColor(health: number): string {
    if (health >= 85) return 'var(--color-success)';
    if (health >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  onServiceSubmit() {
    if (this.serviceForm.valid && this.vehicleId) {
      const record = {
        ...this.serviceForm.value,
        vehicleId: this.vehicleId
      };
      this.mockApi.addServiceRecord(record).subscribe(() => {
        this.loadVehicleDetails(this.vehicleId!);
        this.showServiceForm.set(false);
        this.serviceForm.reset({
          date: new Date().toISOString().split('T')[0],
          description: '',
          cost: 0,
          mechanic: ''
        });
      });
    }
  }
}
