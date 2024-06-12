import { FileContent } from '@navikt/ds-icons';
import { BodyShort, Link } from '@navikt/ds-react';

import { bemUtils, formatDateExtended } from '@navikt/fp-utils';

import DokumentAvsender from 'app/components/dokument-avsender/DokumentAvsender';
import { Dokument as DokumentType } from 'app/types/Dokument';
import { lagUrl } from 'app/utils/dokumenterUtils';

import './dokument.css';

interface Props {
    dokument: DokumentType;
}

const Dokument: React.FunctionComponent<Props> = ({ dokument }) => {
    const bem = bemUtils('dokument');
    const { tittel, type, mottatt } = dokument;
    const url = lagUrl(dokument);

    return (
        <div className={bem.block}>
            <div className={bem.element('content-top')}>
                <FileContent className={bem.element('ikon')} height={24} width={24} aria-hidden={true} />
                <div className={bem.element('link-icon')}>
                    <Link href={url} target="_blank">
                        {tittel}
                    </Link>
                </div>
            </div>
            <div className={bem.element('content-bottom')}>
                <DokumentAvsender type={type} />
                <BodyShort>{formatDateExtended(mottatt)}</BodyShort>
            </div>
        </div>
    );
};

export default Dokument;
