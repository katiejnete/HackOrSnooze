"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  await getFaveStoriesOnStart();
  await getMyStoriesOnStart();
  hidePageComponents();
  getAndShowStoriesOnStart();
  $allStoriesList.show();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show submit story form on click on "submit" */

function navSubmitClick() {
  console.debug("navSubmitClick");
  if (currentUser) {
    hidePageComponents();
    $storyForm.show();
  } else {
    alert("Please login/signup to submit a story!");
  }
}

$navSubmit.on("click", navSubmitClick);

/** Show favorites on click on "favorites" */

async function navFavesClick() {
  console.debug("navFavesClick");
  if (currentUser) {
    hidePageComponents();
    getFaveStoriesOnStart();
    $allFavesList.show();
  } else {
    alert("Please login/signup to view your favorites!");
  }
}

$navFaves.on("click", navFavesClick);

/** Show my stories on click on "my stories" */

async function navMyStoriesClick() {
  console.debug("navMyStoriesClick");
  if (currentUser) {
    hidePageComponents();
    getMyStoriesOnStart();
    $allMyStoriesList.show();
  } else {
    alert("Please login/signup to view your submitted stories!");
  }
}

$navMyStories.on("click", navMyStoriesClick);
