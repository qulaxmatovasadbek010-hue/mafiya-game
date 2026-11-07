// Mafiya O'yini - Asosiy Mijoz Skripti

const state = {
  roomId: null,
  playerId: null,
  playerName: "",
  ws: null,
  gameState: null,
  selectedNightTarget: null,
  selectedVoteTarget: null,
  settings: {
    max_players: 10,
    mafia_count: 2,
    enable_commissioner: true,
    enable_doctor: true,
    enable_don: false,
    enable_maniac: false,
    enable_lover: false,
    enable_lawyer: false,
    night_duration: 30,
    discussion_duration: 60,
    voting_duration: 30
  }
};

// DOM yuklanganda boshlash
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  setupEventListeners();
  checkUrlForRoomCode();
});

function initUI() {
  // Bosh sahifa logotipini joylashtirish
  const logoEl = document.getElementById("home-logo-container");
  if (logoEl && GAME_SVGS.logo) {
    logoEl.innerHTML = GAME_SVGS.logo;
  }
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }

  // Header ko'rinishi
  const header = document.getElementById("main-header");
  if (screenId === "screen-home") {
    header.style.display = "none";
  } else {
    header.style.display = "flex";
  }
}

function checkUrlForRoomCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("room");
  if (code) {
    document.getElementById("input-join-code").value = code.toUpperCase();
    document.getElementById("modal-join").classList.add("active");
  }
}

function setupEventListeners() {
  // Ovoz tugmasi
  document.getElementById("btn-sound-toggle").addEventListener("click", () => {
    const enabled = audio.toggleSound();
    const icon = document.querySelector("#btn-sound-toggle i");
    icon.className = enabled ? "ti ti-volume" : "ti ti-volume-off";
  });

  // Qoidalar modali
  document.getElementById("btn-show-rules").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.add("active");
  });
  document.getElementById("btn-home-rules").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.add("active");
  });
  document.getElementById("btn-close-rules").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.remove("active");
  });
  document.getElementById("btn-rules-ok").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.remove("active");
  });

  // Kod bilan kirish modali
  document.getElementById("btn-open-join").addEventListener("click", () => {
    document.getElementById("modal-join").classList.add("active");
  });
  document.getElementById("btn-close-join").addEventListener("click", () => {
    document.getElementById("modal-join").classList.remove("active");
  });

  // Sozlamalar modali
  document.getElementById("btn-open-settings").addEventListener("click", () => {
    document.getElementById("modal-settings").classList.add("active");
  });
  document.getElementById("btn-close-settings").addEventListener("click", () => {
    document.getElementById("modal-settings").classList.remove("active");
  });

  // Sozlamalar stepperlari
  document.getElementById("btn-inc-players").addEventListener("click", () => {
    if (state.settings.max_players < 20) {
      state.settings.max_players++;
      document.getElementById("st-max-players").innerText = state.settings.max_players;
    }
  });
  document.getElementById("btn-dec-players").addEventListener("click", () => {
    if (state.settings.max_players > 4) {
      state.settings.max_players--;
      document.getElementById("st-max-players").innerText = state.settings.max_players;
    }
  });
  document.getElementById("btn-inc-mafia").addEventListener("click", () => {
    if (state.settings.mafia_count < 6) {
      state.settings.mafia_count++;
      document.getElementById("st-mafia-count").innerText = state.settings.mafia_count;
    }
  });
  document.getElementById("btn-dec-mafia").addEventListener("click", () => {
    if (state.settings.mafia_count > 1) {
      state.settings.mafia_count--;
      document.getElementById("st-mafia-count").innerText = state.settings.mafia_count;
    }
  });

  // Sozlamalar rollar togglelari
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    el.addEventListener("click", () => {
      state.settings[key] = !state.settings[key];
      el.classList.toggle("active", state.settings[key]);
    });
  };
  bindToggle("toggle-commissioner", "enable_commissioner");
  bindToggle("toggle-doctor", "enable_doctor");
  bindToggle("toggle-don", "enable_don");
  bindToggle("toggle-maniac", "enable_maniac");
  bindToggle("toggle-lover", "enable_lover");
  bindToggle("toggle-lawyer", "enable_lawyer");

  // Sozlamalarni saqlash
  document.getElementById("btn-save-settings").addEventListener("click", async () => {
    document.getElementById("modal-settings").classList.remove("active");
    if (state.roomId) {
      await fetch(`/api/room/${state.roomId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.settings)
      });
    }
  });

  // Yangi xona yaratish
  document.getElementById("btn-create-room").addEventListener("click", async () => {
    const name = document.getElementById("input-player-name").value.trim();
    if (!name) {
      alert("Iltimos, ismingizni kiriting!");
      return;
    }
    audio.playButton();
    state.playerName = name;

    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host_name: name, settings: state.settings })
    });
    const data = await res.json();
    if (data.success) {
      state.roomId = data.room_id;
      state.playerId = data.player_id;
      connectWebSocket();
    }
  });

  // Kod bilan kirish tasdiqlash
  document.getElementById("btn-submit-join").addEventListener("click", async () => {
    let name = document.getElementById("input-player-name").value.trim();
    const code = document.getElementById("input-join-code").value.trim().toUpperCase();
    if (!name) {
      name = prompt("Ismingizni kiriting:") || "";
    }
    if (!name.trim() || !code) {
      alert("Ism va xona kodini kiriting!");
      return;
    }
    state.playerName = name.trim();
    audio.playButton();

    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: code, player_name: state.playerName })
    });
    const data = await res.json();
    if (data.success) {
      state.roomId = data.room_id;
      state.playerId = data.player_id;
      document.getElementById("modal-join").classList.remove("active");
      connectWebSocket();
    } else {
      alert(data.message || "Ulanishda xatolik yuz berdi");
    }
  });

  // Havolani nusxalash
  document.getElementById("btn-copy-link").addEventListener("click", () => {
    const url = `${window.location.origin}/?room=${state.roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Xona havolasi nusxalandi! Do'stlaringizga yuboring.");
    });
  });

  // Bot qo'shish
  document.getElementById("btn-add-bot").addEventListener("click", async () => {
    audio.playButton();
    await fetch(`/api/room/${state.roomId}/bot`, { method: "POST" });
  });

  // O'yinni boshlash
  document.getElementById("btn-start-game").addEventListener("click", () => {
    audio.playButton();
    if (state.ws) {
      state.ws.send(JSON.stringify({ type: "start_game" }));
    }
  });

  // Tun harakatini tasdiqlash
  document.getElementById("btn-confirm-night-action").addEventListener("click", () => {
    if (!state.selectedNightTarget) return;
    audio.playButton();
    state.ws.send(JSON.stringify({
      type: "night_action",
      target_id: state.selectedNightTarget
    }));
    document.getElementById("btn-confirm-night-action").style.display = "none";
  });

  // Ovoz berishda o'tkazib yuborish
  document.getElementById("btn-skip-vote").addEventListener("click", () => {
    audio.playButton();
    state.ws.send(JSON.stringify({
      type: "vote_action",
      target_id: null
    }));
  });

  // Qayta o'ynash
  document.getElementById("btn-play-again").addEventListener("click", () => {
    audio.playButton();
    state.ws.send(JSON.stringify({ type: "restart_game" }));
  });

  // Xonadan chiqish
  document.getElementById("btn-leave-room").addEventListener("click", () => {
    window.location.href = "/";
  });

  // Chat jo'natish
  const sendDayChat = () => {
    const input = document.getElementById("day-chat-input");
    const text = input.value.trim();
    if (text && state.ws) {
      state.ws.send(JSON.stringify({ type: "chat_message", text, scope: "all" }));
      input.value = "";
    }
  };
  document.getElementById("btn-send-day-chat").addEventListener("click", sendDayChat);
  document.getElementById("day-chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendDayChat();
  });

  const sendNightChat = () => {
    const input = document.getElementById("night-chat-input");
    const text = input.value.trim();
    if (text && state.ws) {
      state.ws.send(JSON.stringify({ type: "chat_message", text, scope: "mafia" }));
      input.value = "";
    }
  };
  document.getElementById("btn-send-night-chat").addEventListener("click", sendNightChat);
  document.getElementById("night-chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendNightChat();
  });
}

function connectWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/${state.roomId}/${state.playerId}`;

  state.ws = new WebSocket(wsUrl);

  state.ws.onopen = () => {
    document.getElementById("header-room-code").innerText = state.roomId;
    document.getElementById("lobby-room-code").innerText = state.roomId;
  };

  state.ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "state_update") {
      handleStateUpdate(msg.data);
    } else if (msg.type === "timer_tick") {
      handleTimerTick(msg.seconds);
    } else if (msg.type === "chat_message") {
      handleChatMessage(msg.chat);
    } else if (msg.type === "error") {
      alert(msg.message);
    }
  };

  state.ws.onclose = () => {
    console.log("WebSocket ulanishi uzildi");
  };
}

let lastPhase = null;

function handleStateUpdate(data) {
  state.gameState = data;
  const phase = data.phase;
  const myPlayer = data.my_player;

  // Bosqich o'zgarganda tegishli audio chalish
  if (phase !== lastPhase) {
    if (phase === "night") {
      audio.playNight();
    } else if (phase === "night_result") {
      if (data.night_report && data.night_report.killed_player_name) {
        audio.playGunshot();
      } else {
        audio.playHeal();
      }
      setTimeout(() => audio.playDay(), 1000);
    } else if (phase === "vote_result") {
      audio.playGavel();
    } else if (phase === "game_over") {
      audio.playVictory();
    }
    lastPhase = phase;
  }

  // Ekranlarni boshqarish
  if (phase === "lobby") {
    renderLobby(data);
    showScreen("screen-lobby");
  } else if (phase === "role_reveal") {
    renderRoleReveal(data);
    showScreen("screen-role-reveal");
  } else if (phase === "night") {
    renderNight(data);
    showScreen("screen-night");
  } else if (phase === "night_result") {
    renderNightResult(data);
    showScreen("screen-night-result");
  } else if (phase === "day_discussion") {
    renderDayDiscussion(data);
    showScreen("screen-day");
  } else if (phase === "voting") {
    renderVoting(data);
    showScreen("screen-voting");
  } else if (phase === "vote_result") {
    renderVoteResult(data);
    showScreen("screen-vote-result");
  } else if (phase === "game_over") {
    renderGameOver(data);
    showScreen("screen-game-over");
  }
}

function handleTimerTick(seconds) {
  if (seconds <= 5 && seconds > 0) {
    audio.playTick();
  }
  // Barcha aktiv taymerlarni yangilash
  ["reveal-timer", "night-timer", "result-timer", "day-timer", "voting-timer", "vote-res-timer"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = seconds;
  });
}

function handleChatMessage(chat) {
  const isNight = chat.scope === "mafia";
  const container = document.getElementById(isNight ? "night-chat-messages" : "day-chat-messages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-msg";
  msgDiv.innerHTML = `<b>${chat.sender_name}:</b> ${escapeHtml(chat.text)}`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

// 1. KUTILISH XONASI
function renderLobby(data) {
  document.getElementById("lobby-count").innerText = data.players.length;
  document.getElementById("lobby-max").innerText = data.settings.max_players;

  const grid = document.getElementById("lobby-players-grid");
  grid.innerHTML = "";

  data.players.forEach(p => {
    const card = document.createElement("div");
    card.className = "player-badge";
    card.innerHTML = `
      <div class="player-avatar" style="background: ${p.avatar_color}">
        ${p.name.substring(0, 2).toUpperCase()}
      </div>
      <div class="player-name">${escapeHtml(p.name)}</div>
      ${p.is_host ? '<i class="ti ti-crown host-crown" title="Host"></i>' : ''}
      ${p.is_bot ? '<i class="ti ti-robot" style="color: var(--text-muted); font-size: 14px;"></i>' : ''}
    `;
    grid.appendChild(card);
  });

  const startBtn = document.getElementById("btn-start-game");
  const waitMsg = document.getElementById("lobby-wait-msg");

  if (data.my_player.is_host) {
    startBtn.style.display = "flex";
    waitMsg.style.display = "none";
  } else {
    startBtn.style.display = "none";
    waitMsg.style.display = "block";
  }
}

// 2. ROL OCHILISHI
function renderRoleReveal(data) {
  const myRole = data.my_player.role;
  const roleInfo = GAME_SVGS.roles[myRole] || GAME_SVGS.roles["citizen"];

  const front = document.getElementById("reveal-card-front");
  front.style.background = roleInfo.bg;
  front.style.borderColor = roleInfo.border;
  front.innerHTML = `
    ${roleInfo.svg}
    <div style="font-size: 20px; font-weight: 700; margin-top: 8px;">${roleInfo.name_uz}</div>
    <p class="caption" style="margin-top: 4px;">${roleInfo.desc}</p>
    <span style="background: ${roleInfo.border}; color: #fff; padding: 3px 12px; border-radius: 12px; font-size: 11px; margin-top: 8px; font-weight: 600;">
      ${roleInfo.team}
    </span>
  `;

  // Mafiya jamoadoshlarini ko'rsatish
  const isMafia = ["mafia", "don", "lawyer"].includes(myRole);
  const teammatesBox = document.getElementById("reveal-teammates");
  if (isMafia) {
    const teammates = data.players.filter(p => p.id !== data.my_player.id && ["mafia", "don", "lawyer"].includes(p.role));
    if (teammates.length > 0) {
      teammatesBox.style.display = "block";
      document.getElementById("reveal-teammates-list").innerText = teammates.map(t => `${t.name} (${t.role})`).join(", ");
    }
  } else {
    teammatesBox.style.display = "none";
  }
}

// 3. TUN BOSQICHI
function renderNight(data) {
  document.getElementById("night-day-num").innerText = data.day_number;
  const myRole = data.my_player.role;
  const isAlive = data.my_player.is_alive;

  const header = document.getElementById("night-role-title");
  const instruction = document.getElementById("night-instruction");
  const targetList = document.getElementById("night-target-list");
  const confirmBtn = document.getElementById("btn-confirm-night-action");
  const mafiaChat = document.getElementById("night-mafia-chat");

  targetList.innerHTML = "";
  state.selectedNightTarget = data.my_player.night_target || null;

  if (!isAlive) {
    header.innerText = "Siz o'lgansiz";
    instruction.innerText = "Tomosha rejimi: kechasi harakat qila olmaysiz.";
    confirmBtn.style.display = "none";
    mafiaChat.style.display = "none";
    return;
  }

  const isMafia = ["mafia", "don"].includes(myRole);
  mafiaChat.style.display = isMafia ? "flex" : "none";

  let canAct = false;
  let candidates = [];

  if (isMafia) {
    header.innerText = "Mafiya Hujumi";
    instruction.innerText = "Kelishib, bu kecha kimni o'ldirishni tanlang:";
    candidates = data.players.filter(p => p.is_alive && !["mafia", "don", "lawyer"].includes(p.role));
    canAct = true;
  } else if (myRole === "doctor") {
    header.innerText = "Shifokor Davolashi";
    instruction.innerText = "Bu kecha kimni davolab o'limdan saqlaysiz?";
    candidates = data.players.filter(p => p.is_alive);
    canAct = true;
  } else if (myRole === "commissioner") {
    header.innerText = "Komissar Tekshiruvi";
    instruction.innerText = "Kimning rolini tekshirmoqchisiz?";
    candidates = data.players.filter(p => p.is_alive && p.id !== data.my_player.id);
    canAct = true;
  } else if (myRole === "maniac") {
    header.innerText = "Manyak Hujumi";
    instruction.innerText = "Yolg'iz ov: bu kecha kimni o'ldirasiz?";
    candidates = data.players.filter(p => p.is_alive && p.id !== data.my_player.id);
    canAct = true;
  } else if (myRole === "lover") {
    header.innerText = "Sevgilisi To'sig'i";
    instruction.innerText = "Kimni tun bo'yi to'sib qo'ymoqchisiz?";
    candidates = data.players.filter(p => p.is_alive && p.id !== data.my_player.id);
    canAct = true;
  } else {
    header.innerText = "Tun tushdi";
    instruction.innerText = "Siz uxlamoqdasiz. Tong otishini kuting...";
    canAct = false;
  }

  if (canAct && candidates.length > 0) {
    candidates.forEach(cand => {
      const item = document.createElement("div");
      item.className = "target-item" + (state.selectedNightTarget === cand.id ? " selected" : "");
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="player-avatar" style="background: ${cand.avatar_color}">${cand.name.substring(0, 2).toUpperCase()}</div>
          <span style="font-weight: 600;">${escapeHtml(cand.name)}</span>
        </div>
        <i class="ti ti-target" style="font-size: 18px; color: var(--accent-red);"></i>
      `;
      item.addEventListener("click", () => {
        state.selectedNightTarget = cand.id;
        document.querySelectorAll("#night-target-list .target-item").forEach(el => el.classList.remove("selected"));
        item.classList.add("selected");
        confirmBtn.style.display = "flex";
      });
      targetList.appendChild(item);
    });
  } else if (!canAct) {
    targetList.innerHTML = `<p class="caption" style="padding: 24px 0;">🌙 Shahar tinch, shirin tushlar ko'ring...</p>`;
    confirmBtn.style.display = "none";
  }
}

// 4. TUN NATIJASI
function renderNightResult(data) {
  const report = data.night_report || {};
  const banner = document.getElementById("night-result-banner");
  const title = document.getElementById("night-result-title");
  const desc = document.getElementById("night-result-desc");
  const commBox = document.getElementById("commissioner-report-box");

  if (report.saved_by_doctor && !report.killed_player_name) {
    banner.innerHTML = GAME_SVGS.healed || "";
    title.innerText = "Shifokor qutqardi!";
    title.style.color = "var(--accent-green)";
    desc.innerText = report.message || "Bu kecha hech kim o'lmadi.";
  } else if (report.killed_player_name) {
    banner.innerHTML = GAME_SVGS.dawn || "";
    title.innerText = `Bu kecha ${report.killed_player_name} o'ldirildi!`;
    title.style.color = "var(--accent-red)";
    desc.innerText = report.message;
  } else {
    banner.innerHTML = GAME_SVGS.dawn || "";
    title.innerText = "Tinch kecha";
    title.style.color = "var(--accent-gold)";
    desc.innerText = report.message || "Kechasi hech qanday fojia sodir bo'lmadi.";
  }

  // Komissar tekshiruv natijasi kartochkasi
  if (data.inspection) {
    commBox.style.display = "block";
    const insp = data.inspection;
    const isMafia = insp.is_mafia;
    commBox.innerHTML = `
      <div style="background: ${isMafia ? '#791F1F' : '#04251f'}; border: 2px solid ${isMafia ? 'var(--accent-red)' : 'var(--accent-green)'}; border-radius: var(--radius-md); padding: 14px; text-align: center;">
        <div style="font-size: 13px; color: var(--text-muted);"><i class="ti ti-search"></i> Komissar Tekshiruvi: <b>${escapeHtml(insp.target_name)}</b></div>
        <div style="font-size: 22px; font-weight: 800; margin-top: 4px; color: ${isMafia ? '#FCEBEB' : '#E1F5EE'};">
          ${insp.text}
        </div>
      </div>
    `;
  } else {
    commBox.style.display = "none";
  }
}

// 5. KUNDUZGI MUHOKAMA
function renderDayDiscussion(data) {
  const grid = document.getElementById("day-players-grid");
  grid.innerHTML = "";

  data.players.forEach(p => {
    const badge = document.createElement("div");
    badge.className = "player-badge" + (!p.is_alive ? " dead" : "");
    badge.style.opacity = p.is_alive ? "1" : "0.5";
    badge.innerHTML = `
      <div class="player-avatar" style="background: ${p.avatar_color}">${p.name.substring(0, 2).toUpperCase()}</div>
      <div class="player-name">${escapeHtml(p.name)}</div>
      ${!p.is_alive ? '<span class="dead-tag">O\'lgan</span>' : ''}
    `;
    grid.appendChild(badge);
  });
}

// 6. OVOZ BERISH
function renderVoting(data) {
  const targetList = document.getElementById("voting-target-list");
  targetList.innerHTML = "";
  const isAlive = data.my_player.is_alive;

  if (!isAlive) {
    targetList.innerHTML = `<p class="caption" style="padding: 16px 0;">Siz o'lgansiz, ovoz bera olmaysiz (arvoh rejimi).</p>`;
    document.getElementById("btn-skip-vote").style.display = "none";
    return;
  }

  document.getElementById("btn-skip-vote").style.display = "flex";

  const aliveCandidates = data.players.filter(p => p.is_alive && p.id !== data.my_player.id);
  aliveCandidates.forEach(cand => {
    const item = document.createElement("div");
    const isVoted = data.my_player.vote_target === cand.id;
    item.className = "target-item" + (isVoted ? " voted" : "");
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="player-avatar" style="background: ${cand.avatar_color}">${cand.name.substring(0, 2).toUpperCase()}</div>
        <span style="font-weight: 600;">${escapeHtml(cand.name)}</span>
      </div>
      <button class="btn btn-purple" style="width: auto; padding: 6px 14px; font-size: 12px;">
        Ovoz berish
      </button>
    `;
    item.addEventListener("click", () => {
      audio.playButton();
      state.ws.send(JSON.stringify({ type: "vote_action", target_id: cand.id }));
    });
    targetList.appendChild(item);
  });
}

// 7. OVOZ BERISH NATIJASI
function renderVoteResult(data) {
  const report = data.vote_report || {};
  const headline = document.getElementById("vote-result-headline");
  const graphic = document.getElementById("vote-result-graphic");
  const roleText = document.getElementById("vote-result-revealed-role");
  const details = document.getElementById("vote-result-details");

  if (report.eliminated_player_name) {
    headline.innerText = `${report.eliminated_player_name} osildi!`;
    graphic.innerHTML = GAME_SVGS.hung || "";
    roleText.innerText = `Ochilgan rol: ${report.eliminated_player_role}`;
    details.innerText = report.message;
  } else {
    headline.innerText = "Hech kim osilmadi";
    graphic.innerHTML = "";
    roleText.innerText = report.is_tie ? "Ovozlar teng chiqdi" : "Ovoz berilmadi";
    details.innerText = report.message;
  }
}

// 8. O'YIN TUGADI
function renderGameOver(data) {
  document.getElementById("game-over-winner-title").innerText = data.winner_team === "citizens" ? "TINCH AHOLI YUTDI!" : (data.winner_team === "mafia" ? "MAFIYA YUTDI!" : "MANIAK YUTDI!");
  document.getElementById("game-over-winner-desc").innerText = data.winner_text;

  const roster = document.getElementById("game-over-roster");
  roster.innerHTML = "";

  data.players.forEach(p => {
    const roleKey = p.role || "citizen";
    const roleInfo = GAME_SVGS.roles[roleKey] || { name_uz: roleKey, border: "var(--accent-purple)" };
    const row = document.createElement("div");
    row.style = `display: flex; align-items: center; justify-content: space-between; background: var(--bg-row); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px;`;
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="player-avatar" style="background: ${p.avatar_color}">${p.name.substring(0, 2).toUpperCase()}</div>
        <span style="font-weight: 600;">${escapeHtml(p.name)}</span>
        ${!p.is_alive ? '<span class="dead-tag">O\'lgan</span>' : ''}
      </div>
      <span style="background: ${roleInfo.border}; color: #fff; padding: 2px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">
        ${roleInfo.name_uz}
      </span>
    `;
    roster.appendChild(row);
  });
}
