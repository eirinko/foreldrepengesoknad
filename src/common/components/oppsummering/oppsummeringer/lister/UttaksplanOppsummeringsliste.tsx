import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import Oppsummeringsliste, {
    OppsummeringslisteelementProps
} from 'common/components/oppsummeringsliste/Oppsummeringsliste';
import {
    Overføringsperiode,
    Periode,
    Periodetype,
    StønadskontoType,
    Utsettelsesperiode,
    Uttaksperiode,
    Oppholdsperiode
} from '../../../../../app/types/uttaksplan/periodetyper';
import getMessage from 'common/util/i18nUtils';
import { formatDate } from '../../../../../app/util/dates/dates';
import Uttaksperiodedetaljer from 'common/components/oppsummering/oppsummeringer/detaljer/Uttaksperiodedetaljer';
import Utsettelsesperiodedetaljer from 'common/components/oppsummering/oppsummeringer/detaljer/Utsettelsesperiodedetaljer';
import Overføringsperiodedetaljer from 'common/components/oppsummering/oppsummeringer/detaljer/Overføringsperiodedetaljer';
import { NavnPåForeldre, Tidsperiode } from 'common/types';
import { getStønadskontoNavn, getPeriodeTittel } from '../../../../../app/util/uttaksplan';
import Arbeidsforhold from '../../../../../app/types/Arbeidsforhold';
import { UttaksplanValideringState } from 'app/redux/reducers/uttaksplanValideringReducer';
import AnnenForelder from '../../../../../app/types/søknad/AnnenForelder';
import { Tilleggsopplysning, Opplysning } from 'app/types/søknad/Søknad';
import { Attachment } from 'common/storage/attachment/types/Attachment';
import Feltoppsummering from 'common/components/feltoppsummering/Feltoppsummering';
import OppsummeringAvDokumentasjon from 'common/components/oppsummering-av-dokumentasjon/OppsummeringAvDokumentasjon';
import {
    beskrivTilleggsopplysning,
    TilleggsopplysningMedBeskrivelse
} from 'app/util/cleanup/stringifyTilleggsopplysninger';
import { Søknadsinfo } from 'app/selectors/types';
import { finnesPeriodeIOpprinneligPlan } from 'app/util/uttaksplan/uttaksplanEndringUtil';

interface UttaksplanOppsummeringslisteProps {
    perioder: Periode[];
    navnPåForeldre: NavnPåForeldre;
    erFarEllerMedmor: boolean;
    registrerteArbeidsforhold: Arbeidsforhold[];
    uttaksplanValidering: UttaksplanValideringState;
    annenForelder: AnnenForelder;
    begrunnelseForSenEndring?: Tilleggsopplysning;
    begrunnelseForSenEndringVedlegg?: Attachment[];
    søknadsinfo: Søknadsinfo;
    eksisterendeUttaksplan?: Periode[];
}

type Props = UttaksplanOppsummeringslisteProps & InjectedIntlProps;

class UttaksplanOppsummeringsliste extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.createOppsummeringslisteData = this.createOppsummeringslisteData.bind(this);
        this.createOppsummeringslisteelementProps = this.createOppsummeringslisteelementProps.bind(this);
        this.createOppsummeringslisteelementPropsForUttaksperiode = this.createOppsummeringslisteelementPropsForUttaksperiode.bind(
            this
        );
        this.createOppsummeringslisteelementPropsForUtsettelsesperiode = this.createOppsummeringslisteelementPropsForUtsettelsesperiode.bind(
            this
        );
        this.createOppsummeringslisteelementPropsForOverføringsperiode = this.createOppsummeringslisteelementPropsForOverføringsperiode.bind(
            this
        );
        this.createOppsummeringslisteelementPropsForBegrunnelseForSenEndring = this.createOppsummeringslisteelementPropsForBegrunnelseForSenEndring.bind(
            this
        );
        this.formatTidsperiode = this.formatTidsperiode.bind(this);
        this.getStønadskontoNavnFromKonto = this.getStønadskontoNavnFromKonto.bind(this);
    }

    createOppsummeringslisteData(): OppsummeringslisteelementProps[] {
        const { perioder, eksisterendeUttaksplan } = this.props;
        const periodeliste = perioder
            .map((periode) => this.createOppsummeringslisteelementProps(periode, eksisterendeUttaksplan))
            .filter((v) => v !== null) as OppsummeringslisteelementProps[];

        if (this.props.begrunnelseForSenEndring) {
            const begrunnelse = beskrivTilleggsopplysning(
                Opplysning.BEGRUNNELSE_FOR_SEN_ENDRING,
                this.props.begrunnelseForSenEndring,
                this.props.intl
            );

            return periodeliste.concat(
                this.createOppsummeringslisteelementPropsForBegrunnelseForSenEndring(begrunnelse)
            );
        }

        return periodeliste;
    }

    createOppsummeringslisteelementProps(periode: Periode, eksisterendeUttaksplan?: Periode[]) {
        const periodeErNyEllerEndret = eksisterendeUttaksplan
            ? finnesPeriodeIOpprinneligPlan(periode, eksisterendeUttaksplan) === false
            : true;
        switch (periode.type) {
            case Periodetype.Uttak:
                return this.createOppsummeringslisteelementPropsForUttaksperiode(periode, periodeErNyEllerEndret);
            case Periodetype.Utsettelse:
                return this.createOppsummeringslisteelementPropsForUtsettelsesperiode(periode, periodeErNyEllerEndret);
            case Periodetype.Overføring:
                return this.createOppsummeringslisteelementPropsForOverføringsperiode(periode, periodeErNyEllerEndret);
            case Periodetype.Opphold:
                return this.createOppsummeringslisteelementPropsForOppholdsperiode(periode);
            default:
                return null;
        }
    }

    createOppsummeringslisteelementPropsForUttaksperiode(
        periode: Uttaksperiode,
        periodeErNyEllerEndret: boolean = true
    ) {
        const { registrerteArbeidsforhold } = this.props;
        return {
            venstrestiltTekst: this.getStønadskontoNavnFromKonto(periode.konto),
            høyrestiltTekst: this.formatTidsperiode(periode.tidsperiode),
            content: (
                <Uttaksperiodedetaljer
                    periode={periode}
                    registrerteArbeidsforhold={registrerteArbeidsforhold}
                    periodeErNyEllerEndret={periodeErNyEllerEndret}
                />
            )
        };
    }

    createOppsummeringslisteelementPropsForOppholdsperiode(periode: Oppholdsperiode) {
        return {
            venstrestiltTekst: getPeriodeTittel(this.props.intl, periode, this.props.søknadsinfo.navn.navnPåForeldre),
            høyrestiltTekst: this.formatTidsperiode(periode.tidsperiode)
        };
    }

    createOppsummeringslisteelementPropsForUtsettelsesperiode(
        periode: Utsettelsesperiode,
        periodeErNyEllerEndret: boolean
    ) {
        const { registrerteArbeidsforhold, søknadsinfo, intl } = this.props;
        return {
            venstrestiltTekst: getMessage(intl, 'oppsummering.utsettelse.pga'),
            høyrestiltTekst: this.formatTidsperiode(periode.tidsperiode),
            content: (
                <Utsettelsesperiodedetaljer
                    periode={periode}
                    registrerteArbeidsforhold={registrerteArbeidsforhold}
                    søknadsinfo={søknadsinfo}
                    periodeErNyEllerEndret={periodeErNyEllerEndret}
                />
            )
        };
    }

    createOppsummeringslisteelementPropsForOverføringsperiode(
        periode: Overføringsperiode,
        periodeErNyEllerEndret: boolean
    ) {
        const { navnPåForeldre, erFarEllerMedmor, intl } = this.props;
        const kontonavn = this.getStønadskontoNavnFromKonto(periode.konto);
        return {
            venstrestiltTekst: getMessage(intl, 'oppsummering.overtakelse.pga', {
                konto: kontonavn
            }),
            høyrestiltTekst: this.formatTidsperiode(periode.tidsperiode),
            content: (
                <Overføringsperiodedetaljer
                    periode={periode}
                    navnPåForeldre={navnPåForeldre}
                    erFarEllerMedmor={erFarEllerMedmor}
                    periodeErNyEllerEndret={periodeErNyEllerEndret}
                />
            )
        };
    }

    createOppsummeringslisteelementPropsForBegrunnelseForSenEndring(begrunnelse: TilleggsopplysningMedBeskrivelse) {
        return {
            venstrestiltTekst: begrunnelse.beskrivelse,
            høyrestiltTekst: '',
            content: (
                <>
                    <Feltoppsummering
                        feltnavn={
                            begrunnelse.ekstraInformasjon ||
                            getMessage(this.props.intl, 'oppsummering.uttak.begrunnelseForSenEndring.defaultLabel')
                        }
                        verdi={begrunnelse.tekst}
                    />
                    {this.props.begrunnelseForSenEndringVedlegg && (
                        <OppsummeringAvDokumentasjon vedlegg={this.props.begrunnelseForSenEndringVedlegg || []} />
                    )}
                </>
            )
        };
    }

    getStønadskontoNavnFromKonto(konto: StønadskontoType) {
        const { navnPåForeldre, intl } = this.props;
        return getStønadskontoNavn(intl, konto, navnPåForeldre);
    }

    formatTidsperiode(tidsperiode: Tidsperiode) {
        const { intl } = this.props;
        return getMessage(intl, 'tidsintervall', {
            fom: formatDate(tidsperiode.fom),
            tom: formatDate(tidsperiode.tom)
        });
    }

    render() {
        return <Oppsummeringsliste data={this.createOppsummeringslisteData()} />;
    }
}

export default injectIntl(UttaksplanOppsummeringsliste);
