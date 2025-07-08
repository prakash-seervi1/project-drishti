# Incidents Components

This directory contains the modular components that make up the Incidents page. The original large Incidents component (900 lines) has been broken down into smaller, reusable components for better maintainability and code organization.

## Component Structure

### Layout & Header Components

- **IncidentHeader** - Main header with title, view mode toggle, and bulk actions
- **StatusOverview** - Status count cards with filtering functionality
- **SearchFilters** - Search input and filter dropdowns

### Card Components

- **IncidentCard** - Main incident card container
- **IncidentQuickStats** - Quick statistics display (crowd density, ETA, environment, media)
- **IncidentTags** - Incident tags display
- **IncidentActions** - Action buttons (view details, call responder, escalate, etc.)
- **IncidentExpandedDetails** - Expanded details section with timeline, equipment, and environmental data

### List & Utility Components

- **IncidentList** - Container for rendering the list of incident cards
- **utils.jsx** - Utility functions for colors, icons, formatting, and data processing

## Usage

### Importing Components

```jsx
import {
  IncidentHeader,
  StatusOverview,
  SearchFilters,
  IncidentList,
  getStatusColor,
  getPriorityColor,
  getTypeIcon,
  getResponderIcon,
  timeAgo,
  getStatusCounts
} from "../components/incidents"
```

### Example Usage

```jsx
// In your main Incidents component
<IncidentHeader 
  viewMode={viewMode}
  setViewMode={setViewMode}
  selectedIncidents={selectedIncidents}
  handleBulkAction={handleBulkAction}
/>

<div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
  <StatusOverview 
    statusCounts={statusCounts}
    statusFilter={statusFilter}
    setStatusFilter={setStatusFilter}
  />

  <SearchFilters
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    typeFilter={typeFilter}
    setTypeFilter={setTypeFilter}
    priorityFilter={priorityFilter}
    setPriorityFilter={setPriorityFilter}
    sortBy={sortBy}
    setSortBy={setSortBy}
    sortOrder={sortOrder}
    setSortOrder={setSortOrder}
  />
</div>

<IncidentList
  loading={loading}
  filteredIncidents={filteredIncidents}
  searchTerm={searchTerm}
  statusFilter={statusFilter}
  typeFilter={typeFilter}
  priorityFilter={priorityFilter}
  typeInfo={getTypeIcon}
  getStatusColor={getStatusColor}
  getPriorityColor={getPriorityColor}
  getResponderIcon={getResponderIcon}
  timeAgo={timeAgo}
  selectedIncidents={selectedIncidents}
  setSelectedIncidents={setSelectedIncidents}
  expandedCard={expandedCard}
  setExpandedCard={setExpandedCard}
/>
```

## Utility Functions

### Color & Styling Functions

- **getStatusColor(status)** - Returns CSS classes for status-based styling
- **getPriorityColor(priority)** - Returns CSS classes for priority-based styling
- **getTypeIcon(type)** - Returns icon and color for incident type
- **getResponderIcon(type)** - Returns icon component for responder type

### Data Processing Functions

- **timeAgo(timestamp)** - Formats timestamp as relative time (e.g., "2 minutes ago")
- **getStatusCounts(incidents)** - Calculates count of incidents by status

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Testability** - Individual components are easier to test
4. **Readability** - Code is more organized and easier to understand
5. **Performance** - Components can be optimized individually
6. **Team Collaboration** - Different team members can work on different components

## Data Flow

- **Props Down** - Data flows from parent Incidents to child components via props
- **Events Up** - User interactions are handled by callback functions passed as props
- **State Management** - Main state is managed in the Incidents component and passed down

## File Size Reduction

- **Before**: 900 lines in one file
- **After**: 376 lines in main file + multiple focused components
- **Reduction**: ~58% reduction in main file size

## Styling

All components use Tailwind CSS classes and maintain consistent styling patterns:
- White/transparent backgrounds with backdrop blur
- Rounded corners and shadows
- Consistent spacing and typography
- Responsive design patterns
- Status-based color coding
- Interactive hover and focus states

## Component Dependencies

- **IncidentCard** depends on: IncidentQuickStats, IncidentTags, IncidentActions, IncidentExpandedDetails
- **IncidentList** depends on: IncidentCard
- All components use utility functions from utils.jsx
- Components are designed to be self-contained with clear prop interfaces 