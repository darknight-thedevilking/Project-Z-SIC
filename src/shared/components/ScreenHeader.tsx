import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../core/navigation/types';

type ScreenHeaderProps = {
    title: string;
    subtitle?: string;
    rightSlot?: React.ReactNode;
    showSearch?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
    title, 
    subtitle, 
    rightSlot, 
    showSearch = true 
}) => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View className="px-5 pt-6 pb-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">{title}</Text>
                <View className="flex-row items-center">
                    {showSearch && (
                        <TouchableOpacity
                            data-testid="search-icon-button"
                            onPress={() => navigation.navigate('Search')}
                            className="bg-white rounded-full px-3 py-2 mr-2"
                            style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-xs font-semibold text-gray-700">Search</Text>
                        </TouchableOpacity>
                    )}
                    {rightSlot}
                </View>
            </View>
            {subtitle ? <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text> : null}
        </View>
    );
};