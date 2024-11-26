import * as React from "react";

function getLastPart(input: string, delimiter: string = '.'): string {
    const parts = input.split(delimiter);
    return parts[parts.length - 1];
}

export function License() {
    return <></>;
    /*const license = useLicense("offer-saas-aptero","No License");
    return (
        <>
            {license &&
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Typography variant="body1">
                  License:
                </Typography>
                <Chip
                  label={getLastPart(license)}
                  color="primary"
                />
              </div>
            }
        </>
    );*/
}
