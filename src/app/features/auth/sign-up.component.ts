import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, SignUpRequest } from '../../core/services/auth.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card signup-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join Movieland today</p>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                [(ngModel)]="formData.firstName"
                name="firstName"
                placeholder="John"
                required
                [disabled]="isLoading()"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                [(ngModel)]="formData.lastName"
                name="lastName"
                placeholder="Doe"
                required
                [disabled]="isLoading()"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="formData.email"
              name="email"
              placeholder="your@email.com"
              required
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="age">Age</label>
              <input
                type="number"
                id="age"
                [(ngModel)]="formData.age"
                name="age"
                placeholder="18"
                min="1"
                required
                [disabled]="isLoading()"
              />
            </div>

            <div class="form-group">
              <label for="gender">Gender</label>
              <select
                id="gender"
                [(ngModel)]="formData.gender"
                name="gender"
                required
                [disabled]="isLoading()"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="formData.password"
              name="password"
              placeholder="At least 8 characters"
              minlength="8"
              required
              [disabled]="isLoading()"
            />
            <small>Minimum 8 characters</small>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              [(ngModel)]="formData.phone"
              name="phone"
              placeholder="+1234567890"
              required
              [disabled]="isLoading()"
            />
            <small>Include country code (e.g., +1234567890)</small>
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input
              type="text"
              id="address"
              [(ngModel)]="formData.address"
              name="address"
              placeholder="123 Main St, City"
              required
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label for="zipcode">Zip Code</label>
            <input
              type="text"
              id="zipcode"
              [(ngModel)]="formData.zipcode"
              name="zipcode"
              placeholder="12345"
              required
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label for="avatar">Avatar URL (Optional)</label>
            <input
              type="url"
              id="avatar"
              [(ngModel)]="formData.avatar"
              name="avatar"
              placeholder="https://example.com/avatar.jpg"
              [disabled]="isLoading()"
            />
            <small>Enter a valid image URL</small>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              Creating account...
            } @else {
              Sign Up
            }
          </button>
        </form>

        <div class="auth-switch">
          Already have an account? <a routerLink="/auth/sign-in">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.css']
})
export class SignUpComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  formData: SignUpRequest = {
    firstName: '',
    lastName: '',
    age: 18,
    email: '',
    password: '',
    phone: '',
    address: '',
    zipcode: '',
    avatar: '',
    gender: 'MALE'
  };

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.titleService.setTitle('Create Account | Movieland');
    this.metaService.updateTag({ name: 'description', content: 'Join Movieland today to curate your personal cinema collection.' });
  }

  onSubmit() {
    // Check all required fields
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email ||
      !this.formData.password || !this.formData.phone || !this.formData.address ||
      !this.formData.zipcode) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    if (this.formData.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.signUp(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorKeys = error.error?.errorKeys || [];
        if (errorKeys.includes('errors.invalid_email')) {
          this.errorMessage.set('Please enter a valid email address');
        } else if (errorKeys.includes('errors.invalid_phone_number')) {
          this.errorMessage.set('Please enter a valid phone number (e.g., +1234567890)');
        } else {
          this.errorMessage.set(error.error?.error || 'Failed to create account. Please try again.');
        }
      }
    });
  }
}
