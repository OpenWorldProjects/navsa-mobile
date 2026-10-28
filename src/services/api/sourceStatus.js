// Read only the original site's declarative availability settings; never execute its scripts.
export function parseSourceStatus(html) {
  const settings = html.match(/\bconst\s+SHOW_VEHICLES\s*=\s*\{([^}]+)\}/)?.[1];
  if (!settings) throw new Error('NAVSA availability settings not found');
  const availability = {};
  for (const kind of ['tram', 'trolley', 'bus']) {
    const value = settings.match(new RegExp(`\\b${kind}\\s*:\\s*(true|false)\\b`))?.[1];
    if (!value) throw new Error(`NAVSA availability missing: ${kind}`);
    availability[kind] = value === 'true';
  }
  const literal = html.match(/\bconst\s+NOTIFICATION\s*=\s*("(?:\\.|[^"\\])*")\s*;/)?.[1];
  const notice = literal ? JSON.parse(literal)
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/g, entity => ({
      '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&nbsp;': ' '
    })[entity]) : '';
  return { availability, notice };
}
