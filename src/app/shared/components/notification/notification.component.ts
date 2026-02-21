import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  template: `
    @if (notificationService.currentNotification(); as n) {
      <div class="notification-container" [class]="n.type">
        <div class="message-content">
          <span class="icon">{{ getIcon(n.type) }}</span>
          <p>{{ n.message }}</p>
        </div>
        <div class="actions">
          @if (n.action) {
            <button class="action-btn" (click)="n.action.callback(); notificationService.clear()">
              {{ n.action.label }}
            </button>
          }
          <button class="close-btn" (click)="notificationService.clear()">✕</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      padding: 16px 24px;
      border-radius: 12px;
      background: rgba(30, 30, 40, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-width: 320px;
      max-width: 450px;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid #6366f1;
    }

    .notification-container.success { border-left-color: #10b981; }
    .notification-container.error { border-left-color: #ef4444; }
    .notification-container.info { border-left-color: #6366f1; }

    @keyframes slideIn {
      from { transform: translateX(100%) translateY(20px); opacity: 0; }
      to { transform: translateX(0) translateY(0); opacity: 1; }
    }

    .message-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon {
      font-size: 1.2rem;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.4;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #4f46e5;
      transform: translateY(-1px);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: white;
    }
  `]
})
export class NotificationComponent {
  readonly notificationService = inject(NotificationService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }
}
