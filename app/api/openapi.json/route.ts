import { generateOpenApiSpec } from "@/lib/server/openapi";
import { withLogging } from "@/lib/server/request-logger";

export const GET = withLogging(async () => {
  const spec = generateOpenApiSpec();
  return Response.json(spec);
});
