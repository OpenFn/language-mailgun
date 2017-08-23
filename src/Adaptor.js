import {
  execute as commonExecute,
  expandReferences
} from 'language-common';
import {
  post,
  put
} from './Client';
import {
  resolve as resolveUrl
} from 'url';

/** @module Adaptor */

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({...initialState,
      ...state
    })
  };

}

/**
 * Create an event
 * @example
 * execute(
 *   event(eventData)
 * )(state)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */
export function send(eventData) {

  return state => {
    const body = expandReferences(eventData)(state);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events')

    console.log("Send mail:");
    console.log(body)

    return post({
        username,
        password,
        body,
        url
      })
      .then((result) => {
        console.log("Success:", result);
        return {...state,
          references: [result, ...state.references]
        }
      })

  }
}

export {
  field,
  alterState,
  fields,
  sourceValue,
  merge,
  each,
  dataPath,
  dataValue,
  lastReferenceValue
}
from 'language-common';
