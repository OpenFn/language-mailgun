/** @module Adaptor */
import {execute as commonExecute, expandReferences, composeNextState} from 'language-common';
import Mailgun from 'mailgun-js'

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
 * @public
 * @example
 * send(
 *  fields(
 *    field('from', 'from_email'),
 *    field('to', 'to_email'),
 *    field('subject', 'Your Subject'),
 *    field('text', 'Your message goes here')
 * ))
 * @function
 * @param {object} params - Params for sending an email
 */
export function send(params) {

  return state => {
    const body = expandReferences(params)(state);

    const {
      apiKey,
      domain
    } = state.configuration;

    const mailgun = new Mailgun({apiKey: apiKey, domain: domain})

    console.log("Sending mail:");

    return new Promise((resolve, reject) => {

      mailgun.messages().send(body,
        (error, response) => {
          if(error) {
            console.error(error)
            reject(error)
          } else {
            console.log(response);
            resolve(response)
          }
        })
    }).then((response) => {
      const nextState = composeNextState(state, response);
      return nextState;
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
