# Dashboard Components

This directory contains the modular components that make up the Command Center Dashboard. The original large Dashboard component has been broken down into smaller, reusable components for better maintainability and code organization.

## Component Structure

### Core Components

- **DashboardHeader** - Header section with title, weather info, and quick stats grid
- **StatCard** - Individual stat card component used in the header
- **ActionButton** - Reusable action button component

### Alert & Monitoring Components

- **CriticalAlerts** - Displays critical alerts with severity indicators
- **AISituationSummary** - AI-powered situation assessment and recommendations
- **LiveCommandFeed** - Live video feed with zone selection
- **ZoneStatus** - Zone monitoring sidebar with status indicators

### Analytics & Management Components

- **IncidentAnalytics** - Incident type analytics with trends
- **ResponseTeams** - Response team management with dispatch functionality
- **ActionCenter** - Quick action buttons for common operations
- **EmergencyContacts** - Emergency contact management with call functionality

## Usage

### Importing Components

```jsx
import {
  DashboardHeader,
  CriticalAlerts,
  AISituationSummary,
  LiveCommandFeed,
  ZoneStatus,
  IncidentAnalytics,
  ResponseTeams,
  ActionCenter,
  EmergencyContacts
} from "../components/dashboard"
```

### Example Usage

```jsx
// In your main Dashboard component
<DashboardHeader dashboardData={dashboardData} />

<div className="grid md:grid-cols-2 gap-6">
  <CriticalAlerts criticalAlerts={criticalAlerts} />
  <AISituationSummary />
</div>

<div className="grid md:grid-cols-3 gap-6">
  <LiveCommandFeed 
    selectedZone={selectedZone}
    setSelectedZone={setSelectedZone}
    zoneFeeds={zoneFeeds}
    currentTime={currentTime}
  />
  <ZoneStatus 
    selectedZone={selectedZone}
    setSelectedZone={setSelectedZone}
    zoneFeeds={zoneFeeds}
  />
</div>
```

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Testability** - Individual components are easier to test
4. **Readability** - Code is more organized and easier to understand
5. **Performance** - Components can be optimized individually
6. **Team Collaboration** - Different team members can work on different components

## Data Flow

- **Props Down** - Data flows from parent Dashboard to child components via props
- **Events Up** - User interactions are handled by callback functions passed as props
- **State Management** - Main state is managed in the Dashboard component and passed down

## Styling

All components use Tailwind CSS classes and maintain consistent styling patterns:
- White/transparent backgrounds with backdrop blur
- Rounded corners and shadows
- Consistent spacing and typography
- Responsive design patterns 