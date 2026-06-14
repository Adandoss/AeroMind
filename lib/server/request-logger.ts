import { NextRequest } from "next/server";
import { auth } from "@/lib/server/auth";
import { logger } from "./logger";

type RouteHandler<TCtx = undefined> = TCtx extends undefined
  ? (req: NextRequest) => Promise<Response> | Response
  : (req: NextRequest, ctx: TCtx) => Promise<Response> | Response;

export function withLogging<TCtx = undefined>(
  handler: RouteHandler<TCtx>
): RouteHandler<TCtx> {
  const wrapped = async (req: NextRequest, ctx?: TCtx) => {
    const startTime = performance.now();
    const session = await auth();
    const userId = session?.user?.id || "anonymous";
    const userRole = session?.user?.role || "guest";
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await (
        handler as (req: NextRequest, ctx?: TCtx) => Promise<Response> | Response
      )(req, ctx);
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
    } catch (error: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      logger.error({
        msg: "HTTP request failed",
        method,
        path,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
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

  return wrapped as RouteHandler<TCtx>;
}
