import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-profile-header',
    standalone: true,
    templateUrl: './profile-header.component.html',
    styleUrl: './profile-header.component.css'
})
export class ProfileHeaderComponent {
    @Input({ required: true }) user: User | null = null;
    @Input({ required: true }) purchaseCount = 0;
    @Input({ required: true }) favoriteCount = 0;

    getInitials(): string {
        if (!this.user) return '?';
        return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
    }
}
