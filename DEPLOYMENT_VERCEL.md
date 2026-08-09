# Deploying AI Call CRM Backend & Frontend to Vercel

This project is now fully configured for **1-click deployment to Vercel**. You can deploy both the React Frontend and the Node.js Express Backend together in a single Vercel project (Recommended) or deploy the Backend separately.

---

## Method 1: Deploy via Vercel Dashboard & GitHub (Recommended - Easiest)

1. **Push your code to GitHub**:
   - Push this repository (`CALL app`) to your GitHub account.

2. **Import Project into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New...** -> **Project**.
   - Select your GitHub repository.

3. **Deploy**:
   - Vercel will automatically detect `vercel.json`.
   - Click **Deploy**.
   - Your frontend CRM and backend Express API will be live at `https://your-app-name.vercel.app`!

---

## Method 2: Deploy via Vercel CLI (From your Terminal)

1. Open PowerShell / Command Prompt in your project directory:
   ```bash
   npx vercel
   ```

2. Follow the interactive CLI prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Choose your personal/team account
   - **Link to existing project?**: `n`
   - **Project name**: `ai-call-crm` (or your choice)
   - **In which directory is your code located?**: `./`

3. To deploy to production with your custom domain:
   ```bash
   npx vercel --prod
   ```

---

## Testing Your Live Vercel Deployment

Once deployed, test your API endpoint health check:
- `https://your-app-name.vercel.app/health` -> Should return `{"ok": true}`
- `https://your-app-name.vercel.app/api` -> Should return API status details

---

## Seed Admin Credentials on First Login
- **User ID / Login**: `admin` or `CALL-240001`
- **Password**: `demo123`
