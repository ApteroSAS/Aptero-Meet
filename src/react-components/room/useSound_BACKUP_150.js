import { useRef, useCallback } from "react";

<<<<<<< .merge_file_a16496
export function useSound({ webmSrc, mp3Src, oggSrc, wavSrc }) {
  const soundTimeoutRef = useRef();
  const audioElRef = useRef();
  const [soundPlaying, setSoundPlaying] = useState(false);

  useEffect(
    () => {
      const audioEl = document.createElement("audio");

      if (audioEl.canPlayType("audio/webm")) {
        audioEl.src = webmSrc;
      } else if (audioEl.canPlayType("audio/mpeg")) {
        audioEl.src = mp3Src;
      } else if (audioEl.canPlayType("audio/ogg")) {
        audioEl.src = oggSrc;
      } else {
        audioEl.src = wavSrc;
      }

      audioElRef.current = audioEl;

      return () => {
          if(soundPlaying){
              audioEl.pause();
          }
        audioEl.currentTime = 0;
        clearTimeout(soundTimeoutRef.current);
      };
    },
    [webmSrc, mp3Src, oggSrc, wavSrc, soundPlaying]
  );

  const playSound = useCallback(
    () => {
        (async ()=>{
      const audioEl = audioElRef.current;

      if (audioEl) {
        audioEl.currentTime = 0;
        clearTimeout(soundTimeoutRef.current);
        await audioEl.play();
        setSoundPlaying(true);

        soundTimeoutRef.current = setTimeout(() => {
          setSoundPlaying(false);
        }, 1393);
      }})()
=======
export function useSound({ scene, sound }) {
  const sfxSystem = scene.systems["hubs-systems"].soundEffectsSystem;
  const analyserRef = useRef(scene.systems["hubs-systems"].audioSystem.mixerAnalyser);

  const playSound = useCallback(
    () => {
      sfxSystem.playSoundOneShot(sound).connect(analyserRef.current);
>>>>>>> .merge_file_a02976
    },
    [sound, sfxSystem]
  );

  return { playSound };
}
