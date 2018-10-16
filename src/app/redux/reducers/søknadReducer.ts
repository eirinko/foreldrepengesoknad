import moment from 'moment';
import { SøknadAction, SøknadActionKeys } from '../actions/søknad/søknadActionDefinitions';
import Søknad, { SøknadPartial } from '../../types/søknad/Søknad';
import { addAttachmentToState, editAttachmentInState, removeAttachmentFromState } from '../util/attachmentStateUpdates';
import {
    getUniqeRegistrertAnnenForelderFromBarn,
    getBarnInfoFraRegistrertBarnValg
} from '../../util/validation/steg/barn';
import { RegistrertAnnenForelder } from '../../types/Person';
import AnnenForelder, { AnnenForelderPartial } from '../../types/søknad/AnnenForelder';
import { lagUttaksplan } from '../../util/uttaksplan/forslag/uttaksplan';
import { sorterPerioder } from '../../util/uttaksplan/Periodene';
import { cleanupPeriode } from '../../util/cleanup/periodeCleanup';
import { Søker } from '../../types/søknad/Søker';
import { UttaksplanBuilder } from '../../util/uttaksplan/builder/UttaksplanBuilder';
import { isForeldrepengerFørFødselUttaksperiode } from '../../types/uttaksplan/periodetyper';
import { getFamiliehendelsedato } from '../../util/uttaksplan';
import { Barn } from '../../types/søknad/Barn';

const getDefaultState = (): SøknadPartial => {
    return {
        type: 'foreldrepenger',
        annenForelder: {
            kanIkkeOppgis: false
        },
        barn: {},
        informasjonOmUtenlandsopphold: {
            tidligereOpphold: [],
            senereOpphold: []
        },
        søker: {
            erAleneOmOmsorg: undefined,
            andreInntekterSiste10Mnd: []
        },
        harGodkjentVilkår: false,
        harGodkjentOppsummering: false,
        ekstrainfo: {
            uttaksplanSkjema: {
                startdatoPermisjon: undefined
            }
        },
        sensitivInfoIkkeLagre: {
            søknadenGjelderBarnValg: {
                valgteBarn: [],
                gjelderAnnetBarn: undefined
            }
        },
        uttaksplan: []
    };
};

const getAnnenForelderFromRegistrertForelder = (registertForelder: RegistrertAnnenForelder): AnnenForelderPartial => {
    return {
        fnr: registertForelder.fnr,
        fornavn: registertForelder.fornavn,
        etternavn: registertForelder.etternavn
    };
};

const filterOutPerioderFørTermin = (state: SøknadPartial) => {
    return state.uttaksplan.filter((periode) =>
        moment(periode.tidsperiode.tom).isBefore(getFamiliehendelsedato(state.barn as Barn, state.situasjon!), 'day')
    );
};

const handleGjelderAnnetBarn = (
    annenForelder: AnnenForelderPartial,
    gjelderAnnetBarn?: boolean
): AnnenForelderPartial => {
    if (gjelderAnnetBarn) {
        return { ...annenForelder, fnr: undefined, fornavn: undefined, etternavn: undefined };
    }
    return annenForelder;
};

const søknadReducer = (state = getDefaultState(), action: SøknadAction): SøknadPartial => {
    switch (action.type) {
        case SøknadActionKeys.AVBRYT_SØKNAD:
            return {
                ...getDefaultState()
            };
        case SøknadActionKeys.UPDATE_SØKNAD:
            return {
                ...state,
                ...action.payload
            };
        case SøknadActionKeys.SET_SØKNAD:
            return {
                ...getDefaultState(),
                ...action.payload
            };
        case SøknadActionKeys.UPDATE_BARN:
            return {
                ...state,
                barn: { ...state.barn, ...action.payload }
            };
        case SøknadActionKeys.UPDATE_ANNEN_FORELDER:
            return {
                ...state,
                annenForelder: { ...state.annenForelder, ...action.payload }
            };
        case SøknadActionKeys.UPDATE_UTENLANDSOPPHOLD:
            return {
                ...state,
                informasjonOmUtenlandsopphold: {
                    ...state.informasjonOmUtenlandsopphold,
                    ...action.payload
                }
            };
        case SøknadActionKeys.UPDATE_SØKER:
            return {
                ...state,
                søker: {
                    ...state.søker,
                    ...action.payload
                }
            };
        case SøknadActionKeys.UPDATE_SØKNADEN_GJELDER_BARN: {
            const registrertAnnenForelder = getUniqeRegistrertAnnenForelderFromBarn(action.payload.valgteBarn);
            const gjelderAnnetBarn = action.payload.gjelderAnnetBarn;
            const barn = getBarnInfoFraRegistrertBarnValg(action.payload.gjelderAnnetBarn, action.payload.valgteBarn);
            const updatedState: SøknadPartial = {
                ...state,
                barn,
                annenForelder: registrertAnnenForelder
                    ? {
                          ...state.annenForelder,
                          ...getAnnenForelderFromRegistrertForelder(registrertAnnenForelder)
                      }
                    : handleGjelderAnnetBarn(state.annenForelder, gjelderAnnetBarn),
                sensitivInfoIkkeLagre: {
                    ...state.sensitivInfoIkkeLagre,
                    søknadenGjelderBarnValg: action.payload,
                    registrertAnnenForelder
                }
            };
            return updatedState;
        }

        case SøknadActionKeys.UTTAKSPLAN_SET_PERIODER:
            return {
                ...state,
                uttaksplan: action.perioder
            };

        case SøknadActionKeys.UTTAKSPLAN_LAG_FORSLAG:
            return {
                ...state,
                uttaksplan: lagUttaksplan(state as Søknad, action.tilgjengeligeStønadskontoer).sort(sorterPerioder),
                ekstrainfo: {
                    ...state.ekstrainfo,
                    uttaksplanSkjema: {
                        ...state.ekstrainfo.uttaksplanSkjema,
                        forslagLaget: true
                    }
                }
            };

        case SøknadActionKeys.UTTAKSPLAN_ADD_PERIODE: {
            return {
                ...state,
                uttaksplan: UttaksplanBuilder(state.uttaksplan).leggTilPeriodeOgBuild({
                    ...action.periode
                }).perioder
            };
        }

        case SøknadActionKeys.UTTAKSPLAN_DELETE_PERIODE: {
            return {
                ...state,
                uttaksplan: UttaksplanBuilder(state.uttaksplan).slettPeriodeOgBuild(action.periode).perioder
            };
        }

        case SøknadActionKeys.UTTAKSPLAN_UPDATE_PERIODE: {
            const removeOtherPerioderFørTermin =
                isForeldrepengerFørFødselUttaksperiode(action.periode) &&
                action.periode.skalIkkeHaUttakFørTermin === true;

            const filteredPerioder = removeOtherPerioderFørTermin
                ? filterOutPerioderFørTermin(state)
                : state.uttaksplan;
            return {
                ...state,
                uttaksplan: UttaksplanBuilder(filteredPerioder).oppdaterPeriodeOgBuild(
                    cleanupPeriode(action.periode, state.søker as Søker, state.annenForelder as AnnenForelder)
                ).perioder
            };
        }

        case SøknadActionKeys.UTTAKSPLAN_UPDATE_SKJEMADATA: {
            return {
                ...state,
                ekstrainfo: {
                    ...state.ekstrainfo,
                    uttaksplanSkjema: {
                        ...state.ekstrainfo.uttaksplanSkjema,
                        ...action.payload
                    }
                }
            };
        }

        case SøknadActionKeys.UPLOAD_ATTACHMENT:
            const pendingAttachment = action.payload;
            pendingAttachment.pending = true;
            return addAttachmentToState(pendingAttachment, state);

        case SøknadActionKeys.UPLOAD_ATTACHMENT_SUCCESS:
            const uploadedAttachment = action.attachment;
            const url = action.url;
            uploadedAttachment.url = url;
            uploadedAttachment.pending = false;
            uploadedAttachment.uploaded = true;
            return editAttachmentInState(uploadedAttachment, state);

        case SøknadActionKeys.UPLOAD_ATTACHMENT_FAILED:
            const failedAttachment = action.attachment;
            failedAttachment.pending = false;
            failedAttachment.uploaded = false;
            return editAttachmentInState(failedAttachment, state);

        case SøknadActionKeys.DELETE_ATTACHMENT:
            const attachmentToDelete = action.attachment;
            attachmentToDelete.pending = true;
            return editAttachmentInState(attachmentToDelete, state);

        case SøknadActionKeys.DELETE_ATTACHMENT_SUCCESS:
            const deletedAttachment = action.attachment;
            return removeAttachmentFromState(deletedAttachment, state);

        case SøknadActionKeys.DELETE_ATTACHMENT_FAILED:
            const attachmentFailedToDelete = action.attachment;
            return removeAttachmentFromState(attachmentFailedToDelete, state);
    }
    return state;
};

export default søknadReducer;
