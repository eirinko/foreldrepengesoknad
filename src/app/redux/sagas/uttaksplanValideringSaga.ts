import { takeEvery, all, put, select } from 'redux-saga/effects';
import { SøknadActionKeys } from '../actions/søknad/søknadActionDefinitions';
import { AppState } from '../reducers';
import { setUttaksplanValidering } from '../actions/uttaksplanValidering/uttaksplanValideringActionCreators';
import { Periode } from '../../types/uttaksplan/periodetyper';
import { UttaksplanValideringActionKeys } from '../actions/uttaksplanValidering/uttaksplanValideringActionDefinitions';
import { validerPeriodeForm } from '../../util/validation/uttaksplan/periodeFormValidation';
import { Periodene } from '../../util/uttaksplan/Periodene';
import { Periodevalidering, ValidertPeriode } from '../reducers/uttaksplanValideringReducer';
import { Stønadskontouttak } from '../../components/uttaksoppsummering/Uttaksoppsummering';
import { getUttaksstatus } from '../../util/uttaksplan/uttaksstatus';
import { getFamiliehendelsedato } from '../../util/uttaksplan';
import { harMorHarSøktUgyldigUtsettelseFørsteSeksUker } from '../../util/validation/uttaksplan/utsettelseMorValidation';
import { erUttaksmengdeForFarMedmorForHøy } from 'app/util/validation/uttaksplan/erUttaksmengdeForFarMedmorForHøy';
import { erFarEllerMedmor } from 'app/util/domain/personUtil';
import { førsteUttakErInnenforKommendeSeksUker } from '../../util/validation/uttaksplan/datobegrensninger';

const stateSelector = (state: AppState) => state;

const validerPeriode = (appState: AppState, periode: Periode): ValidertPeriode => {
    const { søker, annenForelder, barn, situasjon } = appState.søknad;
    const { tilgjengeligeStønadskontoer } = appState.api;
    const familiehendelsesdato = getFamiliehendelsedato(barn, situasjon);
    return {
        periodeId: periode.id,
        valideringsfeil:
            validerPeriodeForm(periode, søker, annenForelder, tilgjengeligeStønadskontoer, familiehendelsesdato) || [],
        overlappendePerioder: Periodene(appState.søknad.uttaksplan).finnOverlappendePerioder(periode)
    };
};

const getStønadskontoerMedForMyeUttak = (uttak: Stønadskontouttak[]) => {
    return uttak.filter((u) => u.dagerGjenstående < 0);
};

function* validerUttaksplanSaga() {
    const appState: AppState = yield select(stateSelector);
    const { uttaksplan, barn, situasjon } = appState.søknad;
    const validertePerioder: Periodevalidering = {};
    let antallAktivePerioder = 0;
    uttaksplan.forEach((periode) => {
        validertePerioder[periode.id] = validerPeriode(appState, periode);
        if (periode.tidsperiode.fom !== undefined && periode.tidsperiode.tom !== undefined) {
            antallAktivePerioder++;
        }
    });
    const uttaksstatus = getUttaksstatus(
        appState.api.tilgjengeligeStønadskontoer,
        uttaksplan,
        appState.søknad.søker.rolle
    );
    yield put(
        setUttaksplanValidering(
            validertePerioder,
            antallAktivePerioder > 0,
            getStønadskontoerMedForMyeUttak(uttaksstatus),
            førsteUttakErInnenforKommendeSeksUker(uttaksplan),
            harMorHarSøktUgyldigUtsettelseFørsteSeksUker(uttaksplan, getFamiliehendelsedato(barn, situasjon)),
            erUttaksmengdeForFarMedmorForHøy(
                uttaksplan,
                appState.api.tilgjengeligeStønadskontoer,
                erFarEllerMedmor(appState.søknad.søker.rolle)
            )
        )
    );
}

export default function* uttaksplanValideringSaga() {
    yield all([takeEvery(SøknadActionKeys.UTTAKSPLAN_DELETE_PERIODE, validerUttaksplanSaga)]);
    yield all([takeEvery(SøknadActionKeys.UTTAKSPLAN_UPDATE_PERIODE, validerUttaksplanSaga)]);
    yield all([takeEvery(SøknadActionKeys.UTTAKSPLAN_ADD_PERIODE, validerUttaksplanSaga)]);
    yield all([takeEvery(SøknadActionKeys.UTTAKSPLAN_SET_PERIODER, validerUttaksplanSaga)]);
    yield all([takeEvery(SøknadActionKeys.UTTAKSPLAN_LAG_FORSLAG, validerUttaksplanSaga)]);
    yield all([takeEvery(UttaksplanValideringActionKeys.VALIDER_UTTAKSPLAN, validerUttaksplanSaga)]);
}
