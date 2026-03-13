let peer = null;
let currentConn = null;
let currentCall = null;
let localStream = null;

// Initialize PeerJS
window.initWebRTC = function() {
    if (peer) return;

    // Using default PeerServer
    peer = new Peer();

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        const myIdInput = document.getElementById('my-peer-id');
        if (myIdInput) myIdInput.value = id;
    });

    peer.on('connection', (conn) => {
        handleIncomingConnection(conn);
    });

    peer.on('call', (call) => {
        handleIncomingCall(call);
    });

    peer.on('error', (err) => {
        console.error('PeerJS Error:', err);
        alert('WebRTC Error: ' + err.type);
    });
};

function handleIncomingConnection(conn) {
    window.isWebRTCInitiator = false;
    currentConn = conn;
    setupDataChannel();
    // Auto-switch to Caro Online if not active
    if (!window.gameActive) {
        window.launchGame('caro_online');
    }
}

async function handleIncomingCall(call) {
    if (confirm('Có cuộc gọi đến. Bạn có muốn trả lời bằng Video?')) {
        await startLocalStream(true);
        call.answer(localStream);
        setupCallHandlers(call);
    } else if (confirm('Trả lời bằng Mic?')) {
        await startLocalStream(false);
        call.answer(localStream);
        setupCallHandlers(call);
    }
}

window.connectToPeer = function() {
    const remoteId = document.getElementById('remote-peer-id').value;
    if (!remoteId) return alert('Vui lòng nhập ID đối phương');

    window.isWebRTCInitiator = true;
    currentConn = peer.connect(remoteId);
    setupDataChannel();

    // Start video call automatically
    startCall(remoteId);

    document.getElementById('webrtc-modal').style.display = 'none';
};

async function startCall(remoteId) {
    await startLocalStream(true);
    const call = peer.call(remoteId, localStream);
    setupCallHandlers(call);
}

function setupCallHandlers(call) {
    currentCall = call;
    document.getElementById('online-call-ui').style.display = 'flex';

    call.on('stream', (remoteStream) => {
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.srcObject = remoteStream;
        document.getElementById('remote-status').innerText = 'Trực tuyến';
    });

    call.on('close', () => {
        endCall();
    });
}

async function startLocalStream(withVideo) {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: withVideo,
            audio: true
        });
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = localStream;
    } catch (err) {
        console.error('Local Stream Error:', err);
        alert('Không thể truy cập Camera/Mic: ' + err.message);
    }
}

function setupDataChannel() {
    currentConn.on('open', () => {
        console.log('Connected to peer');
        document.getElementById('webrtc-modal').style.display = 'none';
    });

    currentConn.on('data', (data) => {
        console.log('Received data:', data);
        if (data.type === 'caro_move') {
            window.handleRemoteCaroMove(data.y, data.x);
        } else if (data.type === 'caro_init') {
            window.handleRemoteCaroInit(data.size);
        }
    });
}

window.sendWebRTCData = function(data) {
    if (currentConn && currentConn.open) {
        currentConn.send(data);
    }
};

window.copyMyId = function() {
    const id = document.getElementById('my-peer-id').value;
    navigator.clipboard.writeText(id).then(() => alert('Đã copy ID!'));
};

window.closeWebRTC = function() {
    document.getElementById('webrtc-modal').style.display = 'none';
};

window.toggleMic = function() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('toggle-mic').innerText = audioTrack.enabled ? '🎤' : '🔇';
    }
};

window.toggleVideo = function() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            document.getElementById('toggle-video').innerText = videoTrack.enabled ? '📹' : '📵';
        }
    }
};

window.endCall = function() {
    if (currentCall) currentCall.close();
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    document.getElementById('online-call-ui').style.display = 'none';
    document.getElementById('local-video').srcObject = null;
    document.getElementById('remote-video').srcObject = null;
};
