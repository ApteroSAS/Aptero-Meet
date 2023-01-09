import React, { useCallback, useReducer, useContext, useEffect } from "react";
import { TERMS, PRIVACY } from "../../constants";
import configs from "../../utils/configs";
import { AuthContext } from "./AuthContext";
import { SignInModal, SignInStep, WaitForVerification, SubmitEmail,WaitForMicrosoftVerification } from "./SignInModal";

const SignInAction = {
  submitEmail: "submitEmail",
  verificationReceived: "verificationReceived",
  WaitForMicrosoftVerification:"WaitForMicrosoftVerification",
  cancel: "cancel"
};

const initialSignInState = {
  step: SignInStep.submit,
  email: ""
};
const authenticationType={
  microsoftAuhtentication:false,
  adresseMailAuhtentication:false
}

function loginReducer(state, action) {
  switch (action.type) {
    case SignInAction.submitEmail:
      return { step: SignInStep.waitForVerification, email: action.email };
    case SignInAction.verificationReceived:
      return { ...state, step: SignInStep.complete };
    case SignInAction.cancel:
      return { ...state, step: SignInStep.submit };
      case SignInAction.WaitForMicrosoftVerification:
        return { step: SignInStep.WaitForMicrosoftVerification};
  }
}

function useSignIn() {
  const auth = useContext(AuthContext);
  const [state, dispatch] = useReducer(loginReducer, initialSignInState);

  const submitEmail = useCallback(
    email => {
      auth.signIn(email).then(() => {
        dispatch({ type: SignInAction.verificationReceived });
      }).catch(e => {
        console.log(e);
    });
      authenticationType.adresseMailAuhtentication=true;
      authenticationType.microsoftAuhtentication=false;
      dispatch({ type: SignInAction.submitEmail, email });
    },
    [auth]
  );
/**
 *  ) : step===SignInStep.microsoftverificationReceived ?(
        <SignInComplete/>
      )
 */
  const submitEmailMicrosoftLogin =useCallback(
    user=>{
      auth.signInMicrosoft(user).then(()=>{
        dispatch({type:SignInAction.verificationReceived});
      }).catch(e => {
        console.log(e);
    });
      authenticationType.microsoftAuhtentication=true;
      authenticationType.adresseMailAuhtentication=false;
      dispatch({type:SignInAction.WaitForMicrosoftVerification});

    },
    [auth]
  );

  const cancel = useCallback(() => {
    dispatch({ type: SignInAction.cancel });
  }, []);

  return {
    step: state.step,
    email: state.email,
    submitEmail,
    submitEmailMicrosoftLogin,
    cancel
  };
}

export function SignInModalContainer() {
  const qs = new URLSearchParams(location.search);
  const { step, submitEmail, submitEmailMicrosoftLogin, cancel, email } = useSignIn();
  const redirectUrl = qs.get("sign_in_destination_url") || "/";

  useEffect(
    () => {
      if (step === SignInStep.complete) {
        window.location = redirectUrl;
      }
    },
    [step, redirectUrl]
  );
<<<<<<< HEAD
  if(!authenticationType.microsoftAuhtentication) {
    return (
      <SignInModal disableFullscreen>
        {step === SignInStep.submit ? (
          <SubmitEmail
            onSubmitEmail={submitEmail}
            onSubmitEmailMicrosoftLogin={submitEmailMicrosoftLogin}
            initialEmail={email}
            signInReason={qs.get("sign_in_reason")}
            termsUrl={configs.link("terms_of_use", "https://github.com/mozilla/hubs/blob/master/TERMS.md")}
            showTerms={configs.feature("show_terms")}
            privacyUrl={configs.link("privacy_notice", "https://github.com/mozilla/hubs/blob/master/PRIVACY.md")}
            showPrivacy={configs.feature("show_privacy")}
          />
        ) : (
          <WaitForVerification
            onCancel={cancel}
            email={email}
            showNewsletterSignup={configs.feature("show_newsletter_signup")}
          />
        )}
      </SignInModal>
    );
  } else{
    return (
      <SignInModal disableFullscreen>
      <WaitForMicrosoftVerification 
=======

  return (
    <SignInModal disableFullscreen>
      {step === SignInStep.submit ? (
        <SubmitEmail
          onSubmitEmail={submitEmail}
          initialEmail={email}
          signInReason={qs.get("sign_in_reason")}
          termsUrl={configs.link("terms_of_use", TERMS)}
          showTerms={configs.feature("show_terms")}
          privacyUrl={configs.link("privacy_notice", PRIVACY)}
          showPrivacy={configs.feature("show_privacy")}
        />
      ) : (
        <WaitForVerification
>>>>>>> 5a4d3b54dea82f259cfa2e74517406a074ddf81a
          onCancel={cancel}
        />
      </SignInModal>
    );
  }

}
