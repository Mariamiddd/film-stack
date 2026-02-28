import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ReportService, Report } from '../../core/services/report.service';
import { NotificationService } from '../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  authService = inject(AuthService);
  reportService = inject(ReportService);
  notificationService = inject(NotificationService);
  title = inject(Title);

  reports = this.reportService.reports;
  pendingCount = computed(() => this.reports().filter((r: Report) => r.status === 'pending').length);

  responses: Record<string, string> = {};
  chatInputs: Record<string, string> = {};
  selectedReportId = signal<string | null>(null);

  selectedReport = computed(() =>
    this.reports().find(r => r.id === this.selectedReportId()) || null
  );

  selectReport(id: string) {
    this.selectedReportId.set(id === this.selectedReportId() ? null : id);
  }

  ngOnInit() {
    this.title.setTitle('Admin | Movieland');
  }

  resolveReport(report: Report) {
    const response = this.responses[report.id];
    if (!response) return;

    this.reportService.resolveReport(report.id, response);

    // Notify the user - in a real app this would go to their specific inbox
    // For this demo, we'll store it in a shared way or it will appear when they log in
    this.notificationService.show(`Response sent to ${report.userName}`, 'success');

    // Send initial chat message as response
    this.reportService.sendMessage({
      senderId: 'admin',
      receiverId: report.userId,
      reportId: report.id,
      message: response
    });
  }

  getMessages(reportId: string) {
    return this.reportService.messages()
      .filter((m: any) => m.reportId === reportId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  sendChat(report: Report) {
    const msg = this.chatInputs[report.id];
    if (!msg) return;

    this.reportService.sendMessage({
      senderId: 'admin',
      receiverId: report.userId,
      reportId: report.id,
      message: msg
    });

    this.chatInputs[report.id] = '';
  }

  editMovie(movie: any) {
    this.notificationService.show(`Catalog edit for "${movie.movieTitle}" is currently under maintenance.`, 'info');
  }
}
