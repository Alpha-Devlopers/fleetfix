import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, User } from '../services/mock-api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-layout" *ngIf="currentUser()">
      <!-- User Profile Settings Card -->
      <div class="glass-card mb-4">
        <h3>User Profile details</h3>
        <p class="text-muted mb-4">Modify your profile details and business details below.</p>
        
        <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
          <div class="grid-cols-2">
            <div class="form-group">
              <label class="form-label" for="name">Full Name</label>
              <input id="name" type="text" class="form-control" formControlName="name" />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Phone Contact</label>
              <input id="phone" type="text" class="form-control" formControlName="phone" />
            </div>
          </div>

          <div class="grid-cols-2">
            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input id="email" type="email" class="form-control" formControlName="email" />
              <span class="text-xs text-muted">Email address changes require admin approval.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="company">Company Logistics Name</label>
              <input id="company" type="text" class="form-control" formControlName="company" />
            </div>
          </div>

          <div class="flex justify-between items-center mt-2">
            <span class="save-status-text text-green" *ngIf="profileSaved()">Profile saved successfully!</span>
            <button type="submit" class="btn btn-primary ml-auto" [disabled]="profileForm.invalid || profileLoading()">
              <span *ngIf="!profileLoading()">Save Profile Changes</span>
              <div class="spinner-small" *ngIf="profileLoading()"></div>
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change Settings Card -->
      <div class="glass-card mb-4">
        <h3>Change Account Password</h3>
        <p class="text-muted mb-4">Ensure your account is using a long, secure password.</p>

        <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
          <div class="grid-cols-3">
            <div class="form-group">
              <label class="form-label" for="currentPassword">Current Password</label>
              <input id="currentPassword" type="password" class="form-control" formControlName="currentPassword" placeholder="••••••••" />
            </div>

            <div class="form-group">
              <label class="form-label" for="newPassword">New Password</label>
              <input id="newPassword" type="password" class="form-control" formControlName="newPassword" placeholder="••••••••" />
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" class="form-control" formControlName="confirmPassword" placeholder="••••••••" />
            </div>
          </div>

          <div class="flex justify-between items-center mt-2">
            <span class="save-status-text text-green" *ngIf="passwordSaved()">Password updated successfully!</span>
            <button type="submit" class="btn btn-primary ml-auto" [disabled]="passwordForm.invalid || passwordLoading()">
              <span *ngIf="!passwordLoading()">Update Password</span>
              <div class="spinner-small" *ngIf="passwordLoading()"></div>
            </button>
          </div>
        </form>
      </div>

      <!-- System Preferences / Theme Switch Card -->
      <div class="glass-card">
        <h3>System Preferences</h3>
        <p class="text-muted mb-4">Adjust visual display parameters and real-time alerts preference settings.</p>

        <div class="preference-row mb-4">
          <div class="pref-desc">
            <div class="pref-title">Visual Interface Theme</div>
            <div class="pref-note">Switch the fleet manager visual styling parameters.</div>
          </div>
          <div class="theme-picker">
            <button class="btn btn-theme" [class.active]="theme() === 'dark'" (click)="selectTheme('dark')">Dark</button>
            <button class="btn btn-theme" [class.active]="theme() === 'glass'" (click)="selectTheme('glass')">Glassmorphism</button>
            <button class="btn btn-theme" [class.active]="theme() === 'light'" (click)="selectTheme('light')">Light</button>
          </div>
        </div>

        <div class="preference-row mt-4">
          <div class="pref-desc">
            <div class="pref-title">Real-Time DTC Notifications</div>
            <div class="pref-note">Receive instantaneous notification banners when vehicle logs diagnostic codes.</div>
          </div>
          <div class="toggle-control">
            <label class="switch-toggle">
              <input type="checkbox" [checked]="notificationsEnabled()" (change)="toggleNotifications($event)" />
              <span class="slider-toggle"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout {
      display: flex;
      flex-direction: column;
    }
    
    .text-xs { font-size: 0.725rem; }
    .text-green { color: var(--color-success); }
    .save-status-text { font-weight: 500; font-size: 0.85rem; }
    
    .ml-auto { margin-left: auto; }
    
    /* Preferences Row */
    .preference-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      flex-wrap: wrap;
      gap: 12px;
      
      .pref-title {
        font-size: 0.95rem;
        font-weight: 600;
      }
      .pref-note {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
    }
    
    /* Theme buttons */
    .theme-picker {
      display: flex;
      gap: 8px;
    }
    .btn-theme {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px 16px;
      font-size: 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
      &.active {
        background: var(--gradient-primary);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
      }
    }
    
    /* Switch toggle */
    .switch-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      
      input { opacity: 0; width: 0; height: 0; }
    }
    
    .slider-toggle {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(255,255,255,0.1);
      transition: .4s;
      border-radius: 34px;
      border: 1px solid var(--border-color);
      
      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
    }
    
    input:checked + .slider-toggle {
      background-color: var(--color-primary);
      border-color: transparent;
      
      &:before {
        transform: translateX(20px);
      }
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
export class SettingsComponent implements OnInit {
  currentUser = signal<User | null>(null);
  theme = signal<'dark' | 'light' | 'glass'>('glass');
  notificationsEnabled = signal(true);

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Status
  profileSaved = signal(false);
  profileLoading = signal(false);
  
  passwordSaved = signal(false);
  passwordLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    this.mockApi.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        this.theme.set(user.theme);
        this.notificationsEnabled.set(user.notificationsEnabled);
        this.initForms(user);
      }
    });
  }

  initForms(user: User) {
    this.profileForm = this.fb.group({
      name: [user.name, [Validators.required]],
      phone: [user.phone || ''],
      email: [{ value: user.email, disabled: true }, [Validators.required, Validators.email]],
      company: [user.company || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onProfileSubmit() {
    if (this.profileForm.valid) {
      this.profileLoading.set(true);
      this.profileSaved.set(false);
      
      const { name, phone, company } = this.profileForm.value;
      this.mockApi.updateProfile(name, phone, company).subscribe(() => {
        this.profileLoading.set(false);
        this.profileSaved.set(true);
        setTimeout(() => this.profileSaved.set(false), 3000);
      });
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      this.passwordLoading.set(true);
      this.passwordSaved.set(false);
      
      setTimeout(() => {
        this.passwordLoading.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.passwordSaved.set(false), 3000);
      }, 1000);
    }
  }

  selectTheme(themeName: 'dark' | 'light' | 'glass') {
    this.theme.set(themeName);
    this.mockApi.updateSettings(themeName, this.notificationsEnabled()).subscribe(user => {
      this.applyThemeStyle(themeName);
    });
  }

  toggleNotifications(event: any) {
    const val = event.target.checked;
    this.notificationsEnabled.set(val);
    this.mockApi.updateSettings(this.theme(), val).subscribe();
  }

  private applyThemeStyle(themeName: 'dark' | 'light' | 'glass') {
    const body = document.body;
    
    // reset visual body backgrounds
    if (themeName === 'light') {
      body.style.setProperty('--bg-primary', '#f8fafc');
      body.style.setProperty('--bg-secondary', '#f1f5f9');
      body.style.setProperty('--bg-surface', '#ffffff');
      body.style.setProperty('--bg-card', '#ffffff');
      body.style.setProperty('--text-primary', '#0f172a');
      body.style.setProperty('--text-secondary', '#475569');
      body.style.setProperty('--border-color', '#e2e8f0');
      body.style.backgroundImage = 'none';
    } else if (themeName === 'dark') {
      body.style.setProperty('--bg-primary', '#0b0f19');
      body.style.setProperty('--bg-secondary', '#111827');
      body.style.setProperty('--bg-surface', '#1f2937');
      body.style.setProperty('--bg-card', '#111827');
      body.style.setProperty('--text-primary', '#f8fafc');
      body.style.setProperty('--text-secondary', '#94a3b8');
      body.style.setProperty('--border-color', '#374151');
      body.style.backgroundImage = 'none';
    } else {
      // glass theme (default reset back to variables)
      body.style.removeProperty('--bg-primary');
      body.style.removeProperty('--bg-secondary');
      body.style.removeProperty('--bg-surface');
      body.style.removeProperty('--bg-card');
      body.style.removeProperty('--text-primary');
      body.style.removeProperty('--text-secondary');
      body.style.removeProperty('--border-color');
      body.style.backgroundImage = `
        radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 40%)
      `;
    }
  }
}
