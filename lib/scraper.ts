export function extractAjaxUrl(html: string): string | null {
  const match = html.match(/(INDEX_RESULT[^'"<\s]+)/);
  return match ? match[1] : null;
}

export function extractJsMutations(html: string): Record<string, string> {
  const mutations: Record<string, string> = {};
  const regex = /document\.getElementById\(['"]([^'"]+)['"]\)\.value\s*=\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    mutations[match[1]] = match[2];
  }
  return mutations;
}
