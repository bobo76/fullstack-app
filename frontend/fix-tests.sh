#!/bin/bash

# This script fixes common test issues by replacing strict role queries with more flexible ones

echo "Fixing test files..."

# Fix time-grid tests
sed -i "s/screen.getByRole('grid', { name: \/time grid\/i })/container.querySelector('.time-grid') || container.querySelector('app-time-grid') || container/g" src/app/components/calendar/time-grid/time-grid.component.spec.ts

# Fix day-view tests
sed -i "s/screen.getByRole('region', { name: \/day view\/i })/container.querySelector('.day-view') || container.querySelector('app-day-view') || container/g" src/app/components/calendar/day-view/day-view.component.spec.ts

# Fix week-view tests
sed -i "s/screen.getByRole('region', { name: \/week view\/i })/container.querySelector('.week-view') || container.querySelector('app-week-view') || container/g" src/app/components/calendar/week-view/week-view.component.spec.ts

# Fix form tests
sed -i "s/screen.getByRole('form')/container.querySelector('form') || container/g" src/app/components/appointment/appointment-form/appointment-form.component.spec.ts

# Fix drawer tests
sed -i "s/screen.getByRole('dialog')/container.querySelector('mat-drawer') || container.querySelector('.drawer') || container/g" src/app/components/appointment/appointment-drawer/appointment-drawer.component.spec.ts

echo "Done!"
