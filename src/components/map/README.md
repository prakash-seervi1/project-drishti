# Map Components

This directory contains modular components for the Live Safety Map functionality, extracted from the large `Map.jsx` file.

## Components

### MapHeader
Displays the map header with title, description, and action buttons (refresh, filters).

**Props:**
- `onRefresh`: Function to handle refresh action
- `onFilterToggle`: Function to toggle filter visibility
- `showFilters`: Boolean to show/hide filters
- `activeFilters`: Array of active filter names

### MapFilters
Handles map filtering functionality with layer visibility and filter options.

**Props:**
- `showFilters`: Boolean to show/hide filters
- `filters`: Filter state object
- `setFilters`: Function to update filters
- `onClose`: Function to close filters

### MapControls
Provides map layer controls and legend toggle.

**Props:**
- `selectedLayer`: Currently selected layer
- `setSelectedLayer`: Function to change selected layer
- `showLegend`: Boolean to show/hide legend
- `setShowLegend`: Function to toggle legend

### MapLegend
Displays the map legend with color coding for incidents, responders, and zones.

**Props:**
- `showLegend`: Boolean to show/hide legend

### IncidentMarker
Renders individual incident markers on the map with info windows.

**Props:**
- `incident`: Incident data object
- `getIncidentMarkerIcon`: Function to get marker icon
- `getStatusColor`: Function to get status color
- `timeAgo`: Function to format time

### ResponderMarker
Renders individual responder markers on the map with info windows.

**Props:**
- `responder`: Responder data object
- `getResponderMarkerIcon`: Function to get marker icon
- `getResponderStatusColor`: Function to get status color

### ZonePolygon
Renders zone polygons on the map with info windows.

**Props:**
- `zone`: Zone data object
- `getZoneColor`: Function to get zone colors
- `getStatusColor`: Function to get status color

### MapStats
Displays live statistics overlay on the map.

**Props:**
- `stats`: Statistics object with incident, responder, and zone counts

## Utilities

### utils.jsx
Contains utility functions for:
- Marker icon generation
- Status color mapping
- Time formatting
- Statistics calculation

## Usage

```jsx
import {
  MapHeader,
  MapFilters,
  MapControls,
  MapLegend,
  IncidentMarker,
  ResponderMarker,
  ZonePolygon,
  MapStats,
  getIncidentMarkerIcon,
  getStatusColor,
  timeAgo
} from './components/map'

// Use in your map component
```

## Benefits

- **Modularity**: Each component has a single responsibility
- **Reusability**: Components can be reused across different map views
- **Maintainability**: Easier to update and debug individual components
- **Testability**: Each component can be tested in isolation
- **Performance**: Better code splitting and lazy loading opportunities 