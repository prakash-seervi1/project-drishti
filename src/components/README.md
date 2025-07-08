# Components Documentation

## FloatingActionBar

The `FloatingActionBar` component provides a centralized solution for floating action buttons and modals across the application.

### Features

- **Expandable Design**: Click the main button to expand and show additional action buttons
- **Smooth Animations**: Staggered animations for button appearance/disappearance
- **Centralized Modals**: Handles both Report Modal and AI Assistant Modal
- **Consistent Positioning**: Fixed positioning that works across all pages
- **No Overlap Issues**: Buttons are properly spaced and don't hide each other

### Usage

Simply import and use the `FloatingActionBar` component in your main App component:

```jsx
import FloatingActionBar from "./components/FloatingActionBar"

// In your App component
<FloatingActionBar />
```

### Components Included

1. **Main Toggle Button**: Blue gradient button with Plus/X icon
2. **AI Assistant Button**: Green gradient button with message and sparkles icons
3. **Report Button**: Red gradient button with alert triangle icon
4. **ReportModal**: Modal for reporting incidents
5. **AIAssistant**: Modal for AI assistant functionality

### Benefits of Centralization

1. **DRY Principle**: No more repeated floating button code across pages
2. **Consistent UX**: Same behavior and positioning on all pages
3. **Easier Maintenance**: Single place to update floating action functionality
4. **No Overlap**: Buttons are properly positioned and don't hide each other
5. **Better Performance**: Reduced component duplication

### Refactoring Summary

The following pages were refactored to remove individual floating buttons:

- ✅ `src/pages/Dashboard.jsx`
- ✅ `src/pages/Incidents.jsx` 
- ✅ `src/pages/Map.jsx`
- ✅ `src/pages/IncidentDetail.jsx`
- ✅ `src/pages/Summary.jsx`
- ✅ `src/App.jsx` (main app component)

### Animation Details

- **Expansion**: Buttons slide up with staggered delays (0ms, 50ms)
- **Collapse**: Buttons slide down with reverse delays (150ms, 100ms)
- **Opacity**: Smooth fade in/out transitions
- **Transform**: Plus icon rotates 45° to become X icon

### State Management

The component manages its own state for:
- `isExpanded`: Controls button visibility
- `isReportModalOpen`: Controls Report Modal visibility
- `isAIAssistantOpen`: Controls AI Assistant Modal visibility

### Styling

- Uses Tailwind CSS for consistent styling
- Gradient backgrounds for visual appeal
- Hover effects and transitions
- Responsive design that works on all screen sizes
- High z-index (z-50) to ensure visibility above other content 