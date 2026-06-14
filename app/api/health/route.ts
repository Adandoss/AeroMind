import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";

export const GET = withLogging(async () => {
  try {
    // Ping DB
    await prisma.user.count();
    
    return Response.json({
      status: "UP",
      database: "CONNECTED",
      uptime: Math.round(process.uptime()),
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return Response.json(
      {
        status: "DOWN",
        database: "DISCONNECTED",
        error: error instanceof Error ? error.message : String(error),
        uptime: Math.round(process.uptime()),
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
});
