import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { useAppDispatch } from '../../core/hooks/useAppStore';
import { setFeatureFlags } from '../../core/store/uiSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setFeatureFlags({ enableOrdering: false, enableBooking: false }));

        const timer = setTimeout(() => {
            navigation.replace('AuthLanding');
        }, 1500);

        return () => clearTimeout(timer);
    }, [dispatch, navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to SIC</Text>
            <Text style={styles.subtitle}>Discovery Phase</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
    },
});
