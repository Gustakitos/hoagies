# Hoagie Hub Frontend

This is the mobile client for Hoagie Hub, built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/).

## Technologies

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State/Data**: Axios
- **UI**: React Native Elements / Custom components

## Prerequisites

- Node.js
- Expo Go app on your mobile device OR Android/iOS Emulator

## Installation

```bash
$ yarn install
```

## Configuration

Ensure the backend API is running. You may need to update the API base URL in `src/api/client.ts` (or equivalent configuration file) to point to your backend instance.

## Running the app

```bash
# For iOS devices
$ yarn ios

# For Android devices
$ yarn android
```

## Testing

```bash
$ yarn test
```

## Linting

```bash
$ yarn lint
```
