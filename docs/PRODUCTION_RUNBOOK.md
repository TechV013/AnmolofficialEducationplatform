# Production Runbook

## Purpose
Operational procedures for https://www.anmolofficial.com

## Architecture
- Next.js 16.3 / React 19 / TypeScript
- Prisma 6.19.3 + PostgreSQL/Neon
- NextAuth v4 / JWT
- Vercel production
- Razorpay ON HOLD

## Normal Deployment
1. git push origin master
2. Vercel deploys
3. npx prisma migrate deploy (separate, when schema changed)

## Pre-Deploy Checklist
- git status clean
- npm run typecheck / lint / test / build
- migration reviewed (additive only)
- env vars verified in Vercel

## Post-Deploy Checklist
- GET /api/health -> 200
- /courses / /login / /dashboard / /api/auth/session
- /admin denied for student
- /instructor denied for student

## Rollback
- App: Vercel -> previous deployment -> Promote
- DB: Additive migrations backward-compatible; destructive rollback requires Neon recovery (not automatic)

## Migration Safety
- Only use: npx prisma migrate deploy
- NEVER use: prisma db push / migrate dev / migrate reset

## Auth Incident
- Check AUTH_SECRET in Vercel (names only)
- Check Vercel logs for /api/auth/*
- Rotate if suspected; never post secrets

## DB Outage
- Check /api/health (503 = DB issue)
- Check Neon status
- Stop deployments during outage

## 500 Spike
- Vercel logs -> identify route + commit
- Roll back if after new deploy
- Preserve redacted evidence

## Security/Credential Exposure
- Stop exposing value
- Rotate via provider
- Redeploy
- Invalidate sessions
- Never paste in tickets/chat

## Razorpay (ON HOLD)
- Webhook: signature + WebhookEvent idempotency authoritative
- Do NOT rely on rate limiting for webhook security

## Health / Monitoring
- /api/health implemented
- HSTS implemented (production only)
- No external error monitoring configured (P2 gap)
- Rate limiting on auth/certificate endpoints (P2 fixed)

## Severity Matrix
- P0: Security breach / data deletion / fraud
- P1: Core function down (auth outage, DB outage, migration mismatch)
- P2: Hardening (health, rate limit, monitoring, email, SEO)
- P3: Improvement (lint warnings, custom 404, JSON-LD, contact)

## Emergency Checklist
1. P0/P1? Start log
2. Check /api/health
3. Vercel logs
4. Neon status
5. Roll back if deploy-related
6. Verify env vars (names) if auth
7. Rotate if credential exposure
8. Never destructive DB commands
9. Preserve redacted evidence
10. Verify recovery before closing

*Runbook kept current with architecture changes.*
