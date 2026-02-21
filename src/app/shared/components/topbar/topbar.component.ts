import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
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
        <div class="notification-wrapper">
          <button class="action-btn" title="Recent Activity" (click)="toggleInbox()">
            <span class="icon">🔔</span>
            @if (notificationService.unreadCount() > 0) {
              <span class="badge">{{ notificationService.unreadCount() }}</span>
            }
          </button>

          @if (showInbox()) {
            <div class="inbox-dropdown">
              <div class="inbox-header">
                <h3>Activity Feed</h3>
                <button class="clear-all" (click)="notificationService.markAllAsRead()">Mark all as read</button>
              </div>
              <div class="inbox-list">
                @for (item of notificationService.inbox(); track item.id) {
                  <div class="inbox-item" [class.unread]="!item.read" (click)="notificationService.markAsRead(item.id)">
                    <div class="item-icon">
                      @if (item.type === 'purchase') { 🎬 }
                      @else if (item.type === 'favorite') { ⭐ }
                      @else { 🔔 }
                    </div>
                    <div class="item-content">
                      <p class="item-title">{{ item.title }}</p>
                      <p class="item-message">{{ item.message }}</p>
                      <span class="item-time">{{ formatTime(item.timestamp) }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-inbox">
                    <span class="icon">✨</span>
                    <p>No recent activity</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
        
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
      top: -6px;
      right: -6px;
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 10px;
      border: 2px solid var(--bg-deep);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-wrapper {
      position: relative;
    }

    .inbox-dropdown {
      position: absolute;
      top: calc(100% + 15px);
      right: -100px;
      width: 360px;
      background: var(--bg-surface);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      overflow: hidden;
      animation: dropdownFade 0.2s ease-out;
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .inbox-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
    }

    .inbox-header h3 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
    }

    .clear-all {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .inbox-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .inbox-item {
      padding: 16px 20px;
      display: flex;
      gap: 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .inbox-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .inbox-item.unread {
      background: rgba(157, 137, 255, 0.05);
    }

    .item-icon {
      font-size: 1.25rem;
      padding-top: 2px;
    }

    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-title {
      font-size: 0.9rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-main);
    }

    .item-message {
      font-size: 0.85rem;
      margin: 0;
      color: var(--text-dim);
      line-height: 1.4;
    }

    .item-time {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .empty-inbox {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-dim);
    }

    .empty-inbox .icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 12px;
    }

    .empty-inbox p {
      margin: 0;
      font-size: 0.9rem;
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 8px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logout-mini-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
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
  readonly notificationService = inject(NotificationService);
  private readonly el = inject(ElementRef);

  showInbox = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close the inbox if clicking outside the entire topbar or specifically this component
    if (!this.el.nativeElement.contains(target)) {
      this.showInbox.set(false);
    }
  }

  toggleInbox() {
    this.showInbox.update(v => !v);
  }


  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }
}

