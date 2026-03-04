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
        <View className="flex-1 bg-white px-6 pt-10">
            <View className="mt-10">
                <Text className="text-3xl font-bold text-gray-900">Welcome to SIC</Text>
                <Text className="text-sm text-gray-600 mt-2">Sign in to personalize your discovery journey.</Text>
            </View>

            <View className="mt-10">
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
    );
};
