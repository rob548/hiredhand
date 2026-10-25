import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import {
  countWaitlistEntries,
  createContactMessage,
  createWaitlistEntry,
} from "./queries/forms";
import { allowRequest, clientIp, RATE_LIMITS } from "./lib/rate-limit";

function enforceRateLimit(req: Request, name: keyof typeof RATE_LIMITS) {
  const { limit, windowMs } = RATE_LIMITS[name];
  if (!allowRequest(`${name}:${clientIp(req)}`, limit, windowMs)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many submissions. Please try again later.",
    });
  }
}

export const formsRouter = createRouter({
  joinWaitlist: publicQuery
    .input(
      z.object({
        email: z.string().trim().toLowerCase().email().max(320),
        name: z.string().max(255).optional(),
        useCase: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.req, "joinWaitlist");
      await createWaitlistEntry(input);
      return { ok: true as const };
    }),
  waitlistCount: publicQuery.query(() => countWaitlistEntries()),
  sendContact: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().trim().toLowerCase().email().max(320),
        message: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.req, "sendContact");
      await createContactMessage(input);
      return { ok: true as const };
    }),
});
