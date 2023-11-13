import React, { useState, useEffect } from "react";
import YouTube from 'react-youtube';

interface IProps {
    videoId: string;
    minWidth?: number;
    opts?: any;
}

const ResponsiveYouTube: React.FC<IProps> = ({ videoId, minWidth = 800,opts }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (windowWidth < minWidth) {
        return null;
    }

    return <YouTube videoId={videoId} opts={opts} />;
}

export default ResponsiveYouTube;
