import { get } from '@ember/object';
import { nextTickPromise } from './-utils';
import { BaseContext, getContext, isTestContext, TestContext } from './setup-context';
import global from './global';
import hasEmberVersion from './has-ember-version';
import settled from './settled';

export interface ApplicationTestContext extends TestContext {
  element?: Element | null;
}

// eslint-disable-next-line require-jsdoc
export function isApplicationTestContext(context: BaseContext): context is ApplicationTestContext {
  return isTestContext(context);
}

/**
  Navigate the application to the provided URL.

  @public
  @param {string} url The URL to visit (e.g. `/posts`)
  @param {object} options app boot options
  @returns {Promise<void>} resolves when settled
*/
export function visit(url: string, options?: { [key: string]: any }): Promise<void> {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error('Cannot call `visit` without having first called `setupApplicationContext`.');
  }

  let { owner } = context;

  return nextTickPromise()
    .then(() => {
      return owner.visit(url, options);
    })
    .then(() => {
      if (global.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    })
    .then(settled);
}

/**
  @public
  @returns {string} the currently active route name
*/
export function currentRouteName(): string {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error(
      'Cannot call `currentRouteName` without having first called `setupApplicationContext`.'
    );
  }

  let router = context.owner.lookup('router:main');
  return get(router, 'currentRouteName');
}

const HAS_CURRENT_URL_ON_ROUTER = hasEmberVersion(2, 13);

/**
  @public
  @returns {string} the applications current url
*/
export function currentURL(): string {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error(
      'Cannot call `currentURL` without having first called `setupApplicationContext`.'
    );
  }

  let router = context.owner.lookup('router:main');

  if (HAS_CURRENT_URL_ON_ROUTER) {
    return get(router, 'currentURL');
  } else {
    return get(router, 'location').getURL();
  }
}

/**
  Used by test framework addons to setup the provided context for working with
  an application (e.g. routing).

  `setupContext` must have been run on the provided context prior to calling
  `setupApplicationContext`.

  Sets up the basic framework used by application tests.

  @public
  @param {Object} context the context to setup
  @returns {Promise<Object>} resolves with the context that was setup
*/
export default function setupApplicationContext(context: TestContext): Promise<void> {
  return nextTickPromise();
}
