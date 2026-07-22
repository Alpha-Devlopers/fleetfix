import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-viewport flex justify-center items-center p-4">
      <div class="landing-glow-1"></div>
      <div class="landing-glow-2"></div>
      
      <div class="landing-content-wrapper text-center w-full max-w-6xl relative z-10">
        <!-- Brand Header -->
        <header class="mb-10 animate-fade-in">
          <div class="brand-badge mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="brand-svg"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <span>FLEETFIX INDIA</span>
          </div>
          <h1 class="landing-title font-display text-white text-bold">Unified Logistics & Service Portal</h1>
          <p class="landing-subtitle text-secondary max-w-2xl mx-auto">
            Scale your fleet operations, automate diagnostics with AI assistance, and connect directly with approved workshop partners.
          </p>
        </header>

        <!-- Role Select Grid -->
        <div class="grid-cols-3 gap-6 text-left mb-10">
          <!-- 1. Fleet Owner -->
          <div class="glass-card role-card flex-col gap-4">
            <div class="role-icon-box owner">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div class="role-text flex-1">
              <h3 class="text-bold text-white mb-2">Fleet Owner Portal</h3>
              <p class="text-secondary text-sm leading-relaxed">
                Register vehicles, monitor live GPS corridors, inspect engine diagnostics, track drivers, and review AI repair procedures.
              </p>
            </div>
            <div class="role-actions flex-col gap-2 mt-4">
              <a [routerLink]="['/login']" [queryParams]="{ role: 'fleet-owner' }" class="btn btn-primary w-full text-center">
                Login as Fleet Owner
              </a>
              <a [routerLink]="['/register']" [queryParams]="{ role: 'fleet-owner' }" class="btn btn-secondary w-full text-center">
                Register Fleet Account
              </a>
            </div>
          </div>

          <!-- 2. Service Center Owner -->
          <div class="glass-card role-card flex-col gap-4">
            <div class="role-icon-box shop">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div class="role-text flex-1">
              <h3 class="text-bold text-white mb-2">Service Center Portal</h3>
              <p class="text-secondary text-sm leading-relaxed">
                Manage repair orders, inspect AI diagnostic procedures, clear DTCs, and track spare parts inventory.
              </p>
            </div>
            <div class="role-actions flex-col gap-2 mt-4">
              <a [routerLink]="['/login']" [queryParams]="{ role: 'service-center' }" class="btn btn-primary w-full text-center">
                Login as Service Partner
              </a>
              <a [routerLink]="['/register']" [queryParams]="{ role: 'service-center' }" class="btn btn-secondary w-full text-center">
                Register Service Center
              </a>
            </div>
          </div>

          <!-- 3. Administrator -->
          <div class="glass-card role-card flex-col gap-4">
            <div class="role-icon-box admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="role-text flex-1">
              <h3 class="text-bold text-white mb-2">Admin Console</h3>
              <p class="text-secondary text-sm leading-relaxed">
                Configure system telemetry parameters, manage fleet inventories, audit system logs, and inspect performance metrics.
              </p>
            </div>
            <div class="role-actions flex-col gap-2 mt-4">
              <a [routerLink]="['/login']" [queryParams]="{ role: 'admin' }" class="btn btn-primary w-full text-center">
                Access Admin Console
              </a>
              <span class="admin-notice-label text-center text-xs text-muted">
                Admin registrations are restricted to database configuration.
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="text-muted text-xs">
          &copy; 2026 FleetFix Logistics Networks India Private Limited. All Rights Reserved.
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .landing-viewport {
      min-height: 100vh;
      width: 100vw;
      background-color: #0b0f19;
      position: relative;
      overflow-x: hidden;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .landing-glow-1 {
      position: absolute;
      top: -150px;
      left: -150px;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
      pointer-events: none;
    }

    .landing-glow-2 {
      position: absolute;
      bottom: -150px;
      right: -150px;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%);
      pointer-events: none;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 0.725rem;
      font-weight: 700;
      color: #818cf8;
      letter-spacing: 0.1em;
    }

    .landing-title {
      font-size: 2.25rem;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    .landing-subtitle {
      font-size: 1.05rem;
      line-height: 1.6;
    }

    /* Role Cards */
    .role-card {
      min-height: 380px;
      border-radius: 16px;
      padding: 30px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-6px);
        border-color: rgba(99, 102, 241, 0.25);
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.08);
        background: rgba(255, 255, 255, 0.03);
      }
    }

    .role-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.owner { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
      &.shop { background: rgba(6, 182, 212, 0.1); color: #22d3ee; }
      &.admin { background: rgba(168, 85, 247, 0.1); color: #c084fc; }
    }

    .admin-notice-label {
      padding-top: 8px;
      opacity: 0.6;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.8s ease-out forwards;
    }
  `]
})
export class LandingComponent {}
