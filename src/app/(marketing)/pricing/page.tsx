import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "StudyMind is free while in active development.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "while in development",
    description: "Everything you need to study, at no cost.",
    features: [
      "Unlimited documents",
      "AI summaries, quizzes & flashcards",
      "RAG chat with citations",
      "Mind maps, planner & progress",
    ],
    cta: "Get started",
    href: "/dashboard",
    highlighted: true,
    comingSoon: false,
  },
  {
    name: "Pro",
    price: "TBD",
    cadence: "",
    description: "Higher limits and team features, once we're out of beta.",
    features: [
      "Higher AI usage limits",
      "Priority generation",
      "Collaboration & sharing",
      "Early access to new features",
    ],
    cta: "Coming soon",
    href: null,
    highlighted: false,
    comingSoon: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-muted-foreground text-pretty">
          StudyMind is free to use while it&apos;s in active development. No
          credit card, no fake limits.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-primary/40 shadow-sm" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-xl">
                  {plan.name}
                </CardTitle>
                {plan.comingSoon ? (
                  <Badge variant="secondary">Coming Soon</Badge>
                ) : null}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                {plan.cadence ? (
                  <span className="text-sm text-muted-foreground">
                    {plan.cadence}
                  </span>
                ) : null}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.href ? (
                <Button
                  className="w-full"
                  render={<Link href={plan.href} />}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  {plan.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
