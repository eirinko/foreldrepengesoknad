import * as React from 'react';
import { periodelisteBem } from '../Periodeliste';
import PeriodeFargestrek from '../../periode-fargestrek/PeriodeFargestrek';
import { UttaksplanColor } from '../../../types/uttaksplan/colors';

export interface Props {
    isExpanded?: boolean;
    farge: UttaksplanColor | undefined;
}

const PeriodelisteItemWrapper: React.StatelessComponent<Props> = ({ isExpanded, farge, children }) => {
    const bem = periodelisteBem.child('item');
    return (
        <div
            className={bem.classNames(
                bem.block,
                bem.modifierConditional('expanded', isExpanded),
                bem.modifierConditional(farge, farge !== undefined)
            )}>
            <PeriodeFargestrek farge={farge} />
            {children}
        </div>
    );
};

export default PeriodelisteItemWrapper;
