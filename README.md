# Consensus Bridge - Next.js App

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Prerequisites

Before running this app:

1. **Node.js 18+** installed
2. **Supabase project** created
3. **Database schema** deployed (run `supabase-schema.sql` in Supabase SQL Editor)
4. **API keys** from Supabase project settings

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Get Supabase keys from: **Project Settings → API** in Supabase dashboard

---

## 📁 Project Structure

```
app/              # Next.js pages (file-based routing)
components/       # Reusable React components
lib/              # Utilities (Supabase clients, hooks)
types/            # TypeScript types
public/           # Static assets
```

---

## 🛠️ Available Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 📚 Documentation

- **Complete Setup Guide:** `../NEXTJS_SUPABASE_SETUP.md`
- **Quick Guide:** `../NEXTJS_FINAL_GUIDE.md`
- **Database Schema:** `../supabase-schema.sql`

---

## 🚀 Deploy to Vercel

```bash
vercel
```

That's it! Vercel will auto-detect Next.js and deploy.

Remember to add environment variables in Vercel dashboard.

---

## 🐛 Troubleshooting

**"Module not found"**
```bash
rm -rf node_modules
npm install
```

**Build errors**
```bash
rm -rf .next
npm run build
```

**Supabase connection issues**
- Check `.env.local` has correct keys
- Verify Supabase project is running
- Check API keys haven't expired

---

## 💡 Next Steps

1. Complete Supabase setup (see parent folder docs)
2. Run `npm install`
3. Configure `.env.local`
4. Run `npm run dev`
5. Open http://localhost:3000
6. Start building features!

**Happy coding!** 🎉
