# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm install` - Install dependencies
- `npx expo start` - Start development server with options for Android, iOS, web, or Expo Go
- `npm start` - Alias for expo start
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start web version
- `npm run reset-project` - Reset to fresh project structure

### Code Quality
- `npm run lint` - Run ESLint checks using expo lint

### Database Operations
- `npm run seed:all` - Seed database with test data using Faker.js
- `npm run seed:clear` - Clear test data from database
- `npx convex run seed:clear --onlyFakeData false` - Clear ALL data including real users

## Architecture Overview

### Tech Stack
- **Framework**: Expo Router with React Native
- **Backend**: Convex (realtime database with serverless functions)
- **Authentication**: Clerk integration with Expo
- **Styling**: React Native with responsive utilities
- **Type Safety**: TypeScript with strict mode enabled

### Project Structure
```
app/                    # File-based routing (Expo Router)
├── (auth)/            # Authentication screens
├── (tabs)/            # Main tab navigation
├── (screens)/         # Additional screens
│   └── (shared)/      # Shared screens
└── _layout.tsx        # Root layout

src/
├── components/        # Reusable UI components
│   ├── ui/           # Basic UI components
│   ├── animated/     # Animation components
│   └── feedback/     # User feedback components
├── hooks/            # Custom React hooks
├── services/         # External service integrations
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── styles/           # Styling and theming
└── provider/         # Context providers

convex/               # Backend functions and schema
├── schema.ts         # Database schema
├── seed.ts           # Database seeding
└── *.ts             # Convex functions (queries/mutations)
```

### Key Features
- **eMediCard Health Card System**: Digital health card application and management
- **Multi-platform Support**: iOS, Android, and web
- **Real-time Database**: Convex provides live data synchronization
- **Document Upload**: Health card document requirements handling
- **QR Code System**: Health card verification and scanning
- **Payment Processing**: Application fee handling
- **Orientation Management**: Required training scheduling
- **Activity Tracking**: Application status monitoring

### Database Schema
The app manages several core entities:
- **users**: User profiles with personal information
- **jobCategory**: Health card types (Food Handler, Non-Food Worker, Skin-to-Skin Contact)
- **forms**: Application submissions
- **healthCards**: Issued digital health cards
- **payments**: Payment records
- **orientations**: Training sessions
- **notifications**: User notifications
- **verificationLogs**: QR code scan history

### Path Aliases
- `@/*` - Maps to project root for imports

### Environment Setup
- Requires `.env.local` for Convex and Clerk configuration
- Deep linking configured for `emedicardproject://` scheme
- Web deployment uses Metro bundler with static output

### Development Notes
- Uses Expo Router for navigation with typed routes enabled
- Responsive design with scaling utilities
- Error boundaries and loading states implemented
- Toast notifications via context
- Performance monitoring hooks available