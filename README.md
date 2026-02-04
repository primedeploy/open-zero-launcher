# Open Zero Launcher
A minimal Android launcher app built with React Native and Expo.

## Motivations
The goal is simple: pure focus. I hate distracting interfaces and slow animations. A smartphone should be a tool, not a toy. While there are similar launchers, I value privacy. This is a 100% open-source, free, and ad-free launcher designed for speed and security.

## Help us
Pull requests are welcome. You will be fully credited for your contributions.

## Documentation Index

### Configuration Files
- [app.json](./app.json) - Expo app configuration.
- [eas.json](./eas.json) - EAS build configuration.
- [jest.config.js](./jest.config.js) - Jest testing configuration.
- [package.json](./package.json) - Dependencies and scripts.
- [tsconfig.json](./tsconfig.json) - TypeScript configuration.

### Testing
- Unit tests are located in `_tests/` folder.
- Run `npm test` to execute all tests.

### Build and Development
- Run `npm start` to start the development server.
- Run `npm run android` to build for Android.
- Run `npm test` to run unit tests.
- Use EAS for production builds: `eas build --platform android`.

## Features
- Minimalist home screen with up to 10 favorite apps.
- Full app list with alphabetical sorting.
- App locking functionality.
- Notification badges.
- Weather information.
- Customizable app hiding.

## Architecture
- **Framework**: Expo with React Native.
- **Routing**: Expo Router.
- **State Management**: Zustand.
- **Database**: SQLite via Expo SQLite.
- **Styling**: React Native components with dark theme.

## Contributing
Please send us a pull request
