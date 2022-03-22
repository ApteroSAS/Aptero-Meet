import React from "react";
import PropTypes from "prop-types";
import "./UserProfileVisitCard.css";
import {FormattedMessage} from "react-intl";
import {ReactComponent as PhoneIcon} from "../icons/Phone.svg";
import {ReactComponent as AcountIcon} from "../icons/Acount.svg";
import {ReactComponent as EmailIcon} from "../icons/Email.svg";

export function UserProfileVisitCard({
                                         displayName,
                                         email,
                                         phoneNumber,
                                         jobTitle,
                                         profilePicture,
                                         isSignedIn
                                     }) {
    if (isSignedIn) {
        return (
            <div className='control-pane'>
                <div className="sample_container card_sample">

                    <div className="e-card e-custom-card">
                        <div className="e-card-header">

                            <div className="e-avatar e-avatar-circle">
                                {!profilePicture && (
                                    <AcountIcon className="acount-icon"/>
                                )}
                                {profilePicture && (
                                    <img src={profilePicture} className="avatar-image"/>)}
                            </div>
                            &nbsp;
                        </div>
                        <div className="e-card-header">
                            <div className="e-card-header-caption center">
                                <div className="e-card-header-title name">{displayName}</div>
                                <div className="e-card-sub-title">{jobTitle}</div>
                            </div>
                        </div>
                        <div className="e-card-content">
                            <div className="phone-number"><PhoneIcon className="icon-phone"/><span
                                className="phone-number-text">{phoneNumber ??
                                <FormattedMessage id="user-profile-visit-card-no-data"
                                                  defaultMessage="Information not provided"/>}</span></div>
                            <div className="email"><EmailIcon className="icon-phone"/><span
                                className="email-text">{email ??
                                <FormattedMessage id="user-profile-visit-card-no-data"
                                                  defaultMessage="Information not provided"/>
                            }</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <FormattedMessage id="user-profile-visit-card-no-data-found"
                                  defaultMessage="Unfortunately, the user has not provided information"/>
            </div>
        )
    }
}

UserProfileVisitCard.propTypes = {
    displayName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    jobTitle: PropTypes.string,
    companyName: PropTypes.string,
    profilePicture: PropTypes.string,
    avatarPreview: PropTypes.string,
    isSignedIn: PropTypes.bool

};
export default UserProfileVisitCard;
