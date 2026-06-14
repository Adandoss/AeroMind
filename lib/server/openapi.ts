import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
import { CoursesQuerySchema, AdminCourseSchema, AdminModuleSchema, AdminLessonSchema } from "@/lib/schemas/courses";
import { CheckoutSchema } from "@/lib/schemas/checkout";
import { EnrollmentCreateSchema } from "@/lib/schemas/enrollments";
import { LoginSchema, RegisterSchema } from "@/lib/schemas/auth";

// Remove top-level schema attributes not compliant with OpenAPI 3.0 specs
function toOpenApiSchema(zodSchema: z.ZodType) {
  const schema = zodToJsonSchema(
    // zod-to-json-schema types target Zod 3; Zod 4 schemas are compatible at runtime.
    zodSchema as unknown as Parameters<typeof zodToJsonSchema>[0],
    { target: "openApi3" }
  ) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
}

export function generateOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "AeroMind REST API",
      description: "Complete REST API specifications for the AeroMind E-Learning platform, validating payloads with Zod and securing routes with session credentials.",
      version: "1.0.0",
      contact: {
        name: "AeroMind Engineering Team",
        email: "support@aeromind.dev",
      },
    },
    servers: [
      {
        url: "/api",
        description: "Local Dev API Root",
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "API Health Diagnostics",
          description: "Returns health status of the application database and system environment metrics.",
          responses: {
            200: {
              description: "System online and healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "UP" },
                      database: { type: "string", example: "CONNECTED" },
                      uptime: { type: "integer", example: 125 },
                      version: { type: "string", example: "0.1.0" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
            503: {
              description: "Database connection failure or server down",
            },
          },
        },
      },
      "/courses": {
        get: {
          summary: "Query Published Courses Catalog",
          description: "Retrieve a paginated list of published courses, optionally filtering by search text, category, price, and minimum rating.",
          parameters: [
            { name: "q", in: "query", description: "Search keyword for title/description", required: false, schema: { type: "string" } },
            { name: "category", in: "query", description: "Filter by category type", required: false, schema: { type: "string", enum: ["DESIGN", "INTERFACE", "ENGINEERING", "MARKETING"] } },
            { name: "price", in: "query", description: "Filter by price status", required: false, schema: { type: "string", enum: ["free", "paid", "all"], default: "all" } },
            { name: "rating", in: "query", description: "Minimum course rating", required: false, schema: { type: "number", minimum: 0, maximum: 5 } },
            { name: "page", in: "query", description: "Pagination page index", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", description: "Pagination page limit", required: false, schema: { type: "integer", minimum: 1, default: 6 } },
          ],
          responses: {
            200: {
              description: "Filtered courses list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      courses: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            slug: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            category: { type: "string" },
                            priceCents: { type: "integer" },
                            weeks: { type: "integer" },
                            rating: { type: "number" },
                            ratingCount: { type: "integer" },
                            instructor: { type: "string" },
                            isEnrolled: { type: "boolean" },
                          },
                        },
                      },
                      totalCount: { type: "integer" },
                      pagesCount: { type: "integer" },
                      page: { type: "integer" },
                      limit: { type: "integer" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid query parameters structure",
            },
          },
        },
      },
      "/courses/{slug}": {
        get: {
          summary: "Retrieve Course Metadata",
          description: "Fetches details of a specific course using its unique slug segment.",
          parameters: [
            { name: "slug", in: "path", required: true, description: "URL friendly course slug", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Course found",
            },
            404: {
              description: "Course not found",
            },
          },
        },
      },
      "/courses/{slug}/curriculum": {
        get: {
          summary: "Course Curriculum Syllabus",
          description: "Fetches modules and lessons belonging to the course. Includes completion status and locking indicators per lesson for logged-in sessions.",
          parameters: [
            { name: "slug", in: "path", required: true, description: "URL friendly course slug", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Curriculum structure mapped",
            },
            404: {
              description: "Course not found",
            },
          },
        },
      },
      "/lessons/{id}": {
        get: {
          summary: "Read Lesson Content",
          description: "Retrieve complete content text and video details for a lesson. Rejects unauthorized access for paid content.",
          parameters: [
            { name: "id", in: "path", required: true, description: "Unique lesson ID key", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Lesson content returned",
            },
            401: {
              description: "Session authorization required",
            },
            403: {
              description: "Access forbidden. Active enrollment is required.",
            },
            404: {
              description: "Lesson not found",
            },
          },
        },
      },
      "/lessons/{id}/complete": {
        post: {
          summary: "Mark Lesson Completed",
          description: "Record lesson completion logs in the user's progress logs.",
          parameters: [
            { name: "id", in: "path", required: true, description: "Lesson ID", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Lesson completion registered successfully",
            },
            401: {
              description: "Authorization required",
            },
            403: {
              description: "Access denied. Course enrollment missing.",
            },
            404: {
              description: "Lesson not found",
            },
          },
        },
      },
      "/enrollments": {
        post: {
          summary: "Enroll in Course",
          description: "Submits a request to enroll the current student in a course. Checks for active professional or enterprise tier subscription.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EnrollmentCreateInput",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Successfully enrolled (or already registered)",
            },
            400: {
              description: "Validation or JSON error",
            },
            401: {
              description: "Unauthorized",
            },
            403: {
              description: "Subscription expired or missing",
            },
            404: {
              description: "Course not found",
            },
          },
        },
      },
      "/me/enrollments": {
        get: {
          summary: "My Active Course Enrollments",
          description: "Returns courses the student is currently enrolled in, containing completion percentages.",
          responses: {
            200: {
              description: "Active enrollments list",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },
      "/me/dashboard": {
        get: {
          summary: "Student Learning Statistics",
          description: "Aggregates the user's weekly learning duration logs (last 7 days activity) and current course enrollments.",
          responses: {
            200: {
              description: "Dashboard datasets",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },
      "/checkout": {
        post: {
          summary: "Simulated Subscription Order Processing",
          description: "Simulates checkout payment transactions. Generates Order logs and updates user Subscription records.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CheckoutInput",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Simulated checkout succeeded",
            },
            400: {
              description: "Card credentials validation error",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },
      "/admin/courses": {
        get: {
          summary: "Admin Courses Listing",
          description: "Admin check: list all courses (including unpublished ones).",
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden" },
          },
        },
        post: {
          summary: "Admin Create Course",
          description: "Create a new course in the catalog.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminCourseInput" },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Validation error" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/admin/courses/{id}": {
        get: {
          summary: "Admin Retrieve Course Detail",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Success" }, 404: { description: "Not Found" } },
        },
        put: {
          summary: "Admin Update Course",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AdminCourseInput" } } },
          },
          responses: { 200: { description: "Updated" }, 400: { description: "Validation error" } },
        },
        delete: {
          summary: "Admin Delete Course",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/admin/modules": {
        post: {
          summary: "Admin Create Module",
          description: "Create a new learning module for a specific course.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminModuleInput" },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Validation error" },
            403: { description: "Forbidden" },
            409: { description: "Order position conflict" },
          },
        },
      },
      "/admin/modules/{id}": {
        get: {
          summary: "Admin Retrieve Module Detail",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Success" }, 404: { description: "Not Found" } },
        },
        put: {
          summary: "Admin Update Module",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminModuleInput" },
              },
            },
          },
          responses: {
            200: { description: "Updated" },
            400: { description: "Validation error" },
            404: { description: "Not Found" },
            409: { description: "Order position conflict" },
          },
        },
        delete: {
          summary: "Admin Delete Module",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 404: { description: "Not Found" } },
        },
      },
      "/admin/lessons": {
        post: {
          summary: "Admin Create Lesson",
          description: "Create a new lesson within a module.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminLessonInput" },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Validation error" },
            403: { description: "Forbidden" },
            409: { description: "Order position conflict" },
          },
        },
      },
      "/admin/lessons/{id}": {
        get: {
          summary: "Admin Retrieve Lesson Detail",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Success" }, 404: { description: "Not Found" } },
        },
        put: {
          summary: "Admin Update Lesson",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminLessonInput" },
              },
            },
          },
          responses: {
            200: { description: "Updated" },
            400: { description: "Validation error" },
            404: { description: "Not Found" },
            409: { description: "Order position conflict" },
          },
        },
        delete: {
          summary: "Admin Delete Lesson",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 404: { description: "Not Found" } },
        },
      },
    },
    components: {
      schemas: {
        LoginInput: toOpenApiSchema(LoginSchema),
        RegisterInput: toOpenApiSchema(RegisterSchema),
        CoursesQuery: toOpenApiSchema(CoursesQuerySchema),
        CheckoutInput: toOpenApiSchema(CheckoutSchema),
        EnrollmentCreateInput: toOpenApiSchema(EnrollmentCreateSchema),
        AdminCourseInput: toOpenApiSchema(AdminCourseSchema),
        AdminModuleInput: toOpenApiSchema(AdminModuleSchema),
        AdminLessonInput: toOpenApiSchema(AdminLessonSchema),
      },
    },
  };
}
