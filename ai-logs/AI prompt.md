# Vibe Coding Workflow: From Idea to Deployable System

## Overview

This workflow describes a structured, iterative approach to building a web-based system from an initial concept to a fully functional and deployable product. It emphasizes clarity of requirements, modular development, and progressive integration.


## Stage 0: From Idea to Development Specification

**Objective**  
Transform a vague concept into clearly defined user requirements, information architecture, and core workflows.

**Prompt**
```text
I want to build a "campus navigation + light gamification" web prototype for [target users]. Please:

1) Write 5 user requirements describing core value;
2) List main pages/routes and their goals;
3) Identify data that should persist in localStorage;
4) Separate the features from deferred features.

Output using tables and concise text. Do not write code.
````


## Stage 1: Technology Stack and Project Building

**Objective**
Define the technical stack and establish a consistent project structure.

**Prompt**

```text
Use React + Vite + TypeScript, with React Router (Hash mode for GitHub Pages). Provide:

1) Recommended folder structure (src/app/components, context, data, services);
2) Key dependencies for package.json;
3) Notes on local development and base configuration.

Only provide steps and file structure. Do not implement business logic.
```

## Stage 2: Application Framework Building

**Objective**
Establish a minimal runnable application with routing and global structure.

**Prompt**

```text
Implement a minimal working skeleton:

- App.tsx with global Providers;
- routes.tsx defining /, /home, /pictures, etc. with placeholder components;
- RootLayout wrapping Providers and rendering Outlet;
- Add an error boundary page.

Each page should only display a title and a placeholder message.
```

## Stage 3: Design System and UI Components

**Objective**
Create UI components to the system.

**Prompt**

```text
Based on an existing visual style (e.g., comic-style, predefined color constants), implement components:

- PhoneShell: status bar, safe area, layout container;
- BottomNav: active tab highlighting and routing via react-router;

Requirements:
- Fully typed props
- Tailwind-based styling
- No business logic implementation
```

## Stage 4: System Integration

**Objective**
Ensure all components and modules work cohesively.

**Prompt**

```text
Perform a system integration review:

1) List all Context dependencies and hierarchy;
2) Verify route-to-BottomNav mapping;
3) Identify duplicated state or requests;
4) Detect missing i18n keys;

First provide a checklist, then apply fixes incrementally by category.
```

## Stage 5: Finalization and Deployment

**Objective**
Prepare the system for deployment and presentation.

**Prompt**

```text
Prepare for GitHub Pages deployment:

1) Verify vite.config base path;
2) Confirm HashRouter usage;
3) Check asset paths;

Update README with setup and scripts;
Suggest three low-cost Lighthouse optimizations (images, fonts, initial load).
```



