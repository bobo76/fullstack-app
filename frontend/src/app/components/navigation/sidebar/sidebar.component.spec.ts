import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent, ViewType } from './sidebar.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, MatListModule, MatIconModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with calendar as active view', () => {
    expect(component.activeView()).toBe('calendar');
  });

  it('should have two menu items', () => {
    expect(component.menuItems.length).toBe(2);
    expect(component.menuItems[0].id).toBe('calendar');
    expect(component.menuItems[1].id).toBe('appointment-types');
  });

  it('should update active view when selectView is called', () => {
    component.selectView('appointment-types');
    expect(component.activeView()).toBe('appointment-types');
  });

  it('should emit viewChange event when selectView is called', (done) => {
    const viewId: ViewType = 'appointment-types';

    component.viewChange.subscribe((emittedView) => {
      expect(emittedView).toBe(viewId);
      done();
    });

    component.selectView(viewId);
  });
});
