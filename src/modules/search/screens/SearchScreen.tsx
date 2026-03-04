import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { RootStackParamList } from '../../../core/navigation/types';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { SearchResultsSection } from '../components/SearchResultsSection';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const trimmedQuery = useMemo(() => query.trim(), [query]);
    const { data, isLoading } = useGlobalSearch(trimmedQuery);

    const handleRestaurantPress = (item: any) => {
        if (!item?._id) return;
        navigation.navigate('MainTabs', {
            screen: 'RestaurantsStack',
            params: { screen: 'RestaurantDetail', params: { id: item._id } },
        });
    };

    const handleTiffinPress = (item: any) => {
        if (!item?._id) return;
        navigation.navigate('MainTabs', {
            screen: 'TiffinStack',
            params: { screen: 'TiffinDetail', params: { id: item._id } },
        });
    };

    const handleEventPress = (item: any) => {
        if (!item?._id) return;
        navigation.navigate('MainTabs', {
            screen: 'EventsStack',
            params: { screen: 'EventDetail', params: { id: item._id } },
        });
    };

    return (
        <View className="flex-1 bg-[#f2f6f6]">
            <View className="bg-[#f0f4ff] px-5 pt-12 pb-6">
                <View className="absolute right-[-30px] top-[-20px] h-28 w-28 rounded-full bg-[#e1e9ff]" />
                <View className="absolute left-[-20px] bottom-[-30px] h-24 w-24 rounded-full bg-[#e1e9ff]" />
                <ScreenHeader title="Search" subtitle="Find restaurants, tiffins, and events" showSearch={false} />
                <View className="mt-4">
                    <TextInput
                        className="bg-white px-4 py-3 rounded-2xl text-base text-gray-900"
                        placeholder="Search"
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
            </View>
            <View className="px-5 -mt-4">
                <View className="bg-white rounded-3xl p-4 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
                {trimmedQuery.length === 0 ? (
                    <Text className="text-sm text-gray-500 mt-2">
                        Start typing to search across categories.
                    </Text>
                ) : isLoading ? (
                    <View className="mt-4 items-center">
                        <ActivityIndicator color="#02757A" />
                    </View>
                ) : (
                    <View className="mt-4">
                        {data ? (
                            <Text className="text-xs text-gray-500 mb-3">
                                {data.restaurants.length + data.tiffins.length + data.events.length} results
                            </Text>
                        ) : null}
                        <SearchResultsSection
                            title="Restaurants"
                            data={data?.restaurants ?? []}
                            onItemPress={handleRestaurantPress}
                        />
                        <SearchResultsSection
                            title="Tiffins"
                            data={data?.tiffins ?? []}
                            onItemPress={handleTiffinPress}
                        />
                        <SearchResultsSection
                            title="Events"
                            data={data?.events ?? []}
                            onItemPress={handleEventPress}
                        />
                        {data &&
                        data.restaurants.length === 0 &&
                        data.tiffins.length === 0 &&
                        data.events.length === 0 ? (
                            <Text className="text-sm text-gray-500 mt-4 text-center">No results found.</Text>
                        ) : null}
                    </View>
                )}
                </View>
            </View>
        </View>
    );
};
