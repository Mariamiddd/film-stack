import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="burger-menu" (click)="layout.toggleSidebar()">
          <span class="burger-icon">☰</span>
        </button>
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search for films, directors, or actors..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="user-actions">
        <button class="action-btn" title="Notifications" (click)="showNotifications()">
          <span class="icon">🔔</span>
          @if (hasNotifications()) {
            <span class="badge"></span>
          }
        </button>
        
        <div class="profile-link">
          @if (authService.isAuthenticated()) {
            <div class="user-meta">
              <div class="avatar-container" [routerLink]="['/auth/profile']">
                <img [src]="authService.currentUser()?.avatar || 'assets/default-avatar.png'" alt="Profile">
              </div>
              <button class="logout-mini-btn" (click)="authService.signOut()" title="Sign Out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>

            </div>
          } @else {
            <a routerLink="/auth/sign-in" class="sign-in-btn">Sign In</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 80px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      background: var(--bg-deep);
      z-index: 90;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
    }

    .burger-menu {
      display: none;
      background: none;
      border: none;
      color: var(--text-main);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 8px;
    }

    .search-container {
      position: relative;
      flex: 1;
      max-width: 600px;
      background: var(--bg-surface);
      border-radius: 12px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid var(--glass-border);
    }

    .search-icon {
      color: var(--text-dim);
    }

    .search-input {
      background: transparent;
      border: none;
      color: var(--text-main);
      padding: 12px 0;
      width: 100%;
      outline: none;
      font-size: 0.95rem;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-left: 40px;
    }

    .action-btn {
      position: relative;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
    }

    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      border: 2px solid var(--bg-deep);
    }

    .sign-in-btn {
      background: var(--primary);
      color: white;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .user-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logout-mini-btn {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 6px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .logout-mini-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      transform: translateY(-2px);
    }

    .avatar-container {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid var(--glass-border);
    }

    .avatar-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (max-width: 1024px) {
      .topbar {
        padding: 0 20px;
      }
      .burger-menu {
        display: block;
      }
      .search-container {
        margin-right: 0;
      }
    }

    @media (max-width: 768px) {
      .search-container {
        display: none;
      }
    }
  `]
})
export class TopbarComponent {
  readonly authService = inject(AuthService);
  readonly layout = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);

  hasNotifications = signal(true); // Mocking notifications for UI

  showNotifications() {
    this.notificationService.show(
      'You are all caught up! No new messages or releases.',
      'info'
    );
    this.hasNotifications.set(false); // Clear badge on click
  }
}
