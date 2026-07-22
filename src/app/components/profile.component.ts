import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService, User } from '../services/mock-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="profile-layout" *ngIf="user()">
      <!-- Top profile banner header card -->
      <div class="glass-card profile-banner mb-4">
        <div class="banner-avatar-section">
          <div class="avatar-container">
            <img [src]="user()?.avatarUrl || '/images/drivers/sai_kiran.png'" alt="Avatar" class="profile-avatar" />
            <button class="btn-avatar-edit" (click)="toggleAvatarSelector()" title="Change Avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <div class="banner-user-info">
            <h2>Welcome, {{ user()?.name }}</h2>
            <div class="user-meta-badges">
              <span class="badge badge-role">{{ getRoleLabel(user()?.role) }}</span>
              <span class="badge badge-status" [class.active]="user()?.status !== 'Blocked'">{{ user()?.status || 'Active' }}</span>
              <span class="badge badge-id">ID: FF-{{ user()?.id }}</span>
            </div>
            <p class="member-since">Member Since: {{ user()?.id ? 'July 2026' : 'Recently' }}</p>
          </div>
        </div>
      </div>

      <!-- Avatar Selector Dropdown Pane -->
      <div class="glass-card mb-4 animate-slide" *ngIf="showAvatarSelector()">
        <h3>Select Profile Picture</h3>
        <p class="text-muted text-sm mb-3">Choose a professional profile avatar or enter a custom photo URL.</p>
        
        <div class="avatar-grid mb-4">
          <div 
            *ngFor="let avatar of localAvatarOptions" 
            class="avatar-option-card"
            [class.selected]="selectedAvatarUrl() === avatar"
            (click)="selectAvatar(avatar)"
          >
            <img [src]="avatar" alt="Avatar option" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="customUrl">Custom Avatar URL</label>
          <div class="flex gap-2">
            <input 
              id="customUrl"
              type="text" 
              class="form-control flex-1" 
              [value]="selectedAvatarUrl()"
              (input)="onCustomAvatarInput($event)"
              placeholder="https://images.unsplash.com/photo-..." 
            />
            <button class="btn btn-primary" (click)="saveAvatar()" [disabled]="avatarLoading()">
              <span *ngIf="!avatarLoading()">Apply Avatar</span>
              <div class="spinner-small" *ngIf="avatarLoading()"></div>
            </button>
          </div>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Left: Edit details Form -->
        <div class="glass-card flex-2">
          <h3>Personal Specifications Details</h3>
          <p class="text-muted text-sm mb-4">Modify your account contact details, cities, and physical address.</p>

          <form [formGroup]="detailsForm" (ngSubmit)="onDetailsSubmit()">
            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label" for="profileName">Full Name</label>
                <input id="profileName" type="text" class="form-control" formControlName="name" placeholder="Ramesh Patel" />
                <div *ngIf="isFieldInvalid(detailsForm, 'name')" class="form-error">
                  <span>Name is required</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="profilePhone">Phone Contact</label>
                <input id="profilePhone" type="text" class="form-control" formControlName="phone" placeholder="+91 9012345678" />
                <div *ngIf="isFieldInvalid(detailsForm, 'phone')" class="form-error">
                  <span>Please enter a valid phone number (10-14 digits)</span>
                </div>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="profileEmail">Email Address (Read-Only)</label>
              <input id="profileEmail" type="email" class="form-control disabled-input" [value]="user()?.email" readonly />
              <span class="text-xs text-muted">Email validation address cannot be edited online.</span>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="profileAddress">Street Address</label>
              <input id="profileAddress" type="text" class="form-control" formControlName="address" placeholder="Dwaraka Nagar" />
              <div *ngIf="isFieldInvalid(detailsForm, 'address')" class="form-error">
                <span>Address is required</span>
              </div>
            </div>

            <div class="grid-cols-3 mt-3">
              <div class="form-group">
                <label class="form-label" for="profileCity">City</label>
                <input id="profileCity" type="text" class="form-control" formControlName="city" placeholder="Visakhapatnam" />
              </div>

              <div class="form-group">
                <label class="form-label" for="profileState">State</label>
                <input id="profileState" type="text" class="form-control" formControlName="state" placeholder="Andhra Pradesh" />
              </div>

              <div class="form-group">
                <label class="form-label" for="profilePincode">Pincode</label>
                <input id="profilePincode" type="text" class="form-control" formControlName="pincode" placeholder="530016" />
              </div>
            </div>

            <div class="flex justify-between items-center mt-6">
              <span class="status-msg text-green" *ngIf="detailsSaved()">Profile credentials saved successfully!</span>
              <span class="status-msg text-red" *ngIf="detailsError()">{{ detailsError() }}</span>
              <button type="submit" class="btn btn-primary ml-auto" [disabled]="detailsForm.invalid || detailsLoading()">
                <span *ngIf="!detailsLoading()">Save Profile details</span>
                <div class="spinner-small" *ngIf="detailsLoading()"></div>
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Security Password Management & Action Column -->
        <div class="flex-col flex-1 gap-4">
          <!-- Change Password -->
          <div class="glass-card">
            <h3>Change Security Password</h3>
            <p class="text-muted text-sm mb-4">Ensure your account is protected with a long encrypted password.</p>

            <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
              <div class="form-group">
                <label class="form-label" for="currPass">Current Password</label>
                <input id="currPass" type="password" class="form-control" formControlName="currentPassword" placeholder="••••••••" />
              </div>

              <div class="form-group mt-3">
                <label class="form-label" for="newPass">New Password</label>
                <input id="newPass" type="password" class="form-control" formControlName="newPassword" placeholder="••••••••" />
                <div *ngIf="isFieldInvalid(passwordForm, 'newPassword')" class="form-error">
                  <span>Password must be at least 6 characters</span>
                </div>
              </div>

              <div class="form-group mt-3">
                <label class="form-label" for="confPass">Confirm New Password</label>
                <input id="confPass" type="password" class="form-control" formControlName="confirmPassword" placeholder="••••••••" />
                <div *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched" class="form-error">
                  <span>Passwords do not match</span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-6">
                <span class="status-msg text-green" *ngIf="passwordSaved()">Password updated!</span>
                <span class="status-msg text-red" *ngIf="passwordError()">{{ passwordError() }}</span>
                <button type="submit" class="btn btn-primary ml-auto" [disabled]="passwordForm.invalid || passwordLoading()">
                  <span *ngIf="!passwordLoading()">Update Password</span>
                  <div class="spinner-small" *ngIf="passwordLoading()"></div>
                </button>
              </div>
            </form>
          </div>

          <!-- Quick Actions & Logout -->
          <div class="glass-card text-center py-4">
            <h3>Account Session Actions</h3>
            <p class="text-muted text-sm mb-4">Safely sign out of your fleet manager session from this device.</p>
            <button class="btn btn-danger w-full" (click)="onLogout()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="inline-icon mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out of FleetFix
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: flex;
      flex-direction: column;
    }
    
    .profile-grid {
      display: flex;
      gap: 20px;
      
      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }
    
    .flex-2 { flex: 2; }
    .flex-1 { flex: 1; }
    .ml-auto { margin-left: auto; }
    .text-sm { font-size: 0.85rem; }
    .text-xs { font-size: 0.725rem; }
    
    .status-msg {
      font-size: 0.85rem;
      font-weight: 500;
    }
    .text-green { color: var(--color-success); }
    .text-red { color: var(--color-danger); }
    
    .disabled-input {
      background: rgba(255, 255, 255, 0.02) !important;
      border-color: rgba(255, 255, 255, 0.05) !important;
      color: var(--text-muted) !important;
      cursor: not-allowed;
    }
    
    .form-error {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 4px;
    }

    /* Profile Banner */
    .profile-banner {
      padding: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .banner-avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .avatar-container {
      position: relative;
      width: 100px;
      height: 100px;
      
      .profile-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--color-primary);
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.35);
      }
      
      .btn-avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-primary);
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        transition: transform 0.2s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }
    }
    
    .banner-user-info {
      h2 {
        font-family: var(--font-display);
        font-size: 1.5rem;
        margin-bottom: 8px;
      }
      .member-since {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 6px;
        margin-bottom: 0;
      }
    }
    
    .user-meta-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .badge {
        font-size: 0.725rem;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        
        &-role {
          background: rgba(168, 85, 247, 0.15);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }
        &-status {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
          
          &.active {
            background: rgba(16, 185, 129, 0.15);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
        }
        &-id {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
      }
    }

    /* Avatar Grid options */
    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 12px;
      
      .avatar-option-card {
        aspect-ratio: 1;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
        }
        
        &.selected {
          border-color: var(--color-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
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
    
    .animate-slide {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  
  // Forms
  detailsForm!: FormGroup;
  passwordForm!: FormGroup;

  // View UI toggles
  showAvatarSelector = signal(false);
  selectedAvatarUrl = signal('');
  
  // Loading indicators
  detailsLoading = signal(false);
  passwordLoading = signal(false);
  avatarLoading = signal(false);
  
  // Success states
  detailsSaved = signal(false);
  passwordSaved = signal(false);
  
  // Error states
  detailsError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  // Pre-seeded avatars matching Indian logistics photos we generated
  localAvatarOptions = [
    '/images/drivers/sai_kiran.png',
    '/images/drivers/venkatesh_reddy.png',
    '/images/drivers/ravi_teja.png',
    '/images/drivers/mahesh_reddy.png',
    '/images/drivers/anand_kumar.png',
    '/images/drivers/suresh_babu.png'
  ];

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialise empty details forms
    this.detailsForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,14}$')]],
      address: ['', [Validators.required]],
      city: [''],
      state: [''],
      pincode: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Track active user profile updates
    this.mockApi.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user.set(currentUser);
        this.selectedAvatarUrl.set(currentUser.avatarUrl || '');
        
        // Populate inputs
        this.detailsForm.patchValue({
          name: currentUser.name,
          phone: currentUser.phone || '',
          address: currentUser.company || '', // mapping company/address field
          city: (currentUser as any).city || '',
          state: (currentUser as any).state || '',
          pincode: (currentUser as any).pincode || ''
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return '';
    if (role === 'fleet-owner') return 'Fleet Owner (Customer)';
    if (role === 'service-center') return 'Service Center (Shopkeeper)';
    if (role === 'admin') return 'System Administrator';
    return role;
  }

  toggleAvatarSelector() {
    this.showAvatarSelector.update(v => !v);
  }

  selectAvatar(url: string) {
    this.selectedAvatarUrl.set(url);
  }

  onCustomAvatarInput(event: any) {
    this.selectedAvatarUrl.set(event.target.value);
  }

  saveAvatar() {
    if (this.selectedAvatarUrl().trim()) {
      this.avatarLoading.set(true);
      this.mockApi.uploadAvatar(this.selectedAvatarUrl()).subscribe({
        next: () => {
          this.avatarLoading.set(false);
          this.showAvatarSelector.set(false);
          alert('Avatar picture updated successfully!');
        },
        error: (err) => {
          this.avatarLoading.set(false);
          alert(err.message || 'Failed to update avatar.');
        }
      });
    }
  }

  onDetailsSubmit() {
    if (this.detailsForm.valid) {
      this.detailsLoading.set(true);
      this.detailsSaved.set(false);
      this.detailsError.set(null);

      const { name, phone, address, city, state, pincode } = this.detailsForm.value;
      this.mockApi.updateProfile(name, phone, address, city, state, pincode).subscribe({
        next: () => {
          this.detailsLoading.set(false);
          this.detailsSaved.set(true);
          setTimeout(() => this.detailsSaved.set(false), 3000);
        },
        error: (err) => {
          this.detailsLoading.set(false);
          this.detailsError.set(err.message || 'Failed to save changes.');
        }
      });
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      this.passwordLoading.set(true);
      this.passwordSaved.set(false);
      this.passwordError.set(null);

      const { currentPassword, newPassword } = this.passwordForm.value;
      this.mockApi.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.passwordLoading.set(false);
          this.passwordSaved.set(true);
          this.passwordForm.reset();
          setTimeout(() => this.passwordSaved.set(false), 3000);
        },
        error: (err) => {
          this.passwordLoading.set(false);
          this.passwordError.set(err.message || 'Failed to change password.');
        }
      });
    }
  }

  onLogout() {
    this.mockApi.logout().subscribe(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
