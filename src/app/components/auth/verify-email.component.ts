import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle">Email Verification</p>

        <!-- Temporary OTP Display Card -->
        <div class="otp-banner-card mb-4" *ngIf="activeCode()">
          <div class="otp-badge">Temporary Access OTP</div>
          <div class="otp-code-display">{{ activeCode() }}</div>
          <div class="otp-note">Generated for: <strong>{{ targetEmail }}</strong></div>
          <button type="button" class="btn btn-autofill mt-2 w-full" (click)="autoFillAndVerify()">
            ⚡ Auto-Fill Code & Activate Account
          </button>
        </div>

        <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="code">Enter 6-Digit OTP Code</label>
            <input 
              id="code"
              type="text" 
              class="form-control text-center code-input" 
              formControlName="code"
              placeholder="123456"
              maxlength="6"
              [class.invalid]="isFieldInvalid('code')"
            />
            <div *ngIf="isFieldInvalid('code')" class="form-error">
              <span>Please enter a valid 6-digit OTP</span>
            </div>
          </div>

          <div class="auth-status-msg text-danger mt-2" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <div class="auth-status-msg text-success mt-2" *ngIf="resendSuccess()">
            {{ resendSuccess() }}
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="verifyForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Confirm Email</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="auth-actions mt-3 text-center">
          <button type="button" class="btn-link text-xs" (click)="onResend()" [disabled]="resendLoading()">
            <span *ngIf="!resendLoading()">Didn't get code? Generate New OTP</span>
            <span *ngIf="resendLoading()">Generating OTP...</span>
          </button>
        </div>

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
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .otp-banner-card {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .otp-badge {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #60a5fa;
      font-weight: 600;
    }
    .otp-code-display {
      font-family: monospace;
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #38bdf8;
      margin: 8px 0;
    }
    .otp-note {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .btn-autofill {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #ffffff;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s ease;
      &:hover { opacity: 0.9; }
    }
    .code-input {
      font-size: 1.5rem;
      letter-spacing: 0.2em;
      font-weight: 700;
    }
    .form-control.invalid {
      border-color: var(--color-danger);
    }
    .form-error {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 4px;
      text-align: center;
    }
    .auth-status-msg {
      font-size: 0.825rem;
      text-align: center;
      padding: 8px;
      border-radius: 6px;
    }
    .text-danger {
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .text-success {
      color: #34d399;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--color-primary);
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    .auth-footer {
      display: flex;
      justify-content: center;
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
export class VerifyEmailComponent implements OnInit {
  verifyForm!: FormGroup;
  targetEmail: string = '';
  activeCode = signal<string | null>(null);
  isLoading = signal(false);
  resendLoading = signal(false);
  errorMessage = signal<string | null>(null);
  resendSuccess = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.targetEmail = localStorage.getItem('verification_email') || '';
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.fetchActiveCode();
  }

  fetchActiveCode() {
    if (this.targetEmail) {
      this.mockApi.getDevOtp(this.targetEmail).subscribe({
        next: (code) => {
          this.activeCode.set(code);
          this.verifyForm.patchValue({ code });
        },
        error: () => {}
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.verifyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  autoFillAndVerify() {
    if (this.activeCode()) {
      this.verifyForm.patchValue({ code: this.activeCode() });
      this.onSubmit();
    }
  }

  onSubmit() {
    if (this.verifyForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.mockApi.verifyEmail(this.verifyForm.value.code).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Email verified successfully! Account is now active.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'OTP verification failed. Please try again.');
        }
      });
    } else {
      this.verifyForm.markAllAsTouched();
    }
  }

  onResend() {
    this.resendLoading.set(true);
    this.errorMessage.set(null);
    this.resendSuccess.set(null);

    this.mockApi.resendOtp(this.targetEmail).subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.fetchActiveCode();
        this.resendSuccess.set('New OTP code generated!');
        setTimeout(() => this.resendSuccess.set(null), 4000);
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to resend OTP.');
      }
    });
  }
}
