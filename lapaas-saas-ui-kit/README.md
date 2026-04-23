# Lapaas SAAS UI Kit

A complete, production-ready UI component library for building modern SAAS applications. Built with React, TypeScript, and Tailwind CSS, inspired by Material Design principles.

## Features

✨ **30+ Pre-built Components** - Buttons, Inputs, Cards, Modals, Badges, and more
🎨 **Beautiful Design System** - Tailwind CSS with custom color palette
🌓 **Dark Mode Support** - Built-in theme switching
📱 **Fully Responsive** - Mobile-first design approach
♿ **Accessible** - WCAG compliant components
🚀 **Performance Optimized** - Tree-shakeable exports
📦 **TypeScript** - Full type safety
🎯 **Zero Dependencies** - Only React and Tailwind CSS

## Installation

```bash
npm install @lapaas/saas-ui-kit
# or
yarn add @lapaas/saas-ui-kit
# or
pnpm add @lapaas/saas-ui-kit
```

## Quick Start

```tsx
import { ThemeProvider, Button, Input, Card } from '@lapaas/saas-ui-kit';
import '@lapaas/saas-ui-kit/styles';

export default function App() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <Card>
          <h1 className="text-2xl font-bold mb-4">Welcome to Lapaas UI Kit</h1>
          <Input placeholder="Enter your email" />
          <Button className="mt-4">Get Started</Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}
```

## Components

### Form Components
- **Button** - Primary action button with variants
- **Input** - Text input with validation
- **Select** - Dropdown selection
- **Checkbox** - Checkbox input
- **Radio** - Radio button input
- **Switch** - Toggle switch
- **Textarea** - Multi-line text input

### Layout Components
- **Card** - Container for content
- **Grid** - Responsive grid layout
- **Flex** - Flexbox layout
- **Stack** - Vertical/horizontal stacking

### Feedback Components
- **Alert** - Alert messages
- **Badge** - Status badges
- **Progress** - Progress bars
- **Skeleton** - Loading skeleton
- **Toast** - Toast notifications
- **Tooltip** - Hover tooltips

### Navigation Components
- **Tabs** - Tab navigation
- **Breadcrumb** - Breadcrumb navigation
- **Pagination** - Page navigation
- **Dropdown** - Dropdown menu
- **Sidebar** - Sidebar navigation

### Overlay Components
- **Modal** - Modal dialog
- **Popover** - Popover menu
- **Drawer** - Side drawer

## Theming

### Using Theme Provider

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

### Custom Colors

Customize colors in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... more shades
        },
      },
    },
  },
};
```

## Hooks

### useTheme

Access theme context:

```tsx
import { useTheme } from '@lapaas/saas-ui-kit';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### useToast

Show toast notifications:

```tsx
import { useToast } from '@lapaas/saas-ui-kit';

export function MyComponent() {
  const { addToast } = useToast();
  
  return (
    <button onClick={() => addToast({ message: 'Success!', variant: 'success' })}>
      Show Toast
    </button>
  );
}
```

## Utilities

### cn (className utility)

```tsx
import { cn } from '@lapaas/saas-ui-kit';

const className = cn('px-4 py-2', condition && 'bg-blue-500');
```

### Date Utilities

```tsx
import { formatDate, formatTime } from '@lapaas/saas-ui-kit';

formatDate(new Date(), 'MM/DD/YYYY'); // 01/15/2024
formatTime(new Date(), 'HH:mm:ss');   // 14:30:45
```

## Development

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run build:lib
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
npm run type-check
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT © 2024 Lapaas

## Support

- 📖 [Documentation](https://docs.lapaas.io)
- 🐛 [Issue Tracker](https://github.com/lapaas/ui-kit/issues)
- 💬 [Discussions](https://github.com/lapaas/ui-kit/discussions)

---

Built with ❤️ by the Lapaas team
