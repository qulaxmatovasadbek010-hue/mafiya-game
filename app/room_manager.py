import string
import random
import asyncio
from typing import Dict, List, Optional, Any
from fastapi import WebSocket
from app.game_models import RoomSettings, Role, GamePhase
from app.game_engine import GameEngine


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, GameEngine] = {}
        # (room_id, player_id) -> WebSocket
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
        # Chat messages: room_id -> list of {sender, text, scope, time}
        self.chats: Dict[str, List[Dict[str, Any]]] = {}

    def _generate_room_id(self) -> str:
        chars = string.ascii_uppercase + string.digits
        while True:
            rid = "".join(random.choices(chars, k=6))
            if rid not in self.rooms:
                return rid

    def create_room(self, host_name: str, settings: Optional[RoomSettings] = None) -> tuple[str, str]:
        room_id = self._generate_room_id()
        if not settings:
            settings = RoomSettings()

        async def broadcast_cb(event: Dict[str, Any]):
            await self.broadcast_to_room(room_id, event)

        engine = GameEngine(room_id=room_id, settings=settings, broadcast_callback=broadcast_cb)
        host_id = f"p_{random.randint(100000, 999999)}"
        engine.add_player(player_id=host_id, name=host_name, is_host=True)

        self.rooms[room_id] = engine
        self.connections[room_id] = {}
        self.chats[room_id] = []
        return room_id, host_id

    def join_room(self, room_id: str, player_name: str) -> tuple[bool, str, Optional[str]]:
        room_id = room_id.upper().strip()
        if room_id not in self.rooms:
            return False, "Bunday xona topilmadi!", None

        engine = self.rooms[room_id]
        if engine.phase != GamePhase.LOBBY:
            return False, "O'yin allaqachon boshlangan!", None

        if len(engine.players) >= engine.settings.max_players:
            return False, "Xonada bo'sh joy qolmagan!", None

        player_id = f"p_{random.randint(100000, 999999)}"
        engine.add_player(player_id=player_id, name=player_name, is_host=False)
        return True, "Muvaffaqiyatli ulandingiz!", player_id

    def add_bot(self, room_id: str) -> tuple[bool, str]:
        if room_id not in self.rooms:
            return False, "Xona topilmadi"
        engine = self.rooms[room_id]
        if engine.phase != GamePhase.LOBBY:
            return False, "Faqat kutilish (lobby) vaqtida bot qo'shish mumkin"

        bot_names = [
            "Jasur", "Sardor", "Dilnoza", "Madina", "Bekzod",
            "Nodira", "Azizbek", "Shahzod", "Gulnoza", "Kamron"
        ]
        existing_names = [p.name for p in engine.players.values()]
        available_names = [n for n in bot_names if n not in existing_names]
        bot_name = available_names[0] if available_names else f"Bot_{len(engine.players)+1}"

        bot_id = f"bot_{random.randint(100000, 999999)}"
        engine.add_player(player_id=bot_id, name=bot_name, is_host=False, is_bot=True)
        return True, f"{bot_name} bot qo'shildi"

    async def register_connection(self, room_id: str, player_id: str, ws: WebSocket):
        if room_id in self.connections:
            self.connections[room_id][player_id] = ws
            # Holatni ushbu o'yinchiga darhol yuborish
            await self.send_state_to_player(room_id, player_id)
            # Hammaga yangilanish xabari
            await self.broadcast_to_room(room_id, {"type": "player_joined"})

    def remove_connection(self, room_id: str, player_id: str):
        if room_id in self.connections and player_id in self.connections[room_id]:
            del self.connections[room_id][player_id]
        if room_id in self.rooms:
            engine = self.rooms[room_id]
            engine.remove_player(player_id)

    async def send_state_to_player(self, room_id: str, player_id: str):
        if room_id not in self.rooms or room_id not in self.connections:
            return
        ws = self.connections[room_id].get(player_id)
        if not ws:
            return
        engine = self.rooms[room_id]
        view = engine.get_player_view(player_id)
        try:
            await ws.send_json({
                "type": "state_update",
                "data": view
            })
        except Exception:
            pass

    async def broadcast_to_room(self, room_id: str, event: Dict[str, Any]):
        if room_id not in self.rooms or room_id not in self.connections:
            return
        engine = self.rooms[room_id]
        for pid, ws in list(self.connections[room_id].items()):
            try:
                if event.get("type") in ["game_state_update", "player_joined"]:
                    view = engine.get_player_view(pid)
                    await ws.send_json({
                        "type": "state_update",
                        "data": view
                    })
                else:
                    await ws.send_json(event)
            except Exception:
                pass

    async def send_chat(self, room_id: str, player_id: str, text: str, scope: str = "all"):
        if room_id not in self.rooms:
            return
        engine = self.rooms[room_id]
        sender = engine.players.get(player_id)
        if not sender:
            return

        chat_item = {
            "sender_id": sender.id,
            "sender_name": sender.name,
            "sender_color": sender.avatar_color,
            "text": text,
            "scope": scope # "all", "mafia", "ghost"
        }
        self.chats[room_id].append(chat_item)

        # Xabarni faqat ruxsat etilgan o'yinchilarga tarqatish
        for pid, ws in list(self.connections[room_id].items()):
            receiver = engine.players.get(pid)
            if not receiver:
                continue

            can_receive = False
            if scope == "all":
                can_receive = True
            elif scope == "mafia" and receiver.role in [Role.MAFIA, Role.DON, Role.LAWYER]:
                can_receive = True
            elif scope == "ghost" and not receiver.is_alive:
                can_receive = True

            if can_receive:
                try:
                    await ws.send_json({
                        "type": "chat_message",
                        "chat": chat_item
                    })
                except Exception:
                    pass
