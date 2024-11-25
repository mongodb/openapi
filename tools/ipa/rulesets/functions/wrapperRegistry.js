const { withTracking } = require('./hitTracker.js');
const eachResourceHasGetMethod = require('./eachResourceHasGetMethod.js');
// Add additional imports as needed

// Wrap functions with tracking
const wrappedFunctions = {
  eachResourceHasGetMethodWithTracking: withTracking(
    'xgen-IPA-104-resource-has-GET',
    eachResourceHasGetMethod
  ),
  // Add more wrapped functions here
};

// Export the wrapped functions
module.exports = wrappedFunctions;
