import {Card, CardContent, Typography, Box, Grid} from "@mui/material";
import React from "react";
import {OpenAppMenu} from "./OpenAppMenu";
import {Button, Flex} from "@fluentui/react-northstar";
import ResponsiveYouTube from "./ResponsiveYoutube";
import {useDeviceType} from "./useContext";
export function WelcomePage({startEditor}: { startEditor: () => void }) {
    const deviceType = useDeviceType();
    return (
        <Grid container style={{padding: "20px"}}>
            <Grid item xs={12}>
                <Typography variant="h4" align="center" gutterBottom>Welcome</Typography>
                <Box display="flex" justifyContent="center">
                    <ResponsiveYouTube videoId={"X2RsX8tT1Dk"}/>
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>Start creating your own room using the editor or
                    try directly our samples:</Typography>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap:"20px",
                }} >
                    {deviceType === "desktop" && <Button primary onClick={startEditor}>Open Editor</Button>}
                    {deviceType !== "desktop" && <div> The editor is only available on larger screen (Laptop or Desktop)</div>}
                    <OpenAppMenu/>
                </div>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h5" align="center" gutterBottom>Usecases:</Typography>
            </Grid>

            {[
                {title: 'Digital twin for training', videoId: '6azuR1_NoEQ', description: 'Create a virtual replica of a real-world system.'},
                {title: 'Teams 3D event and webinar', videoId: '01iLDR1YyWg', description: 'Host immersive team events and webinars.'},
                {title: 'Immersive classroom', videoId: 'X2RsX8tT1Dk', description: 'Enhance online learning with interactive classrooms.'},
                {title: 'Industry 4.0', videoId: 'j23GK5kcJhM', description: 'Simulate and optimize manufacturing processes.'},
            ].map(({title, videoId, description}) => (
                <Grid item xs={12} md={6} lg={4} key={videoId}>
                    <Card style={{margin:"10px"}} elevation={10}>
                        <CardContent>
                            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
                            <Typography variant="body2" align="center" gutterBottom>{description}</Typography>
                            <ResponsiveYouTube videoId={videoId} opts={{ width: '100%' }}/>
                            <Box display="flex" justifyContent="center" marginTop={2}>
                                <OpenAppMenu/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
