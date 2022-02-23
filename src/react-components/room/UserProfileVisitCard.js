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
import { useHistory } from "react-router-dom";
import { UserProfileSidebar } from "./UserProfileSidebar";
import { UserProfileSidebarContainer } from "./UserProfileSidebarContainer";
import { getMicrophonePresences } from "../../utils/microphone-presence";
import {  userFromPresence } from "./PeopleSidebarContainer";
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
    profilePicture,
    userId,
    companyName, 
    presences,
    mySessionId,   
    hubChannel,
    performConditionalSignIn,
    onClose,
    onCloseDialog,
    toggleChatSidebar,
    showNonHistoriedDialog,
    onSelectPerson,
    store,
    mediaSearchStore,
    isSignedIn,
    signedIn
}){     
        const [goBackToUserPanel,setBackToUserPanel]=useState("test");
        const micPresences=getMicrophonePresences();
        const presence = presences[userId];
        const user=userFromPresence(userId, presence, micPresences, mySessionId);
        let history = useHistory();
    if(isSignedIn)
    {
      if(goBackToUserPanel!=null)
      {
       return (
     
         <Sidebar
         title={displayName}
         beforeTitle={ <BackButton onClick={()=>setBackToUserPanel(null)} />}
     >
     <Column center padding>
     <div className='control-pane'>
                   <div className="sample_container card_sample">
                       
                       <div className="e-card e-custom-card">
                           <div className="e-card-header">
                               
                               <div className="e-avatar e-avatar-circle">
                                       {profilePicture == "" && (     
                                          <AcountIcon className="acount-icon"/>
                                       )}
                                  {profilePicture!="" && ( <img src={profilePicture} className="avatar-image"/>)}
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
                               <div className="phone-number"><PhoneIcon className="icon-phone"></PhoneIcon><span className="phone-number-text">{phoneNumber??<FormattedMessage id="user-profile-visit-card-no-data" defaultMessage="Information not provided" />}</span></div>
                               <div className="email"><EmailIcon className="icon-phone"></EmailIcon><span className="email-text">{email??<FormattedMessage id="user-profile-visit-card-no-data" defaultMessage="Information not provided" />
          }</span></div>
                           </div>
                       </div>
                   </div>
               </div>
               <Button preset="basic" onClick={() => toggleChatSidebar("chat", userId,null)} >
             <FormattedMessage id="user-profile-sidebar.chat-button" defaultMessage="Chat" />
           </Button>
           <Button preset="basic" >
             <FormattedMessage id="user-profile-sidebar.send-mail-button" defaultMessage="Send Mail" />
           </Button>
           </Column>
     
     
     </Sidebar>
     );
      }
      
      else{
       return(
         <UserProfileSidebarContainer
         user={user}
         presences={presences}
         hubChannel={hubChannel}
         mySessionId={mySessionId}
         performConditionalSignIn={performConditionalSignIn}
         onClose={onClose}
         onCloseDialog={onCloseDialog}
         toggleChatSidebar={toggleChatSidebar}
         showNonHistoriedDialog={showNonHistoriedDialog}
         onSelectPerson={onSelectPerson}
         store={store}
         mediaSearchStore={mediaSearchStore}
         signedIn={signedIn}
         />);
      }
     
    }
 else{
  if(goBackToUserPanel!=null)
      {
        return (
          <Sidebar
          title={displayName}
          beforeTitle={ <BackButton onClick={()=>setBackToUserPanel(null)} />}
      >
      <Column center padding>
          <div >
          <FormattedMessage id="user-profile-visit-card-no-data-found" defaultMessage="Unfortunately, the user has not provided information" />
          </div>
            </Column>
      </Sidebar>
      );
      }
      else{
        return(
          <UserProfileSidebarContainer
          user={user}
          presences={presences}
          hubChannel={hubChannel}
          mySessionId={mySessionId}
          performConditionalSignIn={performConditionalSignIn}
          onClose={onClose}
          onCloseDialog={onCloseDialog}
          toggleChatSidebar={toggleChatSidebar}
          showNonHistoriedDialog={showNonHistoriedDialog}
          onSelectPerson={onSelectPerson}
          store={store}
          mediaSearchStore={mediaSearchStore}
          signedIn={signedIn}
          />);
      }


 }
}

UserProfileVisitCard.propTypes = {
    displayName:PropTypes.string,
    email:PropTypes.string,
    phoneNumber:PropTypes.string,
    jobTitle:PropTypes.string,
    companyName:PropTypes.string,
    userId:PropTypes.string,
    presences:PropTypes.object,
    mySessionId:PropTypes.string,
    profilePicture:PropTypes.string,
    hubChannel: PropTypes.object,
    presences:PropTypes.object,
    performConditionalSignIn: PropTypes.func,
    showBackButton: PropTypes.bool,
    onBack: PropTypes.func,
    onClose: PropTypes.func,
    onCloseDialog: PropTypes.func.isRequired,
    showNonHistoriedDialog: PropTypes.func,
    toggleChatSidebar: PropTypes.func,
    onSelectPerson: PropTypes.func,
    store: PropTypes.object.isRequired,
    mediaSearchStore: PropTypes.object.isRequired,
    isSignedIn:PropTypes.bool,
    signedIn:PropTypes.func

};
export  default UserProfileVisitCard;
