import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly layout = inject(LayoutService);
  readonly searchService = inject(SearchService);

  resetSearch() {
    this.searchService.setQuery('');
    this.layout.closeSidebar();
  }
}
