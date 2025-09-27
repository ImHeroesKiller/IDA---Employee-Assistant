# IDA - Employee Assistant: Deployment Guide

This guide explains how to build and deploy this application to a static hosting service like GitHub Pages.

## ⚠️ Important: API Key Security

For this application to connect to the live Google Gemini API, it needs an API key. However, for critical security reasons, this key **cannot** be stored in the frontend code or exposed in a web browser.

-   **Security Risk**: If your API key is in your frontend code, anyone visiting your site can find it and use it, potentially leading to high costs and misuse of your account.
-   **Current Design**: This application is designed to get the API key from a secure server environment (`process.env.API_KEY`). Static hosting services like GitHub Pages do not have this secure environment.

**Therefore, when you deploy this application to GitHub Pages, it will not connect to the live Gemini API.**

Instead, it will automatically fall back to a **built-in mock service**. This allows you to demonstrate the full UI and user flow of the application, but the AI responses will be simulated.

### The Professional Solution: A Backend Proxy

To make this application fully functional online with a real API key, the standard and secure approach is to create a simple backend server (often called a proxy or middleware).

1.  The frontend (this app) sends user messages to your backend server.
2.  Your backend server securely stores your API key.
3.  The backend server adds the key to the request and forwards it to the Google Gemini API.
4.  The Gemini API responds to your backend, which then sends the response back to the frontend.

This is the industry-standard way to protect secret keys for web applications. You can build such a proxy using services like Vercel Serverless Functions, Netlify Functions, or Google Cloud Functions.

## Deploying to GitHub Pages (with Mock Service)

Here are the steps to build the static files and deploy them to GitHub Pages.

### 1. Project Setup

If you haven't already, you need to set up a local project.

a. Place all the application files (`index.html`, `App.tsx`, etc.) into a new folder on your computer.

b. Open your terminal in the project's root directory and install the necessary packages by running this command (this will also create a `node_modules` folder):
   ```bash
   npm install
   ```

### 2. Configure for Your Repository

Open the `vite.config.ts` file and change the `base` property to match your GitHub repository name.

```typescript
// vite.config.ts
export default defineConfig({
  // ... other config
  // V IMPORTANT: Change this to your repository name!
  base: '/your-repo-name/', 
});
```

For example, if your repository URL is `https://github.com/your-username/my-ida-bot`, you should set `base: '/my-ida-bot/'`.

### 3. Build the Application

Run the build command in your terminal. This will compile the React/TypeScript code into static HTML, CSS, and JavaScript files in a `dist` folder.

```bash
npm run build
```

### 4. Deploy to GitHub Pages

This project uses the `gh-pages` package to make deployment simple. Run the following command:

```bash
npm run deploy
```

This command will automatically create a `gh-pages` branch on your repository (if it doesn't exist), push the contents of your `dist` folder to it, and your site will be live!

You can find your live site URL in your repository's settings under the "Pages" section. It will typically be `https://your-username.github.io/your-repo-name/`.
