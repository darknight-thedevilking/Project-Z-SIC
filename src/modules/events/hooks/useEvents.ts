import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/axios';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Event } from '../types/event';
import { storage } from '../../../shared/utils/storage';

const LIST_CACHE_TTL = 6 * 60 * 60 * 1000;

type EventListParams = Record<string, string | number | boolean | string[] | undefined>;

export const useEvents = (params?: EventListParams) => {
    return useQuery({
        queryKey: ['events', params],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get(ENDPOINTS.events.list, { params });
                const payload = data?.data ?? data;
                const items = Array.isArray(payload) ? (payload as Event[]) : [];
                await storage.saveCache('events:list', items);
                return items;
            } catch (error) {
                const cached = await storage.getCache<Event[]>('events:list', LIST_CACHE_TTL);
                return cached ?? [];
            }
        },
    });
};

export const useEventsInfinite = (params?: EventListParams) => {
    return useInfiniteQuery({
        queryKey: ['events-infinite', params],
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const { data } = await apiClient.get(ENDPOINTS.events.list, {
                    params: { ...params, page: pageParam, limit: 10 },
                });
                const payload = data?.data ?? data;
                const items = Array.isArray(payload) ? (payload as Event[]) : [];

                if (pageParam === 1) {
                    await storage.saveCache('events:list', items);
                }

                return {
                    items,
                    nextPage: items.length >= 10 ? pageParam + 1 : undefined,
                };
            } catch (error) {
                if (pageParam === 1) {
                    const cached = await storage.getCache<Event[]>('events:list', LIST_CACHE_TTL);
                    if (cached) {
                        return { items: cached, nextPage: undefined };
                    }
                }
                return { items: [], nextPage: undefined };
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });
};

export const useEventDetail = (id: string) => {
    return useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.events.detail(id));
            return (data.data || data) as Event;
        },
        enabled: !!id,
    });
};

export const useEventFeatured = () => {
    return useQuery({
        queryKey: ['events-featured'],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.events.featured);
            const payload = data?.data ?? data;
            return Array.isArray(payload) ? (payload as Event[]) : [];
        },
    });
};

export const useEventSearch = (query?: string) => {
    return useQuery({
        queryKey: ['events-search', query],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.events.search, { params: { q: query } });
            const payload = data?.data ?? data;
            return Array.isArray(payload) ? (payload as Event[]) : [];
        },
        enabled: !!query,
    });
};
