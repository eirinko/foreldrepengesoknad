import { useIntl } from 'react-intl';
import HvaLeggerNAVVektPå from './hva-legger-nav-vekt-på/HvaLeggerNAVVektPå';
import { MinidialogInnslag } from 'app/types/MinidialogInnslag';
import { formatDate, intlUtils, Block } from '@navikt/fp-common';
import { Alert, Button, Chat, GuidePanel } from '@navikt/ds-react';
import { Ytelse } from 'app/types/Ytelse';
import EttersendingDto from 'app/types/EttersendingDTO';
import { Skjemanummer } from 'app/types/Skjemanummer';
import { Link } from 'react-router-dom';
import FormikFileUploader from '../formik-file-uploader/FormikFileUploader';
import { AttachmentType } from 'app/types/AttachmentType';
import { MinidialogFormComponents, MinidialogFormField } from './minidialogSkjemaConfig';
import { mapMinidialogInputTilDTO } from './minidialogskjemaUtils';
import { YesOrNo } from '@navikt/sif-common-formik-ds/lib';
import { convertYesOrNoOrUndefinedToBoolean } from 'app/utils/formUtils';
import { validateFritekstFelt } from 'app/utils/validationUtils';
import AttachmentList from '../attachment/AttachmentList';
import { deleteAttachment, isAttachmentWithError } from 'app/utils/attachmentUtils';
import { getListOfUniqueSkjemanummer } from 'app/pages/ettersending/EttersendingPage';
import { Attachment } from 'app/types/Attachment';
import ScrollToTop from '../scroll-to-top/ScrollToTop';
import { useQuery } from '@tanstack/react-query';
import Environment from 'app/Environment';
import { useState } from 'react';
import MinidialogVenterPåSvar from './minidialog-venter-på-svar/MinidialogVenterPåSvar';

interface Props {
    ettersendelseErSendt: boolean;
    isSendingEttersendelse: boolean;
    minidialog: MinidialogInnslag;
    onSubmit: (ettersendelse: EttersendingDto) => void;
    sakstype: Ytelse;
    ettersendelseError: string | undefined;
}

const MinidialogSkjema: React.FunctionComponent<Props> = ({
    ettersendelseErSendt,
    isSendingEttersendelse,
    sakstype,
    minidialog,
    ettersendelseError,
    onSubmit,
}) => {
    const intl = useIntl();
    const handleSubmit = (values: any) => {
        const submitData = mapMinidialogInputTilDTO(values, minidialog.saksnr, sakstype, minidialog.dialogId);
        onSubmit(submitData);
    };
    const [fetchCounter, setFetchCounter] = useState(0);
    const [allowedToFetch, setAllowedToFetch] = useState(true);

    const minidialogQuery = useQuery<MinidialogInnslag[]>({
        queryKey: ['minidialog'],
        queryFn: async () => {
            setFetchCounter((prev) => prev + 1);
            return await fetch(`${Environment.REST_API_URL}/minidialog`, { credentials: 'include' }).then((response) =>
                response.json(),
            );
        },
        refetchInterval: (data) => {
            if (data?.find((innslag) => innslag.dialogId === minidialog?.dialogId)) {
                return 1000;
            }

            setAllowedToFetch(false);
            return false;
        },
        enabled: ettersendelseErSendt && fetchCounter < 30 && allowedToFetch,
    });

    if (!minidialogQuery.isLoading) {
        console.log(minidialogQuery.data);
    }

    if (ettersendelseErSendt) {
        return (
            <div>
                <ScrollToTop />
                <MinidialogVenterPåSvar fetchCounter={fetchCounter} allowedToFetch={allowedToFetch} />
                <Block padBottom="l">
                    <Link to={`/sak/${minidialog.saksnr}`}>
                        {intlUtils(intl, 'miniDialog.kvittering.gåTilbakeTilSaken')}
                    </Link>
                </Block>
            </div>
        );
    }

    if (ettersendelseError) {
        return (
            <div>
                <ScrollToTop />
                <Block padBottom="l">
                    <Alert variant="error"> {ettersendelseError}</Alert>
                </Block>
                <Block padBottom="l">
                    <Link to={`/sak/${minidialog.saksnr}`}>
                        {intlUtils(intl, 'miniDialog.kvittering.gåTilbakeTilSaken')}
                    </Link>
                </Block>
            </div>
        );
    }
    return (
        <MinidialogFormComponents.FormikWrapper
            initialValues={{
                tilbakemelding: '',
                vedlegg: [],
                brukerØnskerÅUttaleSeg: YesOrNo.UNANSWERED,
            }}
            onSubmit={handleSubmit}
            renderForm={({ values, setFieldValue }) => {
                const brukerØnskerÅUttaleSeg = convertYesOrNoOrUndefinedToBoolean(values.brukerØnskerÅUttaleSeg);
                const finnesPendingVedlegg = values.vedlegg ? !!values.vedlegg.find((file) => file.pending) : false;
                return (
                    <MinidialogFormComponents.Form includeButtons={false} includeValidationSummary={true}>
                        <Block padBottom="l">
                            <Chat
                                avatar="NAV"
                                name="NAV"
                                avatarBgColor="rgba(255, 236, 204, 1)"
                                backgroundColor="rgba(255, 249, 240, 1)"
                                timestamp={formatDate(minidialog.opprettet)}
                            >
                                <Chat.Bubble>
                                    {intlUtils(intl, 'miniDialog.tilbakekreving.tittel', { sakstype })}
                                </Chat.Bubble>
                            </Chat>
                        </Block>
                        <Block padBottom="xl">
                            <HvaLeggerNAVVektPå />
                        </Block>

                        <Block padBottom="l">
                            <MinidialogFormComponents.YesOrNoQuestion
                                name={MinidialogFormField.brukerØnskerÅUttaleSeg}
                                legend={intlUtils(intl, 'miniDialog.tilbakekreving.radioPanelGruppe.legend')}
                            />
                        </Block>
                        <Block padBottom="xl" visible={brukerØnskerÅUttaleSeg === true}>
                            <MinidialogFormComponents.Textarea
                                name={MinidialogFormField.tilbakemelding}
                                label={intlUtils(intl, 'minidialog.tilbakekreving.tilbakekreving.label')}
                                validate={validateFritekstFelt(
                                    intl,
                                    intlUtils(intl, 'minidialog.tilbakekreving.tilbakekreving.label').replace(':', ''),
                                )}
                            ></MinidialogFormComponents.Textarea>
                            <FormikFileUploader
                                name={MinidialogFormField.vedlegg}
                                attachments={values.vedlegg || []}
                                label={intlUtils(intl, 'miniDialog.lastOppDokumentasjon')}
                                attachmentType={AttachmentType.TILBAKEBETALING}
                                skjemanummer={Skjemanummer.TILBAKEBETALING}
                                legend=""
                                buttonLabel={intlUtils(intl, 'miniDialog.lastOppDokumentasjon')}
                                validateHasAttachment={false}
                            />
                            <Block padBottom="l" visible={values.vedlegg!.length > 0}>
                                {getListOfUniqueSkjemanummer(values.vedlegg!).map((skjemanummer: Skjemanummer) => (
                                    <div key={skjemanummer}>
                                        <AttachmentList
                                            attachments={values.vedlegg!.filter(
                                                (a) => !isAttachmentWithError(a) && a.skjemanummer === skjemanummer,
                                            )}
                                            showFileSize={true}
                                            onDelete={(file: Attachment) => {
                                                setFieldValue(
                                                    MinidialogFormField.vedlegg,
                                                    deleteAttachment(values.vedlegg!, file),
                                                );
                                            }}
                                        />
                                    </div>
                                ))}
                            </Block>
                        </Block>
                        <Block padBottom="xl" visible={brukerØnskerÅUttaleSeg === false}>
                            <div className="blokk-xs">
                                <GuidePanel>{intlUtils(intl, 'minidialog.tilbakekreving.veilederpanel')}</GuidePanel>
                            </div>
                        </Block>

                        <Block padBottom="l" visible={values.brukerØnskerÅUttaleSeg !== YesOrNo.UNANSWERED}>
                            <Button
                                type="submit"
                                loading={isSendingEttersendelse || finnesPendingVedlegg}
                                disabled={isSendingEttersendelse || finnesPendingVedlegg}
                            >
                                {intlUtils(intl, 'miniDialog.tilbakekreving.sendButton')}
                            </Button>
                        </Block>
                    </MinidialogFormComponents.Form>
                );
            }}
        />
    );
};

export default MinidialogSkjema;
