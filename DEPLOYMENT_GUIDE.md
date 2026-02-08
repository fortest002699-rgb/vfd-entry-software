# 🚀 VFD Entry Software - Deployment Guide

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

#### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project already created
- Already configured in `firebase.json`

#### Steps
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   npm run firebase:deploy
   ```

3. **View live application**
   - Check Firebase Console for URL
   - Or check `.firebaserc` for project details

#### Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow domain verification steps

---

### Option 2: Vercel Deployment

#### Prerequisites
- Vercel account (free)
- Vercel CLI: `npm install -g vercel`

#### Steps
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow prompts** and your app will be live!

---

### Option 3: Netlify Deployment

#### Prerequisites
- Netlify account (free)
- Netlify CLI (optional)

#### Steps Using Web Interface
1. Go to netlify.com
2. Sign in with GitHub/email
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Deploy

#### Steps Using CLI
```bash
npm install -g netlify-cli
netlify deploy
```

---

### Option 4: Traditional Server/Hosting

#### Prerequisites
- Web server (Apache, Nginx, etc.)
- Node.js (optional, if using Express)

#### Steps
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Copy build folder**
   - Your hosting provider will have specific upload methods
   - Upload contents of `/build` folder

3. **Configure web server**
   Ensure routing for SPA (Single Page Application):

   **For Apache (.htaccess)**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **For Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/build;
       
       location / {
           try_files $uri /index.html;
       }
   }
   ```

---

### Option 5: Docker Deployment

#### Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

#### Build and Run
```bash
docker build -t vfd-entry-software .
docker run -p 3000:8080 vfd-entry-software
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] Run `npm run build` successfully
- [ ] No console errors or warnings
- [ ] All components working correctly
- [ ] Forms validating properly
- [ ] PDF generation working
- [ ] Google Sheets sync configured

### Testing
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test on tablet
- [ ] Test offline functionality
- [ ] Test all forms and buttons
- [ ] Verify data persists after refresh

### Security
- [ ] No API keys in frontend code
- [ ] Firebase security rules configured
- [ ] Google Sheets API credentials on backend only
- [ ] Environment variables set if used

### Performance
- [ ] Images optimized
- [ ] CSS/JS minified (automatic)
- [ ] Unused dependencies removed
- [ ] Build size reasonable

### Documentation
- [ ] README updated
- [ ] Setup instructions clear
- [ ] API documentation complete
- [ ] Environment variables documented

---

## Environment Variables (if needed)

### Create .env file in root
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_GOOGLE_SHEETS_ID=your_sheet_id
```

### Note
- Build the app after changing .env
- Environment variables must start with `REACT_APP_`
- Never commit .env file (add to .gitignore)

---

## Post-Deployment

### Verify Live Application
1. Visit deployed URL
2. Test creating a job
3. Test saving client info
4. Test technician checks
5. Generate a PDF
6. Check browser console for errors

### Monitor Performance
- Use browser DevTools
- Check Network tab for slow requests
- Monitor localStorage usage
- Check for console errors

### Setup Analytics (Optional)
```javascript
// In App.js
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

---

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run build
```

### Blank Page on Live Site
- Check browser console for errors
- Verify index.html is being served
- Check routing configuration
- Check Firebase connection

### Data Not Persisting
- Check if localStorage is enabled
- Check browser storage quota
- Verify no browser privacy mode
- Check for console errors

### PDF Not Downloading
- Check jsPDF is loaded
- Check browser security settings
- Try different browser
- Check console for errors

---

## Scaling Considerations

### Small Scale (< 1000 users)
- Firebase free tier sufficient
- localStorage adequate for data
- No additional optimization needed

### Medium Scale (1000-10000 users)
- Upgrade Firebase plan
- Consider Firestore for real-time sync
- Add caching strategies
- Monitor performance

### Large Scale (> 10000 users)
- Use Firestore with indexes
- Implement CDN
- Add service worker for offline
- Use Cloud Storage for files
- Implement backend API for complex queries

---

## Maintenance

### Regular Tasks
- [ ] Monitor application errors
- [ ] Check Firebase quota usage
- [ ] Update dependencies monthly
- [ ] Review security settings
- [ ] Backup user data

### Monthly
- [ ] Run security audit: `npm audit`
- [ ] Check for updates: `npm outdated`
- [ ] Review Firebase logs

### Quarterly
- [ ] Update dependencies: `npm update`
- [ ] Test disaster recovery
- [ ] Review Google Sheets quota

---

## Rollback Procedure

### Firebase Hosting
```bash
firebase hosting:channels:list
firebase hosting:clone production staging
```

### Git Rollback
```bash
git log --oneline
git revert <commit-hash>
npm run build
npm run firebase:deploy
```

---

## Monitoring

### Firebase Console
- Go to Firebase Console
- Monitor Realtime Database / Firestore usage
- Check Functions logs
- Review Security & Privacy

### Browser Monitoring
- Add error tracking: Sentry, LogRocket
- Monitor performance: Google Analytics
- Track user behavior

---

## Backup & Recovery

### Backup Locally
```bash
# Regular backup of code
git push origin main

# Backup user data from Firestore
# Via Firebase Console Export
```

### Recovery Steps
1. Identify issue time
2. Check Firebase backups
3. Restore from git if code issue
4. Test recovery in staging first

---

## SSL/HTTPS

Most deployment platforms provide free HTTPS:
- Firebase Hosting: Automatic
- Vercel: Automatic
- Netlify: Automatic
- Custom server: Use Let's Encrypt (free)

---

## Domain Configuration

### Firebase Hosting
1. Firebase Console → Hosting
2. Add custom domain
3. Update DNS records as instructed

### Vercel
1. Vercel Dashboard → Project Settings
2. Add domain
3. Update DNS records

### Traditional Hosting
1. Get deployment IP/URL
2. Update domain DNS records
3. Point to server

---

## Success Metrics

After deployment, verify:
- [ ] App loads < 3 seconds
- [ ] All features working
- [ ] Responsive on all devices
- [ ] No console errors
- [ ] Data persists
- [ ] PDF generation works
- [ ] Google Sheets sync functions

---

## Support

For deployment issues:
1. Check build output for errors
2. Review browser console
3. Check provider documentation
4. Review Firebase logs
5. Test locally first

---

## Quick Reference

| Platform | Build | Deploy | Monitor |
|----------|-------|--------|---------|
| Firebase | `npm run build` | `npm run firebase:deploy` | Firebase Console |
| Vercel | Auto | Auto from Git | Vercel Dashboard |
| Netlify | Auto | Auto from Git | Netlify Dashboard |
| Traditional | Manual | Manual upload | Server logs |
| Docker | `docker build` | `docker run` | Container logs |

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: February 8, 2026
