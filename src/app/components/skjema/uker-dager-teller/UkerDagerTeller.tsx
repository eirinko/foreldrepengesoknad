import * as React from 'react';
import { SkjemaGruppe, Fieldset } from 'nav-frontend-skjema';
import NumberStepper, { Props as NumberStepperProps } from '../number-stepper/NumberStepper';
import { Feil } from 'common/components/skjema/elements/skjema-input-element/types';
import Block from 'common/components/block/Block';
import BEMHelper from 'common/util/bem';

import './ukerDagerTeller.less';

export interface Props {
    ukeLegend: string;
    dagLegend: string;
    feil?: Feil;
    ukeStepper: NumberStepperProps;
    dagStepper: NumberStepperProps;
}

const UkerDagerTeller: React.StatelessComponent<Props> = (props) => {
    const { ukeLegend, dagLegend, feil, ukeStepper, dagStepper } = props;
    const bem = BEMHelper('ukerDagerTeller');
    return (
        <SkjemaGruppe feil={feil}>
            <div className={bem.block}>
                <div className={bem.element('ukerFelt')}>
                    <Block margin="xxs">
                        <Fieldset legend={ukeLegend}>
                            <NumberStepper {...ukeStepper} />
                        </Fieldset>
                    </Block>
                </div>
                <Fieldset legend={dagLegend}>
                    <NumberStepper {...dagStepper} />
                </Fieldset>
            </div>
        </SkjemaGruppe>
    );
};

export default UkerDagerTeller;
