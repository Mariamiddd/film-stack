import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent {
    @Input({ required: true }) formData: Partial<User> = {};
    @Input({ required: true }) passwordData = { oldPassword: '', newPassword: '' };
    @Input({ required: true }) isUpdating = false;
    @Input({ required: true }) isChangingPassword = false;
    @Input({ required: true }) isDeleting = false;
    @Input({ required: true }) successMessage: string | null = null;
    @Input({ required: true }) errorMessage: string | null = null;

    @Output() updateProfile = new EventEmitter<void>();
    @Output() changePassword = new EventEmitter<void>();
    @Output() deleteAccount = new EventEmitter<void>();

    onUpdateProfile() {
        this.updateProfile.emit();
    }

    onChangePassword() {
        this.changePassword.emit();
    }

    onDeleteAccount() {
        this.deleteAccount.emit();
    }
}
