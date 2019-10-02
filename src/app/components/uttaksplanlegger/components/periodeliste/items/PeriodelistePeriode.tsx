import * as React from 'react';
import { Periode } from '../../../../../types/uttaksplan/periodetyper';
import PeriodeHeader from '../elements/PeriodeHeader';
import { NavnPåForeldre } from 'common/types';
import { onToggleItemProp } from '../../../../elementer/toggleList/ToggleList';
import { getPeriodeTittel } from '../../../../../util/uttaksplan';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EndrePeriodeForm from '../../endrePeriodeForm/EndrePeriodeForm';
import PeriodelisteToggleItem from '../elements/PeriodelisteToggleItem';
import PeriodelisteItemWrapper from '../elements/PeriodelisteItemWrapper';
import { getPeriodeFarge } from '../../../../../util/uttaksplan/styleUtils';
import { VeilederMessage } from 'app/components/veilederInfo/types';

export interface Props {
    id: string;
    periode: Periode;
    isExpanded: boolean;
    antallFeriedager: number;
    navnPåForeldre: NavnPåForeldre;
    annenForelderHarSamtidigUttakISammePeriode: boolean;
    meldinger?: VeilederMessage[];
    onToggle: onToggleItemProp;
    updatePeriode: (periode: Periode) => void;
    deletePeriode: (periode: Periode) => void;
}

const PeriodelistePeriode: React.StatelessComponent<Props & InjectedIntlProps> = ({
    id,
    periode,
    navnPåForeldre,
    antallFeriedager,
    annenForelderHarSamtidigUttakISammePeriode,
    meldinger = [],
    isExpanded,
    onToggle,
    updatePeriode,
    deletePeriode,
    intl
}) => {
    const ariaLabel = getPeriodeTittel(intl, periode, navnPåForeldre);
    const melding = meldinger.length > 0 ? meldinger[0] : undefined;

    return (
        <PeriodelisteItemWrapper key={id} farge={getPeriodeFarge(periode)} isExpanded={isExpanded}>
            <PeriodelisteToggleItem
                id={id}
                ariaLabel={ariaLabel}
                isExpanded={isExpanded}
                onToggle={onToggle}
                renderHeader={() => (
                    <PeriodeHeader
                        periode={periode}
                        navnPåForeldre={navnPåForeldre}
                        melding={melding}
                        annenForelderHarSamtidigUttakISammePeriode={annenForelderHarSamtidigUttakISammePeriode}
                    />
                )}
                renderContent={() => (
                    <EndrePeriodeForm
                        periode={periode}
                        antallFeriedager={antallFeriedager}
                        meldinger={meldinger.filter((m) => m.avvikType !== 'skjema')}
                        updatePeriode={updatePeriode}
                        deletePeriode={deletePeriode}
                        onRequestClose={() => {
                            onToggle(periode.id);
                            if (isExpanded) {
                                const el = document.getElementById(id);
                                if (el) {
                                    el.focus();
                                }
                            }
                        }}
                    />
                )}
            />
        </PeriodelisteItemWrapper>
    );
};

export default injectIntl(PeriodelistePeriode);
