import * as React from 'react';
import UttaksplanIkon, { UttaksplanIkonKeys } from './UttaksplanIkon';
import { Forelder, NavnPåForeldre } from 'common/types';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { StønadskontoType } from 'app/types/uttaksplan/periodetyper';
import { getStønadskontoFarge } from 'app/util/uttaksplan/styleUtils';
import IconBox from './iconBox/IconBox';
import { getStønadskontoNavn } from 'app/util/uttaksplan';

export interface Props {
    konto: StønadskontoType;
    forelder?: Forelder;
    gradert?: boolean;
    navnPåForeldre: NavnPåForeldre;
}

const StønadskontoIkon: React.StatelessComponent<Props & InjectedIntlProps> = ({
    konto,
    forelder,
    gradert,
    intl,
    navnPåForeldre
}) => (
    <IconBox color={getStønadskontoFarge(konto, forelder, true)} stripes={gradert}>
        <UttaksplanIkon ikon={UttaksplanIkonKeys.uttak} title={getStønadskontoNavn(intl, konto, navnPåForeldre)} />
    </IconBox>
);

export default injectIntl(StønadskontoIkon);
