import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey</p>
        </div>

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

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-footer">
            <a routerLink="/auth/recovery" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-switch">
          Don't have an account? <a routerLink="/auth/sign-up">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.css']
})
export class SignInComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.titleService.setTitle('Sign In | Movieland');
    this.metaService.updateTag({ name: 'description', content: 'Sign in to your Movieland account to access your library and preferences.' });
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.signIn({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.error || 'Invalid email or password. Please try again.'
        );
      }
    });
  }
}
