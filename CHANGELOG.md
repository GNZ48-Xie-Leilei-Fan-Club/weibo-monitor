# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added functionality to download images and broadcast actual post content and images to chat groups.

## [0.3.0] 2019-02-11
### Added
- Added `winston@^3.2.1`
- Added `logger.js`

### Modified
- Improved logging.

## [0.2.0] 2019-02-06
### Added
- Added `CHANGELOG.md`
  - Backfilled changelog since 0.1.0
- Added scanning of multiple Weibo accounts by sending requests concurrently
  - Now monitors one member account (@GNZ48-谢蕾蕾) and two official accounts (@GNZ48, @SNH48)
    - When monitoring official accounts, we do not broadcast all new posts, but only ones containing specific keywords
- Broadcast message to another group chat

### Modified
- Update `README.md`

## [0.1.0] 2019-02-02
### Added
- Added `README.md`
  - Added Backgrounds, Installation and Roadmap sections
- Added `.gitignore`
  - Ingores `node_modules` directory
- Use `yarn` for dependency management
  - Added `package.json` and `yarn.lock`
  - Added three major dependency
    - `axios@^0.18.0`
    - `websocket@^1.0.28`
    - `websocket-as-promised@^0.9.0`
- Added basic functionality
  - Periodic scan of a Weibo user's post
  - Communicate with Coolq bot using Websocket through [coolq-http-api](https://github.com/richardchien/coolq-http-api) to broadcast in case of new posts


