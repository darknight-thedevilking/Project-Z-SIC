import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/axios';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Restaurant } from '../../restaurants/types/restaurant';
import { Tiffin } from '../../tiffins/types/tiffin';
import { Event } from '../../events/types/event';

export interface SearchResults {
    restaurants: Restaurant[];
    tiffins: Tiffin[];
    events: Event[];
}

export const useGlobalSearch = (query: string) => {
    return useQuery({
        queryKey: ['global-search', query],
        queryFn: async (): Promise<SearchResults> => {
            if (!query || query.length < 2) {
                return { restaurants: [], tiffins: [], events: [] };
            }

            try {
                // Try the global search endpoint first
                const { data } = await apiClient.get(ENDPOINTS.search, {
                    params: { q: query }
                });

                const payload = data?.data ?? data;
                
                return {
                    restaurants: Array.isArray(payload?.restaurants) ? payload.restaurants : [],
                    tiffins: Array.isArray(payload?.tiffins) ? payload.tiffins : [],
                    events: Array.isArray(payload?.events) ? payload.events : [],
                };
            } catch (error) {
                // Fallback: Search each category separately
                const [restaurantsRes, tiffinsRes, eventsRes] = await Promise.allSettled([
                    apiClient.get(ENDPOINTS.takeaway.list, { params: { search: query } }),
                    apiClient.get(ENDPOINTS.tiffins.list, { params: { search: query } }),
                    apiClient.get(ENDPOINTS.events.search, { params: { q: query } }),
                ]);

                return {
                    restaurants: restaurantsRes.status === 'fulfilled' 
                        ? Array.isArray(restaurantsRes.value.data?.data) 
                            ? restaurantsRes.value.data.data 
                            : Array.isArray(restaurantsRes.value.data) 
                            ? restaurantsRes.value.data 
                            : []
                        : [],
                    tiffins: tiffinsRes.status === 'fulfilled'
                        ? Array.isArray(tiffinsRes.value.data?.data)
                            ? tiffinsRes.value.data.data
                            : Array.isArray(tiffinsRes.value.data)
                            ? tiffinsRes.value.data
                            : []
                        : [],
                    events: eventsRes.status === 'fulfilled'
                        ? Array.isArray(eventsRes.value.data?.data)
                            ? eventsRes.value.data.data
                            : Array.isArray(eventsRes.value.data)
                            ? eventsRes.value.data
                            : []
                        : [],
                };
            }
        },
        enabled: query.length >= 2,
    });
};
