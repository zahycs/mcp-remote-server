# React Native Project Structure

BluestoneApps recommends the following project structure for React Native applications:

```
project-name/
├── src/                    # Source code
│   ├── assets/             # Static assets (images, fonts, etc.)
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files (API endpoints, constants)
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── PostLogin/      # Screens available after authentication
│   │   └── PreLogin/       # Authentication and onboarding screens
│   ├── services/           # Business logic services
│   ├── theme/              # Theme definitions (colors, spacing, etc.)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── App.tsx                 # Root component
├── index.js                # Entry point
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Key Directories

### `src/assets`

Contains static assets such as images, fonts, and other media files used in the application.

### `src/components`

Reusable UI components that can be used across different screens. Each component is typically defined in its own file with associated styles.

### `src/config`

Configuration files for the application, including API endpoint definitions, environment variables, and other constants.

### `src/hooks`

Custom React hooks for shared logic, state management, and side effects.

### `src/navigation`

Navigation configuration using React Navigation, including drawer navigators, stack navigators, and navigation wrappers.

### `src/screens`

Screen components organized by authentication state:
- `PostLogin`: Screens that are accessible after user authentication
- `PreLogin`: Authentication screens, onboarding, and public screens

Each screen may have its own subdirectory containing the main screen component and related files (e.g., styles, subcomponents).

### `src/services`

Business logic, API communication, data transformation, and other services. Typically implemented as singleton classes with specific responsibilities.

### `src/theme`

Theme definitions including colors, typography, spacing, and other styling constants.

### `src/types`

TypeScript type definitions, interfaces, and type guards that are shared across the application. This can be a separate directory or included within the config directory depending on the project size.

### `src/utils`

Utility functions and helpers, including API utilities, formatting functions, and other shared logic.

## Best Practices

1. Use TypeScript for type safety and better developer experience
2. Implement functional components with React hooks
3. Keep components small and focused on a single responsibility
4. Extract business logic into services
5. Use consistent naming conventions (PascalCase for components, camelCase for functions)
6. Implement proper error handling in API calls and async operations
7. Use environment-specific configuration when necessary
