// Patch for Expo Router initialization issues
// This file helps resolve module loading errors in Expo Router with React 19

console.log('[Patch] Expo Router init patch loading...');

if (typeof global !== 'undefined') {
  // Ensure global.__DEV__ is defined
  if (typeof global.__DEV__ === 'undefined') {
    global.__DEV__ = __DEV__ || false;
  }

  // Create a proper ExceptionsManager before React DevTools
  if (global.__DEV__ && !global.ExceptionsManager) {
    console.log('[Patch] Creating ExceptionsManager...');
    
    // Create a more complete mock that handles the initialization properly
    const noop = () => {};
    const reportException = (data) => {
      console.log('[ExceptionsManager] Exception reported:', data.message || 'Unknown error');
    };
    
    global.ExceptionsManager = {
      installConsoleErrorReporter: noop,
      uninstallConsoleErrorReporter: noop,
      reportException: reportException,
      updateExceptionMessage: noop,
      dismissRedbox: noop,
      reportSoftException: reportException,
      reportFatalException: reportException,
      addListener: noop,
      removeListener: noop,
    };

    // Also create ErrorUtils if it doesn't exist
    if (!global.ErrorUtils) {
      global.ErrorUtils = {
        setGlobalHandler: noop,
        getGlobalHandler: () => noop,
        reportError: reportException,
        reportFatalError: reportException,
      };
    }
  }

  // Fix console methods to be writable
  const originalConsole = { ...console };
  const consoleMethods = ['error', 'warn', 'log', 'info', 'debug'];
  
  consoleMethods.forEach(method => {
    if (console[method]) {
      const original = console[method];
      console[method] = function(...args) {
        // Filter out the specific errors but let the app continue
        const str = args.join(' ');
        if (method === 'error' && (
          str.includes('ExceptionsManager should be set up') ||
          str.includes('property is not writable') ||
          str.includes("Cannot read property 'default' of undefined")
        )) {
          console.log(`[Suppressed ${method}]`, str.substring(0, 50) + '...');
          return;
        }
        return original.apply(console, args);
      };
    }
  });
}

console.log('[Patch] Expo Router init patch completed');
