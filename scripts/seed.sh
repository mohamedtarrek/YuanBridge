#!/bin/bash
npx prisma db push && npx tsx src/lib/db/seed.ts
