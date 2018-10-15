import { getVariantFromPeriode } from '../../../components/utsettelse-form/UtsettelseForm';
import { erFarEllerMedmor } from '../../domain/personUtil';
import { getVelgbareStønadskontotyper } from '../../uttaksplan/stønadskontoer';
import { Søker } from '../../../types/søknad/Søker';
import { TilgjengeligStønadskonto, Periode, Periodetype } from '../../../types/uttaksplan/periodetyper';
import AnnenForelder from '../../../types/søknad/AnnenForelder';
import { PeriodeValideringsfeil, PeriodeValideringErrorKey } from '../../../redux/reducers/uttaksplanValideringReducer';
import {
    getUtsettelseFormVisibility,
    UtsettelseFormPayload
} from '../../../components/utsettelse-form/utsettelseFormConfig';
import { UttakFormPayload, getUttakFormVisibility } from '../../../components/uttak-form/uttakFormConfig';
import { uttakTidsperiodeErGyldig } from './uttakTidsperiodeValidation';

const validerUtsettelseForm = (payload: UtsettelseFormPayload): PeriodeValideringsfeil[] | undefined => {
    const visibility = getUtsettelseFormVisibility(payload);
    if (visibility.areAllQuestionsAnswered()) {
        return undefined;
    }
    return [
        {
            feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT
        }
    ];
};

const validerUttakForm = (payload: UttakFormPayload): PeriodeValideringsfeil[] | undefined => {
    const visibility = getUttakFormVisibility(payload);
    const valideringsfeil: PeriodeValideringsfeil[] = [];

    if (visibility.areAllQuestionsAnswered() === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT });
    }
    if (uttakTidsperiodeErGyldig(payload.periode) === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_TIDSPERIODE });
    }
    return valideringsfeil.length === 0 ? undefined : valideringsfeil;
};

export const validerPeriodeForm = (
    periode: Periode,
    søker: Søker,
    annenForelder: AnnenForelder,
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[],
    familiehendelsesdato: Date
) => {
    const søkerErFarEllerMedmor = erFarEllerMedmor(søker.rolle);
    if (periode.type === Periodetype.Overføring || periode.type === Periodetype.Uttak) {
        return validerUttakForm({
            periode,
            velgbareStønadskontotyper: getVelgbareStønadskontotyper(tilgjengeligeStønadskontoer),
            kanEndreStønadskonto: false,
            annenForelderHarRett: annenForelder.harRettPåForeldrepenger,
            søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
            søkerErFarEllerMedmor,
            morErUfør: søkerErFarEllerMedmor === false && annenForelder.erUfør,
            familiehendelsesdato
        });
    }
    return validerUtsettelseForm({
        periode,
        variant: getVariantFromPeriode(periode),
        søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
        søkerErFarEllerMedmor: erFarEllerMedmor(søker.rolle),
        annenForelderHarRettPåForeldrepenger: annenForelder.harRettPåForeldrepenger
    });
};
