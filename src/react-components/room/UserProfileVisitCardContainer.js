import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import UserProfileVisitCard from "./UserProfileVisitCard";
import axios from "axios";
import { getProfileList ,getAvatarPreview} from "./../ui-root";
import { usePeopleList } from "./PeopleSidebarContainer";
// get the profile of the selected user
var profileList=[];
var displayName_user="";
var email="";
var jobTitle="";
var companyName="";
var phoneNumber="";
var profilePicture="";
export function UserProfileVisitCardContainer({
  mySessionId,
  presences,
  userId,
  hubChannel,
  performConditionalSignIn,
  onClose,
  onCloseDialog,
  toggleChatSidebar,
  showNonHistoriedDialog,
  onSelectPerson,
  store,
  mediaSearchStore,
  displayName,
  signedIn
  
}) {
    var iSignedIn=false;
    const people = usePeopleList(presences, mySessionId);
    const selectedPerson = people.find(person => person.id === userId);
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
        displayName_user=selectedPersonProfile.displayName;
        email=selectedPersonProfile.email;
        jobTitle=selectedPersonProfile.jobTitle;
        companyName=selectedPersonProfile.companyName;
        phoneNumber=selectedPersonProfile.phoneNumber;  
        profilePicture=getAvatarPreview(); 
    }
    
    if(selectedPerson){
      displayName_user=selectedPerson.profile.displayName;
      email=selectedPerson.profile.email;
      jobTitle=selectedPerson.profile.jobTitle;
      companyName=selectedPerson.profile.companyName;
      phoneNumber=selectedPerson.profile.phoneNumber;
      profilePicture=selectedPerson.profile.profilePicture;   
    }
    if(selectedPerson)
    {
      iSignedIn=selectedPerson.roles.signed_in;
    }
    
  return (
    <UserProfileVisitCard
      isSignedIn={iSignedIn}
      displayName={displayName}
      email={email}
      phoneNumber={phoneNumber}
      jobTitle={jobTitle}
      companyName={companyName}
      profilePictureList={getAvatarPreview()}
      profilePictureMicrosoftUser={profilePicture}
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
      signedIn={signedIn}
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
  mediaSearchStore: PropTypes.object.isRequired,
  displayName:PropTypes.string,
  signedIn:PropTypes.func
};
