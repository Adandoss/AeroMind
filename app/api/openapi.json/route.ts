import { NextRequest } from "next/server";
import { generateOpenApiSpec } from "@/lib/server/openapi";
import { withLogging } from "@/lib/server/request-logger";

export const GET = withLogging(async (_req: NextRequest) => {
  const spec = generateOpenApiSpec();
  return Response.json(spec);
});
