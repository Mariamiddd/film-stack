import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive recovery instructions</p>
        </div>

        @if (successMessage()) {
          <div class="success-banner">
            {{ successMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="your@email.com"
              required
              [disabled]="isLoading()"
            />
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              Sending...
            } @else {
              Send Recovery Email
            }
          </button>
        </form>

        <div class="auth-switch">
          Remember your password? <a routerLink="/auth/sign-in">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.css']
})
export class RecoveryComponent {
  private authService = inject(AuthService);

  email = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.email) {
      this.errorMessage.set('Please enter your email');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.requestPasswordRecovery(this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Recovery email sent! Please check your inbox.');
        this.email = '';
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.error || 'Failed to send recovery email. Please try again.'
        );
      }
    });
  }
}
