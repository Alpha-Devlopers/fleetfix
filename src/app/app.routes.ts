import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ShellComponent } from './components/shell.component';
import { DashboardComponent } from './components/dashboard.component';
import { VehicleListComponent } from './components/vehicles/vehicle-list.component';
import { VehicleDetailComponent } from './components/vehicles/vehicle-detail.component';
import { DriverListComponent } from './components/drivers/driver-list.component';
import { DriverDetailComponent } from './components/drivers/driver-detail.component';
import { TrackingComponent } from './components/tracking.component';
import { DiagnosticsComponent } from './components/diagnostics.component';
import { RepairOrderComponent } from './components/repair-order.component';
import { InventoryComponent } from './components/inventory.component';
import { ReportsComponent } from './components/reports.component';
import { SettingsComponent } from './components/settings.component';
import { ProfileComponent } from './components/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicles', component: VehicleListComponent },
      { path: 'vehicles/:id', component: VehicleDetailComponent },
      { path: 'drivers', component: DriverListComponent },
      { path: 'drivers/:id', component: DriverDetailComponent },
      { path: 'tracking', component: TrackingComponent },
      { path: 'diagnostics', component: DiagnosticsComponent },
      { path: 'repair-order/:id', component: RepairOrderComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
