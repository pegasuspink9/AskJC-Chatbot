# AskJC Chatbot

A React Native application compatible with both web and mobile platforms, featuring a clean architecture with Home and Chats tabs.

## Features

- 🏠 **Home Screen**: Welcome interface with quick actions and message input
- 💬 **Chats Screen**: Chat management with create, delete, and view functionality
- 📱 **Cross-Platform**: Runs on iOS, Android, and Web
- 🎨 **Clean UI**: Modern design with consistent styling
- 🏗️ **Clean Architecture**: Well-organized code structure with TypeScript

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Button.tsx
├── constants/          # App constants and theme
│   └── theme.ts
├── navigation/         # Navigation setup
│   └── TabNavigator.tsx
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   └── ChatScreen.tsx
├── styles/             # Global styles
│   └── globalStyles.ts
└── types/              # TypeScript type definitions
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- For mobile development: Android Studio or Xcode

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AskJC-Chatbot
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

#### Web
```bash
npm run web
```
The app will open in your default browser at `http://localhost:19006`

#### Mobile (Development)
```bash
npm start
```
Then scan the QR code with the Expo Go app on your mobile device.

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run web` - Start the web version
- `npm run android` - Start Android version
- `npm run ios` - Start iOS version

## Architecture

### Components
- **Button**: Reusable button component with multiple variants and sizes
- **Clean separation** between screens, components, and utilities

### Screens
- **HomeScreen**: Main landing page with quick actions and chat input
- **ChatScreen**: Chat list management with CRUD operations

### Navigation
- **Tab Navigation**: Bottom tabs for Home and Chats
- **Type-safe navigation** with TypeScript

### Styling
- **Consistent theming** with centralized colors, spacing, and typography
- **Global styles** for common UI patterns
- **Responsive design** that works across platforms

## Features in Detail

### Home Screen
- Welcome message and introduction
- Quick action cards for common tasks
- Message input with send functionality
- Recent activity section
- Responsive layout with keyboard handling

### Chats Screen
- List of existing chats with timestamps
- Unread message indicators
- Create new chat functionality
- Delete chat with confirmation
- Empty state when no chats exist
- Floating action button for quick access

### Design System
- **Colors**: Primary, secondary, and semantic color palette
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing values
- **Components**: Reusable UI elements with variants

## Technology Stack

- **React Native**: Mobile development framework
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **Expo Vector Icons**: Icon library

## Development Guidelines

### Code Organization
- Use TypeScript for type safety
- Follow clean architecture principles
- Separate concerns between components, screens, and utilities
- Use consistent naming conventions

### Styling
- Use the centralized theme system
- Apply global styles where appropriate
- Maintain consistent spacing and colors
- Ensure responsive design

### Components
- Create reusable components
- Use TypeScript interfaces for props
- Follow React best practices
- Include proper accessibility features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
