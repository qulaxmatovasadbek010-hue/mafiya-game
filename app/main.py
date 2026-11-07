import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.game_models import RoomSettings
from app.room_manager import RoomManager

app = FastAPI(title="Mafiya O'yini API")
manager = RoomManager()

# Static fayllarni ulash
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class CreateRoomRequest(BaseModel):
    host_name: str
    settings: Optional[RoomSettings] = None


class JoinRoomRequest(BaseModel):
    room_id: str
    player_name: str


@app.get("/")
async def get_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    return FileResponse(index_path)


@app.post("/api/room/create")
async def create_room(req: CreateRoomRequest):
    name = req.host_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Ismni kiritish shart!")
    room_id, host_id = manager.create_room(host_name=name, settings=req.settings)
    return {"success": True, "room_id": room_id, "player_id": host_id}


@app.post("/api/room/join")
async def join_room(req: JoinRoomRequest):
    name = req.player_name.strip()
    rid = req.room_id.strip()
    if not name or not rid:
        raise HTTPException(status_code=400, detail="Xona kodi va ismni kiriting!")
    success, msg, pid = manager.join_room(room_id=rid, player_name=name)
    if not success:
        return {"success": False, "message": msg}
    return {"success": True, "room_id": rid.upper(), "player_id": pid}


@app.post("/api/room/{room_id}/bot")
async def add_bot(room_id: str):
    success, msg = manager.add_bot(room_id.upper())
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    await manager.broadcast_to_room(room_id.upper(), {"type": "game_state_update"})
    return {"success": True, "message": msg}


@app.post("/api/room/{room_id}/settings")
async def update_settings(room_id: str, settings: RoomSettings):
    rid = room_id.upper()
    if rid not in manager.rooms:
        raise HTTPException(status_code=404, detail="Xona topilmadi")
    engine = manager.rooms[rid]
    engine.settings = settings
    await manager.broadcast_to_room(rid, {"type": "game_state_update"})
    return {"success": True}


@app.websocket("/ws/{room_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_id: str):
    await websocket.accept()
    rid = room_id.upper()
    if rid not in manager.rooms:
        await websocket.close(code=1000, reason="Xona topilmadi")
        return

    await manager.register_connection(rid, player_id, websocket)
    engine = manager.rooms[rid]

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "start_game":
                # Faqat host boshlay oladi
                p = engine.players.get(player_id)
                if p and p.is_host:
                    ok, msg = await engine.start_game()
                    if not ok:
                        await websocket.send_json({"type": "error", "message": msg})

            elif msg_type == "night_action":
                target_id = data.get("target_id")
                res = engine.handle_night_action(player_id, target_id)
                await websocket.send_json({"type": "action_result", "data": res})
                await engine.broadcast_state()

            elif msg_type == "vote_action":
                target_id = data.get("target_id")
                res = engine.handle_vote(player_id, target_id)
                await websocket.send_json({"type": "action_result", "data": res})
                await engine.broadcast_state()

            elif msg_type == "chat_message":
                text = data.get("text", "").strip()
                scope = data.get("scope", "all")
                if text:
                    await manager.send_chat(rid, player_id, text, scope)

            elif msg_type == "restart_game":
                p = engine.players.get(player_id)
                if p and p.is_host:
                    engine.phase = "lobby"
                    for pl in engine.players.values():
                        pl.role = None
                        pl.is_alive = True
                        pl.night_target = None
                        pl.vote_target = None
                    await engine.broadcast_state()

    except WebSocketDisconnect:
        manager.remove_connection(rid, player_id)
        await manager.broadcast_to_room(rid, {"type": "game_state_update"})
    except Exception:
        manager.remove_connection(rid, player_id)
