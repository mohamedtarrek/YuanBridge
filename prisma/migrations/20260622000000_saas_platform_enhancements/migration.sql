-- Add new enum values to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PREMIUM_USER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MODERATOR';

-- Add new enum values to SubscriptionPlan
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'MONTHLY';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'QUARTERLY';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'YEARLY';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'LIFETIME';

-- Add new enum value to SubscriptionStatus
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';

-- Add new columns to subscriptions table
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMPTZ;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "autoRenew" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
