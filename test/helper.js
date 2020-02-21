/**
 * Helper module for mocha testing.
 *
 * In order to mock document with jsdom,
 * global namespace should be populated before
 * running any test.
 *
 * In this module, globals required by React are
 * initialized.
 */

const jsdom = require("jsdom");
const dom = new jsdom.JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.MouseEvent = dom.window.MouseEvent;
