import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { Restaurant } from '../../restaurants/types/restaurant';
import { Tiffin } from '../../tiffins/types/tiffin';
import { Event } from '../../events/types/event';

interface SearchResultsSectionProps {
    title: string;
    data: Restaurant[] | Tiffin[] | Event[];
    onItemPress: (item: any) => void;
    emptyMessage?: string;
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
    title,
    data,
    onItemPress,
    emptyMessage = 'No results found',
}) => {
    if (!data || data.length === 0) return null;

    const dedupedData = React.useMemo(() => {
        const seen = new Set<string>();
        return data.filter((item: any) => {
            const id = item._id;
            if (!id) return true;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }, [data]);

    const renderItem = ({ item }: { item: any }) => {
        const imageUrl = item.imageUrl || item.images?.[0];
        const displayName = item.name || item.title || 'Untitled';
        const description = item.description || item.shortDescription || '';

        return (
            <TouchableOpacity
                data-testid={`search-result-${item._id}`}
                className="bg-white rounded-2xl overflow-hidden mb-3 shadow-sm flex-row"
                style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 }}
                onPress={() => onItemPress(item)}
            >
                <View className="w-24 h-24 bg-gray-100">
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} className="w-24 h-24" />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-xs text-gray-400">No image</Text>
                        </View>
                    )}
                </View>
                <View className="flex-1 p-3 justify-center">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                        {displayName}
                    </Text>
                    {description ? (
                        <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                            {description}
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>
            <FlatList
                data={dedupedData}
                keyExtractor={(item, index) => (item._id || index).toString()}
                renderItem={renderItem}
                scrollEnabled={false}
            />
        </View>
    );
};
