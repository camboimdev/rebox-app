# Rebox

A modern item trading and marketplace mobile app built with React Native and Expo. Swipe through items, match with other users, and chat to arrange trades—all in a beautiful, intuitive interface.

## Features

### 🔐 Authentication

- **Email/Password Registration**: Create an account with email and password
- **Anonymous Login**: Quick access with just a name
- **Profile Management**: Update your name and profile photo

### 📦 Item Management

- **Add Items**: List your items with photos, descriptions, and categories
- **Categories**: Organize items by category:
  - Electronics (Eletrônicos)
  - Clothing (Roupas)
  - Furniture (Móveis)
  - Books (Livros)
  - Sports (Esportes)
  - Toys (Brinquedos)
  - Home (Casa)
  - Other (Outros)
- **Manage Your Items**: View, edit, and delete your listed items

### 👆 Swipe & Match

- **Swipe Interface**: Tinder-like card deck for browsing items
- **Like/Dislike**: Swipe right to like, left to pass
- **Smart Matching**: Get matched when both users like each other's items
- **Match Notifications**: Celebrate matches with beautiful animations

### 💬 Chat

- **Real-time Messaging**: Chat with your matches
- **Match History**: View all your matches sorted by recent activity
- **Unread Indicators**: See when you have new messages

## Tech Stack

- **Framework**: [Expo](https://expo.dev) ~54.0.31
- **Runtime**: React Native 0.81.5
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage (local persistence)
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **UI Components**: Custom themed components with dark mode support

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your device

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rebox
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device
   - Press `w` for web browser

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser
- `npm run lint` - Run ESLint to check code quality
- `npm run reset-project` - Reset to a blank project (moves current code to `app-example`)

## Project Structure

```
rebox/
├── app/                    # Expo Router file-based routes
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Swipe feed
│   │   ├── matches.tsx    # Matches list
│   │   ├── my-items.tsx   # User's items
│   │   └── profile.tsx    # User profile
│   ├── add-item.tsx       # Add new item screen
│   ├── chat/              # Chat screens
│   │   └── [matchId].tsx
│   └── item/              # Item detail screens
│       └── [itemId].tsx
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat components
│   ├── item/             # Item-related components
│   ├── match/            # Match components
│   ├── swipe/            # Swipe deck components
│   └── ui/               # Generic UI components
├── contexts/             # React Context providers
│   ├── auth-context.tsx
│   ├── items-context.tsx
│   └── matches-context.tsx
├── hooks/                # Custom React hooks
├── services/             # Business logic and data services
│   ├── auth-service.ts
│   ├── item-service.ts
│   ├── match-service.ts
│   └── storage.ts
├── types/                # TypeScript type definitions
├── constants/            # App constants (categories, theme)
└── utils/                # Utility functions
```

## Key Features Implementation

### Data Persistence

All data is stored locally using AsyncStorage. The app uses a service layer pattern to abstract storage operations:

- User authentication and profiles
- Items and categories
- Likes, dislikes, and matches
- Messages and chat history

### Matching Algorithm

When a user likes an item:

1. The like is recorded
2. The system checks if the item's owner has liked any of the current user's items
3. If both users have liked each other's items, a match is created
4. Users are notified and can start chatting

### Swipe Interface

Built with React Native Gesture Handler and Reanimated for smooth, native-feeling swipe animations. Cards can be swiped left (dislike) or right (like) with haptic feedback.

## Development

### Adding New Features

1. Create components in the `components/` directory
2. Add services in the `services/` directory for data operations
3. Use contexts in `contexts/` for global state management
4. Create custom hooks in `hooks/` for reusable logic

### Styling

The app uses a theme system with support for light and dark modes. Use the `useThemeColor` hook to access theme colors:

```typescript
const backgroundColor = useThemeColor({}, "background");
const textColor = useThemeColor({}, "text");
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

Built with ❤️ using Expo and React Native
