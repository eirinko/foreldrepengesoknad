import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import Lenke from 'nav-frontend-lenker';
import { EtikettLiten, Ingress, Normaltekst } from 'nav-frontend-typografi';
import moment from 'moment';

import { Kvittering } from '../../types/Kvittering';
import Applikasjonsside from '../../components/applikasjon/applikasjonsside/Applikasjonsside';
import { apiActionCreators as api } from '../../redux/actions';
import KvitteringHeader from './components/KvitteringHeader';
import KvitteringSuksess from './components/KvitteringSuksess';
import StatusBoks from './components/StatusBoks';
import SøknadSendtSectionHeader from './components/SøknadSendtSectionHeader';

import { DispatchProps } from 'common/redux/types';
import getMessage from 'common/util/i18nUtils';
import BEMHelper from 'common/util/bem';
import Block from 'common/components/block/Block';
import { openPdfPreview } from 'common/util/pdfUtils';

import { MissingAttachment } from 'app/types/MissingAttachment';
import { Periodene } from 'app/util/uttaksplan/Periodene';

import { Søkerinfo } from 'app/types/søkerinfo';

import lenker from 'app/util/routing/lenker';
import { selectMissingAttachments } from 'app/selectors/attachmentsSelector';

import './søknadSendtSide.less';

interface StateProps {
    søkerinfo: Søkerinfo;
    kvittering: Kvittering;
    erEndringssøknad: boolean;
    missingAttachments: MissingAttachment[];
    behandlingsFrist: string;
}

type Props = StateProps & InjectedIntlProps & DispatchProps;
class SøknadSendtSide extends React.Component<Props> {
    componentWillMount(): void {
        if (!this.props.erEndringssøknad) {
            this.props.dispatch(api.sendStorageKvittering());
        }
    }

    render() {
        const { søkerinfo, kvittering, erEndringssøknad, intl } = this.props;
        const { person, arbeidsforhold } = søkerinfo;
        const cls = BEMHelper('søknadSendt');
        return (
            <Applikasjonsside visSøknadstittel={true}>
                <DocumentTitle title={getMessage(intl, 'dokument.tittel.søknadSendt')} />
                <div className={cls.block}>
                    <KvitteringHeader søker={person} kvittering={kvittering} />

                    <Block>
                        <KvitteringSuksess missingAttachments={this.props.missingAttachments} />
                    </Block>

                    {!erEndringssøknad && (
                        <>
                            <Block>
                                <SøknadSendtSectionHeader
                                    title={getMessage(intl, 'søknadSendt.når.tittel')}
                                    type="kalender"
                                    info={getMessage(intl, 'søknadSendt.når.infoBox')}>
                                    {this.props.behandlingsFrist}
                                </SøknadSendtSectionHeader>
                            </Block>

                            {kvittering.infoskrivPdf &&
                                arbeidsforhold &&
                                arbeidsforhold.length > 0 && (
                                    <Block>
                                        <SøknadSendtSectionHeader
                                            title={getMessage(intl, 'søknadSendt.infoFraArbeidsgiver.tittel')}
                                            type="koffert"
                                            info={getMessage(intl, 'søknadSendt.infoFraArbeidsgiver.infoBox')}>
                                            <Lenke
                                                href={'#'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openPdfPreview(kvittering.infoskrivPdf);
                                                }}>
                                                <FormattedMessage id={'søknadSendt.infoFraArbeidsgiver'} />
                                            </Lenke>
                                        </SøknadSendtSectionHeader>
                                    </Block>
                                )}

                            <Block>
                                <SøknadSendtSectionHeader
                                    title={getMessage(intl, 'søknadSendt.pengene.tittel')}
                                    type="cash"
                                    info={getMessage(intl, 'søknadSendt.pengene.infoBox')}>
                                    {person.bankkonto && person.bankkonto.kontonummer ? (
                                        <>
                                            <Block margin="none">
                                                <EtikettLiten>
                                                    <FormattedMessage id="søknadSendt.pengene.kontonummer" />
                                                </EtikettLiten>
                                            </Block>
                                            <Block margin="xxs">
                                                <Ingress>{person.bankkonto && person.bankkonto.kontonummer}</Ingress>
                                            </Block>
                                            <Block margin="none">
                                                <Lenke href={lenker.brukerprofil}>
                                                    <FormattedMessage id="søknadSendt.pengene.kontonummer.endre" />
                                                </Lenke>
                                            </Block>
                                        </>
                                    ) : (
                                        <>
                                            <Block margin="xxs">
                                                <Normaltekst>
                                                    <FormattedMessage id="søknadSendt.pengene.ingenKontonummer" />
                                                </Normaltekst>
                                            </Block>
                                            <Block margin="none">
                                                <Lenke href={lenker.brukerprofil}>
                                                    <FormattedMessage id="søknadSendt.pengene.kontonummer.leggTil" />
                                                </Lenke>
                                            </Block>
                                        </>
                                    )}
                                </SøknadSendtSectionHeader>
                            </Block>
                        </>
                    )}

                    <StatusBoks saksNr={kvittering.saksNr} />
                </div>
            </Applikasjonsside>
        );
    }
}

const mapStateToProps = (state: any) => {
    const førsteUttaksdag = Periodene(state.søknad.uttaksplan).getFørsteUttaksdag();
    return {
        søkerinfo: state.api.søkerinfo,
        kvittering: state.api.kvittering,
        erEndringssøknad: state.søknad.erEndringssøknad,
        missingAttachments: selectMissingAttachments(state),
        behandlingsFrist: moment(førsteUttaksdag)
            .subtract(4, 'weeks')
            .format('dddd Do MMM YYYY')
    };
};

export default connect<StateProps>(mapStateToProps)(injectIntl(SøknadSendtSide));
