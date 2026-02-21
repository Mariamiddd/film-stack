import { Injectable, signal } from '@angular/core';

export interface Notification {
    message: string;
    type: 'info' | 'success' | 'error';
    action?: {
        label: string,
        callback: () => void
    };
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    currentNotification = signal<Notification | null>(null);

    show(message: string, type: 'info' | 'success' | 'error' = 'info', action?: { label: string, callback: () => void }) {
        this.currentNotification.set({ message, type, action });

        // Auto-hide after 5 seconds if there's no action
        if (!action) {
            setTimeout(() => {
                if (this.currentNotification()?.message === message) {
                    this.clear();
                }
            }, 5000);
        }
    }

    clear() {
        this.currentNotification.set(null);
    }
}
