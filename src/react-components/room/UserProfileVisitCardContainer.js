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
  userId,
  store,
  onclose,
  onBack,
  
}) {
    profileList=getProfileList();
    console.log(getProfileList());
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
      onclose={onclose}
      onBack={onBack}
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
  mySessionId:PropTypes.string,
  userId: PropTypes.string,
  store:PropTypes.object,
  onclose:PropTypes.func,
  onBack:PropTypes.func,
};
