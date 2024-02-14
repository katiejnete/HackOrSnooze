"use strict";

/* This is the global list of stories(all stories, favorite stories, and my stories), 
instances of storyList*/

let storyList;
let favesList;
let myStoriesList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.hide();
  putStoriesOnPage();
}

/** Get udpated fave stories when called. */

async function getFaveStoriesOnStart() {
  favesList = await StoryList.getFaveStories(currentUser);
  putFaveStoriesOnPage();
}

/** Get udpated my stories when called. */

async function getMyStoriesOnStart() {
  myStoriesList = await StoryList.getMyStories(currentUser);
  putMyStoriesOnPage();
}

/** Check if story has been favorited or unfavorited,
 *compares currId (current storyId) with each storyId from user's favorited stories
 *if Ids match, then means it is already favorited -> display filled star, vice versa.*/

function checkFave(currId) {
  let faveStr;
  if (favesList) {
    if (favesList.stories.length !== 0) {
      for (let faveStory of favesList.stories) {
        if (currId === faveStory.storyId) {
          faveStr = "★";
          return faveStr;
        } else {
          faveStr = "☆";
        }
      }
    } else if (favesList.stories.length === 0) {
      faveStr = "☆";
      return faveStr;
    }
  } else {
    faveStr = "☆";
  }
  return faveStr;
}

/** Display delete option only for user's stories
 *compares currId (current storyId) with each storyId from user's stories
 *if Ids match, then means it is one of user's stories -> display "delete".*/

function checkCanDelete(currId) {
  let delStr;
  if (myStoriesList) {
    if (myStoriesList.stories.length !== 0) {
      for (let myStory of myStoriesList.stories) {
        if (currId === myStory.storyId) {
          delStr = "delete";
          return delStr;
        } else {
          delStr = "";
        }
      }
    } else if (myStoriesList.stories.length === 0) {
      delStr = "";
      return delStr;
    }
  } else {
    delStr = "";
  }
  return delStr;
}

/** Display delete option only for user's stories
 *compares currId (current storyId) with each storyId from user's stories
 *if Ids match, then means it is one of user's stories
 *display the divider "|" before "delete".*/

function insertDivider(currId) {
  let divider;
  if (myStoriesList) {
    if (myStoriesList.stories.length !== 0) {
      for (let myStory of myStoriesList.stories) {
        if (currId === myStory.storyId) {
          divider = "|";
          return divider;
        } else {
          divider = "";
        }
      }
    } else if (myStoriesList.stories.length === 0) {
      divider = "";
      return divider;
    }
  } else {
    divider = "";
  }
  return divider;
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup",story);
  const hostName = story.getHostName(story.url);
  return $(`
      <li id="${story.storyId}">
      <a class="story-faves">${checkFave(story.storyId)}</a>
      <div class="story-container">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <small class="story-user">
        <div class="small-container">
        posted by ${story.username}
        <span>${insertDivider(story.storyId)}</span>
        <a class="my-story">${checkCanDelete(story.storyId)}</a>
        </div></small>
      </li> 
    `);
}

/** Gets list of stories from server, generates their HTML. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

/** Gets list of favorited stories from server, generates their HTML. */

function putFaveStoriesOnPage() {
  console.debug("putFaveStoriesOnPage");

  $allFavesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of favesList.stories) {
    const $faveStory = generateStoryMarkup(story);
    $allFavesList.append($faveStory);
  }
}

/** Gets list of my stories from server, generates their HTML. */

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allMyStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of myStoriesList.stories) {
    const $myStory = generateStoryMarkup(story);
    $allMyStoriesList.append($myStory);
  }
}

/** Handle story submssions when "create a story" is clicked. */

async function submitStory(evt) {
  console.debug("submit", evt);
  evt.preventDefault();

  // grab author, title, and url input values
  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  // storyList.addStory posts story to API, and returns Story instance
  await storyList.addStory(currentUser, { title, author, url });

  $storyForm.trigger("reset");

  storyList = await StoryList.getStories();
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

$storyForm.on("submit", submitStory);

/** Handles what was clicked on any ol element.
 * Handles favorites and delete operations.
 * Changes displayed content. Updates on api. Updates global list. */

async function olOperations(e) {
  if (currentUser) {
    if ($(e.target).text() === "☆") {
      const storyId = $(e.target).parent().attr("id");
      $(e.target).text("★");
      User.addNewFave(currentUser, storyId);
      favesList = await StoryList.getFaveStories(currentUser);
    } else if ($(e.target).text() === "★" && $allFavesList.is(":visible")) {
      const storyId = $(e.target).parent().attr("id");
      User.deleteFave(currentUser, storyId);
      favesList = await StoryList.getFaveStories(currentUser);
      storyList = await StoryList.getStories();
      getFaveStoriesOnStart();
      $allFavesList.show();
    } else if ($(e.target).text() === "★") {
      $(e.target).text("☆");
      const storyId = $(e.target).parent().attr("id");
      User.deleteFave(currentUser, storyId);
      favesList = await StoryList.getFaveStories(currentUser);
    } else if (
      $(e.target).text() === "delete" &&
      $allMyStoriesList.is(":hidden")
    ) {
      $(e.target).parent().parent().parent().parent().remove();
      const storyId = $(e.target)
        .parent()
        .parent()
        .parent()
        .parent()
        .attr("id");
      User.deleteStory(currentUser, storyId);
      myStoriesList = await StoryList.getMyStories(currentUser);
    } else if (
      $(e.target).text() === "delete" &&
      $allMyStoriesList.is(":visible")
    ) {
      $(e.target).parent().parent().parent().parent().remove();
      const storyId = $(e.target)
        .parent()
        .parent()
        .parent()
        .parent()
        .attr("id");
      User.deleteStory(currentUser, storyId);
      myStoriesList = await StoryList.getMyStories(currentUser);
      storyList = await StoryList.getStories();
    }
  } else {
    alert("Please login/signup to add to your favorites!");
  }
}

$("ol").on("click", olOperations);
