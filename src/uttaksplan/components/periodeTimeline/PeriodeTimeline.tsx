import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import Timeline from 'uttaksplan/components/timeline/Timeline';
import { Periode, Dekningsgrad } from 'uttaksplan/types';
import {
    TimelineItem,
    TimelineItemType
} from 'uttaksplan/components/timeline/types';
import UttaksplanIkon, {
    UttaksplanIkonKeys
} from 'uttaksplan/components/uttaksplanIkon/UttaksplanIkon';
import {
    mapPeriodeToTimelineEvent,
    sortTimelineItems,
    getFamiliehendelseMarker,
    getSistePermisjonsdagMarker,
    getGaps
} from './periodeTimelineUtils';

import './periodeTimeline.less';
import { isSameDay, isBefore } from 'date-fns';
import UkerOgDager from 'common/components/uker-og-dager/UkerOgDager';
import TidsperiodeTekst from 'uttaksplan/components/tidsperiodeTekst/TidsperiodeTekst';
import { Uttaksgrunnlag } from 'uttaksplan/utils/uttak/uttaksgrunnlag';
import { Uttaksinfo } from 'uttaksplan/utils/uttak/uttaksinfo';

export interface OwnProps {
    familiehendelsedato: Date;
    dekningsgrad: Dekningsgrad;
    perioder: Periode[];
    uttaksgrunnlag: Uttaksgrunnlag;
    uttaksinfo: Uttaksinfo;
    onPeriodeClick: (periode: Periode) => void;
}

type Props = OwnProps & InjectedIntlProps;

class PeriodeTidslinje extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
    }

    handleItemClick(item: TimelineItem) {
        if (item.type === TimelineItemType.event) {
            const periode = item.data as Periode;
            this.props.onPeriodeClick(periode);
        }
    }

    render() {
        const {
            familiehendelsedato,
            perioder,
            uttaksgrunnlag,
            uttaksinfo,
            intl
        } = this.props;
        const items = perioder.map((periode) =>
            mapPeriodeToTimelineEvent(periode, intl, uttaksgrunnlag)
        );
        items.push(
            getFamiliehendelseMarker(
                familiehendelsedato,
                uttaksgrunnlag.erBarnetFødt
            )
        );
        items.sort(sortTimelineItems).map((item, idx, arr) => {
            if (idx > 0) {
                const prevItem = arr[idx];
                if (prevItem.type === TimelineItemType.event) {
                    if (
                        isBefore(item.startDate, prevItem.endDate) ||
                        isSameDay(item.startDate, prevItem.endDate)
                    ) {
                        return {
                            ...item,
                            error: 'Overlappende perioder'
                        };
                    }
                }
            }
            return item;
        });

        const sistePermisjonsdag = uttaksinfo.sluttdatoGittUttaksdager;
        if (sistePermisjonsdag) {
            items.push(getSistePermisjonsdagMarker(sistePermisjonsdag));
        }
        return (
            <Timeline
                items={getGaps(items)}
                iconRenderer={(icon) => (
                    <UttaksplanIkon ikon={icon as UttaksplanIkonKeys} />
                )}
                onItemClick={(item: TimelineItem) => {
                    this.handleItemClick(item);
                }}
                durationRenderer={(dager: number) => (
                    <UkerOgDager dager={dager} />
                )}
                rangeRenderer={(fom: Date, tom: Date) => (
                    <TidsperiodeTekst
                        tidsperiode={{
                            fom,
                            tom
                        }}
                        visSluttdato={true}
                        visUkedag={true}
                    />
                )}
            />
        );
    }
}
export default injectIntl(PeriodeTidslinje);
