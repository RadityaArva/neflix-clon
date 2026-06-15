// Import and initialize Vercel Web Analytics
import { inject } from '@vercel/analytics';

// Initialize analytics
inject({
  mode: 'auto', // Automatically detect production/development
  debug: false, // Set to true for debugging
});
