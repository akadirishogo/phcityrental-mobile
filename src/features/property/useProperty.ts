import { useQuery } from '@tanstack/react-query';
import { getProperty } from '@/api/client';
import { queryKeys } from '@/core/queryKeys';

export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => getProperty(id),
  });
}
