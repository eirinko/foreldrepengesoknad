import { getRelasjonTilBarnFødselVisibility } from '../../connected-components/steg/relasjon-til-barn-fødsel/visibility/relasjonTilBarnFødselVisibility';
import Søknad, { Skjemanummer } from '../../types/søknad/Søknad';
import { ApiState } from '../../redux/reducers/apiReducer';
import {
    AnnenForelderSpørsmålKeys,
    getAnnenForelderStegVisibility
} from '../../connected-components/steg/annen-forelder/visibility/annenForelderStegVisibility';

import annenInntektVisibility from '../../components/annen-inntekt-modal/visibility';
import { AttachmentType } from 'common/storage/attachment/types/AttachmentType';
import { Attachment, InnsendingsType } from 'common/storage/attachment/types/Attachment';
import {
    Overføringsperiode,
    Periode,
    Periodetype,
    Utsettelsesperiode,
    UtsettelseÅrsakType,
    Uttaksperiode
} from '../../types/uttaksplan/periodetyper';
import { spørsmålOmVedleggVisible } from '../../connected-components/steg/relasjon-til-barn-adopsjon/visibility';
import {
    getAttachmentTypeForPeriode,
    getSkjemanummerForAndreInntekter,
    getSkjemanummerForPeriode,
    isAttachmentForAnnenInntekt,
    isAttachmentForBarn,
    isAttachmentForPeriode,
    mapFileToAttachment
} from 'common/storage/attachment/components/util';
import {
    dokumentasjonBehøvesForOverføringsperiode,
    dokumentasjonBehøvesForUtsettelsesperiode,
    dokumentasjonBehøvesForUttaksperiode,
    erÅrsakSykdomEllerInstitusjonsopphold
} from '../uttaksplan/utsettelsesperiode';
import { MissingAttachment } from '../../types/MissingAttachment';
import { Søknadsinfo } from 'app/selectors/types';
import { isUfødtBarn, isAdopsjonsbarn } from '../../types/søknad/Barn';
import {
    getUtsettelseFormVisibility,
    UtsettelseSpørsmålKeys
} from 'app/components/utsettelse-form/utsettelseFormConfig';
import { getVariantFromPeriode } from 'app/components/utsettelse-form/UtsettelseForm';
import { getMorsAktivitetSkjemanummer } from '../skjemanummer/morsAktivitetSkjemanummer';
import aktivitetskravMorUtil from '../domain/aktivitetskravMor';

const isAttachmentMissing = (attachments?: Attachment[], type?: AttachmentType): boolean =>
    attachments === undefined ||
    attachments.length === 0 ||
    (type !== undefined && attachments.find((a) => a.type === type) === undefined);

export function shouldPeriodeHaveAttachment(periode: Periode, søknadsinfo: Søknadsinfo): boolean {
    if (periode.type === Periodetype.Overføring) {
        return dokumentasjonBehøvesForOverføringsperiode(
            søknadsinfo.søker.erFarEllerMedmor,
            periode as Overføringsperiode
        );
    } else if (periode.type === Periodetype.Utsettelse) {
        return dokumentasjonBehøvesForUtsettelsesperiode(periode as Utsettelsesperiode, søknadsinfo);
    } else if (periode.type === Periodetype.Uttak) {
        return dokumentasjonBehøvesForUttaksperiode(periode as Uttaksperiode);
    } else {
        return (periode as any).årsak === UtsettelseÅrsakType.Sykdom;
    }
}

export const findMissingAttachmentsForBarn = (søknad: Søknad, api: ApiState): MissingAttachment[] => {
    const missingAttachments = [];
    const shouldUploadTerminbekreftelse = getRelasjonTilBarnFødselVisibility(søknad, api).ufødt.terminbekreftelse;
    if (
        shouldUploadTerminbekreftelse &&
        isUfødtBarn(søknad.barn, søknad.situasjon) &&
        isAttachmentMissing(søknad.barn.terminbekreftelse)
    ) {
        missingAttachments.push({
            skjemanummer: Skjemanummer.TERMINBEKREFTELSE,
            type: AttachmentType.TERMINBEKREFTELSE
        });
    }

    if (
        spørsmålOmVedleggVisible(søknad.barn, søknad.erEndringssøknad) &&
        isAdopsjonsbarn(søknad.barn, søknad.situasjon) &&
        isAttachmentMissing(søknad.barn.omsorgsovertakelse)
    ) {
        missingAttachments.push({
            skjemanummer: Skjemanummer.OMSORGSOVERTAKELSESDATO,
            type: AttachmentType.OMSORGSOVERTAKELSE
        });
    }

    const annenForelderStegVisibility = getAnnenForelderStegVisibility(søknad, api.søkerinfo!);
    const shouldUploadDokumentasjonAvAleneomsorg =
        annenForelderStegVisibility &&
        annenForelderStegVisibility.isVisible(AnnenForelderSpørsmålKeys.datoForAleneomsorg) &&
        søknad.barn.datoForAleneomsorg !== undefined;
    if (shouldUploadDokumentasjonAvAleneomsorg && isAttachmentMissing(søknad.barn.dokumentasjonAvAleneomsorg)) {
        missingAttachments.push({
            skjemanummer: Skjemanummer.ANNET,
            type: AttachmentType.ALENEOMSORG
        });
    }

    return missingAttachments;
};

export const hasPeriodeMissingAttachment = (periode: Periode, søknadsinfo: Søknadsinfo): boolean => {
    return (
        (shouldPeriodeHaveAttachment(periode, søknadsinfo) &&
            (aktivitetskravMorUtil.skalBesvaresVedUtsettelse(
                søknadsinfo.søker.erFarEllerMedmor,
                søknadsinfo.annenForelder
            ) &&
                isAttachmentMissing(periode.vedlegg, AttachmentType.MORS_AKTIVITET_DOKUMENTASJON))) ||
        (erÅrsakSykdomEllerInstitusjonsopphold((periode as Utsettelsesperiode).årsak) &&
            isAttachmentMissing(periode.vedlegg, AttachmentType.UTSETTELSE_SYKDOM))
    );
};

export const findMissingAttachmentsForPerioder = (
    perioder: Periode[],
    søknadsinfo: Søknadsinfo
): MissingAttachment[] => {
    if (!perioder) {
        return [];
    }

    const missingAttachments = [];
    for (const periode of perioder) {
        if (hasPeriodeMissingAttachment(periode, søknadsinfo)) {
            if (
                erÅrsakSykdomEllerInstitusjonsopphold((periode as Utsettelsesperiode).årsak) &&
                isAttachmentMissing(periode.vedlegg, AttachmentType.UTSETTELSE_SYKDOM)
            ) {
                missingAttachments.push({
                    index: perioder.indexOf(periode),
                    skjemanummer: getSkjemanummerForPeriode(periode),
                    type: getAttachmentTypeForPeriode(periode),
                    periodeId: periode.id
                });
            }

            if (
                periode.type === Periodetype.Utsettelse &&
                aktivitetskravMorUtil.skalBesvaresVedUtsettelse(
                    søknadsinfo.søker.erFarEllerMedmor,
                    søknadsinfo.annenForelder
                ) &&
                isAttachmentMissing(periode.vedlegg, AttachmentType.MORS_AKTIVITET_DOKUMENTASJON)
            ) {
                const variant = getVariantFromPeriode(periode);
                const visibility = getUtsettelseFormVisibility({ variant, periode, søknadsinfo });
                if (visibility.isVisible(UtsettelseSpørsmålKeys.morsAktivitet)) {
                    missingAttachments.push({
                        index: perioder.indexOf(periode),
                        skjemanummer: getMorsAktivitetSkjemanummer(periode.morsAktivitetIPerioden),
                        type: AttachmentType.MORS_AKTIVITET_DOKUMENTASJON,
                        periodeId: periode.id
                    });
                }
            }
        }
    }
    return missingAttachments;
};

export const findMissingAttachmentsForAndreInntekter = (søknad: Søknad): MissingAttachment[] => {
    if (!søknad.søker.andreInntekterSiste10Mnd) {
        return [];
    }

    const missingAttachments = [];
    for (const andreInntekterSiste10MndItem of søknad.søker.andreInntekterSiste10Mnd) {
        const annenInntektVedlegg = annenInntektVisibility.vedlegg(andreInntekterSiste10MndItem);
        if (annenInntektVedlegg && isAttachmentMissing(andreInntekterSiste10MndItem.vedlegg)) {
            missingAttachments.push({
                index: søknad.søker.andreInntekterSiste10Mnd.indexOf(andreInntekterSiste10MndItem),
                skjemanummer: getSkjemanummerForAndreInntekter(andreInntekterSiste10MndItem.type),
                type: AttachmentType.ANNEN_INNTEKT
            });
        }
    }
    return missingAttachments;
};

export const findMissingAttachments = (
    søknad: Søknad,
    api: ApiState,
    søknadsinfo: Søknadsinfo
): MissingAttachment[] => {
    const missingAttachments = [];
    missingAttachments.push(...findMissingAttachmentsForBarn(søknad, api));
    missingAttachments.push(...findMissingAttachmentsForPerioder(søknad.uttaksplan, søknadsinfo));
    missingAttachments.push(...findMissingAttachmentsForAndreInntekter(søknad));
    return missingAttachments;
};

export const mapMissingAttachmentsOnSøknad = (missingAttachments: MissingAttachment[], søknad: Søknad): Søknad => {
    missingAttachments.forEach((missingAttachment: MissingAttachment) => {
        const attachment = mapFileToAttachment(
            { name: '', size: '' } as any,
            missingAttachment.type,
            missingAttachment.skjemanummer,
            InnsendingsType.SEND_SENERE
        );

        if (isAttachmentForBarn(attachment.type)) {
            søknad.barn[attachment.type] = [attachment];
        } else if (isAttachmentForAnnenInntekt(attachment.type)) {
            søknad.søker.andreInntekterSiste10Mnd![missingAttachment.index!].vedlegg = [attachment];
        } else if (isAttachmentForPeriode(attachment.type)) {
            søknad.uttaksplan[missingAttachment.index!].vedlegg! =
                Array.isArray(søknad.uttaksplan[missingAttachment.index!].vedlegg) &&
                søknad.uttaksplan[missingAttachment.index!].vedlegg!.length > 0
                    ? søknad.uttaksplan[missingAttachment.index!].vedlegg!.concat(attachment)
                    : [attachment];
        }
    });

    return søknad;
};
