/**
 * Lists the store's themes for the home page's theme picker, and checks the
 * picked one for app block support (see app/lib/theme-support.ts).
 *
 * Needs the read_themes scope. If the merchant hasn't approved it yet (the
 * scope was added after first install), every call here fails soft: the home
 * page falls back to deep links into the live theme, as it did before.
 */
import {
  mainSectionType,
  sectionAcceptsAppBlocks,
  themeNumericId,
  type ThemeSupport,
} from "../lib/theme-support";

type Graphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

export type ThemeOption = {
  /** Numeric id, as the theme editor URL wants it. */
  id: string;
  name: string;
  role: string;
};

type FileNode = { filename: string; body?: { content?: string } | null };

const THEMES_QUERY = `#graphql
  query GiftpinThemes {
    themes(first: 50, roles: [MAIN, UNPUBLISHED, DEVELOPMENT]) {
      nodes { id name role }
    }
  }`;

const THEME_FILES_QUERY = `#graphql
  query GiftpinThemeFiles($id: ID!, $filenames: [String!]!) {
    theme(id: $id) {
      files(filenames: $filenames, first: 5) {
        nodes {
          filename
          body { ... on OnlineStoreThemeFileBodyText { content } }
        }
      }
    }
  }`;

async function run<T>(graphql: Graphql, query: string, variables?: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await graphql(query, variables ? { variables } : undefined);
    const json = (await response.json()) as { data?: T; errors?: unknown };
    if (json.errors || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function listThemes(graphql: Graphql): Promise<ThemeOption[] | null> {
  const data = await run<{ themes: { nodes: { id: string; name: string; role: string }[] } }>(graphql, THEMES_QUERY);
  if (!data) return null;
  const themes = data.themes.nodes.map((theme) => ({
    id: themeNumericId(theme.id),
    name: theme.name,
    role: theme.role,
  }));
  // Live theme first, then the rest in the order Shopify returns them.
  return [...themes.filter((t) => t.role === "MAIN"), ...themes.filter((t) => t.role !== "MAIN")];
}

async function themeFiles(graphql: Graphql, themeId: string, filenames: string[]): Promise<FileNode[] | null> {
  const data = await run<{ theme: { files: { nodes: FileNode[] } } | null }>(graphql, THEME_FILES_QUERY, {
    id: `gid://shopify/OnlineStoreTheme/${themeId}`,
    filenames,
  });
  if (!data?.theme) return null;
  return data.theme.files.nodes;
}

export async function checkThemeSupport(graphql: Graphql, themeId: string): Promise<ThemeSupport> {
  const templates = await themeFiles(graphql, themeId, ["templates/product.json"]);
  if (!templates) return "unknown";
  const productTemplate = templates.find((file) => file.filename === "templates/product.json");
  if (!productTemplate) return "vintage";

  const content = productTemplate.body?.content;
  const sectionType = content ? mainSectionType(content) : null;
  if (!sectionType) return "unknown";

  const sections = await themeFiles(graphql, themeId, [`sections/${sectionType}.liquid`]);
  const section = sections?.find((file) => file.filename === `sections/${sectionType}.liquid`);
  const liquid = section?.body?.content;
  if (!liquid) return "unknown";
  return sectionAcceptsAppBlocks(liquid) ? "supported" : "no-product-blocks";
}
