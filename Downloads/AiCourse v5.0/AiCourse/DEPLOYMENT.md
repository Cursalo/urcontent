# Cursalo Deployment Guide

## Vercel Deployment Options

### Option 1: Frontend Only on Vercel (Recommended)

This approach deploys the React frontend on Vercel and keeps the API server on Render.com or another platform.

#### Steps:

1. **Deploy Backend on Render.com** (as we already configured):
   - Use the existing `render.yaml` configuration
   - Deploy your API server on Render
   - Note your API URL (e.g., `https://cursalo-api.onrender.com`)

2. **Deploy Frontend on Vercel**:
   ```bash
   # Clone/fork the repository
   git clone https://github.com/Cursalo/cursalo.git
   cd cursalo
   
   # Copy the frontend-only Vercel config
   cp vercel-frontend-only.json vercel.json
   
   # Push to GitHub
   git add .
   git commit -m "Add Vercel frontend configuration"
   git push
   ```

3. **Configure Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables:
     ```
     NODE_ENV=production
     VITE_SERVER_URL=https://your-render-api.onrender.com
     VITE_APP_NAME=Cursalo
     VITE_COMPANY_NAME=Spacester
     ```

4. **Deploy**: Vercel will automatically build and deploy your frontend

### Option 2: Full-Stack on Vercel (Advanced)

Deploy both frontend and backend as serverless functions on Vercel.

#### Steps:

1. **Use the full vercel.json** (already created)
2. **Set environment variables** in Vercel dashboard:
   ```
   NODE_ENV=serverless
   MONGODB_URI=your_mongodb_connection
   EMAIL=your_email
   PASSWORD=your_email_password
   API_KEY=your_google_ai_key
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   STRIPE_SECRET_KEY=your_stripe_key
   ```

3. **Deploy to Vercel** via GitHub integration

⚠️ **Note**: Option 2 may have limitations with file uploads and long-running processes due to Vercel's serverless nature.

## Recommended Architecture

### Frontend: Vercel
- Fast global CDN
- Automatic HTTPS
- Perfect for React apps
- Free tier available

### Backend: Render.com
- Always-on server
- Better for file uploads
- Database connections
- Background processes

## Quick Deploy Commands

### For Frontend-Only Vercel Deployment:
```bash
# 1. Update your constants.tsx to use environment variables
# 2. Copy frontend-only config
cp vercel-frontend-only.json vercel.json

# 3. Update VITE_SERVER_URL with your Render API URL
# 4. Commit and push
git add .
git commit -m "Configure for Vercel frontend deployment"
git push

# 5. Import to Vercel and deploy
```

### Environment Variables Needed:

**For Vercel (Frontend)**:
```
NODE_ENV=production
VITE_SERVER_URL=https://your-api-server.onrender.com
VITE_APP_NAME=Cursalo
VITE_COMPANY_NAME=Spacester
VITE_WEBSITE_URL=https://your-frontend.vercel.app
```

**For Render (Backend)**:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
API_KEY=your-google-ai-key
UNSPLASH_ACCESS_KEY=your-unsplash-key
STRIPE_SECRET_KEY=your-stripe-secret
COMPANY=Cursalo
WEBSITE_URL=https://your-frontend.vercel.app
```

## Testing Your Deployment

After deployment, test these URLs:

**Frontend (Vercel)**:
- `https://your-app.vercel.app/` - React app
- `https://your-app.vercel.app/login` - Login page
- `https://your-app.vercel.app/dashboard` - Dashboard

**Backend (Render)**:
- `https://your-api.onrender.com/health` - Health check
- `https://your-api.onrender.com/api/health` - API health check

## Cost Comparison

| Platform | Frontend | Backend | Total/Month |
|----------|----------|---------|-------------|
| Vercel + Render | Free | $7+ | $7+ |
| Full Render | - | $7+ | $7+ |
| Full Vercel | Free | $20+ | $20+ |

**Recommendation**: Use Vercel for frontend + Render for backend for the best performance and cost efficiency.