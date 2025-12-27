# Electron Desktop App Guide

## Overview

The Shopify Marketplace Manager can be packaged as an Electron desktop application for macOS, Windows, and Linux. The desktop app bundles the Node.js backend and React frontend into a standalone executable.

## Architecture

```
┌─────────────────────────────────┐
│   Electron Main Process         │
│   (electron/main.js)            │
│                                 │
│   - Window Management           │
│   - Menu Bar                    │
│   - Server Process Management   │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼─────────────┐  ┌▼──────────────────┐
│  Backend Server  │  │  Frontend UI      │
│  (Express)       │  │  (React/Vite)     │
│  Port: 3000      │  │  Loaded in        │
│                  │  │  BrowserWindow    │
└──────────────────┘  └───────────────────┘
```

## Development

### Prerequisites
- Node.js 18+
- All project dependencies installed

### Run in Development Mode

```bash
# Start the development build
npm run electron:dev
```

This will:
1. Start the Express backend server
2. Start the Vite dev server (with hot reload)
3. Launch Electron with DevTools open

### File Structure

```
electron/
├── main.js       # Main Electron process
└── preload.js    # Preload script for security
```

## Building

### Build for Current Platform

```bash
# Build the client first
npm run build:prod

# Build Electron app
npm run electron:build
```

### Build for All Platforms

```bash
npm run electron:build:all
```

This creates installers for:
- **macOS**: `.dmg` and `.zip`
- **Windows**: `.exe` installer and portable `.exe`
- **Linux**: `.AppImage` and `.deb`

### Output

Built applications are in `dist-electron/`:
```
dist-electron/
├── Shopify Marketplace Manager-1.0.0.dmg
├── Shopify Marketplace Manager-1.0.0-mac.zip
├── Shopify Marketplace Manager Setup 1.0.0.exe
├── Shopify Marketplace Manager-1.0.0.AppImage
└── shopify-marketplace-manager_1.0.0_amd64.deb
```

## Configuration

### electron-builder Settings

Settings are in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.shopify.marketplace-manager",
    "productName": "Shopify Marketplace Manager",
    "mac": {
      "category": "public.app-category.business",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Office"
    }
  }
}
```

### Code Signing (Optional)

For production releases:

**macOS:**
```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
npm run electron:build
```

**Windows:**
```bash
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=certificate_password
npm run electron:build
```

## Features

### Application Menu

The desktop app includes a native menu with:
- File operations
- Edit commands (undo, redo, copy, paste)
- View controls (zoom, reload, DevTools)
- Help links

### Window Management

- Default size: 1400x900
- Remembers window position and size
- macOS: App stays open when windows close
- Windows/Linux: App quits when window closes

### Security

- Context isolation enabled
- Node integration disabled
- Preload script for safe IPC
- No remote module

### Server Management

The backend server:
- Starts automatically when app launches
- Runs on port 3000 (configurable via env)
- Stops when app quits
- Logs visible in console

## Distribution

### macOS

**DMG Installer:**
1. Double-click `.dmg` file
2. Drag app to Applications folder
3. Launch from Applications

**Notarization** (for public distribution):
```bash
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
npm run electron:build
```

### Windows

**NSIS Installer:**
1. Run `.exe` installer
2. Follow installation wizard
3. Launch from Start Menu

**Portable:**
- No installation needed
- Run `.exe` directly
- Settings stored in app directory

### Linux

**AppImage:**
```bash
chmod +x Shopify-Marketplace-Manager-*.AppImage
./Shopify-Marketplace-Manager-*.AppImage
```

**Debian Package:**
```bash
sudo dpkg -i shopify-marketplace-manager_*.deb
```

## Environment Variables

Create a `.env` file in the app directory or set system environment variables:

```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
HOST=http://localhost:3000
```

## Troubleshooting

### App won't start
- Check console for errors
- Verify Node.js is in PATH
- Check file permissions
- Review logs in app data directory

### Server fails to start
- Check if port 3000 is available
- Verify database connection
- Check environment variables
- Review server logs

### Build fails
- Clear `dist-electron/` directory
- Rebuild client: `npm run build:prod`
- Check electron-builder logs
- Verify all dependencies installed

### macOS: "App is damaged"
This happens with unsigned apps. Users can:
1. Right-click app → Open
2. Or: `xattr -cr /path/to/app.app`

### Windows: SmartScreen warning
For unsigned apps, users can click "More info" → "Run anyway"

## Updates

### Manual Updates
1. Download new version
2. Install over existing version
3. Settings and data preserved

### Auto-Update (Optional)
Implement with `electron-updater`:
```bash
npm install electron-updater
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Code Signing](https://www.electron.build/code-signing)
