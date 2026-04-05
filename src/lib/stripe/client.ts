import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: "Starter",
    price: 59,
    limits: { employees: 25, locations: 1, ai_generations: 5 },
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 149,
    limits: { employees: 100, locations: 5, ai_generations: 50 },
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: "Enterprise",
    price: 349,
    limits: { employees: -1, locations: -1, ai_generations: -1 },
  },
} as const;