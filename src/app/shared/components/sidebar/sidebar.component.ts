import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar-overlay" [class.open]="layout.isSidebarOpen()" (click)="layout.closeSidebar()"></div>
    <aside class="sidebar" [class.open]="layout.isSidebarOpen()">
      <div class="sidebar-header">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">Film<span>Stack</span></span>
        </a>
        <button class="close-sidebar-btn" (click)="layout.closeSidebar()">✕</button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="icon">🏠</span> Home
          </a>
          <a routerLink="/movies" routerLinkActive="active" class="nav-item">
            <span class="icon">🧭</span> Movies
          </a>
          <a routerLink="/tv-shows" routerLinkActive="active" class="nav-item">
            <span class="icon">🎭</span> TV Shows
          </a>
        </div>

        <div class="nav-group">
          <p class="group-title">Personal</p>
          <a routerLink="/auth/profile" [queryParams]="{tab: 'purchases'}" routerLinkActive="active" class="nav-item">
            <span class="icon">🎬</span> My Movies
          </a>
          <a routerLink="/auth/profile" [queryParams]="{tab: 'watchlist'}" routerLinkActive="active" class="nav-item">
            <span class="icon">🕒</span> Watchlist
          </a>
          <a routerLink="/auth/profile" [queryParams]="{tab: 'favorites'}" routerLinkActive="active" class="nav-item">
            <span class="icon">⭐</span> Favorites
          </a>
          <a routerLink="/auth/profile" [queryParams]="{tab: 'downloads'}" routerLinkActive="active" class="nav-item">
            <span class="icon">📥</span> Downloads
          </a>
        </div>

        <div class="nav-group footer-group">
          <a routerLink="/auth/profile" [queryParams]="{tab: 'settings'}" class="nav-item">
            <span class="icon">⚙️</span> Settings
          </a>
        </div>
      </nav>
    </aside>

  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-sidebar);
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      padding: 24px 20px;
      transition: transform 0.3s ease;
      overflow-y: auto;
      scrollbar-width: none; /* Hide scrollbar for cleaner look */
    }

    .sidebar::-webkit-scrollbar {
      display: none;
    }

    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 95;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .sidebar-header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .close-sidebar-btn {
      display: none;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 4px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .logo-text span {
      color: var(--primary);
    }

    .logo-icon {
      font-size: 1.6rem;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .group-title {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 12px;
      color: var(--text-muted);
      font-weight: 500;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .nav-item:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: var(--primary);
      background: rgba(157, 137, 255, 0.1);
      border-right: 3px solid var(--primary);
      border-radius: 12px 4px 4px 12px;
    }

    .icon {
      font-size: 1rem;
    }

    .footer-group {
      margin-top: 16px;
      border-top: 1px solid var(--glass-border);
      padding-top: 12px;
      margin-bottom: 32px;
    }

    .logout-btn {
      width: 100%;
      text-align: left;
    }

    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebar-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .close-sidebar-btn {
        display: block;
      }
    }
  `]
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly layout = inject(LayoutService);
}
