import React, { useState, useEffect } from "react";
import PropTypes, { number } from "prop-types";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { BackButton } from "../input/BackButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import "./UserProfileVisitCard.css";
import { FormattedMessage } from "react-intl";
import { ReactComponent as PhoneIcon } from "../icons/Phone.svg";
import { ReactComponent as AcountIcon } from "../icons/Acount.svg";
import { ReactComponent as EmailIcon } from "../icons/Email.svg";
import { Spinner } from "../misc/Spinner";
/*
export function remountUI(props) {
  uiProps = { ...uiProps, ...props };
  mountUI(uiProps);
}*/
export function UserProfileVisitCard ({
    displayName,
    email,
    phoneNumber,
    jobTitle,
    imgUrl,
    userId,
    onClose,
    companyName}){     
        let avatarImgae = "";
        if (imgUrl.length != 0) {
          imgUrl.map(e => {
            if (e.id == userId) {
            avatarImgae = e.url;
            avatarImgae = avatarImgae.replace('"', "");
            avatarImgae = avatarImgae.replace('"', "");
            }
          });
        }
      return (

      <Sidebar
      title={displayName}
      beforeTitle={ <BackButton />}
      
  
 
>
<Column center padding>
<div className='control-pane'>
                <div className="sample_container card_sample">
                    
                    <div className="e-card e-custom-card">
                        <div className="e-card-header">
                            
                            <div className="e-avatar e-avatar-circle">
                                    {avatarImgae == "" && (     
                                       <AcountIcon className="acount-icon"/>
                                    )}
                               {avatarImgae!="" && ( <img src={avatarImgae} className="avatar-image"/>)}
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
                            <div className="phone-number"><PhoneIcon className="icon-phone"></PhoneIcon><span className="phone-number-text">{phoneNumber}</span></div>
                            <div className="email"><EmailIcon className="icon-phone"></EmailIcon><span className="email-text">{email}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <Button preset="basic" >
          <FormattedMessage id="user-profile-sidebar.chat-button" defaultMessage="Chat" />
        </Button>
        <Button preset="basic" >
          <FormattedMessage id="user-profile-sidebar.send-mail-button" defaultMessage="Send Mail" />
        </Button>
        </Column>


  </Sidebar>
  );
}

UserProfileVisitCard.propTypes = {
    displayName:PropTypes.string,
    email:PropTypes.string,
    phoneNumber:PropTypes.string,
    jobTitle:PropTypes.string,
    companyName:PropTypes.string,
    imgUrl:PropTypes.string,
    userId:PropTypes.string,
    onclose:PropTypes.func

};
export  default UserProfileVisitCard;


