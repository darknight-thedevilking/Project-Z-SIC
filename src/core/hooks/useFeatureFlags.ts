import { useAppSelector } from './useAppStore';

export const useFeatureFlags = () => {
    const featureFlags = useAppSelector((state) => state.ui.featureFlags);
    const featureFlagsLoaded = useAppSelector((state) => state.ui.featureFlagsLoaded);

    return { data: featureFlags, isLoading: !featureFlagsLoaded, isError: false };
};
