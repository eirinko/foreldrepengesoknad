import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import JaNeiSpørsmål from '../components/ja-nei-spørsm\u00E5l/JaNeiSpørsm\u00E5l';

interface SkalBoINorgeNeste12MndSpørsmålProps {
    iNorgeNeste12?: boolean;
    onChange: (iNorgeSiste12: boolean) => void;
}

type Props = SkalBoINorgeNeste12MndSpørsmålProps & InjectedIntlProps;

const SkalBoINorgeNeste12MndSpørsmål = (props: Props) => {
    const { onChange, iNorgeNeste12, intl } = props;

    return (
        <JaNeiSpørsmål
            spørsmål={getMessage(intl, 'iNorgeNeste12Mnd.spørsmål')}
            navn="iNorgeNeste12Mnd"
            valgtVerdi={iNorgeNeste12}
            labels={{
                ja: getMessage(intl, 'iNorgeNeste12Mnd.alternativ.boINorge'),
                nei: getMessage(intl, 'iNorgeNeste12Mnd.alternativ.boIUtlandet')
            }}
            onChange={(verdi) => onChange(verdi)}
        />
    );
};

export default injectIntl(SkalBoINorgeNeste12MndSpørsmål);
