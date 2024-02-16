import useWebSocket from "react-use-websocket";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";

import { useRef, useState } from "react";

function SendingBloBChunks() {
  const audioStream = useRef<MediaStream>();
  const recorder = useRef<RecordRTC>();
  const [socketUrl, setSocketUrl] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);

  const { sendJsonMessage} = useWebSocket(
    socketUrl,
    {
      onOpen: () => {
        console.log("WebSocket opened");
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          audioStream.current = stream;
          const rtcRecorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 1500, // set 1500 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // realtime requires only one channel
            bufferSize: 16384,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data: string = reader.result!.toString();
                // audio data must be sent as a base64 encoded string
                sendJsonMessage({
                  type: "to-file",
                  audio_data: base64data!.split("base64,")[1],
                });
              };
              reader.readAsDataURL(blob);
            },
          });
          rtcRecorder.startRecording();
          recorder.current = rtcRecorder;
        });
      },
    },
    shouldConnect
  );

  const initiateRecording = () => {
    setSocketUrl("ws://localhost:9000");
    setShouldConnect(true);
  };

  async function stop() {
    setShouldConnect(false);
    if (recorder.current) {
      recorder.current.pauseRecording();
    } else {
      console.log("there is no recorder");
    }
    stopAudioStream();
  }

  const stopAudioStream = () => {
    if (audioStream.current)
      audioStream.current.getTracks().forEach((track) => {
        if (track.readyState == "live" && track.kind === "audio") {
          track.stop();
        }
      });
  };

  return (
    <>
      {shouldConnect ? "Listening" : "Ready to go"}
      <button onClick={initiateRecording}>Start recording</button>
      <button onClick={stop}>Stop recording</button>
    </>
  );
}

export default SendingBloBChunks;
