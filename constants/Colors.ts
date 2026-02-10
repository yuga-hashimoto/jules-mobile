const julesColors = {
  primary: '#715cd7',         // Jules purple
  secondary: '#9d86e8',       // lighter purple
  tertiary: '#4a90d9',        // Jules blue accent
  background: '#1a1a1f',      // Jules near-black
  surface: '#202028',         // sidebar/surface
  surfaceVariant: '#252530',  // card/panel
  text: '#e8e8f0',            // slightly purple-tinted white
  textSecondary: '#8888a8',   // muted purple-grey
  error: '#FFB4AB',
  border: '#35354a',          // subtle border

  // Status dot colors (matches Jules status icons from jules.google.com)
  statusDone:      '#4a90d9',  // blue circle
  statusWorking:   '#e07b3a',  // orange (in progress)
  statusWaiting:   '#e07b3a',  // orange (Needs clarification)
  statusFailed:    '#e05252',  // red
  statusCancelled: '#8888a8',  // grey
};

export default {
  light: {
    text: julesColors.text,
    background: julesColors.background,
    tint: julesColors.primary,
    tabIconDefault: '#6b6588',
    tabIconSelected: julesColors.primary,
    surface: julesColors.surface,
    primary: julesColors.primary,
    card: julesColors.surface,
    border: julesColors.border,
    notification: julesColors.secondary,
  },
  dark: {
    text: julesColors.text,
    background: julesColors.background,
    tint: julesColors.primary,
    tabIconDefault: '#6b6588',
    tabIconSelected: julesColors.primary,
    surface: julesColors.surface,
    primary: julesColors.primary,
    card: julesColors.surface,
    border: julesColors.border,
    notification: julesColors.secondary,
  },
  jules: julesColors,
};
