# Deployment Guide

This guide covers deploying the Kenmark ITan Solutions AI Chatbot to various platforms.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the recommended platform for Next.js applications with excellent MongoDB integration.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Full-stack AI chatbot for Kenmark ITan Solutions"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     ```
     DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/kenmark_chatbot
     OLLAMA_API_URL=http://localhost:11434
     OLLAMA_MODEL=llama3.2
     GROQ_API_KEY=your_groq_api_key (optional)
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```
   - Click "Deploy"

3. **Post-Deployment**
   - Run Prisma migrations:
     ```bash
     npx prisma db push
     ```
   - Or use Vercel's build command: `npm run build && npx prisma generate && npx prisma db push`

#### Vercel Configuration

Add to `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

### Option 2: Netlify

#### Steps:

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18.x` or higher

2. **Environment Variables**
   Set the same variables as Vercel in Netlify dashboard:
   - Site settings → Environment variables

3. **Deploy**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

**Note**: For Netlify, you may need to use serverless functions. Consider using Vercel for better Next.js support.

---

### Option 3: Render

#### Steps:

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configuration**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Environment Variables**
   Add all required environment variables in Render dashboard

4. **Database Setup**
   - Use Render's MongoDB service or MongoDB Atlas
   - Update `DATABASE_URL` accordingly

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Update Environment Variable**
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority
   ```

4. **Initialize Database**
   After deployment, run:
   ```bash
   npx prisma db push
   npm run seed  # Optional: seed initial data
   ```

---

## 🤖 AI/LLM Configuration

### Option 1: Ollama (Local - Development Only)

For local development:
1. Install Ollama: [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Set in `.env`: `OLLAMA_API_URL=http://localhost:11434`

**Note**: Ollama won't work in production deployments. Use cloud APIs instead.

### Option 2: Groq API (Recommended for Production)

1. **Get API Key**
   - Sign up at [groq.com](https://groq.com)
   - Get your API key from dashboard

2. **Configure**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Update Code**
   The code already includes Groq fallback. Just add the API key.

### Option 3: Other APIs

You can modify `lib/ai.ts` to support:
- OpenRouter API
- Together.ai
- OpenAI API
- Anthropic Claude API

---

## 📝 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB database created and accessible
- [ ] AI API key configured (if using cloud API)
- [ ] Prisma schema pushed to database
- [ ] Sample knowledge base uploaded via admin panel
- [ ] Test chatbot functionality
- [ ] Test admin panel functionality
- [ ] Verify analytics tracking works

---

## 🔧 Post-Deployment Steps

1. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Seed Initial Data (Optional)**
   ```bash
   npm run seed
   ```

3. **Upload Knowledge Base**
   - Navigate to `/admin`
   - Upload `public/sample-knowledge.xlsx`

4. **Test the Application**
   - Test chatbot on homepage
   - Test admin panel
   - Verify analytics

---

## 🌐 Custom Domain (Optional)

### Vercel
- Go to project settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### Netlify
- Go to Domain settings
- Add custom domain
- Configure DNS records

---

## 📊 Monitoring & Analytics

Consider adding:
- Vercel Analytics (built-in)
- Sentry for error tracking
- Google Analytics (optional)

---

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform's environment variable management

2. **API Keys**
   - Rotate keys regularly
   - Use least privilege principle

3. **Database**
   - Use strong passwords
   - Enable IP whitelisting in MongoDB Atlas
   - Use connection string with authentication

4. **Rate Limiting**
   - Consider adding rate limiting to API routes
   - Protect against abuse

---

## 🐛 Troubleshooting Deployment

### Build Failures

1. **Prisma Issues**
   ```bash
   npx prisma generate
   ```

2. **TypeScript Errors**
   ```bash
   npm run lint
   ```

3. **Missing Dependencies**
   - Check `package.json`
   - Ensure all dependencies are listed

### Runtime Errors

1. **Database Connection**
   - Verify `DATABASE_URL` is correct
   - Check MongoDB network access
   - Verify credentials

2. **AI API Errors**
   - Check API key validity
   - Verify API quota/limits
   - Check network connectivity

3. **File Upload Issues**
   - Verify file size limits
   - Check serverless function timeout
   - Ensure proper error handling

---

## 📞 Support

For deployment issues:
1. Check platform-specific logs
2. Review environment variables
3. Test locally first
4. Check platform documentation

---

**Happy Deploying! 🚀**

