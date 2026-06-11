import { NextRequest } from "next/server";
import { auth } from "@/lib/server/auth";
import { logger } from "./logger";

type RouteHandler = (req: NextRequest, ctx: any) => Promise<Response> | Response;

export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: any) => {
    const startTime = performance.now();
    const session = await auth();
    const userId = session?.user?.id || "anonymous";
    const userRole = session?.user?.role || "guest";
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await handler(req, ctx);
      const durationMs = Math.round(performance.now() - startTime);

      logger.info({
        msg: "HTTP request processed",
        method,
        path,
        status: response.status,
        durationMs,
        userId,
        userRole,
      });

      return response;
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - startTime);
      logger.error({
        msg: "HTTP request failed",
        method,
        path,
        error: error.message || error,
        stack: error.stack,
        durationMs,
        userId,
        userRole,
      });

      return Response.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
