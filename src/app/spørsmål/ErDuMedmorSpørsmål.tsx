import * as React from 'react';
import Bolk from '../components/layout/Bolk';
import RadioPanelGruppeResponsive from '../components/radio-panel-gruppe-responsive/RadioPanelGruppeResponsive';
import { SøkerRolle } from '../types/søknad/Søknad';

interface MedmorBolkProps {
    erMedmor: string;
    onChange: (
        erMedmor: SøkerRolle,
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
}

const ErDuMedmorSpørsmål = (props: MedmorBolkProps) => {
    const { onChange, erMedmor, ...otherProps } = props;
    return (
        <RadioPanelGruppeResponsive
            checked={erMedmor}
            legend="Er du medmor?"
            radios={[
                { label: 'Ja', value: SøkerRolle.MEDMOR },
                { label: 'Nei', value: SøkerRolle.MOR }
            ]}
            name="erMedmor"
            onChange={(e: React.ChangeEvent<HTMLInputElement>, v: SøkerRolle) =>
                onChange(v, e)
            }
            {...otherProps}
        />
    );
};

export default (props: MedmorBolkProps) => (
    <Bolk render={() => <ErDuMedmorSpørsmål {...props} />} />
);
