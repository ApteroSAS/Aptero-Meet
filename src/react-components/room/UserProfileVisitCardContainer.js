import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import UserProfileVisitCard from "./UserProfileVisitCard";
import axios from "axios";
import { getProfileList ,getAvatarPreview} from "./../ui-root";
// get the profile of the selected user
var profileList=[];
var displayName="";
var email="";
var jobTitle="";
var companyName="";
var phoneNumber="";
export function UserProfileVisitCardContainer({
  mySessionId,
  presences,
  userId,
  //user,
  //imgTab,
  hubChannel,
  performConditionalSignIn,
  onClose,
  onCloseDialog,
  toggleChatSidebar,
  showNonHistoriedDialog,
  onSelectPerson,
  store,
  mediaSearchStore
  
}) {

    profileList=getProfileList();
    var selectedPersonProfile=null;
    profileList.map((profile)=>{
        if(profile.userId==userId)
        {
            selectedPersonProfile=profile;     
        }
    });
    if(selectedPersonProfile!=null)
    {
        
        
        displayName=selectedPersonProfile.displayName;
        email=selectedPersonProfile.email;
        jobTitle=selectedPersonProfile.jobTitle;
        companyName=selectedPersonProfile.companyName;
        phoneNumber=selectedPersonProfile.phoneNumber;
        
    }
    
  return (
    <UserProfileVisitCard
      displayName={displayName}
      email={email}
      phoneNumber={phoneNumber}
      jobTitle={jobTitle}
      companyName={companyName}
      imgUrl={getAvatarPreview()}
      userId={userId}
      mySessionId={mySessionId}
      presences={presences}
      hubChannel={hubChannel}
      performConditionalSignIn={performConditionalSignIn}
      onClose={onClose}
      onCloseDialog={onCloseDialog}
      toggleChatSidebar={toggleChatSidebar}
      showNonHistoriedDialog={showNonHistoriedDialog}
      onSelectPerson={onSelectPerson}
      store={store}
      mediaSearchStore={mediaSearchStore}
      //identityName={identityName}
      /*
      avatarPreview={<img src={avatarThumbnailUrl} />}
      avatarId={avatarId}
      imgUrl={getAvatarPreview()}
      userId={userId}
      showBackButton={showBackButton}
      onClose={onClose}
      onBack={onBack}
      toggleChatSidebar={toggleChatSidebar}
      */

    />
  );
}

UserProfileVisitCardContainer.propTypes = {
  presences:PropTypes.object,
  mySessionId:PropTypes.string,
  userId: PropTypes.string,
  store:PropTypes.object,
  hubChannel: PropTypes.object,
  performConditionalSignIn: PropTypes.func,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  onClose: PropTypes.func,
  onCloseDialog: PropTypes.func,
  showNonHistoriedDialog: PropTypes.func,
  toggleChatSidebar: PropTypes.func,
  onSelectPerson: PropTypes.func,
  mediaSearchStore: PropTypes.object.isRequired
  
};
