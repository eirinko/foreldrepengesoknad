import { UttaksplanActionTypes, UttaksplanActionTypeKeys } from '../actions/actionTypes';
import { UttaksplanState } from '../types';
import { getUttaksgrunnlag } from 'uttaksplan/utils/uttak/uttaksgrunnlag';
import { UttaksplanBuilder } from 'uttaksplan/utils/planer/UttaksplanBuilder';
import { opprettUttaksperioderToForeldreEttBarn } from 'uttaksplan/utils/planer/oppsett/toForeldreEttBarn';
import { opprettUttaksperioderAleneomsorgMor } from 'uttaksplan/utils/planer/oppsett/aleneomsorgMor';
import { UttaksplanManuell } from 'uttaksplan/utils/planer/UttaksplanManuell';

const defaultState: UttaksplanState = {
    perioder: [],
    manuellOppdatering: false
};

const UttaksplanReducer = (state = defaultState, action: UttaksplanActionTypes): UttaksplanState => {
    switch (action.type) {
        case UttaksplanActionTypeKeys.INIT_UTTAKSPLAN:
            return {
                manuellOppdatering: false,
                perioder: [],
                uttaksgrunnlag: getUttaksgrunnlag(action.props, action.dekningsgrad)
            };
        case UttaksplanActionTypeKeys.OPPRETT_PERIODER_TO_FORELDRE:
            return {
                ...state,
                perioder: UttaksplanBuilder(
                    opprettUttaksperioderToForeldreEttBarn(
                        action.familiehendelsedato,
                        action.dekningsgrad,
                        action.fellesukerForelder1,
                        action.fellesukerForelder2,
                        action.uttaksgrunnlag.permisjonsregler
                    )
                ).buildUttaksplan().perioder
            };
        case UttaksplanActionTypeKeys.OPPRETT_PERIODER_ALENEOMSORG:
            return {
                ...state,
                perioder: UttaksplanBuilder(
                    opprettUttaksperioderAleneomsorgMor(
                        action.familiehendelsedato,
                        action.dekningsgrad,
                        action.uttaksgrunnlag.permisjonsregler
                    )
                ).buildUttaksplan().perioder
            };

        case UttaksplanActionTypeKeys.PERIODE_OPPRETT_ELLER_OPPDATER:
            if (state.manuellOppdatering) {
                return {
                    ...state,
                    perioder: UttaksplanManuell(state.perioder).leggTilEllerOppdater(action.periode).perioder
                };
            }
            return {
                ...state,
                perioder: UttaksplanBuilder(state.perioder).leggTilEllerOppdaterPeriode(action.periode).perioder
            };

        case UttaksplanActionTypeKeys.PERIODE_SLETT:
            if (state.manuellOppdatering) {
                return {
                    ...state,
                    perioder: UttaksplanManuell(state.perioder).slettPeriode(action.periode).perioder
                };
            }
            return {
                ...state,
                perioder: UttaksplanBuilder(state.perioder).slettPeriodeOgBuild(action.periode).perioder
            };

        case UttaksplanActionTypeKeys.SET_MANUELL_UTTAKSPLAN:
            return {
                ...state,
                manuellOppdatering: action.manuellUttaksplan
            };

        case UttaksplanActionTypeKeys.DEV_ACTION:
            return {
                ...state,
                perioder: UttaksplanBuilder(state.perioder).perioder
            };

        default:
            return state;
    }
};

export default UttaksplanReducer;
