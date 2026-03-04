import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RestaurantsStackParamList } from '../../../core/navigation/types';
import { useRestaurantsInfinite } from '../hooks/useRestaurants';
import { Restaurant } from '../types/restaurant';
import { RestaurantCard } from '../components/RestaurantCard';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { LoadingSkeletonList } from '../../../shared/components/LoadingSkeletonList';
import { ErrorState } from '../../../shared/components/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState';
import { storage } from '../../../shared/utils/storage';

type Props = NativeStackScreenProps<RestaurantsStackParamList, 'RestaurantList'>;
type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'distance';

export const RestaurantListScreen: React.FC<Props> = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
    const [vegOnly, setVegOnly] = useState(false);
    const [priceFilter, setPriceFilter] = useState<'budget' | 'mid' | 'premium' | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useRestaurantsInfinite();

    const allRestaurants = useMemo(() => {
        const items = data?.pages.flatMap((page) => page.items) ?? [];
        const seen = new Set<string>();
        return items.filter((item) => {
            const id = item._id;
            if (!id) return true;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }, [data]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query.trim()), 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        saveFilters();
    }, [vegOnly, priceFilter, selectedCuisine, sortBy]);

    const loadFilters = async () => {
        const saved = await storage.getFilters('restaurants');
        if (saved) {
            if (saved.vegOnly !== undefined) setVegOnly(saved.vegOnly);
            if (saved.priceFilter) setPriceFilter(saved.priceFilter);
            if (saved.selectedCuisine) setSelectedCuisine(saved.selectedCuisine);
            if (saved.sortBy) setSortBy(saved.sortBy);
        }
    };

    const saveFilters = async () => {
        await storage.saveFilters('restaurants', {
            vegOnly,
            priceFilter,
            selectedCuisine,
            sortBy,
        });
    };

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

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

    const cuisineOptions = useMemo(() => {
        const set = new Set<string>();
        allRestaurants.forEach((item) => {
            getCuisineTags(item).forEach((tag) => set.add(tag));
        });
        return Array.from(set).slice(0, 10);
    }, [allRestaurants]);

    const filteredAndSortedRestaurants = useMemo(() => {
        const lowerQuery = debouncedQuery.toLowerCase();
        let filtered = allRestaurants.filter((item) => {
            const cuisines = getCuisineTags(item);
            const searchable = [item.name, item.description, ...cuisines].filter(Boolean).join(' ').toLowerCase();
            if (lowerQuery && !searchable.includes(lowerQuery)) return false;
            if (selectedCuisine && !cuisines.includes(selectedCuisine)) return false;
            if (vegOnly && !isVegRestaurant(item)) return false;

            const priceValue = getPriceValue(item);
            if (priceFilter && priceValue !== null) {
                if (priceFilter === 'budget' && priceValue > 200) return false;
                if (priceFilter === 'mid' && (priceValue <= 200 || priceValue > 400)) return false;
                if (priceFilter === 'premium' && priceValue <= 400) return false;
            }
            return true;
        });

        if (sortBy === 'price-low') {
            filtered = filtered.sort((a, b) => {
                const priceA = getPriceValue(a) ?? Infinity;
                const priceB = getPriceValue(b) ?? Infinity;
                return priceA - priceB;
            });
        } else if (sortBy === 'price-high') {
            filtered = filtered.sort((a, b) => {
                const priceA = getPriceValue(a) ?? 0;
                const priceB = getPriceValue(b) ?? 0;
                return priceB - priceA;
            });
        }

        return filtered;
    }, [allRestaurants, debouncedQuery, selectedCuisine, vegOnly, priceFilter, sortBy]);

    const renderChip = (label: string, active: boolean, onPress: () => void) => (
        <TouchableOpacity
            key={label}
            data-testid={`filter-chip-${label.toLowerCase()}`}
            className={`mr-2 rounded-full border px-3 py-2 ${active ? 'bg-[#02757A] border-[#02757A]' : 'bg-white border-gray-200'}`}
            onPress={onPress}
        >
            <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
        </TouchableOpacity>
    );

    const handleRestaurantPress = useCallback((id: string) => {
        navigation.navigate('RestaurantDetail', { id });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: Restaurant }) => (
        <RestaurantCard item={item} onPress={handleRestaurantPress} />
    ), [handleRestaurantPress]);

    const keyExtractor = useCallback((item: Restaurant, index: number) => item._id || index.toString(), []);

    const getItemLayout = useCallback((data: ArrayLike<Restaurant> | null | undefined, index: number) => ({
        length: 240,
        offset: 240 * index,
        index,
    }), []);

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color="#02757A" />
            </View>
        );
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const sortOptions = [
        { value: 'default', label: 'Default' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Rating' },
        { value: 'distance', label: 'Distance' },
    ];

    return (
        <View className="flex-1 bg-[#f2f6f6]">
            <View className="bg-[#e6f4f4] px-5 pt-12 pb-6">
                <View className="absolute right-[-40px] top-[-20px] h-32 w-32 rounded-full bg-[#d6efef]" />
                <View className="absolute left-[-30px] bottom-[-30px] h-24 w-24 rounded-full bg-[#d6efef]" />
                <ScreenHeader
                    title="Restaurants"
                    subtitle="Takeaway and dining picks"
                    rightSlot={
                        <TouchableOpacity
                            data-testid="sort-button"
                            onPress={() => setShowSortMenu(!showSortMenu)}
                            className="bg-white rounded-full px-4 py-2"
                            style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
                        >
                            <Text className="text-xs font-semibold text-gray-700">Sort ▼</Text>
                        </TouchableOpacity>
                    }
                />
                <View className="mt-4">
                    <TextInput
                        data-testid="search-input"
                        className="bg-white px-4 py-3 rounded-2xl text-base text-gray-900"
                        placeholder="Search by name, cuisine, or dish"
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
            </View>

            {showSortMenu && (
                <View className="bg-white mx-5 rounded-2xl shadow-lg mb-2" style={{ elevation: 4 }}>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            data-testid={`sort-option-${option.value}`}
                            className={`px-4 py-3 border-b border-gray-100 ${sortBy === option.value ? 'bg-[#02757A]/10' : ''}`}
                            onPress={() => {
                                setSortBy(option.value as SortOption);
                                setShowSortMenu(false);
                            }}
                        >
                            <Text className={`text-sm font-semibold ${sortBy === option.value ? 'text-[#02757A]' : 'text-gray-900'}`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View className="px-5 -mt-4">
                <View className="bg-white rounded-3xl p-4 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
                    <Text className="text-sm font-semibold text-gray-800">Quick filters</Text>
                    <View className="flex-row mt-3">
                        {renderChip('Veg', vegOnly, () => setVegOnly((prev) => !prev))}
                        {renderChip('Budget', priceFilter === 'budget', () => setPriceFilter(priceFilter === 'budget' ? null : 'budget'))}
                        {renderChip('Mid', priceFilter === 'mid', () => setPriceFilter(priceFilter === 'mid' ? null : 'mid'))}
                        {renderChip('Premium', priceFilter === 'premium', () => setPriceFilter(priceFilter === 'premium' ? null : 'premium'))}
                    </View>
                    <View className="flex-row mt-3 flex-wrap">
                        {cuisineOptions.map((cuisine) =>
                            renderChip(cuisine, selectedCuisine === cuisine, () =>
                                setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)
                            )
                        )}
                    </View>
                </View>
            </View>

            {isLoading ? (
                <LoadingSkeletonList />
            ) : isError ? (
                <ErrorState message="Failed to load restaurants." onRetry={refetch} />
            ) : (
                <FlatList
                    data={filteredAndSortedRestaurants}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 20 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews
                    getItemLayout={getItemLayout}
                    ListEmptyComponent={
                        <EmptyState
                            title="No restaurants found"
                            description="Try adjusting your filters or search terms."
                            actionLabel="Reset filters"
                            onAction={() => {
                                setSelectedCuisine(null);
                                setVegOnly(false);
                                setPriceFilter(null);
                                setQuery('');
                                setSortBy('default');
                            }}
                        />
                    }
                />
            )}
        </View>
    );
};
