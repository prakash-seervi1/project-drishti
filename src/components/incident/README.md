# Incident Components

This directory contains the modular components that make up the IncidentDetail page. The original large IncidentDetail component (1156 lines) has been broken down into smaller, reusable components for better maintainability and code organization.

## Component Structure

### Navigation & Layout Components

- **IncidentNavigation** - Navigation bar with back button and action buttons
- **QuickStats** - Quick stats grid showing response time, nearby units, etc.
- **TabNavigation** - Tab navigation component for switching between views

### Overview Tab Components

- **IncidentDetails** - Incident details section with type, zone, status, etc.
- **EnvironmentalConditions** - Environmental data display
- **AIRecommendations** - AI-powered recommendations section
- **AssignedResponder** - Assigned responder management
- **RelatedIncidents** - Related incidents list
- **OverviewTab** - Main overview tab container

### Timeline Tab Components

- **TimelineItem** - Individual timeline item component
- **TimelineTab** - Timeline tab container with note adding functionality

### Media Tab Components

- **MediaTab** - Media tab with live camera feed and location map
- Live camera feed with controls (play/pause, volume, maximize)
- Interactive location map showing incident zone and responder positions

### Analytics Tab Components

- **AnalyticsTab** - Analytics tab with charts and data visualization
- Response time analysis charts
- Crowd density over time visualization

### Responders Tab Components

- **RespondersTab** - Main responders tab container with live tracking and coordination
- **ResponderCard** - Individual responder information card with status, ETA, and communication buttons
- **LiveTrackingMap** - Interactive map showing real-time responder locations and routes
- **TeamCoordination** - Team coordination tools including communication hub and emergency actions
- **LiveDataStream** - Real-time data stream showing environmental conditions and mobile integration

## Usage

### Importing Components

```jsx
import {
  IncidentNavigation,
  QuickStats,
  TabNavigation,
  OverviewTab,
  TimelineTab,
  MediaTab,
  AnalyticsTab,
  RespondersTab,
  IncidentDetails,
  EnvironmentalConditions,
  AIRecommendations,
  AssignedResponder,
  RelatedIncidents,
  TimelineItem
} from "../components/incident"
```

### Example Usage

```jsx
// In your main IncidentDetail component
<IncidentNavigation />

<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
  {/* Incident Header */}
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
    {/* Header content */}
    <QuickStats liveData={liveData} />
  </div>

  <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

  <div className="p-8">
    {activeTab === "overview" && (
      <OverviewTab
        incident={incident}
        timeAgo={timeAgo}
        liveData={liveData}
        responders={responders}
        assignResponder={assignResponder}
        relatedIncidents={relatedIncidents}
      />
    )}

    {activeTab === "timeline" && (
      <TimelineTab
        notes={notes}
        newNote={newNote}
        setNewNote={setNewNote}
        addNote={addNote}
        timeAgo={timeAgo}
      />
    )}

    {activeTab === "media" && (
      <MediaTab incident={incident} isVideoPlaying={isVideoPlaying} setIsVideoPlaying={setIsVideoPlaying} />
    )}

    {activeTab === "analytics" && (
      <AnalyticsTab />
    )}

    {activeTab === "responders" && (
      <RespondersTab incident={incident} />
    )}
  </div>
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

- **Props Down** - Data flows from parent IncidentDetail to child components via props
- **Events Up** - User interactions are handled by callback functions passed as props
- **State Management** - Main state is managed in the IncidentDetail component and passed down

## File Size Reduction

- **Before**: 1156 lines in one file
- **After**: 344 lines in main file + multiple focused components
- **Reduction**: ~70% reduction in main file size

## Styling

All components use Tailwind CSS classes and maintain consistent styling patterns:
- White/transparent backgrounds with backdrop blur
- Rounded corners and shadows
- Consistent spacing and typography
- Responsive design patterns
- Status-based color coding 