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
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h2>Fleet<span>Fix</span></h2>
        </div>
        
        <p class="auth-subtitle">Verify One-Time Passcode</p>
        <p class="verification-note">Please enter the 6-digit OTP code sent to your registered address to gain temporary access.</p>

        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="otp">6-Digit Code</label>
            <input 
              id="otp"
              type="text" 
              class="form-control text-center otp-input" 
              formControlName="otp"
              placeholder="000000"
              maxlength="6"
              [class.invalid]="isFieldInvalid('otp')"
            />
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="otpForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Verify & Reset</span>
            <div class="spinner" *ngIf="isLoading()"></div>
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/login">Cancel</a>
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
      margin-bottom: 16px;
    }
    .verification-note {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .otp-input {
      font-size: 1.75rem;
      letter-spacing: 0.3em;
      font-weight: 700;
    }
    .form-control.invalid {
      border-color: var(--color-danger);
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
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.otpForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.isLoading.set(true);
      this.mockApi.verifyOtp(this.otpForm.value.otp).subscribe(() => {
        this.isLoading.set(false);
        // OTP success, login as mock user
        this.mockApi.login('admin@fleetfix.com', 'admin123').subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      });
    }
  }
}
