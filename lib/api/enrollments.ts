export async function enrollInCourse(courseId: string) {
  const res = await fetch("/api/enrollments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseId }),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(responseData.error || "Enrollment failed");
  }
  return responseData;
}
