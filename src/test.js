// Require all test(spec) files.
const context = require.context("./", true, /.+\.spec\.tsx?$/);
context.keys().forEach(context);
