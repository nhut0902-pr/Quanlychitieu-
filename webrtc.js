// PeerJS & WebRTC Logic for Online Calling and Games
let peer = null;
let dataChannel = null;
let currentCall = null;
let localStream = null;
let isInitiator = false;

function initPeer() {
    if (peer) return;

    // Create Peer with random ID if not provided
    peer = new Peer({
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        debug: 1
    });

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        document.getElementById('my-peer-id').value = id;
    });

    peer.on('connection', (conn) => {
        handleIncomingConnection(conn);
    });

    peer.on('call', (call) => {
        handleIncomingCall(call);
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        showToast("Lỗi kết nối: " + err.type, "error");
        updateWebRTCStatus("Lỗi");
    });
}

function showWebRTCModal() {
    initPeer();
    document.getElementById('webrtc-modal').style.display = 'flex';
}

function closeWebRTC() {
    document.getElementById('webrtc-modal').style.display = 'none';
}

function updateWebRTCStatus(status, color) {
    const el = document.getElementById('webrtc-status-text');
    if (el) {
        el.textContent = status;
        if (color) el.style.color = color;
    }
}

function connectToPeer() {
    const remoteId = document.getElementById('remote-peer-id').value.trim();
    if (!remoteId) {
        showToast("Vui lòng nhập ID đối phương", "info");
        return;
    }

    isInitiator = true;
    updateWebRTCStatus("Đang kết nối...");

    const conn = peer.connect(remoteId);
    handleIncomingConnection(conn);

    // Also initiate call automatically if user wants video
    startCall(remoteId);
}

function handleIncomingConnection(conn) {
    dataChannel = conn;

    conn.on('open', () => {
        showToast("Đã kết nối dữ liệu!", "success");
        updateWebRTCStatus("Đã kết nối", "#10b981");

        // If we are playing caro_online, it might need to sync
        if (currentGame === 'caro_online') {
            launchGame('caro_online');
        }
    });

    conn.on('data', (data) => {
        handleReceivedData(data);
    });

    conn.on('close', () => {
        showToast("Kết nối đã đóng", "info");
        updateWebRTCStatus("Đã ngắt");
        dataChannel = null;
    });
}

function sendData(data) {
    if (dataChannel && dataChannel.open) {
        dataChannel.send(data);
    }
}

function handleReceivedData(data) {
    switch(data.type) {
        case 'caro_move':
            if (typeof handleOnlineCaroMove === 'function') {
                handleOnlineCaroMove(data);
            }
            break;
        case 'caro_init':
            // Receiver gets init from Initiator
            if (currentGame === 'caro_online') {
                caroOnline_size = data.size;
                // re-init with specific size
                const container = document.getElementById('game-container');
                if (container) initCaro(container, true);
            }
            break;
        case 'caro_reset':
            if (currentGame === 'caro_online') {
                const container = document.getElementById('game-container');
                if (container) initCaro(container, true);
            }
            break;
        case 'chat':
            showToast("Bạn mới: " + data.msg, "info");
            break;
    }
}

async function startCall(remoteId) {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('local-video').srcObject = localStream;
        document.getElementById('online-call-ui').style.display = 'block';

        const call = peer.call(remoteId, localStream);
        handleIncomingCall(call);
    } catch (err) {
        console.error('Failed to get local stream', err);
        showToast("Không thể mở camera/micro", "error");
    }
}

function handleIncomingCall(call) {
    currentCall = call;

    // If we haven't started local stream yet (receiving end)
    if (!localStream) {
        showInfoModal("Cuộc gọi đến", "Bạn có cuộc gọi video đến. Chấp nhận?", async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                document.getElementById('local-video').srcObject = localStream;
                document.getElementById('online-call-ui').style.display = 'block';
                call.answer(localStream);
                setupCallEvents(call);
            } catch (err) {
                console.error('Failed to answer call', err);
                showToast("Lỗi camera", "error");
            }
        });
    } else {
        call.answer(localStream);
        setupCallEvents(call);
    }
}

function setupCallEvents(call) {
    call.on('stream', (remoteStream) => {
        document.getElementById('remote-video').srcObject = remoteStream;
        document.getElementById('remote-status').style.display = 'none';
    });

    call.on('close', () => {
        endCall();
    });
}

function endCall() {
    if (currentCall) currentCall.close();
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('online-call-ui').style.display = 'none';
    currentCall = null;
    localStream = null;
    showToast("Cuộc gọi kết thúc", "info");
}

function toggleMic() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('toggle-mic').style.background = audioTrack.enabled ? '' : '#ef4444';
    }
}

function toggleVideo() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById('toggle-video').style.background = videoTrack.enabled ? '' : '#ef4444';
    }
}

function copyMyId() {
    const idInput = document.getElementById('my-peer-id');
    idInput.select();
    document.execCommand('copy');
    showToast("Đã copy ID!", "success");
}
