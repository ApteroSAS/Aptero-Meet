import React from "react";
import PropTypes from "prop-types";
import { Button, AcceptButton } from "../input/Button";
import styles from "./AvatarSettingsContent.scss";
import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { FormattedMessage, useIntl } from "react-intl";

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
  containerType,
  ...rest
}) {
  const intl = useIntl();
  if(containerType==="sidebar")
  {
    
    return (
      <Column as="form" className={styles.content} {...rest}>
        <div className={styles.container}>
          <div className={styles.avatarPreviewFormContainer}>
            <TextInputField
              className={styles.test}
              disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
              value={displayName??''}
              pattern={displayNamePattern}
              spellCheck="false"
              //required
              onChange={onChangeDisplayName}
              placeholder={intl.formatMessage({
                id: "avatar-settings.display-name-label-placeholder",
                defaultMessage: "Enter your name"
              })}
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
              value={companyName??''}
              //pattern={displayNamePattern}
              spellCheck="false"
              //required
              onChange={onChangeCompanyName}
              //ref={displayNameInputRef}
              placeholder={intl.formatMessage({
                id: "avatar-settings.company-name-placeholder",
                defaultMessage: "Company name"
              })}
            />
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.job-title-label" defaultMessage="Job Title" />}
              value={jobTitle??''}
              //pattern={displayNamePattern}
              spellCheck="false"
              //required
              onChange={onChangeJobTitle}
              placeholder={intl.formatMessage({
                id: "avatar-settings.job-title-placeholder",
                defaultMessage: "Job title"
              })}
              //ref={displayNameInputRef}
            />
            {isSignedIn &&
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.email-label" defaultMessage="Email" />}
              value={email??''}
              //pattern={displayNamePattern}
              spellCheck="false"
              ///required
              //ref={displayNameInputRef}
              placeholder={intl.formatMessage({
                id: "avatar-settings.email-placeholder",
                defaultMessage: "Job email address"
              })}
            />}
            <TextInputField
              className={styles.test}
              //disabled={disableDisplayNameInput}
              label={<FormattedMessage id="avatar-settings-content.phone-number-label" defaultMessage="Phone Number" />}
              value={phoneNumber??''}
              //pattern={displayNamePattern}
              spellCheck="false"
              //required
              onChange={onChangePhoneNumber}
              //ref={displayNameInputRef}
              placeholder={intl.formatMessage({
                id: "avatar-settings.phone-number-placeholder",
                defaultMessage: "Phone number"
              })}
            />

          </div>
        </div>
        <AcceptButton preset="accept" type="submit" onClick={submit_info} />
      </Column>
    );
  }
//avant l'entree dans la salle
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
      placeholder={intl.formatMessage({
        id: "avatar-settings.display-name-label-placeholder",
        defaultMessage: "Enter your name"
      })}
    />
    <div className={styles.avatarPreviewContainer}>
      {avatarPreview || <div />}
      <Button type="button" preset="basic" onClick={onChangeAvatar}>
        <FormattedMessage id="avatar-settings-content.change-avatar-button" defaultMessage="Change Avatar" />
      </Button>
    </div>
    {isSignedIn && (
        <AcceptButton preset="accept" type="submit" onClick={submit_info} />
        )
        }
        {
          !isSignedIn && (
            <AcceptButton preset="accept" type="submit" onClick={signedIn} />
          )
        }
  
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
  signedIn:PropTypes.func,
  containerType:PropTypes.string
};
