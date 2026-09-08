# Railway Deployment Guide for ujuziplus.co.tz

## **ACTION REQUIRED STEPS**

### 1. Get Railway MySQL URL
After creating MySQL on Railway, copy the URL and update `.env`:
```
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:3306/YOUR_DB"
NEXTAUTH_SECRET="replace-with-your-own-random-string"
NEXTAUTH_URL="https://ujuziplus.co.tz"
```

### 2. Generate NextAuth Secret
Run: `openssl rand -base64 32`

### 3. Deploy
- Push to GitHub
- Connect repo to Railway
- Railway builds automatically
- Run `npx prisma migrate deploy` in Railway

### 4. Cloudflare DNS
Add CNAME record:
- Name: @ (or www)
- Target: your-app.up.railway.app
- Proxy: Proxied (orange cloud)

---

## Full Guide

### Railway Setup
1. Go to Railway.app → Create project
2. Add MySQL plugin → Copy connection details
3. Set env vars in Railway dashboard

### Optional Services
- Email: Gmail app password
- Payments: ClickPesa API credentials

### First Login
Create admin user via Prisma Studio or seed script.