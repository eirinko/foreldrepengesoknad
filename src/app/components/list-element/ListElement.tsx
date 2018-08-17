import * as React from 'react';
import Normaltekst from 'nav-frontend-typografi/lib/normaltekst';
import CustomSVG from 'common/components/custom-svg/CustomSVG';
import BEMHelper from 'common/util/bem';
import { default as Etikett, EtikettBaseProps } from 'nav-frontend-etiketter';

const pencil = require('./pencil.svg').default;

interface ListElementProps {
    title: string;
    text: string;
    deleteLinkText: string;
    etikettProps?: EtikettBaseProps;
    onEdit: () => void;
    onDelete: () => void;
}

const cls = BEMHelper('listElement');

export default class ListElement extends React.Component<ListElementProps> {
    render() {
        const {
            title,
            text,
            deleteLinkText,
            etikettProps,
            onDelete,
            onEdit
        } = this.props;
        return (
            <li className={cls.className}>
                <div className={cls.element('top')}>
                    <Normaltekst className="title">{title}</Normaltekst>
                    <button
                        onClick={onEdit}
                        {...{ 'aria-label': 'Rediger' }}
                        type="button">
                        <CustomSVG iconRef={pencil} size={24} />
                    </button>
                </div>
                <Normaltekst className={cls.element('text')}>
                    {text}
                </Normaltekst>
                <div className={cls.element('bottom')}>
                    {etikettProps !== undefined && (
                        <Etikett {...etikettProps} />
                    )}
                    <button
                        className="listElement__bottom__slettKnapp"
                        onClick={onDelete}
                        type="button">
                        {deleteLinkText}
                    </button>
                </div>
            </li>
        );
    }
}
