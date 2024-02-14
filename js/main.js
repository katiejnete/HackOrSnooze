"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $allFavesList = $("#all-faves-list");
const $allMyStoriesList = $("#all-my-stories-list");

const $storyForm = $("#story-form");
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navSubmit = $("#nav-submit");
const $navFaves = $("#nav-faves");
const $navMyStories = $("#nav-my-stories");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allFavesList,
    $allStoriesList,
    $loginForm,
    $signupForm,
    $storyForm,
    $allMyStoriesList,
  ];
  components.forEach((c) => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  if (currentUser) await getFaveStoriesOnStart();
  if (currentUser) await getMyStoriesOnStart();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn(
  "HEY STUDENT: This program sends many debug messages to" +
    " the console. If you don't see the message 'start' below this, you're not" +
    " seeing those helpful debug messages. In your browser console, click on" +
    " menu 'Default Levels' and add Verbose"
);
$(start);
