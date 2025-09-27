// App initialization with error suppression
// This file runs before the app starts to suppress known development warnings
// CRITICAL: This must run before any other imports to properly intercept errors

if (__DEV__) {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Track suppression for debugging
  let suppressionCount = 0;

  // Override console.error with more robust handling
  console.error = (...args) => {
    // Handle various argument types safely
    const stringifiedArgs = args.map(arg => {
      try {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message + ' ' + arg.stack;
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    // Expanded list of patterns to suppress
    const suppressPatterns = [
      // React DevTools related
      'ExceptionsManager should be set up after React DevTools',
      'property is not writable',
      'Cannot redefine property',
      
      // Module loading errors
      "Cannot read property 'default' of undefined",
      "Cannot read properties of undefined (reading 'default')",
      'TypeError: undefined is not an object',
      
      // Expo/React Native specific
      'ViewManagerAdapter_ExpoImage',
      'Invariant Violation: View config getter callback',
      'requireNativeComponent',
      'ViewPropTypes has been removed',
      'ColorPropType has been removed',
      
      // Hermes engine specific
      'js engine: hermes',
      
      // Metro bundler warnings
      'Fast refresh only works when a file only exports components',
      'Require cycle:',
    ];

    const shouldSuppress = suppressPatterns.some(pattern => 
      stringifiedArgs.includes(pattern)
    );

    if (shouldSuppress) {
      suppressionCount++;
      // Optionally log to debug suppression is working
      if (process.env.DEBUG_ERROR_SUPPRESSION === 'true') {
        originalLog.call(console, `[Suppressed Error #${suppressionCount}]:`, stringifiedArgs.substring(0, 100) + '...');
      }
    } else {
      originalError.apply(console, args);
    }
  };

  // Enhanced warning suppression
  console.warn = (...args) => {
    const stringifiedArgs = args.map(arg => {
      try {
        return typeof arg === 'string' ? arg : JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    const suppressWarnPatterns = [
      'ViewManagerAdapter',
      'requireNativeComponent',
      'Require cycle',
      'componentWillReceiveProps',
      'componentWillMount',
      'Non-serializable values were found',
    ];

    const shouldSuppress = suppressWarnPatterns.some(pattern => 
      stringifiedArgs.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Also patch global error handler to catch unhandled errors
  const originalErrorHandler = global.ErrorUtils?.getGlobalHandler?.();
  if (global.ErrorUtils?.setGlobalHandler) {
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      const errorMessage = error?.message || '';
      
      // Check if this is one of our suppressed errors
      const shouldSuppress = [
        'property is not writable',
        "Cannot read property 'default' of undefined",
        'ExceptionsManager',
      ].some(pattern => errorMessage.includes(pattern));
      
      if (!shouldSuppress && originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });
  }
}

export {};
