# Deployment Guide

## Quick Deploy Options

### 1. Deploy to Railway (Recommended for Real-time Apps)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

### 2. Deploy to Render
1. Go to https://render.com
2. Connect your GitHub repository
3. Choose "Web Service"
4. Set build command: `npm install`
5. Set start command: `node realtime-server.js`
6. Deploy!

### 3. Deploy to Heroku
```bash
# Install Heroku CLI
# Then run:
heroku create your-chat-app-name
git push heroku main
```

### 4. Deploy to Vercel (Note: Limited WebSocket support)
```bash
npm install -g vercel
vercel --prod
```

## Environment Variables
Set these in your deployment platform:
- `NODE_ENV=production`
- `PORT=8000` (or let platform set automatically)

## Important Notes
- Railway and Render are best for WebSocket apps
- Vercel has limited WebSocket support
- Make sure to update CORS origins in production

## Testing Deployment
After deployment, test these features:
1. Multiple users can connect
2. Real-time messaging works
3. Room creation/switching works
4. All UI features function properly
