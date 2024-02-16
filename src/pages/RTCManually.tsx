import { useRef, useEffect, useState } from "react";

function CallScreen() {
  const [areTracksAdded, setTracksAdded] = useState(false);
  const localVideoRef = useRef<HTMLAudioElement>(null);
  const remoteVideoRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream>();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const pc = useRef<RTCPeerConnection>();

  useEffect(() => {
    const _pc = new RTCPeerConnection();
    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
      }
    };
    _pc.onconnectionstatechange = (e) => {
      console.log(e);
    };

    _pc.ontrack = (e) => {
      console.log("ontrack", e, e.streams);
      remoteVideoRef.current!.srcObject = e.streams[0];
    };

    pc.current = _pc;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream: MediaStream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
      });

    return function cleanup() {
      pc.current!.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addStreamTracks = () => {
    const localStream = localVideoRef.current!.srcObject;
    if (localStream) {
      for (const track of localStream.getTracks()) {
        pc.current!.addTrack(track, localStream);
      }
      setTracksAdded(true);
    } else {
      console.error("Can not add tracks");
    }
  };

  const createOffer = () => {
    console.log("Creating offer");
    pc.current!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    }).then(
      (sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current!.setLocalDescription(sdp);
      },
      (error) => {
        console.error("create offer failed: ", error);
      }
    );
  };

  const createAnswer = () => {
    console.log("Creating answer");
    pc.current!.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    }).then(
      (sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current!.setLocalDescription(sdp);
      },
      (error) => {
        console.error("send answer failed: ", error);
      }
    );
  };

  const setRemoteDescription = () => {
    const sdp = JSON.parse(textRef.current!.value);
    pc.current!.setRemoteDescription(new RTCSessionDescription(sdp));
    textRef.current!.value = "Remote description set.";
  };

  const addCandidate = () => {
    const candidate = JSON.parse(textRef.current!.value);
    pc.current!.addIceCandidate(new RTCIceCandidate(candidate));

    textRef.current!.value = "Candidate added";
  };

  return (
    <div>
      <audio autoPlay muted ref={localVideoRef} />
      <audio autoPlay ref={remoteVideoRef} style={{ background: "black" }} />
      <br />
      {!areTracksAdded && (
        <button onClick={addStreamTracks}>Add Stream tracks(click me once!)</button>
      )}
      <br />
      <button onClick={createOffer}>Create offer</button>
      <button onClick={createAnswer}>Create answer</button>
      <br />
      <textarea ref={textRef} />
      <br />
      <button onClick={setRemoteDescription}>Set Remote Description</button>
      <button onClick={addCandidate}>Add Candidate</button>
    </div>
  );
}

export default CallScreen;
