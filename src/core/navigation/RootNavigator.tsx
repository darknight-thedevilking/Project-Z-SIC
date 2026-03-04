import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../modules/splash/SplashScreen';
import {
    AuthLandingScreen,
    LoginScreen,
    SignupScreen,
    OtpScreen,
    OAuthWebViewScreen,
} from '../../modules/auth/screens';
import { NotFoundScreen } from '../../shared/components/NotFoundScreen';
import { TabsNavigator } from './TabsNavigator';
import { SearchScreen } from '../../modules/search/screens/SearchScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="OAuthWebView" component={OAuthWebViewScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="MainTabs" component={TabsNavigator} />
        </Stack.Navigator>
    );
};
