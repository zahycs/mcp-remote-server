# Project Structure Standards

## Overview

This document outlines the standard project structure for React Native applications at BluestoneApps. Following these standards ensures consistency across projects and makes it easier for developers to navigate and maintain the codebase.

## Directory Structure

The React Native application follows a well-organized modular structure to maintain separation of concerns and facilitate code reuse.

```
/src
  /assets          # Static assets (images, fonts, etc.)
  /components      # Reusable React components
  /config          # Configuration files and environment settings
  /helper          # Helper functions and utilities
  /hooks           # Custom React hooks
  /navigation      # Navigation configuration and components
  /screens         # Screen components organized by feature/flow
  /services        # Services for API communication and business logic
  /theme           # Theming variables (colors, spacing, typography)
  /utils           # Utility functions and modules
```

## Key Patterns

### Feature-Based Organization

Screen components are organized by feature or flow (e.g., PreLogin/Login, Dashboard) rather than by component type.

```
/screens
  /PreLogin
    /Login
      LoginScreen.tsx
      Styles.ts
    /SignUp
    /ForgotPassword
  /Dashboard
  /Profile
```

### Component Hierarchy

- **Screens**: Full-page components that are navigation targets
- **Components**: Reusable UI elements used across screens
- **Navigation**: Components that manage app routing and transitions

### Separation of Concerns

- UI components in `/screens` and `/components`
- Business logic in `/services` and `/hooks`
- API communication in `/services`
- Configuration in `/config`

## File Naming Conventions

- Component files: PascalCase with .tsx extension (e.g., `LoginScreen.tsx`)
- Utility and service files: camelCase with .ts extension (e.g., `authService.ts`)
- Style files: `Styles.ts` or `ComponentNameStyles.ts`
- Type definitions: `types.ts` or `[feature]Types.ts`

## Import Standards

- Use relative imports for files in the same directory or nearby
- Use absolute imports from the src root for distant files
- Organize imports by:
  1. React/RN libraries
  2. Third-party libraries
  3. Project imports
  4. Types
  5. Styles

Example:
```typescript
// 1. React/RN imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// 3. Project imports
import { Button } from '../../../components/Button';
import { colors } from '../../../theme/colors';
import { login } from '../../../helper/authService';

// 4. Types
import { LoginScreenProps } from './types';

// 5. Styles
import styles from './Styles';
```

## Configuration Management

- Environment-specific configuration should be in `/config/environment.ts`
- API endpoints should be defined in `/helper/config.ts`
- Constants should be exported from appropriate files

## Asset Organization

- Assets should be organized by type (images, fonts, icons)
- Use descriptive filenames for assets
- Consider using asset catalogs for platform-specific assets

## Best Practices

- Keep the directory structure flat where possible
- Group related files together
- Use index files to simplify imports
- Document the purpose of each directory in a README file
- Follow consistent naming patterns across the project
- For any changes you make, summarize in the changelog.md file

## Changelog Management

All projects must maintain a `CHANGELOG.md` file at the root level to track changes to the codebase.

- Update the changelog for every feature, bugfix, or significant change
- Follow the [Keep a Changelog](https://keepachangelog.com/) format
- Organize entries by version number and release date
- Include categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Link issue numbers where applicable

Example:
```markdown
# Changelog

## [1.2.0] - 2025-03-04

### Added
- New profile settings screen (#123)
- Support for dark mode throughout the app

### Changed
- Improved form validation in login screen
- Updated API client to handle refresh tokens

### Fixed
- Crash when opening notifications on Android (#145)
- Text overflow in product details screen
```
