# Weibo-Monitor
A small crawler based on Node.js to monitor for Weibo users' new posts.

## Backgrounds
[Weibo](weibo.com) is a Chinese social networking site modelled closely after Twitter, and enjoys a huge user base due to Twitter being inaccessible within Chinese borders. Despite its popularity, the [Weibo Open API](https://open.weibo.com/wiki/API) comes with many restrictions, making it impossible to accomplish simple tasks such as fetching user's Weibo posts.
To monitor user's new posts, this project periodically makes requests to Weibo's mobile-facing API, which requires no authentication and reponds with JSON data.

## Installation and Use
To install Weibo-Monitor, make sure you are in the projects' root directory. Then install dependencies by
```
yarn
```
To run Weibo-Monitor
```
node app.js
```

## Roadmaps
- [x] Logging
    - Improve logging.

- [ ] Dockerization
    - For easy deployment.

- [ ] Authentication
    - It seems that the mobile-facing API, although requires no authentication, has a rate-limit on unauthenticated requests. Therefore authentication is needed for simultaneous monitoring of multiple user's posts.

- [ ] Normalization of JSON response for archiving and representation
    - Normalize the JSON response into a more readable and intuitive format, so that we can archive them or use them in other ways.

- [ ] Database connection (No-SQL)
    - Connects to a document oriented database to persist data.
