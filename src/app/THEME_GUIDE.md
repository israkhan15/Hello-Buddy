# Hello Buddy - Light/Dark Theme Guide

## Overview
The Hello Buddy app now features **TWO COMPLETELY DISTINCT THEMES**: Light Mode and Dark Mode. The themes provide a clear visual distinction with proper contrast and smooth transitions.

## Theme Specifications

### Light Mode
**Background Colors:**
- Main background: `#FFFFFF` (Pure White)
- Cards & Sections: `#FFFFFF` (Pure White)
- Secondary surfaces: `#F5F5F5` (Light Neutral)
- Input fields: `#F5F5F5` (Light Neutral)

**Text Colors:**
- Primary text: `#1a1a1a` (Dark Gray)
- Secondary text: `#6b7280` (Medium Gray)
- Muted text: `#6b7280` (Medium Gray)

**Borders:**
- Subtle borders: `#e5e7eb` (Light Gray - NOT white)
- Card borders: `#e2e8f0` (Subtle Gray)

**Accent Colors:**
- Primary purple: `#8b5cf6`
- Secondary: `#f5f5f5`
- Highlights: Various soft pastels (purple, pink, blue, green)

### Dark Mode
**Background Colors:**
- Main background: `#000000` (Pure Black)
- Cards & Sections: `#121212` (Dark Gray)
- Secondary surfaces: `#1a1a1a` (Very Dark Gray)
- Input fields: `#1a1a1a` (Very Dark Gray)

**Text Colors:**
- Primary text: `#ffffff` (Pure White)
- Secondary text: `#e5e5e5` (Light Gray)
- Muted text: `#9ca3af` (Medium Gray)

**Borders:**
- Dark borders: `#2d2d2d` (Dark Gray - NOT white)
- Card borders: `#2d2d2d` (Dark Gray)

**Accent Colors:**
- Primary purple: `#a78bfa` (Lighter purple for contrast)
- Secondary: `#1a1a1a`
- Highlights: Deep rich tones

## How the Theme Toggle Works

### 1. Theme State Management
The theme is managed in `/App.tsx` using React state:
```tsx
const [isDarkMode, setIsDarkMode] = useState(getInitialTheme());
```

### 2. Initial Theme Detection
On first load, the app:
1. Checks `localStorage` for saved theme preference
2. Falls back to system preference using `prefers-color-scheme`
3. Defaults to the detected preference

```tsx
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
```

### 3. Theme Toggle Function
```tsx
const toggleTheme = () => {
  const newTheme = !isDarkMode;
  setIsDarkMode(newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
};
```

### 4. CSS Class Application
The theme is applied using Tailwind's `dark:` variant:
```tsx
<div className={isDarkMode ? 'dark' : ''}>
  <div className="bg-white dark:bg-black">
    {/* content */}
  </div>
</div>
```

### 5. Theme Switch Component
Located at `/components/ThemeSwitch.tsx`, this component provides:
- Beautiful toggle switch with smooth animations
- Sun/Moon icons
- Three variants: `toggle`, `button`, `icon`
- Automatic localStorage persistence

## CSS Variables

All theme colors are defined in `/styles/globals.css`:

### Light Mode Variables
```css
:root {
  --background: #FFFFFF;
  --foreground: #1a1a1a;
  --card: #FFFFFF;
  --card-foreground: #1a1a1a;
  --border: #e5e7eb;
  /* ... more variables */
}
```

### Dark Mode Variables
```css
.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #121212;
  --card-foreground: #ffffff;
  --border: #2d2d2d;
  /* ... more variables */
}
```

## Theme Transition

All theme changes include smooth 300ms transitions:
```css
transition-colors duration-300
```

This applies to:
- Background colors
- Text colors
- Border colors
- Card backgrounds
- Interactive elements

## Component-Level Implementation

### Example: Card Component
```tsx
<div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
  <h3 className="text-gray-800 dark:text-white">Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

### Example: Button Component
```tsx
<button className="bg-white dark:bg-[#121212] text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
  Click me
</button>
```

### Example: Input Component
```tsx
<input
  className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2d2d2d] text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400"
/>
```

## Key Components with Theme Support

1. **App.tsx** - Main container and theme provider
2. **Dashboard.tsx** - Home screen with feature tiles
3. **LoginScreen.tsx** - Login and signup forms
4. **Profile.tsx** - Profile settings and appearance toggle
5. **StudyMode.tsx** - Task planner interface
6. **Communication.tsx** - Speech analysis tools
7. **Wellness.tsx** - Mindfulness and wellness features
8. **AIChatbot.tsx** - AI chat interface
9. **GroupChatRoom.tsx** - Community chat
10. **ThemeSwitch.tsx** - Theme toggle component

## Testing the Theme

### Manual Testing Steps:
1. **Login Screen**: Check background gradient, card, and input fields
2. **Dashboard**: Verify all feature tiles, stats cards, and quotes
3. **Profile**: Toggle theme switch and observe instant changes
4. **Study Mode**: Check task cards and input fields
5. **Communication**: Verify speech analysis cards and buttons
6. **Wellness**: Check mindfulness cards and activity tiles
7. **Settings**: Confirm theme preference persists after refresh

### Visual Checklist:
- [ ] All backgrounds change (no missed elements)
- [ ] All text remains clearly readable
- [ ] Borders are visible (NOT white in dark mode)
- [ ] Cards have proper contrast from background
- [ ] Interactive elements have clear hover states
- [ ] Gradients maintain proper opacity
- [ ] Icons and emojis remain visible
- [ ] Input fields are clearly distinguishable
- [ ] Focus states are visible in both themes

## Persistence

The theme preference is saved to `localStorage` with key `'theme'`:
- `'light'` for Light Mode
- `'dark'` for Dark Mode

This ensures the user's choice persists across:
- Page refreshes
- Browser sessions
- Component re-renders

## Troubleshooting

### Theme doesn't change:
- Ensure the `dark` class is applied to the root div in App.tsx
- Check that Tailwind CSS is properly configured for dark mode
- Verify all components use the `dark:` variant

### Some elements don't change:
- Search for hardcoded colors (e.g., `bg-gray-800` without `dark:` variant)
- Ensure transition classes are applied

### Text is not readable:
- Check contrast ratios
- Verify text color classes use proper dark mode variants
- Ensure headings have the appropriate color classes

## Color Palette Reference

### Light Mode Palette
- **Backgrounds**: #FFFFFF, #F5F5F5
- **Text**: #1a1a1a, #6b7280
- **Borders**: #e5e7eb, #e2e8f0
- **Purple**: #8b5cf6
- **Pink**: #ec4899
- **Blue**: #3b82f6
- **Green**: #10b981

### Dark Mode Palette
- **Backgrounds**: #000000, #121212, #1a1a1a
- **Text**: #ffffff, #e5e5e5, #9ca3af
- **Borders**: #2d2d2d, #404040
- **Purple**: #a78bfa
- **Pink**: #f472b6
- **Blue**: #60a5fa
- **Green**: #34d399

## Summary

The Hello Buddy app features a complete, production-ready Light/Dark theme system with:
✅ Pure white backgrounds in Light Mode
✅ Pure black backgrounds in Dark Mode
✅ Clear visual distinction between themes
✅ Smooth 300ms transitions
✅ Persistent theme preference
✅ Comprehensive component coverage
✅ Accessible contrast ratios
✅ Beautiful theme toggle switch

Click the theme toggle in the Dashboard or Profile to switch between modes and experience the seamless transformation!
