import Environment from './Environment';

export enum Feature {
    endringssøknad = 'FEATURE_ENDRINGSSOKNAD',
    nynorsk = 'FEATURE_NYNORSK'
}

export const isFeatureEnabled = (feature: Feature): boolean => {
    if (Environment[feature] && Environment[feature].toLowerCase() === 'on') {
        return true;
    }
    return false;
};
