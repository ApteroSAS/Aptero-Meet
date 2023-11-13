import * as React from "react";
import {CSSProperties} from "react";

const MAX_DIGITS = 6;

const styles: Record<string, CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        padding: '10px',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        maxWidth: '400px',
        margin: '0 auto',
        borderRadius: '5px',
        boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
    },
    input: {
        height: '50px',
        fontSize: '20px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        textAlign: 'center',
        marginBottom: '20px',
        width: '50%',
        boxSizing: 'border-box',
        marginRight: '20px',
    },
    keypad: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '50%',
    },
    button: {
        height: '50px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '20px',
        color: '#333',
        backgroundColor: '#f5f5f5',
        transition: 'all 0.2s ease-in-out',
    },
    buttonDisabled: {
        opacity: '0.5',
    },
    error: {
        color: '#ff0000',
        marginBottom: '10px',
    },
};

export const PadNumber = ({execute}) => {
    const [entered, setEntered] = React.useState("");
    const [failedAtLeastOnce, setFailedAtLeastOnce] = React.useState(false);


    const handleKeyDown = e => {
        if (e.keyCode < 48 || e.keyCode > 57) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        addToEntry(e.keyCode - 48);
    };

    const addToEntry = async (ch) => {
        if (entered.length >= MAX_DIGITS) return;
        const newChars = `${entered}${ch}`;

        setEntered(newChars);
        if (newChars.length === MAX_DIGITS) {
            try {
                await execute(newChars);
            } catch (e) {
                console.error(e);
                setFailedAtLeastOnce(true);
                setEntered("");
            }
        }
    };

    const removeChar = () => {
        if (entered.length === 0) return;
        setEntered(entered.substring(0, entered.length - 1));
    };

    React.useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [entered]);

    return (<>
        {failedAtLeastOnce &&
          <div style={styles.error}>
            We couldn't find that code. Please try again.
          </div>
        }
        <div style={styles.container}>
            <input
                style={styles.input}
                type="tel"
                pattern="[0-9]*"
                value={entered}
                placeholder="Enter code"
                onChange={ev => {
                    const val = ev.target.value;
                    setEntered(val);
                    if (val.length === MAX_DIGITS) {
                        try {
                            execute(val);
                        } catch (e) {
                            console.error(e);
                            setFailedAtLeastOnce(true);
                            setEntered("");
                        }
                    }
                }}
            />

            <div style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
                    <button
                        disabled={entered.length === MAX_DIGITS}
                        style={{...styles.button, ...(entered.length === MAX_DIGITS && styles.buttonDisabled)}}
                        key={`char_${i}`}
                        onClick={() => addToEntry(d)}
                    >
                        {d}
                    </button>
                ))}
                <button
                    disabled={entered.length === 0}
                    style={{...styles.button, ...((entered.length === 0) && styles.buttonDisabled)}}
                    onClick={removeChar}
                >
                    {"<"}
                </button>
            </div>
        </div>
    </>);
};
