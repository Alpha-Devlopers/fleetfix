import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MockApiService, User, FaultAlert } from '../services/mock-api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  currentUser: User | null = null;
  activeRouteTitle = signal('Dashboard');
  sidebarCollapsed = signal(false);
  
  // Notifications state
  showNotifications = signal(false);
  alertsList: FaultAlert[] = [];
  unreadCount = signal(0);

  constructor(
    private mockApi: MockApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.mockApi.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });

    // Track active page title based on router URL
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });

    // Fetch alerts to show in notification popover
    this.mockApi.getFaultAlerts().subscribe(alerts => {
      this.alertsList = alerts.slice(0, 4); // show top 4
      this.unreadCount.set(alerts.filter(a => a.status === 'Unresolved').length);
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications.update(v => !v);
  }

  closeNotifications() {
    this.showNotifications.set(false);
  }

  clearNotifications() {
    this.unreadCount.set(0);
  }

  logout() {
    this.mockApi.logout().subscribe(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  private updateTitle(url: string) {
    if (url.includes('/dashboard')) this.activeRouteTitle.set('Dashboard Overview');
    else if (url.includes('/vehicles')) this.activeRouteTitle.set('Vehicle Management');
    else if (url.includes('/drivers')) this.activeRouteTitle.set('Driver Directory');
    else if (url.includes('/tracking')) this.activeRouteTitle.set('Live GPS Tracking');
    else if (url.includes('/diagnostics')) this.activeRouteTitle.set('System Diagnostics & Faults');
    else if (url.includes('/repair-order')) this.activeRouteTitle.set('AI Assist Repair Order');
    else if (url.includes('/inventory')) this.activeRouteTitle.set('Parts Inventory');
    else if (url.includes('/reports')) this.activeRouteTitle.set('Fleet & Operations Reports');
    else if (url.includes('/settings')) this.activeRouteTitle.set('Account Settings');
    else this.activeRouteTitle.set('FleetFix');
  }
}
