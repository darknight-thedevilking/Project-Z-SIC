import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Event } from '../types/event';

interface EventCardProps {
    item: Event;
    onPress: (id: string) => void;
}

export const EventCard = memo<EventCardProps>(({ item, onPress }) => {
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

    const isPastEvent = (dateString?: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return false;
        return date.getTime() < Date.now();
    };

    const imageUrl = item.imageUrl || item.images?.[0];
    const ended = isPastEvent(item.date);

    return (
        <TouchableOpacity
            data-testid={`event-card-${item._id}`}
            className="bg-white rounded-3xl overflow-hidden mb-4 shadow-sm"
            style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 }}
            onPress={() => onPress(item._id || 'unknown')}
        >
            <View className="h-40 bg-gray-100">
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} className="h-40 w-full" />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-xs text-gray-500">No image</Text>
                    </View>
                )}
                {ended && (
                    <View className="absolute top-3 right-3 bg-red-600 px-2 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-white">Event Ended</Text>
                    </View>
                )}
            </View>
            <View className="p-4">
                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.name || item.title || 'Unnamed Event'}
                </Text>
                {item.date && (
                    <Text className="text-sm text-gray-600 mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                )}
                {item.venue && (
                    <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>Venue: {formatVenue(item.venue)}</Text>
                )}
                {item.category && (
                    <Text className="text-xs font-semibold text-[#02757A] mt-2">{item.category}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.item._id === nextProps.item._id;
});

EventCard.displayName = 'EventCard';
