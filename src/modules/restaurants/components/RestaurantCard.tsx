import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Restaurant } from '../types/restaurant';

interface RestaurantCardProps {
    item: Restaurant;
    onPress: (id: string) => void;
}

export const RestaurantCard = memo<RestaurantCardProps>(({ item, onPress }) => {
    const getCuisineTags = (item: Restaurant) => {
        if (Array.isArray(item.cuisineTags)) return item.cuisineTags;
        if (Array.isArray(item.cuisines)) return item.cuisines;
        if (typeof item.cuisines === 'string') {
            return item.cuisines.split(',').map((c) => c.trim()).filter(Boolean);
        }
        return [];
    };

    const getPriceValue = (item: Restaurant) => {
        if (typeof item.priceRange === 'number') return item.priceRange;
        if (typeof item.priceRange === 'string') {
            const match = item.priceRange.match(/\d+/g);
            if (match && match.length > 0) return Number(match[0]);
        }
        return null;
    };

    const isVegRestaurant = (item: Restaurant) => {
        if (item.vegOnly || item.isVeg) return true;
        const tags = getCuisineTags(item).map((tag) => tag.toLowerCase());
        return tags.includes('veg') || tags.includes('vegetarian') || tags.includes('pure veg');
    };

    const cuisines = getCuisineTags(item);
    const priceValue = getPriceValue(item);
    const imageUrl = item.imageUrl || item.images?.[0];

    return (
        <TouchableOpacity
            data-testid={`restaurant-card-${item._id}`}
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
            </View>
            <View className="p-4">
                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.name || 'Unnamed Restaurant'}
                </Text>
                {cuisines.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
                        {cuisines.join(' • ')}
                    </Text>
                )}
                {priceValue !== null && (
                    <Text className="text-xs font-semibold text-[#02757A] mt-2">From ₹{priceValue}</Text>
                )}
                {isVegRestaurant(item) && (
                    <View className="mt-2 bg-emerald-50 px-2 py-1 rounded-full self-start">
                        <Text className="text-[11px] font-semibold text-emerald-700">Pure Veg</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.item._id === nextProps.item._id;
});

RestaurantCard.displayName = 'RestaurantCard';
