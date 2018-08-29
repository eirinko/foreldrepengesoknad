import { Tidsperiode } from '../types';
import { isWithinRange } from 'date-fns';
import { normaliserDato } from 'common/util/datoUtils';
import { Uttaksdagen } from 'uttaksplan/utils/Uttaksdagen';

export type DatoValideringsfeil =
    | 'ikkeUttaksdag'
    | 'utenforPerioder'
    | 'ugyldigDato'
    | 'innenforUlovligPeriode'
    | 'innenforForsteSeksUker'
    | undefined;

export const nyDato = (datostring?: string): Date => normaliserDato(datostring ? new Date(datostring) : new Date());

export const erSammeDato = (dato1: Date, dato2: Date) =>
    normaliserDato(dato1).getTime() === normaliserDato(dato2).getTime();

export const separerTekstArray = (tekster: string[]): string => {
    const arr = [...tekster];
    const siste = arr.pop();
    return `${arr.join(', ')} og ${siste}`;
};

export const validerDato = (
    dato: Date,
    tidsrom: Tidsperiode,
    ugyldigePerioder: Tidsperiode[] = [],
    familiehendelsedato?: Date
): DatoValideringsfeil => {
    if (!dato) {
        return 'ugyldigDato';
    }
    if (
        familiehendelsedato &&
        isWithinRange(
            normaliserDato(dato),
            normaliserDato(familiehendelsedato),
            normaliserDato(Uttaksdagen(tidsrom.fom).forrige())
        )
    ) {
        return 'innenforForsteSeksUker';
    }
    if (!isWithinRange(normaliserDato(dato), normaliserDato(tidsrom.fom), normaliserDato(tidsrom.tom))) {
        return 'utenforPerioder';
    }
    if (!Uttaksdagen(dato).erUttaksdag()) {
        return 'ikkeUttaksdag';
    }
    let gyldig: DatoValideringsfeil;
    ugyldigePerioder.forEach((p) => {
        if (gyldig && isWithinRange(dato, p.fom, p.tom)) {
            gyldig = 'innenforUlovligPeriode';
        }
    });
    return gyldig;
};
