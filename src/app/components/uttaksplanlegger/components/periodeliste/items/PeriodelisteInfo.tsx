import * as React from 'react';
import { onToggleItemProp } from '../../../../elementer/toggleList/ToggleList';
import PeriodelisteToggleItem from '../elements/PeriodelisteToggleItem';
import PeriodelisteItemHeader from '../elements/PeriodelisteItemHeader';
import PeriodelisteItemWrapper from '../elements/PeriodelisteItemWrapper';
import { UttaksplanColor } from 'app/types/uttaksplan/colors';
import { Tidsperiode } from 'common/types';

interface Props extends PeriodelisteInformasjon {
    isExpanded: boolean;
    onToggle: onToggleItemProp;
}

export interface PeriodelisteInformasjon {
    id: string;
    tittel: string;
    beskrivelse?: React.ReactNode;
    tidsperiode?: Tidsperiode;
    ikon: React.ReactNode;
    renderContent: () => JSX.Element;
    farge?: UttaksplanColor;
    periodeFargestrek?: UttaksplanColor;
    border?: boolean;
    erSamtidigUttak: boolean;
    navnAnnenForelder?: string;
}

const PeriodelisteInfo: React.StatelessComponent<Props> = ({
    id,
    isExpanded,
    onToggle,
    renderContent,
    ikon,
    tittel,
    beskrivelse,
    tidsperiode,
    farge = UttaksplanColor.yellow,
    border,
    periodeFargestrek,
    erSamtidigUttak,
    navnAnnenForelder
}) => {
    return (
        <PeriodelisteItemWrapper
            key={id}
            farge={farge}
            periodeFargestrek={periodeFargestrek}
            isExpanded={isExpanded}
            border={border}>
            <PeriodelisteToggleItem
                id={id}
                isExpanded={isExpanded}
                onToggle={onToggle}
                renderHeader={() => (
                    <PeriodelisteItemHeader
                        type="info"
                        ikon={ikon}
                        tittel={tittel}
                        beskrivelse={beskrivelse}
                        tidsperiode={tidsperiode}
                        erSamtidigUttak={erSamtidigUttak}
                        navnAnnenForelder={navnAnnenForelder}
                    />
                )}
                renderContent={renderContent}
            />
        </PeriodelisteItemWrapper>
    );
};

export default PeriodelisteInfo;
