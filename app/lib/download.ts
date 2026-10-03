import { API_BASE_URL } from "~/store/api";

/**
 * Downloads a CSV export from the admin API (DSH-EXP-01). Uses fetch so the session cookie
 * and CSRF header are sent; the file never passes through Redux.
 */
export async function downloadExport(path: string, query: string, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin${path}${query}`, {
    credentials: "include",
    headers: { "X-Requested-With": "dashboard" },
  });
  if (!response.ok) throw new Error(`Export failed with ${response.status}`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
