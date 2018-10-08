import { Skjemanummer } from '../../types/søknad/Søknad';
import { MorsAktivitet } from '../../types/uttaksplan/periodetyper';

export const getMorsAktivitetSkjemanummer = (morsAktivitet?: MorsAktivitet): Skjemanummer => {
    switch (morsAktivitet) {
        case MorsAktivitet.Innlagt:
            return Skjemanummer.DOK_INNLEGGELSE;
        case MorsAktivitet.Kvalifiseringsprogrammet:
            return Skjemanummer.BEKREFTELSE_DELTAR_KVALIFISERINGSPROGRAM;
        case MorsAktivitet.Introduksjonsprogrammet:
            return Skjemanummer.ANNET_SKJEMA_IKKE_NAV;
        case MorsAktivitet.ArbeidOgUtdanning:
        case MorsAktivitet.Arbeid:
            return Skjemanummer.DOK_MORS_UTDANNING_ARBEID_SYKDOM;
        case MorsAktivitet.Utdanning:
        case MorsAktivitet.TrengerHjelp:
            return Skjemanummer.BEKREFTELSE_FRA_STUDIESTED;
        default:
            return Skjemanummer.ANNET;
    }
};
