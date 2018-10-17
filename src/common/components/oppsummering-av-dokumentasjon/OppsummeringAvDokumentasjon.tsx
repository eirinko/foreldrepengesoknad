import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import KompleksFeltoppsummering from 'common/components/kompleks-feltoppsummering/KompleksFeltoppsummering';
import EtikettBase from 'nav-frontend-etiketter';
import getMessage from 'common/util/i18nUtils';
import './oppsummeringAvDokumentasjon.less';
import { Attachment } from 'common/storage/attachment/types/Attachment';
import Lenke from 'nav-frontend-lenker';

interface OppsummeringAvDokumentasjonProps {
    ledetekst?: string;
    vedlegg: Attachment[];
}

type Props = OppsummeringAvDokumentasjonProps & InjectedIntlProps;

class OppsummeringAvDokumentasjon extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.renderListOfAttachmentPreviewLinks = this.renderListOfAttachmentPreviewLinks.bind(this);
    }

    renderListOfAttachmentPreviewLinks() {
        const { vedlegg } = this.props;
        return vedlegg.map(({ url, id, filename }) => (
            <Lenke href={url!} key={id} target="_blank">
                {filename}
            </Lenke>
        ));
    }

    render() {
        const { ledetekst, vedlegg, intl } = this.props;

        return (
            <KompleksFeltoppsummering
                className="oppsummeringAvDokumentasjon"
                ledetekst={ledetekst || getMessage(intl, 'vedlagtdokumentasjon')}>
                {vedlegg && vedlegg.length > 0 ? (
                    this.renderListOfAttachmentPreviewLinks()
                ) : (
                    <EtikettBase type="fokus">{getMessage(intl, 'dokumentasjon.mangler')}</EtikettBase>
                )}
            </KompleksFeltoppsummering>
        );
    }
}

export default injectIntl(OppsummeringAvDokumentasjon);
