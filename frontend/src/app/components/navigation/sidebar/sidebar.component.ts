import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

export type ViewType = 'calendar' | 'appointment-types' | 'settings';

interface MenuItem {
  id: ViewType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatListModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  viewChange = output<ViewType>();

  activeView = signal<ViewType>('calendar');

  menuItems: MenuItem[] = [
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { id: 'appointment-types', label: 'Appointment Types', icon: 'category' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  selectView(viewId: ViewType): void {
    this.activeView.set(viewId);
    this.viewChange.emit(viewId);
  }
}
