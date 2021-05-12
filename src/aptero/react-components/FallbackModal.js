import React from "react";
import PropTypes from "prop-types";
import { Modal } from "./../../react-components/modal/Modal";
import { Button } from "./../../react-components/input/Button";
import styles from "./FallbackModal.scss";
import { BackButton } from "./../../react-components/input/BackButton";
import { FormattedMessage } from "react-intl";
import { Column } from "../../react-components/layout/Column";
import { minimumQualityService } from "../service/MinimumQualityService";
import { remoteControlServiceV2 } from "../service/RemoteControlServiceV2";

export function fallbackVMButton(){
  return <>
    <Button preset="green" onClick={async ()=>{
      window.location.href = await remoteControlServiceV2.generateFallBackUrl();
    }
    }>
      <FormattedMessage id="fallback-modal.enter-room-error-button-compatibility" defaultMessage="Retart in compatibility mode"/>
    </Button>
  </>
}

export function fallbackTCPButton(){
  const tcpUrl = new URL(document.location.toString());
  const tcpParams = new URLSearchParams(tcpUrl.search);
  tcpParams.set("force_tcp", true);
  tcpUrl.search = tcpParams.toString();
  return <>
    <Button preset="green" onClick={async ()=>{
      window.location.href = tcpUrl.toString();
    }
    }>
      <FormattedMessage id="fallback-modal.enter-room-error-button-tcp" defaultMessage="Retart in TCP mode"/>
    </Button>
  </>
}

export function comboFallbackButton(){
  return <>{
    fallbackVMButton()
  }{
    fallbackTCPButton()
  }
  </>
}

export function FallbackModal({ className, onEnterRoom, onBack, ...rest }) {

  const status = minimumQualityService.getCheckStatus();
  return (
      <Modal
          title={<FormattedMessage id="mic-permissions-modal.title" defaultMessage="Issue panel"/>}
          beforeTitle={<BackButton onClick={onBack}/>}
          className={className}
          {...rest}
      >
        <Column padding center className={styles.content}>
          {status["turn-udp-issue"] || status["turn-tcp-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.turn-issue"
                defaultMessage="Connectivity issue detected other user won't be able to hear you"
            />
          </div>}
          {status["mic-activity-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.mic-activity-issue"
                defaultMessage="No sound detected coming from your microphone press back and try to change microphone."
            />
          </div>}
          {status["fps-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.fps-issue"
                defaultMessage="Your PC does not seems to have the required performance to be able to run application."
            />
          </div>}
          {(status["fps-issue"] || status["turn-udp-issue"] || status["turn-tcp-issue"] || status["mic-activity-issue"]) &&
            fallbackVMButton()
          }
          <>
            <Button preset="green" onClick={onEnterRoom}>
              <FormattedMessage id="fallback-modal.enter-room-button-anyway" defaultMessage="Enter Room Anyway"/>
            </Button>
          </>
        </Column>
      </Modal>
  );
}

FallbackModal.propTypes = {
  className: PropTypes.string,
  onEnterRoom: PropTypes.func,
  onBack: PropTypes.func
};
