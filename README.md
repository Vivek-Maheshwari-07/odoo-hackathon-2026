# AssetFlow

AssetFlow is an enterprise asset and resource management system that digitizes physical asset tracking and shared resource booking to replace manual spreadsheets.

## Overview

AssetFlow digitizes physical asset tracking and shared resource booking to replace manual spreadsheets in enterprise environments. The system provides role-based permissions, resource reservation scheduling, and automated workflows to track physical hardware and coordinate shared room allocations.

## Tech Stack

* **Frontend**: React.js, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database & ORM**: MySQL, Prisma

## Key Features

* **Secure Role-Based Access Control**: Granular permission levels for Admin, Asset Manager, Dept Head, and Employee roles.
* **Centralized Asset Directory & Registration**: Unified directory to register, manage, and audit physical assets.
* **Asset Allocation & Transfer Workflows**: Managed asset allocation and handovers with double-booking prevention logic.
* **Time-slot Resource Booking**: Resource reservation scheduling with integrated overlap validation.
* **Structured Maintenance Approval Pipeline**: Kanban-style state machine to process, track, and approve asset maintenance requests.

## Local Setup & Quick Start

AssetFlow uses a split client and server architecture. Follow the instructions below to configure the database and run the client and server applications.

### Dependency Installation

Navigate to each folder and run the installation command:

```bash
# Install server dependencies
cd server
npm install --legacy-peer-deps

# Install client dependencies
cd ../client
npm install --legacy-peer-deps
```

### Database Schema Setup

Generate the Prisma client and apply the schema changes directly to the MySQL database:

```bash
npx prisma generate
npx prisma db push
```

### Running the System

Start the server and client services individually:

```bash
# Start backend server
cd server
npm start

# Start frontend client
cd ../client
npm run dev
```

## Contributors

* Vivek Maheshwari
* Manav Lathiya
* Jugal Kshatriya
* Aayush Malhotra
