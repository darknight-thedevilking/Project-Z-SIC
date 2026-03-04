import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/navigation/types';
import { loginAsGuest } from '../../../core/auth/guest';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLanding'>;

export const AuthLandingScreen: React.FC<Props> = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGuestLogin = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            await loginAsGuest();
            navigation.replace('MainTabs');
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'Unable to login as guest.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f2f6f6]">
            <View className="bg-[#e6f4f4] px-6 pt-14 pb-10">
                <View className="absolute right-[-40px] top-[-30px] h-36 w-36 rounded-full bg-[#d6efef]" />
                <View className="absolute left-[-30px] bottom-[-30px] h-28 w-28 rounded-full bg-[#d6efef]" />
                <Text className="text-3xl font-bold text-gray-900">Welcome to SIC</Text>
                <Text className="text-sm text-gray-700 mt-2">Discover restaurants, tiffins, and events around you.</Text>
            </View>

            <View className="px-6 -mt-6">
                <View className="bg-white rounded-3xl p-5 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}>
                <TouchableOpacity
                    className="bg-[#02757A] px-5 py-4 rounded-2xl"
                    onPress={() => navigation.navigate('Login')}
                    disabled={isLoading}
                >
                    <Text className="text-white text-base font-semibold text-center">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 border border-gray-200 px-5 py-4 rounded-2xl"
                    onPress={() => navigation.navigate('Signup')}
                    disabled={isLoading}
                >
                    <Text className="text-gray-900 text-base font-semibold text-center">Create an account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 border border-gray-200 px-5 py-4 rounded-2xl"
                    onPress={handleGuestLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#02757A" />
                    ) : (
                        <Text className="text-gray-900 text-base font-semibold text-center">Login as Guest</Text>
                    )}
                </TouchableOpacity>

                {errorMessage ? (
                    <Text className="text-sm text-red-600 mt-4 text-center">{errorMessage}</Text>
                ) : null}
                </View>
            </View>
        </View>
    );
};
