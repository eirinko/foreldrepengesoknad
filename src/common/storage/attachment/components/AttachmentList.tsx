import * as React from 'react';
import AttachmentComponent from './Attachment';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './attachment.less';
import { Attachment } from 'common/storage/attachment/types/Attachment';

interface Props {
    attachments: Attachment[];
    showFileSize?: boolean;
    onDelete?: (file: Attachment) => void;
}

const AttachmentList: React.StatelessComponent<Props> = (props) => {
    const { attachments, showFileSize, onDelete } = props;
    return (
        <ul className="attachmentListe">
            <TransitionGroup>
                {attachments.map((attachment, index) => (
                    <CSSTransition
                        classNames="transitionFade"
                        timeout={500}
                        key={index}>
                        <li>
                            <AttachmentComponent
                                attachment={attachment}
                                onDelete={onDelete}
                                visFilstørrelse={showFileSize}
                            />
                        </li>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </ul>
    );
};
export default AttachmentList;
