import React from "react";
import PropTypes from "prop-types";
import { Button, AcceptButton } from "../input/Button";
import styles from "./AvatarSettingsContent.scss";
import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { FormattedMessage } from "react-intl";

export function AvatarSettingsContent({
  displayName,
  companyName,
  jobTitle,
  email,
  phoneNumber,
  descriptionUser,
  displayNameInputRef,
  disableDisplayNameInput,
  onChangeDisplayName,
  onChangeCompanyName,
  onChangeJobTitle,
  onChangePhoneNumber,
  avatarPreview,
  displayNamePattern,
  onChangeAvatar,
  submit_info,
  isSignedIn,
  signedIn,
  ...rest
}) {
  if(isSignedIn)
  {
    return (
      <Column as="form" className={styles.content} {...rest}>
        <div className={styles.container}>
          <div className={styles.avatarPreviewFormContainer}>
            <TextInputField
              className={styles.test}
              disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
              value={displayName}
              pattern={displayNamePattern}
              spellCheck="false"
              required
              onChange={onChangeDisplayName}
              /*
            description={
              <FormattedMessage
                id="avatar-settings-content.display-name-description"
                defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
              />
            }*/
              ref={displayNameInputRef}
            />
            <div className={styles.avatarPreviewContainer}>
              {avatarPreview || <div />}
              <Button type="button" preset="basic" onClick={onChangeAvatar}>
                <FormattedMessage id="avatar-settings-content.change-avatar-button" defaultMessage="Change Avatar" />
              </Button>
            </div>
          </div>
          <div className={styles.avatarPreviewInputs}>
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.company-name-label" defaultMessage="Company Name" />}
              value={companyName}
              //pattern={displayNamePattern}
              spellCheck="false"
              required
              onChange={onChangeCompanyName}
              //ref={displayNameInputRef}
            />
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.job-title-label" defaultMessage="Job Title" />}
              value={jobTitle}
              //pattern={displayNamePattern}
              spellCheck="false"
              //required
              onChange={onChangeJobTitle}
              //ref={displayNameInputRef}
            />
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.email-label" defaultMessage="Email" />}
              value={email}
              //pattern={displayNamePattern}
              spellCheck="false"
              ///required
              //ref={displayNameInputRef}
            />
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.phone-number-label" defaultMessage="Phone Number" />}
              value={phoneNumber}
              //pattern={displayNamePattern}
              spellCheck="false"
              required
              onChange={onChangePhoneNumber}
              //ref={displayNameInputRef}
            />
       
          </div>
        </div>
        <AcceptButton preset="accept" type="submit" onClick={submit_info} />
      </Column>
    );
  }
  else{
    
    return (
    <Column as="form" className={styles.content} {...rest}>
    <TextInputField
      disabled={disableDisplayNameInput}
      label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
      value={displayName}
      pattern={displayNamePattern}
      spellCheck="false"
      required
      onChange={onChangeDisplayName}
      description={
        <FormattedMessage
          id="avatar-settings-content.display-name-description"
          defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
        />
      }
      ref={displayNameInputRef}
    />
    <div className={styles.avatarPreviewContainer}>
      {avatarPreview || <div />}
      <Button type="button" preset="basic" onClick={onChangeAvatar}>
        <FormattedMessage id="avatar-settings-content.change-avatar-button" defaultMessage="Change Avatar" />
      </Button>
    </div>
    <Button type="button" preset="basic" onClick={signedIn}>
        <FormattedMessage  id="avatar-settings-content.sign-up-button" defaultMessage="Sign in"/>
      </Button>
    <AcceptButton preset="accept" type="submit" />
  </Column>
);
  }

}

AvatarSettingsContent.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  companyName: PropTypes.string,
  jobTitle:PropTypes.string,
  email:PropTypes.string,
  phoneNumber:PropTypes.string,
  descriptionUser:PropTypes.string,
  displayNameInputRef: PropTypes.func,
  disableDisplayNameInput: PropTypes.bool,
  displayNamePattern: PropTypes.string,
  onChangeDisplayName: PropTypes.func,
  onChangeCompanyName: PropTypes.func,
  onChangeJobTitle:PropTypes.func,
  onChangePhoneNumber:PropTypes.func,
  avatarPreview: PropTypes.node,
  onChangeAvatar: PropTypes.func,
  submit_info:PropTypes.func,
  isSignedIn:PropTypes.bool,
  signedIn:PropTypes.func
};
