# 🧱 Web Frontend Architecture

This document outlines the folder structure and architecture used in the **web** frontend of this project. It follows a modular, scalable, and domain-driven design to ensure clean separation of concerns and long-term maintainability.

## 📁 Folder Structure Overview

```
project-root/
│
├── public/               # Static files (HTML, images, etc.)
├── src/                  # Application source code
│   ├── features/         # Domain-driven features of the app
│   │   ├── auth/         # Authentication-specific feature
│   │   │   ├── components/   # Auth-specific UI components
│   │   │   ├── hooks/        # Custom hooks for auth logic
│   │   │   ├── services/     # API services related to auth
│   │   │   ├── slices/       # Redux slices (if using Redux Toolkit)
│   │   │   └── pages/        # Pages/views related to auth
│   │   ├── dashboard/    # Dashboard-specific functionality
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── slices/
│   │   │   └── pages/
│   │   └── ...           # Other domain features (e.g. products, users, etc.)
│   │
│   ├── shared/           # Shared reusable logic/components
│   │   ├── components/   # Common UI (buttons, modals, etc.)
│   │   ├── hooks/        # Reusable hooks
│   │   ├── services/     # Global services (e.g. API base)
│   │   ├── utils/        # Helpers and utilities
│   │   ├── styles/       # Global styles (Tailwind, SCSS, etc.)
│   │   └── contexts/     # Global React contexts (Auth, Theme, etc.)
│   │
│   ├── App.js            # Root component with providers and layout
│   ├── index.js          # React entry point
│   └── routes.js         # App routing configuration (React Router)
│
├── .env                  # Environment variables
├── .gitignore            # Git ignored files
├── package.json          # Project metadata, scripts, dependencies
└── README.md             # Project documentation
```

---

## 📂 Folder Descriptions

### `public/`

Contains static files served as-is:

* `index.html`
* Images, icons, logos
* Manifest or favicon

### `src/features/`

Each subfolder under `features` corresponds to a **feature/domain** of the application (e.g., auth, dashboard, orders). Internally, a feature is broken into:

* `components/`: Feature-specific UI elements
* `hooks/`: Feature-specific logic encapsulated in custom hooks
* `services/`: API clients or service logic
* `slices/`: Redux slices (only if using Redux Toolkit)
* `pages/`: Pages related to this feature, used in routing

This structure allows encapsulation and ownership of logic within a feature.

### `src/shared/`

Holds **reusable and shared logic** across the app:

* `components/`: UI elements shared across features (e.g., Button, Modal)
* `hooks/`: Common custom hooks like `useDebounce`, `useWindowSize`
* `services/`: Shared services like base Axios instance
* `utils/`: Utility functions, constants, validators
* `styles/`: Global styles, Tailwind config, themes
* `contexts/`: Shared app-wide contexts like AuthContext, ThemeContext

### `src/App.js`

Sets up high-level structure of the app: layout, context providers, routing.

### `src/index.js`

Mounts the React app to the DOM (`ReactDOM.createRoot`).

### `src/routes.js`

Holds routing config using `react-router-dom`. Includes public/private routes and guards.

---

## ⚙️ Configuration Files

### `.env`

Used for environment variables like:

```
REACT_APP_API_URL=https://api.example.com
```

### `package.json`

Defines:

* Dependencies and devDependencies
* Project scripts (`start`, `build`, `lint`, etc.)

---

## ✅ Best Practices

* Apply **domain-driven structure** using `features/`
* Isolate logic inside `hooks` and `services`
* Favor reusable components in `shared/components`
* Use environment variables for config
* Follow component-driven development and write unit tests for logic-heavy parts
* Apply responsiveness and accessibility from the beginning

---

## 📦 Future Enhancements

* Lazy-load feature pages with `React.lazy` and `Suspense`
* Add tests using Jest + React Testing Library
* Add i18n with `react-i18next`
* Setup error tracking (e.g. Sentry)
* Add PWA support or offline cache if needed

---

## 📣 Contribution Guide

When adding new features:

1. Create a new folder under `features/`.
2. Follow the subfolder convention (`components`, `hooks`, `pages`, etc.).
3. Reuse components and logic from `shared/` wherever possible.
4. Update `routes.js` to register new pages.
5. Write docs in `README.md` if applicable.

For questions, consult the frontend lead or check the documentation in the project root.

---

¿Te gustaría que este documento estuviera también en español o en formato Markdown para incluirlo en tu proyecto?
Aquí tienes la documentación adaptada a la arquitectura de carpetas que mostraste en la imagen (`project-root/src/features`, `shared`, slices, hooks, etc.), manteniendo el estilo claro y profesional del original:

---

# 🧱 Web Frontend Architecture

This document outlines the folder structure and architecture used in the **web** frontend of this project. It follows a modular, scalable, and domain-driven design to ensure clean separation of concerns and long-term maintainability.

## 📁 Folder Structure Overview

```
project-root/
│
├── public/               # Static files (HTML, images, etc.)
├── src/                  # Application source code
│   ├── features/         # Domain-driven features of the app
│   │   ├── auth/         # Authentication-specific feature
│   │   │   ├── components/   # Auth-specific UI components
│   │   │   ├── hooks/        # Custom hooks for auth logic
│   │   │   ├── services/     # API services related to auth
│   │   │   ├── slices/       # Redux slices (if using Redux Toolkit)
│   │   │   └── pages/        # Pages/views related to auth
│   │   ├── dashboard/    # Dashboard-specific functionality
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── slices/
│   │   │   └── pages/
│   │   └── ...           # Other domain features (e.g. products, users, etc.)
│   │
│   ├── shared/           # Shared reusable logic/components
│   │   ├── components/   # Common UI (buttons, modals, etc.)
│   │   ├── hooks/        # Reusable hooks
│   │   ├── services/     # Global services (e.g. API base)
│   │   ├── utils/        # Helpers and utilities
│   │   ├── styles/       # Global styles (Tailwind, SCSS, etc.)
│   │   └── contexts/     # Global React contexts (Auth, Theme, etc.)
│   │
│   ├── App.js            # Root component with providers and layout
│   ├── index.js          # React entry point
│   └── routes.js         # App routing configuration (React Router)
│
├── .env                  # Environment variables
├── .gitignore            # Git ignored files
├── package.json          # Project metadata, scripts, dependencies
└── README.md             # Project documentation
```

---

## 📂 Folder Descriptions

### `public/`

Contains static files served as-is:

* `index.html`
* Images, icons, logos
* Manifest or favicon

### `src/features/`

Each subfolder under `features` corresponds to a **feature/domain** of the application (e.g., auth, dashboard, orders). Internally, a feature is broken into:

* `components/`: Feature-specific UI elements
* `hooks/`: Feature-specific logic encapsulated in custom hooks
* `services/`: API clients or service logic
* `slices/`: Redux slices (only if using Redux Toolkit)
* `pages/`: Pages related to this feature, used in routing

This structure allows encapsulation and ownership of logic within a feature.

### `src/shared/`

Holds **reusable and shared logic** across the app:

* `components/`: UI elements shared across features (e.g., Button, Modal)
* `hooks/`: Common custom hooks like `useDebounce`, `useWindowSize`
* `services/`: Shared services like base Axios instance
* `utils/`: Utility functions, constants, validators
* `styles/`: Global styles, Tailwind config, themes
* `contexts/`: Shared app-wide contexts like AuthContext, ThemeContext

### `src/App.js`

Sets up high-level structure of the app: layout, context providers, routing.

### `src/index.js`

Mounts the React app to the DOM (`ReactDOM.createRoot`).

### `src/routes.js`

Holds routing config using `react-router-dom`. Includes public/private routes and guards.

---

## ⚙️ Configuration Files

### `.env`

Used for environment variables like:

```
REACT_APP_API_URL=https://api.example.com
```

### `package.json`

Defines:

* Dependencies and devDependencies
* Project scripts (`start`, `build`, `lint`, etc.)

---

## ✅ Best Practices

* Apply **domain-driven structure** using `features/`
* Isolate logic inside `hooks` and `services`
* Favor reusable components in `shared/components`
* Use environment variables for config
* Follow component-driven development and write unit tests for logic-heavy parts
* Apply responsiveness and accessibility from the beginning

---

## 📦 Future Enhancements

* Lazy-load feature pages with `React.lazy` and `Suspense`
* Add tests using Jest + React Testing Library
* Add i18n with `react-i18next`
* Setup error tracking (e.g. Sentry)
* Add PWA support or offline cache if needed

---

## 📣 Contribution Guide

When adding new features:

1. Create a new folder under `features/`.
2. Follow the subfolder convention (`components`, `hooks`, `pages`, etc.).
3. Reuse components and logic from `shared/` wherever possible.
4. Update `routes.js` to register new pages.
5. Write docs in `README.md` if applicable.

For questions, consult the frontend lead or check the documentation in the project root.
