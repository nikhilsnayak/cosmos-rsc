# COSMOS RSC - caveman's RSC Template

COSMOS RSC is a React Server Component (RSC) template designed to showcase the features and capabilities of React 19 and Server Components.

## Features

- React Server Components (RSC) implementation with **webpack** bundler
- Server-side streaming rendering
- Client-side navigation with custom router
- Form handling with server actions
- Basic file-system based routing using pages directory

## Prerequisites

- Node.js LTS

## Installation

To install the dependencies, run the following command:

```sh
npm install
```

## Usage

To start the development server, run:

```sh
NODE_ENV=development npm start
```

To build the project for production, run:

```sh
NODE_ENV=production npm run build
```

## Project Structure

```sh
├── app/
│   ├── pages/          # Page components
│   └── root-layout.js  # Root layout component
└── framework/
    ├── client/         # Client-side runtime
    ├── config/         # Build configuration
    ├── lib/            # Utility functions
    ├── loaders/        # Custom loaders
    ├── scripts/        # Build scripts
    └── server/         # RSC and SSR servers
```

## Limitations

- CSS solutions require manual configuration
- No TypeScript support
- No Hot Module Replacement (HMR)

These features are out of scope for this template as it focuses on demonstrating basic RSC functionality.
