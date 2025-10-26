import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, runTransaction, update, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwird5A7fTnSD3JA7HgHNJhVOi3yiPVwU",
  authDomain: "stylish-steps.firebaseapp.com",
  databaseURL: "https://stylish-steps-default-rtdb.firebaseio.com",
  projectId: "stylish-steps",
  storageBucket: "stylish-steps.firebasestorage.app",
  messagingSenderId: "580730135694",
  appId: "1:580730135694:web:3d77bfef3af246f9c755df",
  measurementId: "G-21F9WH2PZT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const params = new URLSearchParams(window.location.search);
let roomId = params.get("id");
const isCreator = params.get("creator") === "true"; 

if (!roomId) {
  alert("❌ No room ID provided");
  window.location.href = "index.html";
}
document.getElementById("room-id-display").innerText = "Room: " + roomId;

if (!isCreator) {
  document.getElementById("video-controls").style.display = "none";
  document.getElementById("align-controls").style.display = "block";
}

// --- User ---
let userName = isCreator ? "👑 Creator" : "🙋 Viewer";
const userNameSpan = document.getElementById("user-name");
userNameSpan.textContent = userName;

const userId = Math.random().toString(36).substring(2, 10);

userNameSpan.addEventListener("click", () => {
  const newName = prompt("Escribe tu nuevo nombre (máx. 13 caracteres):", userName.replace("👑 ", "").replace("🙋 ", ""));
  if (newName !== null) {
    const trimmed = newName.trim().slice(0, 13);
    userName = (isCreator ? "👑 " : "🙋 ") + (trimmed || (isCreator ? "Creator" : "Viewer"));
    userNameSpan.textContent = userName;
    update(ref(db, "rooms/" + roomId + "/userList/" + userId), { name: userName });
  }
});

// --- Users counter ---
const userCountRef = ref(db, "rooms/" + roomId + "/users");
runTransaction(userCountRef, (current) => (current || 0) + 1);

const userListRef = ref(db, "rooms/" + roomId + "/userList/" + userId);
set(userListRef, { name: userName, muted: false });

onValue(userCountRef, (snap) => {
  const count = snap.val() || 0;
  document.getElementById("user-count").innerText = count + " online";
});

window.addEventListener("beforeunload", () => {
  runTransaction(userCountRef, (current) => (current || 1) - 1);
  remove(userListRef);
});

// --- Expulsión ---
const expelledRef = ref(db, "rooms/" + roomId + "/expelled/" + userId);
onValue(expelledRef, (snap) => {
  if (snap.val() === true) {
    alert("Has sido expulsado de la sala.");
    window.location.href = "index.html";
  }
});

// --- Modal Users ---
const userModal = document.getElementById("user-modal");
const userListDiv = document.getElementById("user-list");
document.getElementById("user-count").addEventListener("click", () => {
  userModal.classList.remove("hidden");
});
document.getElementById("close-modal").addEventListener("click", () => {
  userModal.classList.add("hidden");
});

onValue(ref(db, "rooms/" + roomId + "/userList"), (snap) => {
  userListDiv.innerHTML = "";
  snap.forEach((child) => {
    const data = child.val();
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-slate-700 p-2 rounded";
    div.innerHTML = `
      <span>${data.name}</span>
      ${isCreator ? `
      <div class="flex gap-2">
        <button data-id="${child.key}" class="mute-btn bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs">
          ${data.muted ? "Unmute" : "Mute"}
        </button>
        <button data-expel="${child.key}" class="expel-btn bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">
          Expulsar
        </button>
      </div>` : ""}
    `;
    userListDiv.appendChild(div);
  });

  if (isCreator) {
    // mute
    document.querySelectorAll(".mute-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.id;
        const newState = btn.textContent === "Mute";
        update(ref(db, "rooms/" + roomId + "/userList/" + uid), { muted: newState });
      });
    });
    // expulsar
    document.querySelectorAll(".expel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.expel;
        set(ref(db, "rooms/" + roomId + "/expelled/" + uid), true);

        // regenerar roomId
        const newRoomId = Math.random().toString(36).substring(2, 8);
        set(ref(db, "rooms/" + newRoomId), { users: 0 }); 
        document.getElementById("room-id-display").innerText = "Room: " + newRoomId;
        alert("Nuevo Room creado: " + newRoomId);
        roomId = newRoomId;
      });
    });
  }
});

// --- Chat ---
const chatRef = ref(db, "rooms/" + roomId + "/chat");
const chatBox = document.getElementById("chat-messages");

onValue(chatRef, (snap) => {
  chatBox.innerHTML = "";
  snap.forEach((msg) => {
    const data = msg.val();
    const div = document.createElement("div");
    div.className = "bg-slate-700 p-2 rounded break-words";
    div.innerHTML = `
      <span class="text-emerald-400 font-bold">${data.user}</span> 
      <span class="text-gray-400 text-xs">[${new Date(data.time).toLocaleTimeString()}]</span><br>
      ${data.text}
    `;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

document.getElementById("send-chat").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input.value.trim()) return;
  push(chatRef, {
    user: userName,
    text: input.value.trim(),
    time: Date.now()
  });
  input.value = "";
}

// --- Video ---
let player;
let syncInterval;
const videoRef = ref(db, "rooms/" + roomId + "/video");

window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: "",
    events: {
      onReady: () => console.log("✅ Player ready"),
      onStateChange: handlePlayerState
    }
  });
};

function handlePlayerState(event) {
  if (!isCreator) return;
  if (event.data === YT.PlayerState.PLAYING) {
    update(videoRef, { time: player.getCurrentTime(), action: "play" });
    syncInterval = setInterval(() => {
      update(videoRef, { time: player.getCurrentTime(), action: "play" });
    }, 2000);
  } else if (event.data === YT.PlayerState.PAUSED) {
    clearInterval(syncInterval);
    update(videoRef, { time: player.getCurrentTime(), action: "pause" });
  }
}

if (isCreator) {
  document.getElementById("load-video").addEventListener("click", () => {
    const url = document.getElementById("video-url").value.trim();
    if (!url) return;
    const vid = extractVideoId(url);
    set(videoRef, { url: url, videoId: vid, action: "pause", time: 0 });
    player.loadVideoById(vid);
  });
}

onValue(videoRef, (snap) => {
  const data = snap.val();
  if (!data || isCreator || !player) return;

  if (data.videoId && player.getVideoData().video_id !== data.videoId) {
    player.loadVideoById(data.videoId, data.time || 0);
  } else {
    const diff = Math.abs(player.getCurrentTime() - data.time);
    if (diff > 1) player.seekTo(data.time, true);
  }

  if (data.action === "play") player.playVideo();
  else player.pauseVideo();
});

if (!isCreator) {
  document.getElementById("align-video").addEventListener("click", async () => {
    const snap = await get(videoRef);
    if (snap.exists()) {
      const data = snap.val();
      if (data && player) {
        player.seekTo(data.time, true);
        if (data.action === "play") player.playVideo();
        else player.pauseVideo();
      }
    }
  });
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }
  } catch (e) {
    const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  }
  return "";
}

// --- Mic controls ---
let micEnabled = true;
const toggleMicBtn = document.getElementById("toggle-mic");
const muteAllBtn = document.getElementById("mute-all");

if (isCreator) muteAllBtn.classList.remove("hidden");

toggleMicBtn.addEventListener("click", () => {
  micEnabled = !micEnabled;
  const icon = toggleMicBtn.querySelector("i");
  if (micEnabled) {
    icon.classList.remove("fa-microphone-slash");
    icon.classList.add("fa-microphone");
  } else {
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
  }
});

muteAllBtn.addEventListener("click", () => {
  set(ref(db, "rooms/" + roomId + "/muteAll"), true);
});

const muteAllRef = ref(db, "rooms/" + roomId + "/muteAll");
onValue(muteAllRef, (snap) => {
  if (snap.val() === true) {
    micEnabled = false;
    const icon = toggleMicBtn.querySelector("i");
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
  }
});

// --- Leave room ---
document.getElementById("leave

