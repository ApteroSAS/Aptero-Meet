import {Collapse, Paper, TextField, Typography, Button, Box, IconButton} from "@material-ui/core";
import React, {useState} from 'react';
import {FormattedMessage} from "react-intl";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InfoIcon from '@material-ui/icons/Info';

export const RoomRecap: React.FC<{
    suggestedDisplayName: string,
    onChangeSuggestedDisplayName: (value: string) => void,
    roomUrl: string,
    onChangeRoomUrl: (value: string) => void,
}> = ({suggestedDisplayName, onChangeSuggestedDisplayName, roomUrl, onChangeRoomUrl}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            minHeight: "300px",
        }}>
            <Paper style={{
                flexGrow: 1,
                padding: "20px",
                margin: "20px",
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                position: "relative" // To position the buttons absolutely
            }} elevation={3}>
                <IconButton
                    style={{ position: "absolute", top: "20px", left: "20px" }}
                    onClick={() => {onChangeRoomUrl("");}}
                >
                    <ArrowBackIcon />
                </IconButton>

                <IconButton
                    style={{ position: "absolute", top: "20px", right: "20px" }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <InfoIcon />
                </IconButton>

                <TextField
                    label={<FormattedMessage id="microsoft.settings.room-display-name"
                                                 defaultMessage="Room Display Name"/>}
                    fullWidth
                    value={suggestedDisplayName}
                    onChange={(value) => {
                        onChangeSuggestedDisplayName((value.target as any).value);
                    }}
                    style={{marginBottom: "2px", marginTop: "70px"}} // Push down the TextField to avoid overlapping with the buttons
                />

                <Collapse in={isOpen}>
                    <h5>Room Info</h5>
                    <TextField
                        label={<FormattedMessage id="microsoft.settings.selected-room" defaultMessage="Selected Room"/>}
                        fullWidth
                        value={roomUrl}
                        onChange={(value) => {
                            onChangeRoomUrl((value.target as any).value);
                        }}
                        style={{marginBottom: "2px"}}
                    />
                </Collapse>
            </Paper>
        </div>
    );
}
