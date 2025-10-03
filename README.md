# Project Setup and Deployment Instructions

## Development Setup

### 1. Pull Repository
Clone or pull the latest version of the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

Or if you already have the repository:

```bash
git pull origin main
```

### 2. Install Dependencies
Install all required npm packages. The `--force` flag is used to resolve any dependency conflicts:

```bash
npm install --force
```

**Note:** The `--force` flag bypasses certain checks and forces package installation. Use this if you encounter peer dependency warnings or conflicts.

### 3. Start Development Server
Launch the Angular development server:

```bash
ng serve
```

The application will be available at:
- **Local:** `http://localhost:4200`
- The development server includes hot-reload, so changes will automatically reflect in the browser

To run on a different port:
```bash
ng serve --port 4300
```

---

## Production Build

### 1. Build for Production
Create an optimized production build:

```bash
ng build
```

This command will:
- Compile the application with production optimizations
- Minify code and assets
- Generate output in the `/dist` directory
- Enable ahead-of-time (AOT) compilation

For a specific environment:
```bash
ng build --configuration production
```

### 2. Deploy Build Files
After the build completes successfully:

1. Navigate to the build output directory:
   ```
   dist/realtime/browser
   ```

2. Copy all contents from this directory to your destination server/hosting directory:
   ```bash
   cp -r dist/realtime/browser/* /path/to/destination/
   ```

   **Windows:**
   ```cmd
   xcopy dist\realtime\browser\* \path\to\destination\ /E /I /Y
   ```

3. Ensure your web server is configured to:
   - Serve `index.html` for all routes (for Angular routing to work)
   - Use proper MIME types for static assets

---

## Common Issues

- **Port already in use:** Kill the process using port 4200 or use a different port
- **Build errors:** Clear the cache with `npm cache clean --force` and reinstall
- **Module not found:** Ensure all dependencies are installed with `npm install`