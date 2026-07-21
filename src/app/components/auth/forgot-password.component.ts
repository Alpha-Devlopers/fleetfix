import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle">Reset your account password</p>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!success()">
          <div class="form-group">
            <label class="form-label" for="email">Registered Email Address</label>
            <input 
              id="email"
              type="email" 
              class="form-control" 
              formControlName="email"
              placeholder="sarah@logistics.com"
              [class.invalid]="isFieldInvalid('email')"
            />
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="forgotForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Send Verification Code</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="success-message" *ngIf="success()">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h3>Verification Link Sent</h3>
          <p>We've sent a 6-digit OTP verification code to your email address to reset your credentials.</p>
          <button (click)="goToOtp()" class="btn btn-primary w-full mt-4">Verify OTP</button>
        </div>

        <div class="auth-footer" *ngIf="!success()">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 64px);
      width: 100%;
      padding: 20px;
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
      .brand-icon { color: var(--color-primary); }
      h2 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        margin-bottom: 0;
        span { color: var(--color-secondary); }
      }
    }
    .auth-subtitle {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 32px;
    }
    .form-control.invalid {
      border-color: var(--color-danger);
    }
    .success-message {
      text-align: center;
      margin-top: 16px;
      .success-icon {
        color: var(--color-success);
        margin-bottom: 16px;
      }
      p {
        font-size: 0.875rem;
        margin-bottom: 20px;
      }
    }
    .auth-footer {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      font-size: 0.85rem;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isLoading = signal(false);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.mockApi.forgotPassword(this.forgotForm.value.email).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.success.set(true);
          alert('Verification OTP code dispatched successfully! Please check your mailbox.');
        },
        error: (err) => {
          this.isLoading.set(false);
          alert(err.message || 'Failed to dispatch reset code.');
        }
      });
    }
  }

  goToOtp() {
    this.router.navigate(['/verify-otp']);
  }
}
