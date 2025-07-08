# Home Components

This directory contains the modular components that make up the Home page. The original large Home component has been broken down into smaller, reusable components for better maintainability and code organization.

## Component Structure

### Main Sections

- **HeroSection** - Main hero section with title, description, and CTA buttons
- **FeaturesGrid** - Features section with cards showcasing different platform capabilities
- **StatsSection** - Statistics section displaying key platform metrics
- **Footer** - Footer section with branding and credits

### Reusable Components

- **FeatureCard** - Individual feature card component used in the features grid
- **StatCard** - Individual stat card component used in the stats section

## Usage

### Importing Components

```jsx
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  Footer,
  FeatureCard,
  StatCard
} from "../components/home"
```

### Example Usage

```jsx
// In your main Home component
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <Footer />
    </div>
  )
}
```

### Using Individual Components

```jsx
// FeatureCard usage
<FeatureCard
  icon={Eye}
  title="Zone Summary"
  description="AI-generated briefings for comprehensive zone analysis"
  linkText="Get AI-generated briefings for any zone"
  linkTo="/summary"
  gradientFrom="green-500"
  gradientTo="emerald-600"
/>

// StatCard usage
<StatCard
  icon={Activity}
  value="24/7"
  label="Monitoring"
  gradientFrom="blue-500"
  gradientTo="indigo-600"
/>
```

## Component Details

### HeroSection
- Contains the main title and description
- Includes CTA buttons for Dashboard and Documentation
- Uses gradient text effects and responsive design

### FeaturesGrid
- Displays platform features in a responsive grid
- Uses FeatureCard components for consistent styling
- Includes hover effects and smooth transitions

### StatsSection
- Shows key platform statistics
- Uses StatCard components in a responsive grid
- Features gradient backgrounds and icons

### Footer
- Contains branding and project information
- Includes credits and technology stack information
- Uses consistent styling with the rest of the platform

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Testability** - Individual components are easier to test
4. **Readability** - Code is more organized and easier to understand
5. **Performance** - Components can be optimized individually
6. **Team Collaboration** - Different team members can work on different components

## Styling

All components use Tailwind CSS classes and maintain consistent styling patterns:
- Gradient backgrounds and text effects
- Consistent spacing and typography
- Responsive design patterns
- Hover effects and transitions
- Backdrop blur effects for modern glass-morphism design 