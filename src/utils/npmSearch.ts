import type { NpmSearchResponse } from "../model/npm";

const NPM_SEARCH_SIZE = 10;

export const fetchNpmSearch = async (
  text: string
): Promise<NpmSearchResponse | null> => {
  const response = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=${NPM_SEARCH_SIZE}&from=0`
  );
  const data: NpmSearchResponse = await response.json();
  return data ?? null;
};
