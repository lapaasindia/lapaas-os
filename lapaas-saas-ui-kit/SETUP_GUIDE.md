# Lapaas SAAS UI Kit - Setup Guide

## Project Overview

Lapaas SAAS UI Kit is a complete, production-ready component library built for modern SAAS applications. It combines the best practices from Material Design with modern React and TypeScript.

## Quick Start

### 1. Installation

Dependencies have been installed. To verify:

```bash
npm install
```

### 2. Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Project Structure

```
lapaas-saas-ui-kit/
├── src/
│   ├── components/          # UI Components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Alert/
│   │   └── index.ts         # Component exports
│   ├── context/             # React Context
│   │   └── ThemeContext.tsx # Theme management
│   ├── hooks/               # Custom React Hooks
│   │   ├── useTheme.ts
│   │   ├── useToast.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── classNameUtils.ts
│   │   ├── dateUtils.ts
│   │   └── index.ts
│   ├── styles/              # Global styles
│   │   └── index.css
│   ├── App.tsx              # Demo application
│   ├── main.tsx             # Entry point
│   └── index.ts             # Library exports
├── public/                  # Static assets
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── README.md                # Documentation
├── CHANGELOG.md             # Version history
└── CONTRIBUTING.md          # Contribution guide
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run build:lib        # Build as library

# Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types

# Preview
npm run preview          # Preview production build
```

## Component Architecture

### Creating a New Component

1. Create a new directory under `src/components/ComponentName/`
2. Create `ComponentName.tsx` with your component
3. Create `index.ts` that exports the component
4. Add types to `src/types/index.ts`
5. Export from `src/components/index.ts`

Example:

```tsx
// src/components/MyComponent/MyComponent.tsx
import React from 'react';
import { MyComponentProps } from '../../types';

export const MyComponent: React.FC<MyComponentProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};
```

```ts
// src/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
```

## Theming

### Using the Theme Provider

Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@lapaas/saas-ui-kit';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Accessing Theme

Use the `useTheme` hook:

```tsx
import { useTheme } from '@lapaas/saas-ui-kit';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### Customizing Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... more shades
      },
    },
  },
}
```

## Styling

The kit uses **Tailwind CSS** for styling. All components are built with utility classes.

### Global Styles

Global styles are in `src/styles/index.css`. Import it in your app:

```tsx
import '@lapaas/saas-ui-kit/styles';
```

### Component Styling

Components use `clsx` for conditional classes:

```tsx
className={clsx(
  'base-styles',
  variant === 'primary' && 'primary-styles',
  disabled && 'disabled-styles'
)}
```

## TypeScript

All components are fully typed. Types are defined in `src/types/index.ts`.

### Component Props

```tsx
interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

## Dark Mode

Dark mode is built-in. The theme provider automatically handles dark mode classes.

To use dark mode styles in Tailwind:

```tsx
<div className="bg-white dark:bg-gray-900">
  Content
</div>
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Color contrast compliance
- Semantic HTML

## Performance

The kit is optimized for performance:

- Tree-shakeable exports
- Code splitting support
- Minimal dependencies
- Optimized bundle size
- CSS-in-JS free (uses Tailwind)

## Publishing

To publish to npm:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run build`
4. Run `npm publish`

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors after installing:

```bash
npm run type-check
```

### Build Issues

Clear cache and rebuild:

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Dev Server Not Starting

Check if port 5173 is in use:

```bash
npm run dev -- --port 3000
```

## Next Steps

1. **Explore Components** - Check out the demo app at `http://localhost:5173`
2. **Read Documentation** - See `README.md` for detailed docs
3. **Create Components** - Start building your own components
4. **Customize Theme** - Adjust colors and spacing to match your brand
5. **Deploy** - Build and deploy your SAAS app

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Material Design](https://material.io/design)

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- Open an issue on GitHub

---

Happy building! 🚀
