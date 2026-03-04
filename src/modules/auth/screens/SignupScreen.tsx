import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/navigation/types';
import { apiClient } from '../../../core/api/axios';

 type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

 type SignupForm = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    accept: boolean;
};

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
    const [form, setForm] = useState<SignupForm>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        accept: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (key: keyof SignupForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errorMessage) setErrorMessage(null);
    };

    const handleSignup = async () => {
        const email = form.email.trim().toLowerCase();
        if (!form.username.trim() || !email || !form.password || !form.confirmPassword) {
            setErrorMessage('Please fill all required fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        if (!form.accept) {
            setErrorMessage('Please accept the terms and conditions.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await apiClient.post('/api/signup', {
                username: form.username.trim(),
                email,
                password: form.password,
            });

            if (response.data?.success === false) {
                setErrorMessage(response.data?.message || 'Signup failed.');
                return;
            }

            navigation.navigate('Otp', {
                email,
                password: form.password,
                username: form.username.trim(),
            });
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'Signup failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="px-6 pt-6">
                    <Text className="text-2xl font-bold text-gray-900">Sign Up</Text>
                    <Text className="text-sm text-gray-600 mt-2">Create an account to continue.</Text>

                    {errorMessage ? (
                        <Text className="text-sm text-red-600 mt-4 text-center">{errorMessage}</Text>
                    ) : null}

                    <View className="mt-6">
                        <Text className="text-sm text-gray-700 mb-2">Username</Text>
                        <TextInput
                            className="border border-gray-200 rounded-2xl px-4 py-3 text-base"
                            placeholder="Your name"
                            value={form.username}
                            onChangeText={(value) => handleChange('username', value)}
                        />

                        <Text className="text-sm text-gray-700 mt-5 mb-2">Email</Text>
                        <TextInput
                            className="border border-gray-200 rounded-2xl px-4 py-3 text-base"
                            placeholder="you@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={(value) => handleChange('email', value)}
                        />

                        <Text className="text-sm text-gray-700 mt-5 mb-2">Password</Text>
                        <TextInput
                            className="border border-gray-200 rounded-2xl px-4 py-3 text-base"
                            placeholder="Password"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(value) => handleChange('password', value)}
                        />

                        <Text className="text-sm text-gray-700 mt-5 mb-2">Confirm Password</Text>
                        <TextInput
                            className="border border-gray-200 rounded-2xl px-4 py-3 text-base"
                            placeholder="Confirm password"
                            secureTextEntry
                            value={form.confirmPassword}
                            onChangeText={(value) => handleChange('confirmPassword', value)}
                        />

                        <TouchableOpacity
                            className="mt-4 flex-row items-center"
                            onPress={() => handleChange('accept', !form.accept)}
                            activeOpacity={0.8}
                        >
                            <View
                                className={`h-5 w-5 rounded border ${form.accept ? 'bg-[#02757A] border-[#02757A]' : 'border-gray-300'}`}
                            />
                            <Text className="ml-3 text-sm text-gray-700">I accept the terms and conditions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-[#02757A] mt-6 px-5 py-4 rounded-2xl"
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className="text-white text-base font-semibold text-center">Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => navigation.replace('Login')}
                        >
                            <Text className="text-sm text-gray-700 text-center">
                                Already have an account? <Text className="text-[#02757A] font-semibold">Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
