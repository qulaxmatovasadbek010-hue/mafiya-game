import random
import asyncio
from typing import Dict, List, Optional, Tuple, Any
from app.game_models import Role, Team, GamePhase, RoomSettings, Player, NightReport, VoteReport


class GameEngine:
    def __init__(self, room_id: str, settings: RoomSettings, broadcast_callback):
        self.room_id = room_id
        self.settings = settings
        self.broadcast_callback = broadcast_callback # async funksiyasi
        self.players: Dict[str, Player] = {}
        self.phase: GamePhase = GamePhase.LOBBY
        self.day_number: int = 0
        self.timer_seconds: int = 0
        self.timer_task: Optional[asyncio.Task] = None
        self.night_report: Optional[NightReport] = None
        self.vote_report: Optional[VoteReport] = None
        self.winner_team: Optional[str] = None
        self.winner_text: str = ""
        self.inspections: Dict[str, str] = {} # commissioner_id -> inspection result text

    def add_player(self, player_id: str, name: str, is_host: bool = False, is_bot: bool = False) -> Player:
        colors = ["#AFA9EC", "#5DCAA5", "#ED93B1", "#FAC775", "#85B7EB", "#F0997B", "#B4B2A9", "#CECBF6"]
        avatar_color = colors[len(self.players) % len(colors)]
        player = Player(
            id=player_id,
            name=name,
            is_host=is_host,
            is_bot=is_bot,
            avatar_color=avatar_color
        )
        self.players[player_id] = player
        return player

    def remove_player(self, player_id: str):
        if player_id in self.players:
            p = self.players[player_id]
            if self.phase == GamePhase.LOBBY:
                del self.players[player_id]
                # Yangi host tayinlash
                if p.is_host and self.players:
                    first_player = next(iter(self.players.values()))
                    first_player.is_host = True
            else:
                p.disconnected = True

    def assign_roles(self):
        """O'yinchilarga rollarni adolatli taqsimlash (Fisher-Yates)"""
        player_ids = [p_id for p_id in self.players.keys()]
        random.shuffle(player_ids)
        total = len(player_ids)

        roles_pool: List[Role] = []
        mafia_need = min(self.settings.mafia_count, max(1, total // 3))

        # Don
        if self.settings.enable_don and mafia_need > 0:
            roles_pool.append(Role.DON)
            mafia_need -= 1

        # Oddiy mafiyalar
        for _ in range(mafia_need):
            roles_pool.append(Role.MAFIA)

        # Advokat (Mafiya jamoasi)
        if self.settings.enable_lawyer and len(roles_pool) + 1 < total:
            roles_pool.append(Role.LAWYER)

        # Manyak (Yolg'iz)
        if self.settings.enable_maniac and len(roles_pool) + 1 < total:
            roles_pool.append(Role.MANIAC)

        # Komissar (Tinch aholi)
        if self.settings.enable_commissioner and len(roles_pool) + 1 < total:
            roles_pool.append(Role.COMMISSIONER)

        # Shifokor (Tinch aholi)
        if self.settings.enable_doctor and len(roles_pool) + 1 < total:
            roles_pool.append(Role.DOCTOR)

        # Sevgilisi (Tinch aholi)
        if self.settings.enable_lover and len(roles_pool) + 1 < total:
            roles_pool.append(Role.LOVER)

        # Qolgan barcha o'rinlar Tinch aholi
        while len(roles_pool) < total:
            roles_pool.append(Role.CITIZEN)

        random.shuffle(roles_pool)

        for i, pid in enumerate(player_ids):
            self.players[pid].role = roles_pool[i]
            self.players[pid].is_alive = True
            self.players[pid].night_target = None
            self.players[pid].vote_target = None
            self.players[pid].is_blocked = False

    async def start_game(self):
        if len(self.players) < 4:
            return False, "O'yinni boshlash uchun kamida 4 nafar o'yinchi kerak!"
        
        self.assign_roles()
        self.phase = GamePhase.ROLE_REVEAL
        self.day_number = 1
        await self.broadcast_state()

        # 6 soniyadan so'ng 1-tunga o'tish
        self.timer_seconds = 6
        self.start_timer(self.transition_to_night)
        return True, "O'yin boshlandi!"

    def start_timer(self, callback_after_timer):
        if self.timer_task and not self.timer_task.done():
            self.timer_task.cancel()

        async def _run():
            try:
                while self.timer_seconds > 0:
                    await asyncio.sleep(1)
                    self.timer_seconds -= 1
                    await self.broadcast_timer()
                await callback_after_timer()
            except asyncio.CancelledError:
                pass

        self.timer_task = asyncio.create_task(_run())

    async def broadcast_timer(self):
        await self.broadcast_callback({
            "type": "timer_tick",
            "seconds": self.timer_seconds
        })

    async def transition_to_night(self):
        self.phase = GamePhase.NIGHT
        self.inspections.clear()
        for p in self.players.values():
            p.night_target = None
            p.vote_target = None
            p.is_blocked = False

        # Botlar avtomatik harakat qiladi
        self._simulate_bot_night_actions()

        await self.broadcast_state()
        self.timer_seconds = self.settings.night_duration
        self.start_timer(self.transition_to_night_result)

    def _simulate_bot_night_actions(self):
        """Botlarning tunda mustaqil qaror qabul qilishi"""
        alive_players = [p for p in self.players.values() if p.is_alive]
        alive_targets = [p.id for p in alive_players]
        
        for p in alive_players:
            if not p.is_bot:
                continue
            if p.role in [Role.MAFIA, Role.DON]:
                # Tinch aholiga hujum
                non_mafia = [t.id for t in alive_players if t.role not in [Role.MAFIA, Role.DON, Role.LAWYER]]
                if non_mafia:
                    p.night_target = random.choice(non_mafia)
            elif p.role == Role.DOCTOR:
                # O'zini yoki boshqani davolash
                p.night_target = random.choice(alive_targets)
            elif p.role == Role.COMMISSIONER:
                # O'zidan boshqa birini tekshirish
                others = [t.id for t in alive_players if t.id != p.id]
                if others:
                    p.night_target = random.choice(others)
            elif p.role == Role.MANIAC:
                others = [t.id for t in alive_players if t.id != p.id]
                if others:
                    p.night_target = random.choice(others)

    def handle_night_action(self, player_id: str, target_id: str) -> Dict[str, Any]:
        player = self.players.get(player_id)
        if not player or not player.is_alive or self.phase != GamePhase.NIGHT:
            return {"success": False, "message": "Harakat qilishga ruxsat yo'q"}

        target = self.players.get(target_id)
        if not target or not target.is_alive:
            return {"success": False, "message": "Noto'g'ri nishon"}

        player.night_target = target_id

        # Komissar uchun tezkor xabar tayyorlash
        res = {"success": True, "message": f"{target.name} tanlandi"}
        if player.role == Role.COMMISSIONER:
            is_mafia = target.role in [Role.MAFIA]
            # Don va advokat tekshiruvda toza ko'rinadi
            if target.role == Role.DON or target.role == Role.LAWYER:
                is_mafia = False
            
            res_text = "Mafiya!" if is_mafia else "Mafiya emas"
            self.inspections[player_id] = {
                "target_name": target.name,
                "is_mafia": is_mafia,
                "text": res_text
            }
            res["inspection"] = self.inspections[player_id]

        return res

    async def transition_to_night_result(self):
        self.phase = GamePhase.NIGHT_RESULT
        
        # 1. Sevgilisining to'sishi
        lovers = [p for p in self.players.values() if p.is_alive and p.role == Role.LOVER and p.night_target]
        for l in lovers:
            blocked_target = self.players.get(l.night_target)
            if blocked_target:
                blocked_target.is_blocked = True

        # 2. Mafiyalar nishonini hisoblash
        mafia_targets: Dict[str, int] = {}
        for p in self.players.values():
            if p.is_alive and not p.is_blocked and p.role in [Role.MAFIA, Role.DON] and p.night_target:
                mafia_targets[p.night_target] = mafia_targets.get(p.night_target, 0) + 1

        mafia_victim_id = None
        if mafia_targets:
            mafia_victim_id = max(mafia_targets, key=mafia_targets.get)

        # 3. Shifokor davolashi
        healed_id = None
        for p in self.players.values():
            if p.is_alive and not p.is_blocked and p.role == Role.DOCTOR and p.night_target:
                healed_id = p.night_target
                break

        # 4. Manyak nishoni
        maniac_victim_id = None
        for p in self.players.values():
            if p.is_alive and not p.is_blocked and p.role == Role.MANIAC and p.night_target:
                maniac_victim_id = p.night_target
                break

        # Natijani hisoblash
        saved_by_doc = False
        killed_id = None
        killed_name = None

        if mafia_victim_id:
            if mafia_victim_id == healed_id:
                saved_by_doc = True
            else:
                killed_id = mafia_victim_id
                victim = self.players.get(mafia_victim_id)
                if victim:
                    victim.is_alive = False
                    killed_name = victim.name

        maniac_kill_id = None
        maniac_kill_name = None
        if maniac_victim_id and maniac_victim_id != healed_id and maniac_victim_id != killed_id:
            victim_m = self.players.get(maniac_victim_id)
            if victim_m and victim_m.is_alive:
                victim_m.is_alive = False
                maniac_kill_id = victim_m.id
                maniac_kill_name = victim_m.name

        msg = ""
        if saved_by_doc and not killed_id:
            msg = "Shifokor qutqardi! Bu kecha hech kim o'lmadi."
        elif killed_name:
            msg = f"Bu kecha {killed_name} o'ldirildi."
            if maniac_kill_name:
                msg += f" Shuningdek Manyak {maniac_kill_name}ni ham o'ldirdi!"
        else:
            msg = "Bu tun tinch o'tdi, hech kim jabr ko'rmadi."

        self.night_report = NightReport(
            killed_player_id=killed_id,
            killed_player_name=killed_name,
            saved_by_doctor=saved_by_doc,
            maniac_kill_id=maniac_kill_id,
            maniac_kill_name=maniac_kill_name,
            message=msg
        )

        await self.broadcast_state()

        # G'alaba shartini tekshirish
        if self.check_win_condition():
            return

        # 7 soniyadan so'ng kunduzgi muhokamaga o'tish
        self.timer_seconds = 7
        self.start_timer(self.transition_to_discussion)

    async def transition_to_discussion(self):
        self.phase = GamePhase.DAY_DISCUSSION
        await self.broadcast_state()
        self.timer_seconds = self.settings.discussion_duration
        self.start_timer(self.transition_to_voting)

    async def transition_to_voting(self):
        self.phase = GamePhase.VOTING
        for p in self.players.values():
            p.vote_target = None

        # Botlarning ovoz berishi
        alive = [p for p in self.players.values() if p.is_alive]
        for p in alive:
            if p.is_bot:
                candidates = [c.id for c in alive if c.id != p.id]
                if candidates:
                    p.vote_target = random.choice(candidates)

        await self.broadcast_state()
        self.timer_seconds = self.settings.voting_duration
        self.start_timer(self.transition_to_vote_result)

    def handle_vote(self, player_id: str, target_id: Optional[str]) -> Dict[str, Any]:
        player = self.players.get(player_id)
        if not player or not player.is_alive or self.phase != GamePhase.VOTING:
            return {"success": False, "message": "Ovoz berishga ruxsat yo'q"}

        player.vote_target = target_id
        return {"success": True, "message": "Ovoz qabul qilindi"}

    async def transition_to_vote_result(self):
        self.phase = GamePhase.VOTE_RESULT
        
        # Ovozlar soni
        vote_counts: Dict[str, int] = {}
        for p in self.players.values():
            if p.is_alive and p.vote_target:
                vote_counts[p.vote_target] = vote_counts.get(p.vote_target, 0) + 1

        eliminated_id = None
        eliminated_name = None
        eliminated_role = None
        is_tie = False
        msg = ""

        if vote_counts:
            sorted_votes = sorted(vote_counts.items(), key=lambda x: x[1], reverse=True)
            top_target, max_votes = sorted_votes[0]
            
            # Agar teng ovoz bo'lsa
            if len(sorted_votes) > 1 and sorted_votes[1][1] == max_votes:
                is_tie = True
                msg = f"Ovozlar teng chiqdi ({max_votes} ovoz). Bugun hech kim chiqarilmadi."
            else:
                eliminated_id = top_target
                target_p = self.players.get(top_target)
                if target_p:
                    target_p.is_alive = False
                    eliminated_name = target_p.name
                    eliminated_role = target_p.role
                    role_display = {
                        Role.MAFIA: "Mafiya",
                        Role.DON: "Don (Mafiya)",
                        Role.LAWYER: "Advokat",
                        Role.COMMISSIONER: "Komissar",
                        Role.DOCTOR: "Shifokor",
                        Role.MANIAC: "Manyak",
                        Role.LOVER: "Sevgilisi",
                        Role.CITIZEN: "Tinch aholi"
                    }.get(target_p.role, str(target_p.role))
                    msg = f"Shahar aholisi qarori bilan {eliminated_name} osildi ({max_votes} ovoz). Uning roli: {role_display} edi."
        else:
            msg = "Hech kim ovoz bermadi. Hech kim chiqarilmadi."

        self.vote_report = VoteReport(
            eliminated_player_id=eliminated_id,
            eliminated_player_name=eliminated_name,
            eliminated_player_role=eliminated_role,
            vote_counts=vote_counts,
            is_tie=is_tie,
            message=msg
        )

        await self.broadcast_state()

        if self.check_win_condition():
            return

        # Yangi kunga va tunga o'tish
        self.day_number += 1
        self.timer_seconds = 7
        self.start_timer(self.transition_to_night)

    def check_win_condition(self) -> bool:
        alive_players = [p for p in self.players.values() if p.is_alive]
        mafia_alive = [p for p in alive_players if p.role in [Role.MAFIA, Role.DON, Role.LAWYER]]
        citizens_alive = [p for p in alive_players if p.role in [Role.CITIZEN, Role.COMMISSIONER, Role.DOCTOR, Role.LOVER]]
        maniac_alive = [p for p in alive_players if p.role == Role.MANIAC]

        # 1. Barcha mafiya o'ldi
        if len(mafia_alive) == 0 and len(maniac_alive) == 0:
            self.phase = GamePhase.GAME_OVER
            self.winner_team = Team.CITIZENS
            self.winner_text = "Tinch aholi g'alaba qildi! Barcha mafiyalar fosh etildi."
            asyncio.create_task(self.broadcast_state())
            return True

        # 2. Mafiya soni >= Tinch aholi soni
        if len(mafia_alive) >= len(citizens_alive) and len(maniac_alive) == 0:
            self.phase = GamePhase.GAME_OVER
            self.winner_team = Team.MAFIA
            self.winner_text = "Mafiya g'alaba qildi! Shahar mafiya qo'liga o'tdi."
            asyncio.create_task(self.broadcast_state())
            return True

        # 3. Manyak g'alabasi (agar faqat manyak va 1 kishi qolsa)
        if len(maniac_alive) == 1 and len(alive_players) <= 2:
            self.phase = GamePhase.GAME_OVER
            self.winner_team = Team.NEUTRAL
            self.winner_text = "Manyak g'alaba qildi! Shaharda faqat u tirik qoldi."
            asyncio.create_task(self.broadcast_state())
            return True

        return False

    def get_player_view(self, player_id: str) -> Dict[str, Any]:
        """Xavfsiz ko'rinish: Har bir o'yinchi faqat o'ziga ruxsat etilgan ma'lumotni ko'radi"""
        current_player = self.players.get(player_id)
        if not current_player:
            return {}

        players_list = []
        is_mafia_team = current_player.role in [Role.MAFIA, Role.DON, Role.LAWYER]

        for p in self.players.values():
            p_data = {
                "id": p.id,
                "name": p.name,
                "is_alive": p.is_alive,
                "is_host": p.is_host,
                "is_bot": p.is_bot,
                "avatar_color": p.avatar_color,
                "disconnected": p.disconnected
            }
            # O'yin tugaganda barcha rollar ochiladi
            if self.phase == GamePhase.GAME_OVER:
                p_data["role"] = p.role
            # O'z rolini har doim ko'radi
            elif p.id == player_id:
                p_data["role"] = p.role
            # Mafiya o'z sheriklarini ko'radi
            elif is_mafia_team and p.role in [Role.MAFIA, Role.DON, Role.LAWYER]:
                p_data["role"] = p.role
            # Boshqa o'yinchilarning rollari sir saqlanadi
            else:
                p_data["role"] = None

            # Ovoz berishda kim kimga ovoz berganini ko'rsatish (agar ovoz berilgan bo'lsa)
            if self.phase in [GamePhase.VOTING, GamePhase.VOTE_RESULT]:
                p_data["vote_target"] = p.vote_target

            players_list.append(p_data)

        # Hozirgi o'yinchi uchun komissar tekshiruvi xabari
        inspection_data = None
        if current_player.role == Role.COMMISSIONER and player_id in self.inspections:
            inspection_data = self.inspections[player_id]

        alive_count = sum(1 for p in self.players.values() if p.is_alive)
        mafia_count = sum(1 for p in self.players.values() if p.is_alive and p.role in [Role.MAFIA, Role.DON, Role.LAWYER])
        citizen_count = alive_count - mafia_count

        return {
            "room_id": self.room_id,
            "phase": self.phase,
            "day_number": self.day_number,
            "timer_seconds": self.timer_seconds,
            "my_player": {
                "id": current_player.id,
                "name": current_player.name,
                "role": current_player.role,
                "is_alive": current_player.is_alive,
                "is_host": current_player.is_host,
                "night_target": current_player.night_target,
                "vote_target": current_player.vote_target,
                "is_blocked": current_player.is_blocked
            },
            "players": players_list,
            "settings": self.settings.model_dump(),
            "night_report": self.night_report.model_dump() if self.night_report else None,
            "vote_report": self.vote_report.model_dump() if self.vote_report else None,
            "winner_team": self.winner_team,
            "winner_text": self.winner_text,
            "inspection": inspection_data,
            "stats": {
                "alive": alive_count,
                "mafia": mafia_count,
                "citizens": citizen_count
            }
        }

    async def broadcast_state(self):
        """Barcha o'yinchilarga xavfsiz holatni yuborish"""
        await self.broadcast_callback({
            "type": "game_state_update",
            "room_id": self.room_id
        })
