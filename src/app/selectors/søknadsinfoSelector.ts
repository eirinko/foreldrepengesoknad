import { createSelector } from 'reselect';
import {
    selectSituasjon,
    selectDekningsgrad,
    selectSøkerErAleneOmOmsorg,
    selectAnnenForelder,
    selectSøker,
    selectErEndringssøknad,
    selectSøkerrolle,
    selectEkstrainfo,
    selectBarn
} from './søknadSelector';

import {
    selectFamiliehendelsesdato,
    selectErDeltUttak,
    selectErFlerbarnssøknad,
    selectSøkerErFarEllerMedmor,
    selectSøkerErMor,
    selectMorHarAleneomsorg,
    selectFarEllerMedmorHarRett,
    selectFarEllerMedmorHarAleneomsorg,
    selectMorHarRett,
    selectErFødsel,
    selectMorErUfør,
    selectErAdopsjon,
    selectSøkerKjønn,
    selectAnnenForelderKjønn,
    selectHarKomplettUttaksplan
} from './utledetSøknadsinfoSelectors';
import { selectSøkerinfo } from './apiSelector';
import { Søker } from '../types/søknad/Søker';
import AnnenForelder from '../types/søknad/AnnenForelder';
import Person from '../types/Person';
import { getErSøkerFarEllerMedmor } from '../util/domain/personUtil';
import { Navn } from '../types/common';
import { getUttaksdatoer } from '../util/uttaksplan/uttaksdatoer';
import { OmMor, OmSøker, OmFarMedmor, OmAnnenForelder, NavnISøknaden, Søknadsinfo, OmSøknaden } from './types';
import { Forelder } from 'common/types';
import { Søkersituasjon } from 'app/types/søknad/Søknad';
import Api from 'app/api/api';

const selectOmSøknaden = createSelector(
    [
        selectSituasjon,
        selectFamiliehendelsesdato,
        selectDekningsgrad,
        selectErDeltUttak,
        selectErFlerbarnssøknad,
        selectErFødsel,
        selectErAdopsjon,
        selectErEndringssøknad,
        selectEkstrainfo,
        selectBarn,
        selectHarKomplettUttaksplan
    ],
    (
        situasjon,
        familiehendelsesdato,
        dekningsgrad,
        erDeltUttak,
        erFlerbarnssøknad,
        erFødsel,
        erAdopsjon,
        erEndringssøknad,
        ekstrainfo,
        barn,
        harKomplettUttaksplan
    ): OmSøknaden | undefined => {
        if (
            situasjon !== undefined &&
            familiehendelsesdato !== undefined &&
            erDeltUttak !== undefined &&
            erFlerbarnssøknad !== undefined &&
            erFødsel !== undefined &&
            erAdopsjon !== undefined &&
            erEndringssøknad !== undefined &&
            barn !== undefined &&
            barn.antallBarn !== undefined &&
            ekstrainfo !== undefined &&
            harKomplettUttaksplan !== undefined
        ) {
            return {
                situasjon,
                familiehendelsesdato,
                dekningsgrad,
                erDeltUttak,
                erFlerbarnssøknad,
                erFødsel,
                erAdopsjon,
                erEndringssøknad,
                erEnkelEndringssøknad: ekstrainfo.erEnkelEndringssøknad === true,
                antallBarn: barn.antallBarn,
                erBarnFødt: situasjon === Søkersituasjon.FØDSEL ? barn.erBarnetFødt : undefined,
                harKomplettUttaksplan,
                ønskerTomPlan: ekstrainfo.uttaksplanSkjema && ekstrainfo.uttaksplanSkjema.ønskerTomPlan,
                harGjenskaptUttaksplanFraEkisterendeSak:
                    ekstrainfo.eksisterendeSak !== undefined &&
                    ekstrainfo.eksisterendeSak.uttaksplan !== undefined &&
                    ekstrainfo.eksisterendeSak.uttaksplan.length > 0
            };
        }

        Api.log({
            message: 'selectSøknadsinfo undefined',
            situasjon: situasjon ? 'definert' : 'ikke definiert',
            familiehendelsesdato: familiehendelsesdato ? 'definert' : 'ikke definiert',
            erDeltUttak: erDeltUttak ? 'definert' : 'ikke definiert',
            erFlerbarnssøknad: erFlerbarnssøknad ? 'definert' : 'ikke definiert',
            erFødsel: erFødsel ? 'definert' : 'ikke definiert',
            erAdopsjon: erAdopsjon ? 'definert' : 'ikke definiert',
            erEndringssøknad: erEndringssøknad ? 'definert' : 'ikke definiert',
            barn: barn ? 'definert' : 'ikke definiert',
            antallBarn: barn !== undefined && barn.antallBarn !== undefined ? 'definert' : 'ikke definiert',
            ekstrainfo: ekstrainfo !== undefined ? 'definert' : 'ikke definiert',
            harKomplettUttaksplan: harKomplettUttaksplan !== undefined ? 'definert' : 'ikke definiert',
        });

        return undefined;
    }
);

const getNavn = ({ fornavn, etternavn }: { fornavn: string | undefined; etternavn: string | undefined }): Navn => {
    if (fornavn !== undefined && etternavn !== undefined) {
        return {
            fornavn,
            etternavn,
            navn: `${fornavn} ${etternavn}`
        };
    }
    return {
        fornavn: '',
        etternavn: '',
        navn: ''
    };
};

const selectOmSøker = createSelector(
    [selectSøkerErAleneOmOmsorg, selectSøkerErFarEllerMedmor, selectSøkerErMor, selectSøkerrolle, selectSøkerKjønn],
    (erAleneOmOmsorg, erFarEllerMedmor, erMor, rolle, kjønn): OmSøker | undefined => {
        return kjønn !== undefined
            ? {
                  erAleneOmOmsorg,
                  erFarEllerMedmor,
                  erMor,
                  rolle: rolle!,
                  kjønn,
                  forelder: erMor ? Forelder.mor : Forelder.farMedmor
              }
            : undefined;
    }
);

const selectOmMor = createSelector(
    [selectMorHarAleneomsorg, selectMorHarRett, selectMorErUfør],
    (erAleneOmOmsorg, harRett, erUfør): OmMor => {
        return {
            erAleneOmOmsorg: erAleneOmOmsorg === true,
            harRett: harRett === true,
            erUfør: erUfør === true
        };
    }
);

const selectOmFarMedmor = createSelector(
    [selectFarEllerMedmorHarRett, selectFarEllerMedmorHarAleneomsorg],
    (harRett, erAleneOmOmsorg): OmFarMedmor => {
        return {
            erAleneOmOmsorg: erAleneOmOmsorg === true,
            harRett: harRett === true
        };
    }
);

const selectOmAnnenForelder = createSelector(
    [selectAnnenForelder, selectSøkerErFarEllerMedmor, selectAnnenForelderKjønn],
    (annenForelder = {}, søkerErFarEllerMedmor, kjønn): OmAnnenForelder => {
        return {
            harRett: annenForelder.harRettPåForeldrepenger === true,
            erFarEllerMedmor: søkerErFarEllerMedmor === false,
            erMor: søkerErFarEllerMedmor === true,
            erUfør: annenForelder.erUfør === true,
            kanIkkeOppgis: annenForelder.kanIkkeOppgis === true,
            kjønn
        };
    }
);

const selectNavnISøknaden = createSelector(
    [selectSøkerinfo, selectSøker, selectAnnenForelder, selectSøkerErFarEllerMedmor],
    (søkerinfo, søker, annenForelder, søkerErFarEllerMedmor) => {
        if (
            søker !== undefined &&
            søkerinfo !== undefined &&
            annenForelder !== undefined &&
            søkerErFarEllerMedmor !== undefined
        ) {
            return getNavnISøknaden(søkerinfo.person, søker as Søker, annenForelder as AnnenForelder);
        }
        return undefined;
    }
);

const getNavnISøknaden = (søkerpersonalia: Person, søker: Søker, annenForelder: AnnenForelder): NavnISøknaden => {
    const erSøkerFarMedmor = getErSøkerFarEllerMedmor(søker.rolle);
    const navnSøker = getNavn(søkerpersonalia);
    const navnAnnenForelder = getNavn(annenForelder);
    const navnMor = erSøkerFarMedmor ? navnAnnenForelder : navnSøker;
    const navnFarMedmor = erSøkerFarMedmor ? navnSøker : navnAnnenForelder;
    return {
        søker: navnSøker,
        annenForelder: navnAnnenForelder,
        mor: navnMor,
        farMedmor: navnFarMedmor,
        navnPåForeldre: { mor: navnMor.fornavn, farMedmor: navnFarMedmor.fornavn }
    };
};

export const selectSøknadsinfo = createSelector(
    [selectOmSøknaden, selectOmSøker, selectOmMor, selectOmFarMedmor, selectOmAnnenForelder, selectNavnISøknaden],
    (omSøknaden, omSøker, omMor, omFarMedmor, omAnnenForelder, navn): Søknadsinfo | undefined => {
        if (omSøknaden !== undefined && navn !== undefined && omSøker !== undefined) {
            return {
                søknaden: omSøknaden,
                søker: omSøker,
                mor: omMor,
                farMedmor: omFarMedmor,
                annenForelder: omAnnenForelder,
                navn,
                uttaksdatoer: getUttaksdatoer(omSøknaden.familiehendelsesdato)
            };
        }

        Api.log({
            message: 'selectSøknadsinfo undefined',
            omSøknaden: omSøknaden ? 'definert' : 'ikke definiert',
            navn: navn ? 'navn er definert ' : 'navn er ikke definert',
            omSøknad: omSøker ? 'omSøker er definert' : 'omSøker er ikke definert'
        });
        
        return undefined;
    }
)