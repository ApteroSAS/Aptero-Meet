import React from "react";
import PropTypes from "prop-types";
import { Modal } from "./../../react-components/modal/Modal";
import { Button } from "./../../react-components/input/Button";
import styles from "./FallbackModal.scss";
import { BackButton } from "./../../react-components/input/BackButton";
import { FormattedMessage } from "react-intl";
import { Column } from "../../react-components/layout/Column";
import { minimumQualityService } from "../service/MinimumQualityService";

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
                id="mic-permissions-modal.grant-mic-permissions.turn"
                defaultMessage="Connectivity issue detected other user won't be able to hear you"
            />
          </div>}
          {status["mic-activity-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="mic-permissions-modal.grant-mic-permissions.mic"
                defaultMessage="No sound detected coming from your microphone press back and try to change microphone."
            />
          </div>}
          <>
            <Button preset="green" onClick={onEnterRoom}>
              <FormattedMessage id="mic-setup-modal.enter-room-button-anyway" defaultMessage="Enter Room Anyway"/>
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
