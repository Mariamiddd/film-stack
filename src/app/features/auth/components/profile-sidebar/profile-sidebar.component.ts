import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-profile-sidebar',
    standalone: true,
    templateUrl: './profile-sidebar.component.html',
    styleUrl: './profile-sidebar.component.css'
})
export class ProfileSidebarComponent {
    @Input({ required: true }) activeTab: string = 'purchases';
    @Input({ required: true }) unreadMessages: number = 0;
    @Output() tabChange = new EventEmitter<any>();

    setTab(tab: any) {
        this.tabChange.emit(tab);
    }
}
