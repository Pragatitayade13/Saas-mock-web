export const tokens = {
  colors: {
    bg: '#0B0D12',
    surface: '#12151C',
    elevated: '#181C25',
    border: '#272C36',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    accent: '#22D3EE',
    text: {
      primary: '#F8FAFC',
      secondary: '#A1A1AA',
      muted: '#71717A',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  },
  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    fontSize: {
      display: '2.5rem', // 40px
      h1: '2rem',       // 32px
      h2: '1.5rem',     // 24px
      h3: '1.25rem',    // 20px
      body: '0.875rem',  // 14px
      small: '0.75rem',  // 12px
      caption: '0.6875rem', // 11px
    },
  },
  spacing: {
    containerPx: 'px-4 sm:px-6 lg:px-8',
    cardPadding: 'p-5 sm:p-6',
    headerHeight: 'h-16',
    sidebarWidthExpanded: 'w-64',
    sidebarWidthCollapsed: 'w-20',
  },
  animation: {
    duration: '200ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type Tokens = typeof tokens;
