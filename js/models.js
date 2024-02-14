"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName(url) {
    const hostName = $("<a>").prop("href", url).prop("hostname");
    return hostName;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    try {
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: "GET",
      });

      // turn plain old story objects from API into instances of Story class
      const stories = response.data.stories.map((story) => new Story(story));

      // build an instance of our own class using the new array of stories
      return new StoryList(stories);
    } catch (err) {
      console.error("getStories failed", err);
      return null;
    }
  }

  /** Get user's favorite stories froom api, builds array of favorites story instances to make storylist instance */

  static async getFaveStories(user) {
    // get user favorites from api
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${user.username}`,
        method: "GET",
        params: { token: user.loginToken },
      });

      //turn story objects from api to instances of story class
      const faveStories = response.data.user.favorites.map(
        (story) => new Story(story)
      );

      // build StoryList for user's favorites
      return new StoryList(faveStories);
    } catch (err) {
      console.error("getFaveStories failed", err);
      return null;
    }
  }

  /** Get user's stories froom api, builds array of favorites story instances to make storylist instance */

  static async getMyStories(user) {
    // get my stories from api
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${user.username}`,
        method: "GET",
        params: { token: user.loginToken },
      });

      //turn story objects from api to instances of story class
      const myStories = response.data.user.stories.map(
        (story) => new Story(story)
      );

      // build StoryList for user's stories
      return new StoryList(myStories);
    } catch (err) {
      console.error("getMyStories failed", err);
      return null;
    }
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    try {
      let { author, title, url } = newStory;
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: "POST",
        data: { token: user.loginToken, story: { author, title, url } },
      });

      const storyData = response.data.story;
      return new Story({
        storyId: storyData.storyId,
        title: storyData.title,
        author: storyData.author,
        url: storyData.url,
        username: storyData.username,
        createdAt: storyData.createdAt,
      });
    } catch (err) {
      console.error("addStory failed", err);
      return null;
    }
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (err) {
      console.error("signup failed", err);
      return null;
    }
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (err) {
      console.error("login failed", err);
      return null;
    }
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Adds new favorite story with api
   * - user - the current instance of User who will favorite the story via "storyId" */

  static async addNewFave(user, storyId) {
    try {
      await axios({
        url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
        method: "POST",
        data: { token: user.loginToken },
      });
    } catch (err) {
      console.error("addNewFave failed", err);
      return null;
    }
  }

  /** Deletes user's favorited story with api
   * - user - the current instance of User who will favorite the story via "storyId" */

  static async deleteFave(user, storyId) {
    try {
      await axios({
        url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
        method: "DELETE",
        data: { token: user.loginToken },
      });
    } catch (err) {
      console.error("deleteFave failed", err);
      return null;
    }
  }

  /** Deletes user's story with api
   * - user - the current instance of User who will favorite the story via "storyId" */

  static async deleteStory(user, storyId) {
    try {
      await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "DELETE",
        data: { token: user.loginToken },
      });
    } catch (err) {
      console.error("deleteStory failed", err);
      return null;
    }
  }
}
