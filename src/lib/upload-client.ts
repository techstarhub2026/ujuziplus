export type UploadKind = "image" | "video" | "doc" | "audio";

export function uploadMediaFile(
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name?: string }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.withCredentials = true;

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as { url: string; name?: string });
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        reject(new Error(data.error ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error. Please try again."));
    });

    xhr.send(fd);
  });
}

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif";

/** Upload a certification PDF during instructor signup step 2 — authenticated
 * by a short-lived signup token instead of a session cookie, since the
 * account is still pending approval and not signed in. */
export function uploadSignupCredentialFile(
  file: File,
  token: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name?: string }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("token", token);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/signup-credential");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as { url: string; name?: string });
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        reject(new Error(data.error ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error. Please try again."));
    });

    xhr.send(fd);
  });
}
