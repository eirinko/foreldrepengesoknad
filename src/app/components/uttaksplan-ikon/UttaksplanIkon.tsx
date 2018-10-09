import * as React from 'react';
import FerieIkon from './ikoner/FerieIkon';
import ArbeidIkon from './ikoner/ArbeidIkon';
import SykdomIkon from './ikoner/SykdomIkon';
import UttakIkon from './ikoner/UttakIkon';
import TerminIkon from './ikoner/TerminIkon';
import AdvarselIkonÅpen from './ikoner/AdvarselIkonÅpen';
import AdvarselIkon from './ikoner/AdvarselIkon';

export enum UttaksplanIkonKeys {
    'arbeid' = 'arbeid',
    'ferie' = 'ferie',
    'sykdom' = 'sykdom',
    'termin' = 'termin',
    'uttak' = 'uttak',
    'advarsel' = 'advarsel',
    'feil' = 'feil'
}

export interface Props {
    ikon: UttaksplanIkonKeys;
    title: string;
}

const UttaksplanIkon: React.StatelessComponent<Props> = ({ ikon, title }) => {
    switch (ikon) {
        case 'arbeid':
            return <ArbeidIkon title={title} />;
        case 'ferie':
            return <FerieIkon title={title} />;
        case 'sykdom':
            return <SykdomIkon title={title} />;
        case 'termin':
            return <TerminIkon title={title} />;
        case 'advarsel':
            return <AdvarselIkonÅpen title={title} />;
        case 'feil':
            return <AdvarselIkon title={title} type="feil" />;
        default:
            return <UttakIkon title={title} />;
    }
};

export default UttaksplanIkon;
