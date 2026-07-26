/**
 * Converts Supabase database records into the format
 * expected by the existing React frontend.
 */

export function mapMod(dbMod) {
  return {
    id: dbMod.id,

    title: dbMod.title,
    description: dbMod.description,

    game: dbMod.games?.name ?? "Unknown Game",

    author:
      dbMod.profiles?.display_name ||
      dbMod.profiles?.username ||
      "Unknown",

    category: dbMod.category,

    featured: dbMod.featured,

    downloads: dbMod.downloads ?? 0,

    rating: Number(dbMod.average_rating ?? 0),

    ratingsCount: dbMod.ratings_count ?? 0,

    views: dbMod.views ?? 0,

    image:
      dbMod.cover_image ||
      "/placeholder.png",

    images: dbMod.images ?? [],

    tags: dbMod.tags ?? [],

    createdAt: dbMod.created_at,
  };
}

export function mapMods(mods) {
  return mods.map(mapMod);
}