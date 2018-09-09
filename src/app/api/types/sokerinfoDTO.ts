import { Kjønn } from '../../types/common';

export interface SøkerinfoDTOPerson {
    fnr: string;
    fornavn: string;
    etternavn: string;
    mellomnavn?: string;
    fødselsdato: string;
    kjønn: Kjønn;
}

export interface SøkerinfoDTOAnnenForelder extends SøkerinfoDTOPerson {
    harOpplystOmSinPågåendeSak?: boolean;
}

export interface SøkerinfoDTOBarn extends SøkerinfoDTOPerson {
    annenForelder?: SøkerinfoDTOAnnenForelder;
}

export interface SøkerinfoDTOSøker extends SøkerinfoDTOPerson {
    ikkeNordiskEøsLand?: boolean;
    barn?: SøkerinfoDTOBarn[];
}

export interface SøkerinfoDTOArbeidsforhold {
    arbeidsgiverId: string;
    arbeidsgiverIdType: string;
    arbeidsgiverNavn: string;
    stillingsprosent: number;
    fom: string;
    tom?: string;
}

export interface SøknadsinfoDTO {
    erEndringssøknad: boolean;
    deltUttaksplan: boolean;
}

export interface SøkerinfoDTO {
    søker: SøkerinfoDTOSøker;
    arbeidsforhold?: SøkerinfoDTOArbeidsforhold[];
    søknadsinfo: SøknadsinfoDTO;
}
