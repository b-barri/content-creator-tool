# Deployment Guide

## Required Environment Variables

Before deploying, you'll need to set up the following environment variables:

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### OpenAI Configuration
- `OPENAI_API_KEY` - Your OpenAI API key for content generation

### Google Cloud Configuration
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to your Google Cloud service account key file
- `GOOGLE_CLOUD_PROJECT_ID` - Your Google Cloud project ID

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all required environment variables
   - Redeploy the project

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set environment variables during setup
5. Deploy automatically

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/b-barri/content-creator-tool)

## Post-Deployment Setup

1. **Database Setup**: Run the database schema on your Supabase instance
2. **Google Cloud**: Upload your service account key file
3. **Test Upload**: Try uploading a small video to test all integrations

## Environment Variables Setup Commands

```bash
# Set Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Set OpenAI variable
vercel env add OPENAI_API_KEY

# Set Google Cloud variables
vercel env add GOOGLE_CLOUD_PROJECT_ID
vercel env add GOOGLE_APPLICATION_CREDENTIALS
```

## Troubleshooting

- **API timeouts**: The vercel.json is configured with 5-minute timeouts for API routes
- **File uploads**: Large video files may need chunked upload for production
- **CORS issues**: Check Supabase CORS settings if having browser issues

## Performance Optimization

- **Images**: All images are served through the proxy API for consistent loading
- **Caching**: Static assets are automatically cached by Vercel
- **API Routes**: Optimized for serverless deployment
