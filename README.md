# COSMOS RSC - caveman's RSC Template

COSMOS RSC is a React Server Component (RSC) template designed to showcase the features and capabilities of React 19 and Server Components.

## Features

- React Server Components (RSC) implementation with **webpack** bundler
- Server-side streaming rendering
- Client-side navigation with suspense enabled router
- Form handling with server actions
- Basic file-system based routing using pages directory
- Pre-configured Tailwind CSS for styling

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
│   ├── pages/           # Page components
│   ├── globals.css      # Global styles
│   ├── favicon.ico      # Favicon
│   └── root-layout.js   # Root layout component (Not re-fetched during client side navigation)
└── core/
    ├── client/          # Client-side runtime and components
    ├── config/          # Build configuration
    ├── loaders/         # Custom loaders
    ├── rsc-html-stream/ # RSC HTML streaming implementation
    ├── scripts/         # Build scripts
    └── server/          # RSC and SSR servers
```
