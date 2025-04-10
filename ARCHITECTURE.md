# 🧱 Web Frontend Architecture

This document provides a detailed explanation of the folder structure and architecture used in the **web** application of this project. The goal is to keep the frontend modular, scalable, and maintainable as the product evolves.

## 📁 Folder Structure Overview
- web/
- ├── public/
- ├── src/
  - ├── assets/
  - ├── components/
  - ├── hooks/
  - ├── layouts/
  - ├── pages/
  - ├── routes/
  - ├── services/
  - ├── store/
  - ├── theme/
  - ├── utils/
  - ├── App.tsx
  - └── main.tsx
- index.html
- tsconfig.json
- vite.config.ts

## 📂 Folder Descriptions

### `public/`
Static files that are served directly without processing. This includes:
- `favicon.ico`
- Images or logos
- `manifest.json`

### `src/`
Main application source code.

#### `assets/`
Global static assets such as images, fonts, SVGs.

#### `components/`
Reusable presentational components like buttons, inputs, cards, etc. These are stateless or minimally stateful and styled with Tailwind or a shared design system.

#### `hooks/`
Custom React hooks for common logic such as `useAuth`, `useTheme`, `useDebounce`, etc.

#### `layouts/`
Page-level layout components such as `MainLayout`, `AuthLayout`, `DashboardLayout`.

#### `pages/`
Top-level pages that represent each route in the app (e.g., `Home.tsx`, `Login.tsx`, `Habits.tsx`).

#### `routes/`
Routing logic, usually defined using `react-router-dom`. Contains route guards and route definitions.

#### `services/`
API logic. Contains HTTP clients using `axios` or `fetch`, organized by domain (e.g., `auth.service.ts`, `user.service.ts`, `habit.service.ts`).

#### `store/`
Global state management (if needed). You can use tools like:
- `Zustand`
- `Redux Toolkit`
- Or even `React Context` for small global state needs

#### `theme/`
Tailwind config extensions, color schemes, spacing, typography and any custom theme variables.

#### `utils/`
Helper functions, validation schemas (e.g., `zod` or `yup`), formatters, constants, etc.

#### `App.tsx`
Root component that sets up routing, global providers (e.g., ThemeProvider, AuthProvider), and error boundaries.

#### `main.tsx`
Entry point for the React application. Mounts the app to the DOM.

## ⚙️ Tooling & Configuration

### `vite.config.ts`
Configuration for Vite (modern dev server and build tool). Includes:
- Aliases (e.g., `@/components`)
- Plugins (e.g., React, SVGR, etc.)

### `tsconfig.json`
TypeScript config specific to the web app. Inherits from the base config at the root.

## 🧩 Integration with Shared Libraries

If you’re using Nx or a similar monorepo setup, this web app may import logic and components from shared libraries like:

- `@libs/ui` – Design system and reusable UI components
- `@libs/hooks` – Cross-platform logic (React/React Native)
- `@libs/types` – Shared TypeScript interfaces and types
- `@libs/api` – Base Axios config, token interceptors

## ✅ Best Practices

- Follow component-driven development
- Keep business logic outside of UI components (in hooks or services)
- Use environment variables for API URLs
- Use code splitting and lazy loading for routes
- Apply accessibility and responsiveness from the start
- Write unit tests for utilities and critical logic

## 📦 Future Improvements (Optional Ideas)

- Add i18n support (e.g., `react-i18next`)
- Integrate analytics or error tracking (e.g., Sentry)
- Include a testing setup with Vitest or Jest + React Testing Library
- Add service workers or PWA support (if required)

## 📣 Contact

For any contribution, follow the code guidelines and structure described above. For questions, contact the frontend team lead or check the README at the root of the repository.
