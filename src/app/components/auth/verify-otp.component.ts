import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page flex justify-center items-center">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle text-center mt-2">Verify OTP & Reset Password</p>

        <!-- Temporary OTP Display Card -->
        <div class="otp-banner-card mb-3" *ngIf="activeCode()">
          <div class="otp-badge">Temporary Reset OTP</div>
          <div class="otp-code-display">{{ activeCode() }}</div>
          <div class="otp-note">Generated for: <strong>{{ targetEmail }}</strong></div>
          <button type="button" class="btn btn-autofill mt-2 w-full" (click)="autoFillOtp()">
            ⚡ Auto-Fill Reset OTP
          </button>
        </div>

        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="auth-form mt-3">
          <div class="form-group">
            <label class="form-label" for="otp">6-Digit OTP Code</label>
            <input 
              id="otp"
              type="text" 
              class="form-control text-center otp-input" 
              formControlName="otp"
              placeholder="000000"
              maxlength="6"
              [class.invalid]="isFieldInvalid('otp')"
            />
            <div *ngIf="isFieldInvalid('otp')" class="form-error">
              <span>Please enter a valid 6-digit OTP</span>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label" for="password">New Password</label>
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

          <div class="auth-error-msg mt-3" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="otpForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Reset Password</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="auth-footer mt-4 text-center">
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
      background: rgba(17, 23, 41, 0.85);
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
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .otp-banner-card {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .otp-badge {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #fbbf24;
      font-weight: 600;
    }
    .otp-code-display {
      font-family: monospace;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #f59e0b;
      margin: 6px 0;
    }
    .otp-note {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .btn-autofill {
      background: linear-gradient(135deg, #d97706, #f59e0b);
      color: #ffffff;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      &:hover { opacity: 0.9; }
    }
    .otp-input {
      font-size: 1.5rem;
      letter-spacing: 0.2em;
      font-weight: 700;
    }
    .form-control.invalid {
      border-color: var(--color-danger);
    }
    .auth-error-msg {
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      font-size: 0.825rem;
      text-align: center;
      padding: 8px;
      border-radius: 6px;
    }
    .auth-footer {
      font-size: 0.85rem;
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
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  targetEmail: string = '';
  activeCode = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.targetEmail = localStorage.getItem('reset_email') || '';
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (this.targetEmail) {
      this.mockApi.getDevOtp(this.targetEmail).subscribe({
        next: (code) => {
          this.activeCode.set(code);
          this.otpForm.patchValue({ otp: code });
        },
        error: () => {}
      });
    }
  }

  autoFillOtp() {
    if (this.activeCode()) {
      this.otpForm.patchValue({ otp: this.activeCode() });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.otpForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const { otp, password } = this.otpForm.value;
      this.mockApi.resetPassword(otp, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Password reset successful! Please login with your new password.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Verification failed. Please check your OTP.');
        }
      });
    } else {
      this.otpForm.markAllAsTouched();
    }
  }
}
