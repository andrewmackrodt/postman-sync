# postman-sync 🕹️ 💾

Import and export workspaces across postman accounts.

## Requirements

**Operating System**: Linux or macOS, Windows should work but has not been tested<br>
**Runtime:** Node 18+, npm

## Installation

Ensure Node 18+ and npm are available and then run `npm install`.

If you do not have node installed, you may use `./setup.sh` which will download
a compatible runtime and install npm dependencies. Caution is advised running
the script if you have an older version of node installed and have applications
which require the older runtime.

## Usage

TODO

### Developer Commands

| Command                      | Description                          |
|------------------------------|--------------------------------------|
| `npm run build`              | Write compiled output to `./out`     |
| `npm run coverage`           | Write code coverage to `./coverage`  |
| `npm run lint`               | Run `eslint`                         |
| `npm run lint:fix`           | Run `eslint --fix`                   |
| `npm run test`               | Run test suite                       |
| `npm run test -- --watchAll` | Run test suite and watch for changes |
| `npm run start`              | Run application                      |
