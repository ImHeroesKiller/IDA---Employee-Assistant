# IDA - Employee Assistant: Setup Guide

This guide explains how to run this application on your local machine and how to build and deploy it to a static hosting service like GitHub Pages.

## Running Locally

Follow these steps to get the application running on your computer.

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### 2. Project Setup

a. Place all the application files (`index.html`, `App.tsx`, etc.) into a folder on your computer.

b. Open your terminal in that folder and install the necessary packages by running:
   ```bash
   npm install
   ```

### 3. (Optional but Recommended) Set up your Gemini API Key

To connect to the live Google Gemini API, you need to provide your API key securely.

a. In the root of your project folder, create a new file named `.env.local`.

b. Add your API key to this file like so:
   ```
   API_KEY=your_gemini_api_key_here
   ```
   
**Note**: If you skip this step, the application will use a built-in mock service and will not connect to the real Gemini API. This is useful for UI development without using your key. The `.gitignore` file in this project is already configured to keep this file private.

### 4. Start the Development Server

Run the following command in your terminal:
```bash
npm run dev
```

Your application should now be running! Your terminal will show you the local URL, which is usually `http://localhost:5173`. Open this URL in your web browser.

---

## Deploying to GitHub Pages (with Mock Service)

### ⚠️ Important: API Key Security

For critical security reasons, your Gemini API key **cannot** be stored in the frontend code or exposed in a web browser. Static hosting services like GitHub Pages do not have a secure environment to store secrets.

**Therefore, when you deploy this application to GitHub Pages, it will not connect to the live Gemini API.** It will automatically fall back to the **built-in mock service**, which allows you to demonstrate the full UI and user flow of the application with simulated AI responses.

### Deployment Steps

#### 1. Configure the `base` Path

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

#### 2. Build the Application

Run the build command in your terminal. This will compile the React/TypeScript code into static HTML, CSS, and JavaScript files in a `dist` folder.

```bash
npm run build
```

#### 3. Deploy to GitHub Pages

This project uses the `gh-pages` package to make deployment simple. Run the following command:

```bash
npm run deploy
```

This command will automatically create a `gh-pages` branch on your repository (if it doesn't exist), push the contents of your `dist` folder to it, and your site will be live.

You can find your live site URL in your repository's settings under the "Pages" section. It will typically be `https://your-username.github.io/your-repo-name/`.