export const CATEGORY_ORDER = ['Science', 'Sports', 'Politics', 'Technology', 'World', 'Business', 'General'];

const labels = {
  science: 'Science',
  sport: 'Sports',
  sports: 'Sports',
  politics: 'Politics',
  tech: 'Technology',
  technology: 'Technology',
  world: 'World',
  business: 'Business',
  general: 'General',
};

export function categoryLabel(value) {
  return labels[String(value || 'general').toLowerCase()] || 'General';
}

export function distinctSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}
export function groupSources(sources) {
  const groups = new Map();
  for (const source of sources) {
    const category = categoryLabel(source.category);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(source);
  }
  return [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left);
    const rightIndex = CATEGORY_ORDER.indexOf(right);
    return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
  });
}
