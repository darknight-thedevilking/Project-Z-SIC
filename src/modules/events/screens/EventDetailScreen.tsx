import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../core/navigation/types';
import { useEventDetail } from '../hooks/useEvents';
import { Event } from '../types/event';
import { ImageCarousel } from '../../../shared/components/ImageCarousel';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingSkeletonList } from '../../../shared/components/LoadingSkeletonList';
import { openInMaps } from '../../../shared/utils/maps';
import { useFeatureFlags } from '../../../core/hooks/useFeatureFlags';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

export const EventDetailScreen: React.FC<Props> = ({ route }) => {
    const { id } = route.params;
    const { data: event, isLoading, isError, refetch } = useEventDetail(id);
    const { data: featureFlags } = useFeatureFlags();

    const normalizedEvent = event as Event | undefined;

    const images = useMemo(() => {
        if (!normalizedEvent) return [];
        return [
            ...(normalizedEvent.images || []),
            normalizedEvent.imageUrl,
        ].filter(Boolean) as string[];
    }, [normalizedEvent]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const isPastEvent = (dateString?: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return false;
        return date.getTime() < Date.now();
    };

    const formatVenue = (venue?: Event['venue']) => {
        if (!venue) return '';
        if (typeof venue === 'string') return venue;
        if (typeof venue === 'object') {
            const value = venue as { name?: string; address?: string; city?: string; state?: string; country?: string };
            return [value.name, value.address, value.city, value.state, value.country]
                .filter(Boolean)
                .join(', ');
        }
        return String(venue);
    };

    if (isLoading) {
        return <LoadingSkeletonList count={2} />;
    }

    if (isError || !normalizedEvent) {
        return <ErrorState message="Failed to load event details." onRetry={refetch} />;
    }

    const ended = isPastEvent(normalizedEvent.date);

    return (
        <ScrollView className="flex-1 bg-[#f6f7f8]">
            <View className="px-5 py-6">
                {images.length > 0 && <ImageCarousel images={images} />}

                <View className="bg-white rounded-3xl p-5 shadow-sm mt-5" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}>
                    <Text className="text-2xl font-bold text-gray-900">{normalizedEvent.name || normalizedEvent.title || 'Unnamed Event'}</Text>
                    {ended && (
                        <View className="mt-2 bg-red-50 px-2 py-1 rounded-full self-start">
                            <Text className="text-xs font-semibold text-red-700">Event Ended</Text>
                        </View>
                    )}
                    {normalizedEvent.category && (
                        <Text className="text-xs font-semibold text-[#02757A] mt-2">{normalizedEvent.category}</Text>
                    )}
                    <View className="mt-4 bg-gray-50 rounded-2xl px-3 py-2">
                        {normalizedEvent.date && (
                            <Text className="text-sm text-gray-600">{new Date(normalizedEvent.date).toLocaleString()}</Text>
                        )}
                        {normalizedEvent.venue && (
                            <Text className="text-sm text-gray-600 mt-1">Venue: {formatVenue(normalizedEvent.venue)}</Text>
                        )}
                    </View>

                    {(normalizedEvent.priceInfo || normalizedEvent.price) && (
                        <Text className="text-sm font-semibold text-[#02757A] mt-4">Price: {normalizedEvent.priceInfo || normalizedEvent.price}</Text>
                    )}

                    {normalizedEvent.description && (
                        <Text className="text-base text-gray-700 mt-4 leading-6">{normalizedEvent.description}</Text>
                    )}

                    {!featureFlags?.enableBooking && (
                        <View className="mt-4 bg-amber-50 px-3 py-2 rounded-2xl self-start">
                            <Text className="text-xs font-semibold text-amber-700">Booking Coming Soon</Text>
                        </View>
                    )}
                </View>

                {normalizedEvent.location?.lat && normalizedEvent.location?.lng && (
                    <TouchableOpacity
                        className="mt-6 bg-[#02757A] px-4 py-4 rounded-2xl items-center"
                        onPress={() => openInMaps(normalizedEvent.location!.lat!, normalizedEvent.location!.lng!)}
                    >
                        <Text className="text-white font-semibold text-base">Navigate to venue</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};
