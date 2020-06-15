/* 
    Create and export configuration variables
*/

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret': 'thisIsASecret',
    'mailgunDomain': 'sandbox501a5f8bbf7e43b0b095936bf2d61a0e.mailgun.org',
    'mailgunKey': process.env.MAILGUN_KEY,
    'stripeKey': process.env.STRIPE_KEY,
};

// Production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret': 'thisIsASecret',
    'mailgunDomain': 'sandbox501a5f8bbf7e43b0b095936bf2d61a0e.mailgun.org',
    'mailgunKey': process.env.MAILGUN_KEY,
    'stripeKey': process.env.STRIPE_KEY,
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that hte current environment is one of the environments above, if not, default to the staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;