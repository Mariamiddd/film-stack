import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { FavoriteService } from '../../core/services/favorites.service';
import { TmdbService, Movie } from '../../core/services/tmdb.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink, MovieCardComponent],
  template: `
    <div class="profile-container">
      <div class="profile-header-modern">
        <div class="user-main">
          <div class="avatar-large">
            @if (user()?.avatar) {
              <img [src]="user()!.avatar" [alt]="user()!.firstName" />
            } @else {
              <div class="placeholder">{{ getInitials() }}</div>
            }
          </div>
          <div class="user-text">
            <h1>{{ user()?.firstName }} {{ user()?.lastName }}</h1>
            <p>{{ user()?.email }}</p>
          </div>
        </div>
        <div class="header-actions">
           <div class="quick-stats">
              <div class="stat">
                 <span class="val">{{ purchaseCount() }}</span>
                 <span class="lab">Movies</span>
              </div>
              <div class="stat">
                 <span class="val">{{ favoriteCount() }}</span>
                 <span class="lab">Favorites</span>
              </div>
           </div>
        </div>
      </div>

      <div class="profile-main-layout">
        <!-- Sidebar Tabs (Left) -->
        <aside class="profile-tabs-sidebar">
          <button class="nav-tab-btn" [class.active]="activeTab() === 'purchases'" (click)="activeTab.set('purchases')">
            <span class="icon">🎬</span> My Movies
          </button>
          <button class="nav-tab-btn" [class.active]="activeTab() === 'watchlist'" (click)="activeTab.set('watchlist')">
            <span class="icon">🕒</span> Watchlist
          </button>
          <button class="nav-tab-btn" [class.active]="activeTab() === 'favorites'" (click)="activeTab.set('favorites')">
            <span class="icon">⭐</span> Favorites
          </button>
          <button class="nav-tab-btn" [class.active]="activeTab() === 'downloads'" (click)="activeTab.set('downloads')">
            <span class="icon">📥</span> Downloads
          </button>
          <div class="divider"></div>
          <button class="nav-tab-btn" [class.active]="activeTab() === 'settings'" (click)="activeTab.set('settings')">
            <span class="icon">⚙️</span> Settings
          </button>
        </aside>

        <!-- Dynamic Content (Right) -->
        <div class="profile-content-area">

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Purchased Movies Tab -->
        @if (activeTab() === 'purchases') {
          <div class="movies-section">
            <h2>My Purchased Movies</h2>
            @if (purchases().length === 0) {
              <div class="empty-state">
                <p>🎬 You haven't purchased any movies yet</p>
                <a routerLink="/" class="browse-btn">Browse Movies</a>
              </div>
            } @else {
              <div class="movies-grid">
                @for (purchase of purchases(); track purchase.movieId) {
                  <div class="movie-card-simple">
                     <div class="movie-poster" [routerLink]="['/movie', purchase.movieId]">
                        <div class="purchased-badge">✓ Owned</div>
                        @if (purchase.posterPath) {
                          <img [src]="getPosterUrl(purchase.posterPath)" [alt]="purchase.movieTitle">
                        } @else {
                          <div class="movie-placeholder">🎬</div>
                        }
                     </div>
                    <div class="movie-info">
                      <h3>{{ purchase.movieTitle }}</h3>
                      <p class="purchase-date">Purchased {{ formatDate(purchase.purchaseDate) }}</p>
                      <p class="purchase-price">\${{ purchase.price.toFixed(2) }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Watchlist Tab -->
        @if (activeTab() === 'watchlist') {
          <div class="movies-section">
            <h2>My Watchlist</h2>
            @if (wishlistItems().length === 0) {
              <div class="empty-state">
                <p>🕒 Your watchlist is empty</p>
                <a routerLink="/" class="browse-btn">Find Movies to Watch</a>
              </div>
            } @else {
              <div class="movies-grid">
                @for (item of wishlistItems(); track item.movieId) {
                  <app-movie-card [movie]="{id: item.movieId, title: item.movieTitle, poster_path: item.posterPath, vote_average: 0, overview: ''}"></app-movie-card>
                }
              </div>
            }
          </div>
        }

        <!-- Favorites Tab -->
        @if (activeTab() === 'favorites') {
          <div class="movies-section">
            <h2>My Favorite Movies</h2>
            @if (favoriteItems().length === 0) {
              <div class="empty-state">
                <p>⭐ No favorites added yet</p>
                <a routerLink="/" class="browse-btn">Explore Content</a>
              </div>
            } @else {
              <div class="movies-grid">
                @for (item of favoriteItems(); track item.movieId) {
                  <app-movie-card [movie]="{id: item.movieId, title: item.movieTitle, poster_path: item.posterPath, vote_average: 0, overview: ''}"></app-movie-card>
                }
              </div>
            }
          </div>
        }

        <!-- Downloads Tab -->
        @if (activeTab() === 'downloads') {
          <div class="movies-section">
            <h2>Offline Downloads</h2>
            @if (purchases().length === 0) {
              <div class="empty-state">
                <p>📥 You haven't downloaded any movies yet</p>
                <a routerLink="/" class="browse-btn">Explore Content to Download</a>
              </div>
            } @else {
              <div class="movies-grid">
                @for (purchase of purchases(); track purchase.movieId) {
                  <div class="movie-card-simple">
                     <div class="movie-poster" [routerLink]="['/movie', purchase.movieId]">
                        <div class="purchased-badge">📥 Available Offline</div>
                        @if (purchase.posterPath) {
                          <img [src]="getPosterUrl(purchase.posterPath)" [alt]="purchase.movieTitle">
                        } @else {
                          <div class="movie-placeholder">🎬</div>
                        }
                     </div>
                    <div class="movie-info">
                      <h3>{{ purchase.movieTitle }}</h3>
                      <p class="purchase-date">Ready to watch without internet</p>
                      <button 
                        class="remove-btn" 
                        style="margin-top: 12px; font-size: 0.8rem; padding: 6px 12px;"
                        (click)="removePurchase(purchase.movieId)">
                        Remove from Device
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Settings Tab -->
        @if (activeTab() === 'settings') {
          <div class="settings-section">
            <div class="settings-card">
              <h2>Personal Information</h2>
              
              @if (successMessage()) {
                <div class="success-banner">{{ successMessage() }}</div>
              }
              
              @if (errorMessage()) {
                <div class="error-banner">{{ errorMessage() }}</div>
              }

              <form (ngSubmit)="updateProfile()" class="settings-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      [(ngModel)]="formData.firstName"
                      name="firstName"
                      [disabled]="isUpdating()"
                    />
                  </div>

                  <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      [(ngModel)]="formData.lastName"
                      name="lastName"
                      [disabled]="isUpdating()"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      [(ngModel)]="formData.age"
                      name="age"
                      [disabled]="isUpdating()"
                    />
                  </div>

                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select
                      id="gender"
                      [(ngModel)]="formData.gender"
                      name="gender"
                      [disabled]="isUpdating()"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="submit-btn" [disabled]="isUpdating()">
                  @if (isUpdating()) {
                    <span class="spinner"></span>
                    Updating...
                  } @else {
                    Update Profile
                  }
                </button>
              </form>
            </div>

            <div class="settings-card">
              <h2>Change Password</h2>
              
              <form (ngSubmit)="changePassword()" class="settings-form">
                <div class="form-group">
                  <label for="oldPassword">Current Password</label>
                  <input
                    type="password"
                    id="oldPassword"
                    [(ngModel)]="passwordData.oldPassword"
                    name="oldPassword"
                    [disabled]="isChangingPassword()"
                  />
                </div>

                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    [(ngModel)]="passwordData.newPassword"
                    name="newPassword"
                    minlength="8"
                    [disabled]="isChangingPassword()"
                  />
                  <small>Minimum 8 characters</small>
                </div>

                <button type="submit" class="submit-btn" [disabled]="isChangingPassword()">
                  @if (isChangingPassword()) {
                    <span class="spinner"></span>
                    Changing...
                  } @else {
                    Change Password
                  }
                </button>
              </form>
            </div>

            <div class="settings-card danger-zone">
              <h2>Danger Zone</h2>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              
              <button (click)="confirmDelete()" class="delete-btn" [disabled]="isDeleting()">
                @if (isDeleting()) {
                  <span class="spinner"></span>
                  Deleting...
                } @else {
                  Delete Account
                }
              </button>
            </div>
          </div>
        }
      </div> <!-- end tab-content -->
    </div> <!-- end profile-content-area -->
  </div> <!-- end profile-main-layout -->
</div> <!-- end profile-container -->
`,
  styleUrls: ['./auth.css', './profile.component.css']
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tmdbService = inject(TmdbService);
  private readonly purchaseService = inject(PurchaseService);
  private readonly wishlistService = inject(WishlistService);
  private readonly favoriteService = inject(FavoriteService);

  user = this.authService.currentUser;
  activeTab = signal<'purchases' | 'watchlist' | 'favorites' | 'downloads' | 'settings'>('purchases');

  purchases = computed(() => this.purchaseService.getPurchases());
  wishlistItems = computed(() => this.wishlistService.getWishlist());
  favoriteItems = computed(() => this.favoriteService.getFavorites());

  purchaseCount = computed(() => this.purchases().length);
  wishlistCount = computed(() => this.wishlistItems().length);
  favoriteCount = computed(() => this.favoriteItems().length);

  formData: Partial<User> = {};
  passwordData = {
    oldPassword: '',
    newPassword: ''
  };

  isUpdating = signal(false);
  isChangingPassword = signal(false);
  isDeleting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    // Listen for tab changes via query params
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['purchases', 'watchlist', 'favorites', 'downloads', 'settings'].includes(tab)) {
        this.activeTab.set(tab as any);
      }
    });

    // Load form data
    const currentUser = this.user();
    if (currentUser) {
      this.formData = { ...currentUser };
    }

    // Always attempt to recover posters if we have any
    this.recoverMissingPosters();
  }

  private recoverMissingPosters() {
    const currentPurchases = this.purchases();
    currentPurchases.forEach(purchase => {
      if (!purchase.posterPath) {
        // Try movie first
        this.tmdbService.getMovieDetails(purchase.movieId.toString()).subscribe({
          next: (movie) => {
            if (movie.poster_path) {
              this.purchaseService.updatePurchasePoster(purchase.movieId, movie.poster_path);
            }
          },
          error: () => {
            // If movie fails, try TV
            this.tmdbService.getTvDetails(purchase.movieId.toString()).subscribe({
              next: (tv) => {
                if (tv.poster_path) {
                  this.purchaseService.updatePurchasePoster(purchase.movieId, tv.poster_path);
                }
              }
            });
          }
        });
      }
    });
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  getPosterUrl(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(date).toLocaleDateString();
  }

  updateProfile() {
    this.isUpdating.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.updateProfile(this.formData).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        this.isUpdating.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to update profile');
      }
    });
  }

  changePassword() {
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.errorMessage.set('Please fill in all password fields');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.errorMessage.set('New password must be at least 8 characters');
      return;
    }

    this.isChangingPassword.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.changePassword(
      this.passwordData.oldPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.successMessage.set('Password changed successfully!');
        this.passwordData = { oldPassword: '', newPassword: '' };
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        this.isChangingPassword.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to change password');
      }
    });
  }

  confirmDelete() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      this.isDeleting.set(true);
      this.authService.deleteAccount().subscribe({
        error: (error) => {
          this.isDeleting.set(false);
          this.errorMessage.set(error.error?.error || 'Failed to delete account');
        }
      });
    }
  }

  removePurchase(movieId: number) {
    if (confirm('Are you sure you want to remove this movie from your device?')) {
      this.purchaseService.removePurchase(movieId);
    }
  }
}
