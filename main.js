// RTM init
const client = AgoraRTM.createInstance("9c9206460eb940dab9a2116ea8b29f91", {
  enableLogUpload: false,
});

// RTM login
client
  .login({
    token:
      "0069c9206460eb940dab9a2116ea8b29f91IADMI79f8aCWZI6p8BzTNcruMrMiOs0qYf2BUNFIxacU4jwv3/YAAAAAEADqt5gB4Pd9YwEA6ANHSX9j",
    uid: "777",
  })
  .then(() => {
    console.log("Login success!");
  });
let peerConnection; // all details about connection will be added here
let localStrem; // save local stream
let remoteStrem; // save remote stream

let servers = {
  // generate ice servers, stun servers copied from internet
  iceServers: [
    {
      urls: ["stun:stun4.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let init = async () => {
  localStrem = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  //remoteStrem = new MediaStream();

  document.getElementById("user-1").srcObject = localStrem;
  document.getElementById("user-2").srcObject = localStrem;
  //document.getElementById("user-3").srcObject = localStrem;
  //document.getElementById('user-2').srcObject = remoteStrem
};

// first step, create SDP offer
let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers); // create a new rtc peer connection object

  remoteStrem = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStrem;

  localStrem.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStrem);
    console.log("Peer connection: ", peerConnection);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStrem.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      document.getElementById("offer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
      console.log("Ice candidate: ", event.candidate);
    }
  };

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer); // when setlocaldescription, we can access localdescription

  document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

// second step, to create answer using offer received in first step
let createAnswer = async () => {
  // copy paste the peer connection from create offer
  peerConnection = new RTCPeerConnection(servers); // create a new rtc peer connection object

  remoteStrem = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStrem;

  localStrem.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStrem);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStrem.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      document.getElementById("answer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };

  let offer = document.getElementById("offer-sdp").value;
  if (!offer) return alert("Retrieve offer from peer first!");

  offer = JSON.parse(offer);
  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  document.getElementById("answer-sdp").value = JSON.stringify(answer);
};

// add answer
let addAnswer = async () => {
  let answer = document.getElementById("answer-sdp").value;
  if (!answer) return alert("Retrieve answer from the peer first!");

  answer = JSON.parse(answer);

  if (!peerConnection.currectRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
