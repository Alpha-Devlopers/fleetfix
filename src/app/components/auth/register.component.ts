import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page flex justify-center items-center">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle text-center mt-2">Create your Fleet Manager account</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form mt-4">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              class="form-control" 
              formControlName="name"
              placeholder="e.g. Ramesh Patel"
              [class.invalid]="isFieldInvalid('name')"
            />
            <div *ngIf="isFieldInvalid('name')" class="form-error">
              <span>Name is required</span>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              class="form-control" 
              formControlName="email"
              placeholder="e.g. manager@fleetfix.com"
              [class.invalid]="isFieldInvalid('email')"
            />
            <div *ngIf="isFieldInvalid('email')" class="form-error">
              <span>Please enter a valid email address</span>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="phone">Mobile Number</label>
            <input 
              id="phone"
              type="text" 
              class="form-control" 
              formControlName="phone"
              placeholder="e.g. +91 9012345678"
              [class.invalid]="isFieldInvalid('phone')"
            />
            <div *ngIf="isFieldInvalid('phone')" class="form-error">
              <span>Please enter a valid phone number (10-14 digits)</span>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="address">Address</label>
            <input 
              id="address"
              type="text" 
              class="form-control" 
              formControlName="address"
              placeholder="e.g. Dwaraka Nagar, Visakhapatnam"
              [class.invalid]="isFieldInvalid('address')"
            />
            <div *ngIf="isFieldInvalid('address')" class="form-error">
              <span>Address is required</span>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="role">Register As</label>
            <select id="role" class="form-control" formControlName="role" [class.invalid]="isFieldInvalid('role')">
              <option value="fleet-owner">Fleet Owner (Customer)</option>
              <option value="service-center">Service Center (Shopkeeper)</option>
              <option value="admin">Administrator (Admin)</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="password">Password</label>
            <input 
              id="password"
              type="password" 
              class="form-control" 
              formControlName="password"
              placeholder="••••••••"
              [class.invalid]="isFieldInvalid('password')"
            />
            <div *ngIf="isFieldInvalid('password')" class="form-error">
              <span>Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="auth-error-msg animate-shake" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="registerForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Register Account</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="auth-footer flex justify-center mt-6 gap-2 text-center text-sm">
          <span class="text-muted">Already have an account?</span>
          <a routerLink="/login" class="text-bold text-primary">Log In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      width: 100vw;
      padding: 20px;
      box-sizing: border-box;
      background: #0b0f19;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      background: rgba(17, 23, 41, 0.75);
    }
    
    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .brand-icon {
        color: var(--color-primary);
      }
      h2 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        margin-bottom: 0;
        span {
          color: var(--color-secondary);
        }
      }
    }
    
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 24px;
    }
    
    .form-control.invalid {
      border-color: var(--color-danger);
      box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
    }
    
    .auth-error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-top: 16px;
      text-align: center;
    }

    .form-error {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 4px;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,14}$')]],
      address: ['', [Validators.required]],
      role: ['fleet-owner', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const { email, name, role, phone, address, password } = this.registerForm.value;

      this.mockApi.register(email, name, role, { phone, address, password }).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Registration successful! Please log in with your credentials.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Registration failed.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
