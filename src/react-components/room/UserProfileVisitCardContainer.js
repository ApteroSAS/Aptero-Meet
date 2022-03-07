import React from "react";
import PropTypes from "prop-types";
import UserProfileVisitCard from "./UserProfileVisitCard";
import { getProfileList } from "./../ui-root";
import { usePeopleList } from "./PeopleSidebarContainer";
// get the profile of the selected user
let profileList = [];
let email = "";
let jobTitle = "";
let companyName = "";
let phoneNumber = "";
let profilePicture = "";

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
  let iSignedIn = false;
  const people = usePeopleList(presences, mySessionId);
  const selectedPerson = people.find(person => person.id === userId);
  profileList = getProfileList();
  let selectedPersonProfile = null;
  profileList.map((profile) => {
    if (profile.userId === userId) {
      selectedPersonProfile = profile;
    }
  });
  if (selectedPersonProfile != null) {
    email = selectedPersonProfile.email;
    jobTitle = selectedPersonProfile.jobTitle;
    companyName = selectedPersonProfile.companyName;
    phoneNumber = selectedPersonProfile.phoneNumber;
    if (selectedPersonProfile.microsoftUserprofilePicture) {
      profilePicture = selectedPersonProfile.microsoftUserprofilePicture;
    } else {
      profilePicture = selectedPersonProfile.profilePicture;
    }

  }

  if (selectedPerson) {
    email = selectedPerson.profile.email;
    jobTitle = selectedPerson.profile.jobTitle;
    companyName = selectedPerson.profile.companyName;
    phoneNumber = selectedPerson.profile.phoneNumber;
    if (selectedPerson.profile.microsoftUserprofilePicture) {
      profilePicture = selectedPerson.profile.microsoftUserprofilePicture;
    } else {
      profilePicture = selectedPerson.profile.profilePicture;
    }

  }
  if (selectedPerson) {
    iSignedIn = selectedPerson.roles.signed_in;
  }

  return (
    <UserProfileVisitCard
      isSignedIn={iSignedIn}
      displayName={displayName}
      email={email}
      phoneNumber={phoneNumber}
      jobTitle={jobTitle}
      companyName={companyName}
      profilePicture={profilePicture}
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
  presences: PropTypes.object,
  mySessionId: PropTypes.string,
  userId: PropTypes.string,
  store: PropTypes.object,
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
  displayName: PropTypes.string,
  signedIn: PropTypes.func
};
