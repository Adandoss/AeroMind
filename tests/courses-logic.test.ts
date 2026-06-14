import { describe, it, expect } from "vitest";
import { buildCourseWhereFilter } from "@/lib/courses-logic";
import { Category } from "@/lib/types/enums";

describe("buildCourseWhereFilter", () => {
  it("always filters to published courses", () => {
    expect(buildCourseWhereFilter({})).toEqual({ published: true });
  });

  it("adds text search across title and description", () => {
    expect(buildCourseWhereFilter({ q: "Swiss" })).toEqual({
      published: true,
      OR: [{ title: { contains: "Swiss" } }, { description: { contains: "Swiss" } }],
    });
  });

  it("supports category, price and rating filters", () => {
    expect(
      buildCourseWhereFilter({
        category: Category.DESIGN,
        price: "free",
        rating: 4.5,
      }),
    ).toEqual({
      published: true,
      category: Category.DESIGN,
      priceCents: 0,
      rating: { gte: 4.5 },
    });

    expect(buildCourseWhereFilter({ price: "paid" })).toEqual({
      published: true,
      priceCents: { gt: 0 },
    });
  });
});
