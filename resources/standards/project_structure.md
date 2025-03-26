# React Native Project Structure

BluestoneApps recommends the following project structure for React Native applications:

```
project-name/
├── src/                    # Source code
│   ├── api/                # API interaction files
│   ├── assets/             # Static assets (images, fonts, etc.)
│   ├── components/         # Reusable components
│   │   ├── common/         # Shared components
│   │   └── specific/       # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── services/           # Business logic services
│   ├── store/              # State management
│   │   ├── actions/        # Redux actions
│   │   ├── reducers/       # Redux reducers
│   │   └── slices/         # Redux Toolkit slices
│   ├── theme/              # Theme definitions (colors, spacing, etc.)
│   └── utils/              # Utility functions
├── App.js                  # Root component
├── index.js                # Entry point
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Key Directories

### `src/api`

Contains all API-related code, including endpoints, interceptors, and response transformers.

### `src/components`

Reusable UI components organized by:
- `common`: Shared across the app (buttons, inputs, etc.)
- `specific`: Used by specific features

### `src/hooks`

Custom React hooks for shared logic.

### `src/navigation`

Navigation configuration using React Navigation.

### `src/screens`

Screen components organized by feature.

### `src/services`

Business logic, data transformation, and other services.

### `src/store`

State management using Redux/Redux Toolkit.

### `src/theme`

Theme definitions including colors, typography, spacing, etc.

## Best Practices

1. Use absolute imports with path aliases
2. Group related files in feature-based directories when appropriate
3. Keep components small and focused
4. Extract business logic into services
5. Use consistent naming conventions
