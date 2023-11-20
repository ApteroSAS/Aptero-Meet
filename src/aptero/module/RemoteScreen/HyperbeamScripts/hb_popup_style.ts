
export const hb_popup_style = /*css*/`
.hyperbeam-popup {
  opacity: 0;
  display: none;
  flex-direction: column;
  position: absolute;
  z-index: 10;
  top: 1em;
  left: 50%;
  transform: translate(-50%,0);
  padding: 0.5em 1em;
  background-color: #caff26;
  border-radius: 0.75em;
  text-shadow: 0 0 0.25em #000000b0;
  box-shadow: 0 0 0.5em #00000033;
  font-size: 1.1em;
  font-weight: bold;
  line-height: 1.5em;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 27.2em;
  max-width: 95%;
  color: white;
}

.nowrap {
  white-space: nowrap;
}

.hyperbeam-popup button {
  padding: 0.25em 1em;
  background-color: #7ed320;
  border-radius: 0.5em;
  font-size: 1em;
  font-weight: bold;
  line-height: 1.5em;
  text-align: center;
  margin: 0.3em 0.5em 0;
  border: none;
  box-shadow: 0 0 0.5em #00000033;
}

@keyframes fadein {
  from {opacity: 0; transform: translate(-50%,0.5em);}
  to {opacity: 1; transform: translate(-50%,0);}
}

@keyframes fadeout {
  from {opacity: 1; transform: translate(-50%,0);}
  to {opacity: 0; transform: translate(-50%,-0.5em);}
}
`