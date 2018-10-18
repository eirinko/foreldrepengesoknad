import * as React from 'react';
import { Knapp } from 'nav-frontend-knapper';
import { UtenlandsoppholdType, Utenlandsopphold } from '../../types/søknad/InformasjonOmUtenlandsopphold';
import UtenlandsoppholdModal, {
    UtenlandsoppholdModalPropsPartial
} from '../../components/utenlandsopphold-modal/UtenlandsoppholdModal';
import Block from 'common/components/block/Block';
import List from '../../components/list/List';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import OppholdListElement from './OppholdListElement';
import getMessage from 'common/util/i18nUtils';

interface UtenlandsoppholdBolkProps {
    renderSpørsmål: () => JSX.Element;
    showUtenlandsoppholdContent: boolean;
    opphold: Utenlandsopphold[];
    oppholdType: UtenlandsoppholdType;
    onChange: (perioder: Utenlandsopphold[]) => void;
    utenlandsoppholdModalProps?: UtenlandsoppholdModalPropsPartial;
}

interface UtenlandsoppholdBolkState {
    modalIsOpen: boolean;
    oppholdToEdit?: Utenlandsopphold;
    oppholdIndex?: number;
}

type Props = UtenlandsoppholdBolkProps & InjectedIntlProps;

type UtenlandsoppholdBolkStatePartial = Partial<UtenlandsoppholdBolkState>;

class UtenlandsoppholdBolk extends React.Component<Props, UtenlandsoppholdBolkState> {
    constructor(props: Props) {
        super(props);

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onOppholdDelete = this.onOppholdDelete.bind(this);
        this.onOppholdSelect = this.onOppholdSelect.bind(this);

        this.state = {
            modalIsOpen: false
        };
    }

    onAdd(oppholdToAdd: Utenlandsopphold) {
        const { opphold, onChange } = this.props;
        onChange([...opphold, oppholdToAdd]);
        this.closeModal();
    }

    onEdit(oppholdToEdit: Utenlandsopphold) {
        const { opphold, onChange } = this.props;
        const { oppholdIndex } = this.state;
        const editedOppholdList = opphold.slice();
        if (oppholdIndex !== undefined && oppholdIndex >= 0) {
            editedOppholdList[oppholdIndex] = oppholdToEdit;
            onChange(editedOppholdList);
        }
        this.closeModal();
    }

    onOppholdDelete(oppholdToDelete: Utenlandsopphold) {
        const { opphold, onChange } = this.props;
        const editedPerioder = opphold.slice();
        editedPerioder.splice(editedPerioder.indexOf(oppholdToDelete), 1);
        onChange(editedPerioder);
    }

    onOppholdSelect(oppholdToEdit: Utenlandsopphold, oppholdIndex: number) {
        this.openModal({
            oppholdToEdit,
            oppholdIndex
        });
    }

    openModal(otherState: UtenlandsoppholdBolkStatePartial = {}) {
        this.setState({
            ...otherState,
            modalIsOpen: true
        });
    }

    closeModal() {
        this.setState({
            oppholdToEdit: undefined,
            oppholdIndex: undefined,
            modalIsOpen: false
        });
    }

    render() {
        const {
            renderSpørsmål,
            showUtenlandsoppholdContent,
            opphold,
            oppholdType,
            utenlandsoppholdModalProps,
            intl
        } = this.props;
        const { oppholdToEdit } = this.state;

        return (
            <>
                {renderSpørsmål()}
                {showUtenlandsoppholdContent && (
                    <>
                        <Block margin="xs" visible={opphold && opphold.length > 0}>
                            <List
                                data={opphold}
                                renderElement={(oppholdToRender: Utenlandsopphold, index: number) => (
                                    <OppholdListElement
                                        opphold={oppholdToRender}
                                        onEdit={() => this.onOppholdSelect(oppholdToRender, index)}
                                        onDelete={() => this.onOppholdDelete(oppholdToRender)}
                                        key={JSON.stringify(oppholdToRender)}
                                    />
                                )}
                            />
                        </Block>
                        <Block margin="l">
                            <Knapp onClick={() => this.openModal()} htmlType="button">
                                <FormattedMessage id="utenlandsopphold.leggTilLand" />
                            </Knapp>
                        </Block>
                    </>
                )}

                <UtenlandsoppholdModal
                    type={oppholdType}
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={() => this.closeModal()}
                    contentLabel={`Landvelger for ${oppholdType}`}
                    children={null}
                    oppholdToEdit={oppholdToEdit}
                    oppholdList={opphold}
                    onAdd={this.onAdd}
                    onEdit={this.onEdit}
                    {...utenlandsoppholdModalProps || {}}
                />
            </>
        );
    }
}

export default injectIntl(UtenlandsoppholdBolk);
