import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { MorsAktivitet } from '../types/uttaksplan/periodetyper';
import Select from 'common/components/skjema/wrappers/Select';
import getMessage from 'common/util/i18nUtils';
import { SelectChangeEvent } from '../types/dom/Events';
import { NavnPåForeldre } from 'common/types';
import Block from 'common/components/block/Block';
import Veilederinfo from 'common/components/veileder-info/Veilederinfo';

interface HvaSkalMorGjøreSpørsmålProps {
    morsAktivitetIPerioden?: MorsAktivitet;
    navnPåForeldre: NavnPåForeldre;
    onChange: (morsAktivitetIPerioden: MorsAktivitet) => void;
}

type Props = HvaSkalMorGjøreSpørsmålProps & InjectedIntlProps;

class HvaSkalMorGjøreSpørsmål extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.renderOptions = this.renderOptions.bind(this);
    }

    getVeilederTekst() {
        const { morsAktivitetIPerioden, navnPåForeldre, intl } = this.props;

        if (morsAktivitetIPerioden === MorsAktivitet.Arbeid) {
            return (
                <FormattedMessage
                    id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.arbeid"
                    values={{ navnMor: navnPåForeldre.mor }}
                />
            );
        } else if (morsAktivitetIPerioden === MorsAktivitet.ArbeidOgUtdanning) {
            return <FormattedMessage id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.arbeidOgUtdanning" />;
        } else if (morsAktivitetIPerioden === MorsAktivitet.Innlagt) {
            return <FormattedMessage id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.innlagt" />;
        } else if (morsAktivitetIPerioden === MorsAktivitet.Introduksjonsprogrammet) {
            return (
                <FormattedMessage
                    id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.introduksjonsprogrammet"
                    values={{ navnMor: navnPåForeldre.mor }}
                />
            );
        } else if (morsAktivitetIPerioden === MorsAktivitet.Kvalifiseringsprogrammet) {
            return (
                <FormattedMessage
                    id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.kvalifiseringsprogrammet"
                    values={{ navnMor: navnPåForeldre.mor }}
                />
            );
        } else if (morsAktivitetIPerioden === MorsAktivitet.TrengerHjelp) {
            return (
                <FormattedMessage
                    id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.trengerhjelp"
                    values={{ navnMor: navnPåForeldre.mor }}
                />
            );
        } else if (morsAktivitetIPerioden === MorsAktivitet.Utdanning) {
            const listData = [
                getMessage(intl, 'uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.utdanning.punkt1'),
                getMessage(intl, 'uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.utdanning.punkt2'),
                getMessage(intl, 'uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.utdanning.punkt3'),
                getMessage(intl, 'uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.utdanning.punkt4')
            ];

            return (
                <>
                    <FormattedMessage
                        id="uttaksplan.fellesdel.hvaSkalMorGjøre.veileder.utdanning"
                        values={{ navnMor: navnPåForeldre.mor }}
                    />
                    <ul>{listData.map((listItem, index) => <li key={`trengerhjelp${index}`}>{listItem}</li>)}</ul>
                </>
            );
        } else {
            return '';
        }
    }

    renderOptions() {
        const { intl } = this.props;
        return Object.keys(MorsAktivitet).map((aktivitetsid) => (
            <option value={MorsAktivitet[aktivitetsid]} key={MorsAktivitet[aktivitetsid]}>
                {getMessage(intl, `morsAktivitet.${aktivitetsid}`)}
            </option>
        ));
    }
    render() {
        const { intl, navnPåForeldre, morsAktivitetIPerioden, onChange } = this.props;
        const visVeileder = morsAktivitetIPerioden !== undefined && morsAktivitetIPerioden.length > 0;
        return (
            <>
                <Block margin={visVeileder ? 's' : 'm'}>
                    <Select
                        value={morsAktivitetIPerioden}
                        name="hvaSkalMorGjøre.spørsmål"
                        label={getMessage(intl, 'uttaksplan.fellesdel.hvaSkalMorGjøre.spørsmål', {
                            navnMor: navnPåForeldre.mor
                        })}
                        onChange={(e: SelectChangeEvent) => onChange(e.target.value as MorsAktivitet)}
                        validators={[
                            {
                                test: () => morsAktivitetIPerioden !== undefined && morsAktivitetIPerioden.length > 0,
                                failText: getMessage(intl, 'påkrevd')
                            }
                        ]}>
                        <option value="" />
                        {this.renderOptions()}
                    </Select>
                </Block>
                <Block visible={visVeileder} margin="none">
                    <Veilederinfo>{this.getVeilederTekst()}</Veilederinfo>
                </Block>
            </>
        );
    }
}

export default injectIntl(HvaSkalMorGjøreSpørsmål);
