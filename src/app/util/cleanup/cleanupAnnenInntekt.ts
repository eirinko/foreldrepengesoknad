import { AnnenInntekt, JobbIUtlandetInntekt } from '../../types/søknad/AnnenInntekt';
import visibility from '../../components/annen-inntekt-modal/visibility';

const cleanupAnnenInntekt = (inntekt: AnnenInntekt): AnnenInntekt => {
    if (!visibility.vedlegg(inntekt)) {
        delete inntekt.vedlegg;
    }
    if (!visibility.arbeidsgiverNavn(inntekt)) {
        delete (inntekt as JobbIUtlandetInntekt).arbeidsgiverNavn;
    }
    if (!visibility.land(inntekt)) {
        delete (inntekt as JobbIUtlandetInntekt).land;
    }
    if (!visibility.erNærVennEllerFamilie(inntekt)) {
        delete (inntekt as JobbIUtlandetInntekt).erNærVennEllerFamilieMedArbeidsgiver;
    }
    return inntekt;
};

export default cleanupAnnenInntekt;
