# Node.js Project README

## description
The frontend of the application.


## Prerequisites

Before you can use this project, you must have the following installed:

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Docker](https://www.docker.com/get-started)

## Installation

This is a Node.js project that requires Yarn to be installed and can be run as a Docker container.

To install the necessary dependencies for this project, run the following command:

```bash
cd modules/basic-modules
yarn install
cd ..
yarn install
```

## Build

To build the project, run the following command:

```bash
cd modules/basic-modules
yarn run build
cd ..
yarn run build
```

## Docker Container

To generate a Docker container, run the following command:

```bash
docker/build.bat
```

Make sure you have Docker installed on your system before running this command.