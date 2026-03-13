// PeerJS & WebRTC Logic for Online Calling and Games
let peer = null;
let dataChannel = null;
let currentCall = null;
let localStream = null;
let isInitiator = false;

function generateShortId(length = 5) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function initPeer() {
    if (peer) return;

    // Generate a short 5-char ID
    let myId = localStorage.getItem('peer_id_short');
    if (!myId) {
        myId = generateShortId();
        localStorage.setItem('peer_id_short', myId);
    }

    peer = new Peer(myId, {
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
        isInitiator = false;
        handleIncomingConnection(conn);
    });

    peer.on('call', (call) => {
        handleIncomingCall(call);
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
            // ID taken, generate new one
            const newId = generateShortId();
            localStorage.setItem('peer_id_short', newId);
            location.reload();
        } else {
            showToast("Lỗi kết nối: " + err.type, "error");
            updateWebRTCStatus("Lỗi");
        }
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

async function connectToPeer() {
    const remoteId = document.getElementById('remote-peer-id').value.trim().toUpperCase();
    if (!remoteId) {
        showToast("Vui lòng nhập ID đối phương", "info");
        return;
    }

    isInitiator = true;
    updateWebRTCStatus("Đang kết nối...");

    // Connect Data Channel
    const conn = peer.connect(remoteId);
    handleIncomingConnection(conn);

    // Connect Video Call
    await startCall(remoteId);
}

function handleIncomingConnection(conn) {
    dataChannel = conn;

    conn.on('open', () => {
        showToast("Đã kết nối dữ liệu!", "success");
        updateWebRTCStatus("Đã kết nối", "#10b981");

        if (currentGame === 'caro_online') {
            launchGame('caro_online');
        }
    });

    conn.on('data', (data) => {
        handleReceivedData(data);
    });

    conn.on('close', () => {
        showToast("Kết nối đã đóng", "info");
        updateWebRTCStatus("Sẵn sàng");
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
            if (currentGame === 'caro_online') {
                caroOnline_size = data.size;
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
    }
}

async function startCall(remoteId) {
    try {
        if (!localStream) {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }
        document.getElementById('local-video').srcObject = localStream;
        document.getElementById('online-call-ui').style.display = 'block';

        const call = peer.call(remoteId, localStream);
        currentCall = call;
        setupCallEvents(call);
    } catch (err) {
        console.error('Failed to get local stream', err);
        showToast("Không thể mở camera/micro", "error");
    }
}

function handleIncomingCall(call) {
    currentCall = call;

    // If receiver
    if (!localStream) {
        showInfoModal("Cuộc gọi đến", "Bạn có cuộc gọi video đến từ " + call.peer + ". Chấp nhận?", async () => {
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
        }, () => {
            call.close();
        });
    } else {
        // Already have stream (maybe re-connecting)
        call.answer(localStream);
        setupCallEvents(call);
    }
}

function setupCallEvents(call) {
    call.on('stream', (remoteStream) => {
        const remoteVid = document.getElementById('remote-video');
        remoteVid.srcObject = remoteStream;
        document.getElementById('remote-status').style.display = 'none';
        remoteVid.play().catch(e => console.log("Auto-play blocked", e));
    });

    call.on('close', () => {
        endCall();
    });

    call.on('error', (err) => {
        console.error("Call error", err);
        endCall();
    });
}

function endCall() {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    document.getElementById('online-call-ui').style.display = 'none';
    document.getElementById('local-video').srcObject = null;
    document.getElementById('remote-video').srcObject = null;
    document.getElementById('remote-status').style.display = 'block';
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
    const idVal = document.getElementById('my-peer-id').value;
    navigator.clipboard.writeText(idVal).then(() => {
        showToast("Đã copy ID: " + idVal, "success");
    });
}
