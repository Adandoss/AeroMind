export async function fetchLesson(id: string) {
  const res = await fetch(`/api/lessons/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch lesson");
  }
  return res.json();
}

export async function completeLesson(id: string) {
  const res = await fetch(`/api/lessons/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to complete lesson");
  }
  return res.json();
}
