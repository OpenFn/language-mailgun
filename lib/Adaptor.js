'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.each = exports.merge = exports.sourceValue = exports.fields = exports.alterState = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */

// NOTE: We can use sync-request because the Node sandbox the client uses will
// be killed after 300s, regardless of whether this succeeds, fails, or hangs.


exports.execute = execute;
exports.send = send;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _mailgunJs = require('mailgun-js');

var _mailgunJs2 = _interopRequireDefault(_mailgunJs);

var _syncRequest = require('sync-request');

var _syncRequest2 = _interopRequireDefault(_syncRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for mailgun.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Create an event
 * @public
 * @example
 * send({
 *   from: 'from_email',
 *   to: 'to_email',
 *   subject: 'Your Subject',
 *   text: 'Your message goes here',
 *   attachment: {
 *     url: 'www.google.com/doodle.png',
 *     filename: 'forYou.png',
 *   },
 * })
 * @function
 * @param {object} params - Params for sending an email
 */
function send(params) {
  return function (state) {
    var body = (0, _languageCommon.expandReferences)(params)(state);

    var _state$configuration = state.configuration,
        apiKey = _state$configuration.apiKey,
        domain = _state$configuration.domain;


    var mailgun = new _mailgunJs2.default({ apiKey: apiKey, domain: domain });

    if (body.attachment) {
      var response = (0, _syncRequest2.default)('GET', body.attachment.url);
      console.log(response);
      var attch = new mailgun.Attachment({
        data: response.body, filename: body.attachment.filename
      });
      body.attachment = attch;
    }

    console.log("Sending mail:");

    return new Promise(function (resolve, reject) {

      mailgun.messages().send(body, function (error, response) {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log(response);
          resolve(response);
        }
      });
    }).then(function (response) {
      var nextState = (0, _languageCommon.composeNextState)(state, response);
      return nextState;
    });
  };
}
