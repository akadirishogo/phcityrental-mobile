import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/api/client';
import { queryKeys } from '@/core/queryKeys';
import type { SearchFilters } from '@/core/types';

export function useProperties(filters: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.properties.search(filters),
    queryFn: () => getProperties(filters),
  });
}
