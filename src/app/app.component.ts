import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, NotificationComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
}
