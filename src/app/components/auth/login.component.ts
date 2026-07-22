import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page flex justify-center items-center">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle text-center mt-2">Sign in to manage your smart fleet</p>

        <div class="auth-success-msg mb-4" *ngIf="successMessage()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{{ successMessage() }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form mt-4">
          <div class="form-group">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Please enter a valid email address</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mb-1" for="password">Password</label>
            <input 
              id="password"
              type="password" 
              class="form-control" 
              formControlName="password"
              placeholder="••••••••"
              [class.invalid]="isFieldInvalid('password')"
            />
            <div *ngIf="isFieldInvalid('password')" class="form-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="auth-error-msg animate-shake" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="loginForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Access Dashboard</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="auth-footer flex justify-center mt-6 gap-2 text-center text-sm">
          <span class="text-muted">New to FleetFix?</span>
          <a routerLink="/register" class="text-bold text-primary">Create an account</a>
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

    .auth-success-msg {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
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

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .animate-shake {
      animation: shake 0.3s ease-in-out;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private mockApi: MockApiService
  ) {}

  ngOnInit() {
    if (this.mockApi.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.route.snapshot.queryParams['registered'] === 'true') {
      this.successMessage.set('Account registered successfully! Please sign in with your email and password.');
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const { email, password } = this.loginForm.value;

      this.mockApi.login(email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Invalid credentials. Please verify your entries.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
