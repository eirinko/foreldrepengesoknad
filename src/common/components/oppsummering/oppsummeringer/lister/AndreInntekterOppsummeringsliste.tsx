import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import { formatDate } from '../../../../../app/util/dates/dates';
import Oppsummeringsliste from 'common/components/oppsummeringsliste/Oppsummeringsliste';
import { AnnenInntekt } from '../../../../../app/types/søknad/AnnenInntekt';
import AnnenInntektDetaljer from 'common/components/oppsummering/oppsummeringer/detaljer/AnnenInntektDetaljer';

interface AndreInntekterOppsummeringslisteProps {
    andreInntekter: AnnenInntekt[];
}

type Props = AndreInntekterOppsummeringslisteProps & InjectedIntlProps;

class AndreInntekterOppsummeringsliste extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modalIsOpen: false
        };

        this.createOppsummeringslisteData = this.createOppsummeringslisteData.bind(this);
        this.createOppsummeringslisteelementData = this.createOppsummeringslisteelementData.bind(this);
    }

    createOppsummeringslisteData() {
        const { andreInntekter } = this.props;
        return andreInntekter.map((annenInntekt) => this.createOppsummeringslisteelementData(annenInntekt));
    }

    createOppsummeringslisteelementData(annenInntekt: AnnenInntekt) {
        const { intl } = this.props;
        const { type, tidsperiode, pågående } = annenInntekt;
        return {
            venstrestiltTekst: getMessage(intl, `inntektstype.${type.toLowerCase()}`),
            høyrestiltTekst: getMessage(intl, 'tidsintervall', {
                fom: formatDate(tidsperiode.fom),
                tom: pågående ? 'pågående' : formatDate(tidsperiode.tom)
            }),
            content: <AnnenInntektDetaljer annenInntekt={annenInntekt} />
        };
    }

    render() {
        return <Oppsummeringsliste data={this.createOppsummeringslisteData()} />;
    }
}

export default injectIntl(AndreInntekterOppsummeringsliste);
