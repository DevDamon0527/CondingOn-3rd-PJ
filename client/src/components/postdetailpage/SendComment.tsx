import React, { useState, ChangeEvent } from 'react';
import '../../styles/PostDetailSendComment.scss';

interface SendCommentProps {
    onSendComment: (content: string) => void;
    postUserId: string;
}

const SendComment: React.FC<SendCommentProps> = ({ onSendComment }) => {
    const [comment, setComment] = useState('');

    const handleSendComment = () => {
        if (comment.trim() !== '') {
            onSendComment(comment);

            setComment('');
        }
    };

    return (
        <div className="entire-comment-container">
            <div className="send-comment-container">
                <input
                    type="text"
                    placeholder="댓글을 입력하세요..."
                    value={comment}
                    className="type-comment"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setComment(e.target.value)
                    }
                />
                <div className="send-comment" onClick={handleSendComment}></div>
            </div>
        </div>
    );
};

export default SendComment;
