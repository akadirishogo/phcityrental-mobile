import type { SearchFilters } from "./types";

export const queryKeys = {
    properties: {
      all: ['properties'] as const,
      search: (filters: SearchFilters) => ['properties', 'search', filters] as const,
      detail: (id: string) => ['properties', id] as const,
    },
    saved: ['saved'] as const,
  };