export async function uploadFileToR2(
  file: File,
  folder: "products" | "uploads" = "uploads"
): Promise<string> {
  const res = await fetch("/api/r2-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Failed to get upload URL" }));
    throw new Error(error || "Failed to get upload URL");
  }
  const { uploadUrl, publicUrl } = await res.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to storage failed");

  return publicUrl;
}
