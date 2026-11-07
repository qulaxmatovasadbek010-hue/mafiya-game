from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class Role(str, Enum):
    CITIZEN = "citizen"            # Tinch aholi
    MAFIA = "mafia"                # Mafiya
    COMMISSIONER = "commissioner"  # Komissar
    DOCTOR = "doctor"              # Shifokor
    DON = "don"                    # Mafiya Doni
    MANIAC = "maniac"              # Manyak
    LOVER = "lover"                # Sevgilisi
    LAWYER = "lawyer"              # Advokat


class Team(str, Enum):
    CITIZENS = "citizens"
    MAFIA = "mafia"
    NEUTRAL = "neutral"


class GamePhase(str, Enum):
    LOBBY = "lobby"
    ROLE_REVEAL = "role_reveal"
    NIGHT = "night"
    NIGHT_RESULT = "night_result"
    DAY_DISCUSSION = "day_discussion"
    VOTING = "voting"
    VOTE_RESULT = "vote_result"
    GAME_OVER = "game_over"


class RoomSettings(BaseModel):
    max_players: int = 10
    mafia_count: int = 2
    enable_commissioner: bool = True
    enable_doctor: bool = True
    enable_don: bool = False
    enable_maniac: bool = False
    enable_lover: bool = False
    enable_lawyer: bool = False
    night_duration: int = 30
    discussion_duration: int = 60
    voting_duration: int = 30


class Player(BaseModel):
    id: str
    name: str
    role: Optional[Role] = None
    is_alive: bool = True
    is_host: bool = False
    is_bot: bool = False
    avatar_color: str = "#AFA9EC"
    # Tun va kunduzgi harakatlar
    night_target: Optional[str] = None
    vote_target: Optional[str] = None
    is_blocked: bool = False # Sevgilisi to'sgan bo'lsa
    disconnected: bool = False


class NightReport(BaseModel):
    killed_player_id: Optional[str] = None
    killed_player_name: Optional[str] = None
    saved_by_doctor: bool = False
    maniac_kill_id: Optional[str] = None
    maniac_kill_name: Optional[str] = None
    message: str = ""


class VoteReport(BaseModel):
    eliminated_player_id: Optional[str] = None
    eliminated_player_name: Optional[str] = None
    eliminated_player_role: Optional[Role] = None
    vote_counts: Dict[str, int] = Field(default_factory=dict)
    is_tie: bool = False
    message: str = ""
