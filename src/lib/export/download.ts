"use client";

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(
  filename: string,
  text: string,
  mime = "text/plain;charset=utf-8",
) {
  triggerDownload(filename, new Blob([text], { type: mime }));
}

/** Slugify a title into a safe filename base. */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "studymind"
  );
}
