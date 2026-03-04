import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline) return null;

    return (
        <View className="bg-orange-500 px-4 py-3">
            <Text className="text-white text-center text-sm font-semibold">
                No internet connection. Showing cached results.
            </Text>
        </View>
    );
};
