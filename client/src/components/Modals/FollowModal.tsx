import React from 'react';
import { Link } from 'react-router-dom';

type FollowModalProps = {
    closeModal: () => void;
    title: string;
    userId: string;
    users: any[];
    modalContent: string | null;
};

const FollowModal: React.FC<FollowModalProps> = ({
    closeModal,
    title,
    userId,
    users,
}) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>
                                <Link to={`/searchUser/${user.id}`}>
                                    <div className="follow-modal-user-item">
                                        <div className="follow-modal-img-wrap">
                                            {user.profileImgPath ? (
                                                <img
                                                    className="follow-modal-profile"
                                                    src={`${process.env.REACT_APP_SERVERURL}${user.profileImgPath}`}
                                                    alt={user.name}
                                                />
                                            ) : (
                                                <div className="follow-modal-profile follow-modal-profile--empty" />
                                            )}
                                            {user.nation && (
                                                <img
                                                    className="follow-modal-flag"
                                                    src={`/images/flag/${user.nation}.png`}
                                                    alt={user.nation}
                                                />
                                            )}
                                        </div>
                                        <span className="follow-modal-name">
                                            {user.name}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FollowModal;
