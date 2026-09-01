import type { FastifyInstance } from "fastify";
import { healthResponseSchema } from "@ats/contracts";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => healthResponseSchema.parse({ status: "ok" }));
}
