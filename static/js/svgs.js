// Avtomatik yaratilgan SVG va Rollar kutubxonasi
const GAME_SVGS = {
  logo: `<svg viewBox="0 0 240 150" width="210" role="img" style="margin-top:8px"><title>Mafiya logotipi</title>
      <circle cx="120" cy="80" r="56" fill="#FAC775"></circle>
      <circle cx="140" cy="68" r="10" fill="#EF9F27" fill-opacity="0.5"></circle>
      <circle cx="104" cy="96" r="7" fill="#EF9F27" fill-opacity="0.5"></circle>
      <ellipse cx="120" cy="64" rx="70" ry="11" fill="#0a0a0a"></ellipse>
      <path d="M88 64 Q88 22 120 22 Q152 22 152 64Z" fill="#1c1c1c"></path>
      <rect x="88" y="50" width="64" height="10" fill="#E24B4A"></rect>
      <circle cx="40" cy="30" r="2" fill="#CECBF6"></circle><circle cx="204" cy="40" r="2.5" fill="#CECBF6"></circle><circle cx="214" cy="110" r="2" fill="#CECBF6"></circle><circle cx="28" cy="100" r="2.5" fill="#CECBF6"></circle>
    </svg>`,
  dawn: `<svg viewBox="0 0 240 120" width="calc(100% + 32px)" role="img" style="margin:0 -16px;display:block"><title>Tong otishi</title>
      <rect width="240" height="120" fill="#26215C"></rect>
      <rect y="60" width="240" height="60" fill="#993C1D" fill-opacity="0.55"></rect>
      <circle cx="40" cy="20" r="1.8" fill="#CECBF6"></circle><circle cx="90" cy="34" r="1.5" fill="#CECBF6"></circle><circle cx="190" cy="18" r="2" fill="#CECBF6"></circle><circle cx="215" cy="44" r="1.5" fill="#CECBF6"></circle>
      <circle cx="120" cy="82" r="34" fill="#FAC775"></circle>
      <path d="M0 96 Q60 74 120 92 Q180 108 240 84 L240 120 L0 120Z" fill="#04342C"></path>
      <rect x="150" y="76" width="14" height="30" fill="#0a0a0a"></rect><rect x="170" y="68" width="12" height="38" fill="#0a0a0a"></rect><rect x="60" y="80" width="16" height="26" fill="#0a0a0a"></rect>
    </svg>`,
  healed: `<svg viewBox="0 0 160 150" width="150" role="img" style="margin-top:6px"><title>Qalqon va yurak</title>
      <circle cx="80" cy="75" r="68" fill="#0F6E56"></circle>
      <path d="M80 18 L128 36 Q128 92 80 128 Q32 92 32 36Z" fill="#5DCAA5" stroke="#E1F5EE" stroke-width="4" stroke-linejoin="round"></path>
      <rect x="72" y="50" width="16" height="44" rx="3" fill="#fff"></rect>
      <rect x="58" y="64" width="44" height="16" rx="3" fill="#fff"></rect>
      <circle cx="30" cy="30" r="3" fill="#9FE1CB"></circle><circle cx="136" cy="110" r="4" fill="#9FE1CB"></circle><circle cx="24" cy="100" r="2.5" fill="#9FE1CB"></circle>
    </svg>`,
  hung: `<svg viewBox="0 0 120 130" width="150" role="img"><title>Ochilgan rol: Mafiya</title>
      <circle cx="60" cy="62" r="56" fill="#791F1F"></circle>
      <path d="M14 130 Q14 92 60 90 Q106 92 106 130Z" fill="#1c1c1c"></path>
      <polygon points="48,91 72,91 60,114" fill="#F1EFE8"></polygon>
      <polygon points="57,100 63,100 64,118 60,124 56,118" fill="#E24B4A"></polygon>
      <rect x="52" y="78" width="16" height="14" fill="#E0A98A"></rect>
      <circle cx="60" cy="62" r="22" fill="#F0C8A8"></circle>
      <ellipse cx="60" cy="48" rx="36" ry="8" fill="#0a0a0a"></ellipse>
      <path d="M40 48 Q40 20 60 20 Q80 20 80 48Z" fill="#1c1c1c"></path>
      <rect x="40" y="39" width="40" height="8" fill="#E24B4A"></rect>
      <rect x="43" y="57" width="15" height="9" rx="3" fill="#000"></rect>
      <rect x="62" y="57" width="15" height="9" rx="3" fill="#000"></rect>
      <path d="M51 76 Q60 80 69 76" stroke="#7a3a2a" stroke-width="2" fill="none" stroke-linecap="round"></path>
      <line x1="14" y1="14" x2="106" y2="116" stroke="#E24B4A" stroke-width="7" stroke-linecap="round"></line>
      <line x1="106" y1="14" x2="14" y2="116" stroke="#E24B4A" stroke-width="7" stroke-linecap="round"></line>
    </svg>`,
  roles: {
  "mafia": {
    "name_uz": "Mafiya",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Mafiya</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#791F1F\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#1c1c1c\"></path>\n<polygon points=\"48,91 72,91 60,114\" fill=\"#F1EFE8\"></polygon>\n<polygon points=\"48,91 60,114 42,130 28,130\" fill=\"#2c2c2a\"></polygon>\n<polygon points=\"72,91 60,114 78,130 92,130\" fill=\"#2c2c2a\"></polygon>\n<polygon points=\"57,100 63,100 64,118 60,124 56,118\" fill=\"#E24B4A\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<ellipse cx=\"60\" cy=\"48\" rx=\"36\" ry=\"8\" fill=\"#0a0a0a\"></ellipse>\n<path d=\"M40 48 Q40 20 60 20 Q80 20 80 48Z\" fill=\"#1c1c1c\"></path>\n<rect x=\"40\" y=\"39\" width=\"40\" height=\"8\" fill=\"#E24B4A\"></rect>\n<rect x=\"43\" y=\"57\" width=\"15\" height=\"9\" rx=\"3\" fill=\"#000\"></rect>\n<rect x=\"62\" y=\"57\" width=\"15\" height=\"9\" rx=\"3\" fill=\"#000\"></rect>\n<line x1=\"58\" y1=\"60\" x2=\"62\" y2=\"60\" stroke=\"#000\" stroke-width=\"2\"></line>\n<path d=\"M51 76 Q60 80 69 76\" stroke=\"#7a3a2a\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"></path>\n<line x1=\"68\" y1=\"77\" x2=\"88\" y2=\"71\" stroke=\"#854F0B\" stroke-width=\"4\" stroke-linecap=\"round\"></line>\n<circle cx=\"89\" cy=\"70.5\" r=\"3\" fill=\"#EF9F27\"></circle>\n<line x1=\"70\" y1=\"52\" x2=\"74\" y2=\"68\" stroke=\"#A32D2D\" stroke-width=\"1.5\"></line>\n</svg>",
    "desc": "Tunda jamoa bilan birga bitta odamni yo'q qiladi.",
    "team": "Mafiya jamoasi",
    "bg": "#2b0d0d",
    "border": "2px solid #E24B4A"
  },
  "commissioner": {
    "name_uz": "Komissar",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Komissar</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#0C447C\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#185FA5\"></path>\n<polygon points=\"48,91 72,91 60,106\" fill=\"#F1EFE8\"></polygon>\n<polygon points=\"82,98 84.5,104 91,104.5 86,108.5 87.5,115 82,111.5 76.5,115 78,108.5 73,104.5 79.5,104\" fill=\"#FAC775\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M38 48 Q38 18 60 18 Q82 18 82 48Z\" fill=\"#042C53\"></path>\n<rect x=\"36\" y=\"40\" width=\"48\" height=\"8\" rx=\"2\" fill=\"#0C447C\"></rect>\n<path d=\"M40 48 Q60 58 80 48 L80 45 L40 45Z\" fill=\"#000\"></path>\n<circle cx=\"60\" cy=\"30\" r=\"6\" fill=\"#FAC775\"></circle>\n<circle cx=\"52\" cy=\"62\" r=\"2.6\" fill=\"#2c2c2a\"></circle>\n<circle cx=\"68\" cy=\"62\" r=\"2.6\" fill=\"#2c2c2a\"></circle>\n<path d=\"M47 56 L57 58 M73 56 L63 58\" stroke=\"#5a3a1a\" stroke-width=\"2\" stroke-linecap=\"round\"></path>\n<path d=\"M49 73 Q60 67 71 73 Q60 78 49 73Z\" fill=\"#5a3a1a\"></path>\n<circle cx=\"26\" cy=\"98\" r=\"12\" fill=\"#B5D4F4\" fill-opacity=\"0.55\" stroke=\"#FAC775\" stroke-width=\"4\"></circle>\n<line x1=\"34\" y1=\"107\" x2=\"44\" y2=\"121\" stroke=\"#854F0B\" stroke-width=\"5\" stroke-linecap=\"round\"></line>\n</svg>",
    "desc": "Har tun bitta o'yinchini tekshiradi: mafiyami yoki yo'qmi.",
    "team": "Tinch aholi",
    "bg": "#04203d",
    "border": "2px solid #378ADD"
  },
  "doctor": {
    "name_uz": "Shifokor",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Shifokor</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#0F6E56\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#F1EFE8\"></path>\n<polygon points=\"48,91 72,91 60,110\" fill=\"#B4B2A9\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M37 56 Q36 28 60 28 Q84 28 83 56 Q60 46 37 56Z\" fill=\"#5DCAA5\"></path>\n<circle cx=\"60\" cy=\"37\" r=\"5\" fill=\"#D3D1C7\" stroke=\"#5F5E5A\" stroke-width=\"1.5\"></circle>\n<circle cx=\"52\" cy=\"63\" r=\"6\" fill=\"none\" stroke=\"#444441\" stroke-width=\"2\"></circle>\n<circle cx=\"68\" cy=\"63\" r=\"6\" fill=\"none\" stroke=\"#444441\" stroke-width=\"2\"></circle>\n<line x1=\"58\" y1=\"63\" x2=\"62\" y2=\"63\" stroke=\"#444441\" stroke-width=\"2\"></line>\n<circle cx=\"52\" cy=\"63\" r=\"2\" fill=\"#2c2c2a\"></circle>\n<circle cx=\"68\" cy=\"63\" r=\"2\" fill=\"#2c2c2a\"></circle>\n<path d=\"M52 75 Q60 81 68 75\" stroke=\"#7a3a2a\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"></path>\n<path d=\"M46 92 Q42 114 56 114 Q66 114 66 104\" stroke=\"#444441\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"></path>\n<circle cx=\"66\" cy=\"103\" r=\"4\" fill=\"#888780\"></circle>\n<rect x=\"76\" y=\"98\" width=\"18\" height=\"18\" rx=\"3\" fill=\"#1D9E75\"></rect>\n<rect x=\"83\" y=\"101\" width=\"4\" height=\"12\" fill=\"#fff\"></rect>\n<rect x=\"79\" y=\"105\" width=\"12\" height=\"4\" fill=\"#fff\"></rect>\n</svg>",
    "desc": "Har tun bitta odamni davolaydi va o'limdan saqlab qoladi.",
    "team": "Tinch aholi",
    "bg": "#04251f",
    "border": "2px solid #1D9E75"
  },
  "citizen": {
    "name_uz": "Tinch aholi",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Tinch aholi</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#854F0B\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#D4537E\"></path>\n<path d=\"M50 91 Q60 100 70 91Z\" fill=\"#72243E\"></path>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M37 60 Q34 32 60 32 Q86 32 83 60 Q76 46 60 47 Q44 46 37 60Z\" fill=\"#412402\"></path>\n<circle cx=\"52\" cy=\"63\" r=\"2.8\" fill=\"#2c2c2a\"></circle>\n<circle cx=\"68\" cy=\"63\" r=\"2.8\" fill=\"#2c2c2a\"></circle>\n<path d=\"M50 73 Q60 84 70 73Z\" fill=\"#fff\" stroke=\"#7a3a2a\" stroke-width=\"1.5\" stroke-linejoin=\"round\"></path>\n<circle cx=\"45\" cy=\"72\" r=\"3.5\" fill=\"#F09595\" fill-opacity=\"0.6\"></circle>\n<circle cx=\"75\" cy=\"72\" r=\"3.5\" fill=\"#F09595\" fill-opacity=\"0.6\"></circle>\n</svg>",
    "desc": "Kunduzi muhokama qiladi va mafiyani topish uchun ovoz beradi.",
    "team": "Tinch aholi",
    "bg": "#2d1a04",
    "border": "2px solid #EF9F27"
  },
  "don": {
    "name_uz": "Don",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Don</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#633806\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#F1EFE8\"></path>\n<polygon points=\"48,91 72,91 60,114\" fill=\"#1c1c1c\"></polygon>\n<polygon points=\"48,91 60,114 44,130 30,130\" fill=\"#D3D1C7\"></polygon>\n<polygon points=\"72,91 60,114 76,130 90,130\" fill=\"#D3D1C7\"></polygon>\n<polygon points=\"57,100 63,100 64,118 60,124 56,118\" fill=\"#FAC775\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<ellipse cx=\"60\" cy=\"48\" rx=\"36\" ry=\"8\" fill=\"#F1EFE8\" stroke=\"#B4B2A9\" stroke-width=\"1.5\"></ellipse>\n<path d=\"M40 48 Q40 20 60 20 Q80 20 80 48Z\" fill=\"#F1EFE8\"></path>\n<rect x=\"40\" y=\"39\" width=\"40\" height=\"8\" fill=\"#2c2c2a\"></rect>\n<circle cx=\"60\" cy=\"43\" r=\"4\" fill=\"#FAC775\"></circle>\n<circle cx=\"51\" cy=\"62\" r=\"6\" fill=\"#000\"></circle><circle cx=\"69\" cy=\"62\" r=\"6\" fill=\"#000\"></circle>\n<line x1=\"57\" y1=\"62\" x2=\"63\" y2=\"62\" stroke=\"#000\" stroke-width=\"2\"></line>\n<path d=\"M48 73 Q60 68 72 73 Q60 78 48 73Z\" fill=\"#2c2c2a\"></path>\n<line x1=\"70\" y1=\"79\" x2=\"90\" y2=\"72\" stroke=\"#854F0B\" stroke-width=\"4\" stroke-linecap=\"round\"></line>\n<circle cx=\"91\" cy=\"71.5\" r=\"3\" fill=\"#EF9F27\"></circle>\n<circle cx=\"86\" cy=\"112\" r=\"6\" fill=\"none\" stroke=\"#FAC775\" stroke-width=\"3\"></circle>\n</svg>",
    "desc": "Mafiya boshlig'i. Komissar uni \"mafiya emas\" deb ko'radi.",
    "team": "Mafiya jamoasi",
    "bg": "#2a1703",
    "border": "2px solid #EF9F27"
  },
  "maniac": {
    "name_uz": "Manyak",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Manyak</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#534AB7\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#F1EFE8\"></path>\n<rect x=\"26\" y=\"102\" width=\"68\" height=\"12\" rx=\"6\" fill=\"#D3D1C7\"></rect>\n<rect x=\"26\" y=\"102\" width=\"68\" height=\"12\" rx=\"6\" fill=\"none\" stroke=\"#888780\" stroke-width=\"1.5\" stroke-dasharray=\"4 3\"></rect>\n<rect x=\"52\" y=\"104\" width=\"16\" height=\"8\" rx=\"2\" fill=\"#888780\"></rect>\n<polygon points=\"32,62 26,40 40,46 38,24 52,36 56,18 64,34 74,20 78,38 92,28 86,46 98,44 88,62\" fill=\"#639922\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M38 56 Q60 36 82 56 L78 48 Q60 32 42 48Z\" fill=\"#639922\"></path>\n<circle cx=\"51\" cy=\"62\" r=\"7\" fill=\"#fff\"></circle><circle cx=\"69\" cy=\"62\" r=\"7\" fill=\"#fff\"></circle>\n<circle cx=\"52\" cy=\"63\" r=\"2.5\" fill=\"#2c2c2a\"></circle><circle cx=\"68\" cy=\"61\" r=\"2.5\" fill=\"#2c2c2a\"></circle>\n<path d=\"M43 52 L57 56 M77 52 L63 56\" stroke=\"#412402\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path>\n<path d=\"M46 74 Q60 90 74 74Z\" fill=\"#fff\" stroke=\"#7a3a2a\" stroke-width=\"1.5\" stroke-linejoin=\"round\"></path>\n<path d=\"M54 76 L54 82 M60 77 L60 85 M66 76 L66 82\" stroke=\"#B4B2A9\" stroke-width=\"1\"></path>\n</svg>",
    "desc": "Yolg'iz o'ynaydi. Maqsadi: hammadan ko'p tirik qolish.",
    "team": "Yolg'iz",
    "bg": "#1a1440",
    "border": "2px solid #7F77DD"
  },
  "lover": {
    "name_uz": "Sevgilisi",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Sevgilisi</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#993556\"></circle>\n<path d=\"M32 62 Q26 26 60 26 Q94 26 88 62 L94 104 Q80 100 80 84 L40 84 Q40 100 26 104Z\" fill=\"#412402\"></path>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#E24B4A\"></path>\n<polygon points=\"48,91 72,91 60,108\" fill=\"#E0A98A\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M38 58 Q44 38 60 38 Q76 38 82 58 Q72 46 60 48 Q50 46 38 58Z\" fill=\"#412402\"></path>\n<circle cx=\"52\" cy=\"63\" r=\"2.6\" fill=\"#2c2c2a\"></circle><circle cx=\"68\" cy=\"63\" r=\"2.6\" fill=\"#2c2c2a\"></circle>\n<path d=\"M47 59 L44 56 M52 58 L51 54 M73 59 L76 56 M68 58 L69 54\" stroke=\"#2c2c2a\" stroke-width=\"1.5\" stroke-linecap=\"round\"></path>\n<circle cx=\"45\" cy=\"71\" r=\"4\" fill=\"#ED93B1\" fill-opacity=\"0.7\"></circle><circle cx=\"75\" cy=\"71\" r=\"4\" fill=\"#ED93B1\" fill-opacity=\"0.7\"></circle>\n<path d=\"M52 74 Q60 82 68 74 Q60 71 52 74Z\" fill=\"#A32D2D\"></path>\n<path d=\"M60 124 L50 114 Q44 106 52 102 Q60 100 60 108 Q60 100 68 102 Q76 106 70 114Z\" fill=\"#FBEAF0\"></path>\n<path d=\"M100 30 L94 24 Q90 18 96 16 Q100 16 100 20 Q100 16 104 16 Q110 18 106 24Z\" fill=\"#F4C0D1\"></path>\n<path d=\"M18 40 L14 36 Q11 31 15 30 Q18 30 18 33 Q18 30 21 30 Q25 31 22 36Z\" fill=\"#F4C0D1\"></path>\n</svg>",
    "desc": "Tunda bitta o'yinchini to'sib qo'yadi: u harakat qila olmaydi.",
    "team": "Tinch aholi",
    "bg": "#3a0f22",
    "border": "2px solid #D4537E"
  },
  "lawyer": {
    "name_uz": "Advokat",
    "svg": "<svg viewBox=\"0 0 120 130\" role=\"img\"><title>Advokat</title>\n<circle cx=\"60\" cy=\"62\" r=\"56\" fill=\"#444441\"></circle>\n<path d=\"M14 130 Q14 92 60 90 Q106 92 106 130Z\" fill=\"#5F5E5A\"></path>\n<polygon points=\"48,91 72,91 60,112\" fill=\"#F1EFE8\"></polygon>\n<polygon points=\"57,100 63,100 64,118 60,124 56,118\" fill=\"#185FA5\"></polygon>\n<rect x=\"52\" y=\"78\" width=\"16\" height=\"14\" fill=\"#E0A98A\"></rect>\n<circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#F0C8A8\"></circle>\n<path d=\"M38 56 Q38 34 60 34 Q82 34 82 56 Q72 44 60 45 Q48 44 38 56Z\" fill=\"#B4B2A9\"></path>\n<rect x=\"43\" y=\"57\" width=\"15\" height=\"11\" rx=\"2\" fill=\"#B5D4F4\" fill-opacity=\"0.35\" stroke=\"#2c2c2a\" stroke-width=\"2\"></rect>\n<rect x=\"62\" y=\"57\" width=\"15\" height=\"11\" rx=\"2\" fill=\"#B5D4F4\" fill-opacity=\"0.35\" stroke=\"#2c2c2a\" stroke-width=\"2\"></rect>\n<line x1=\"58\" y1=\"61\" x2=\"62\" y2=\"61\" stroke=\"#2c2c2a\" stroke-width=\"2\"></line>\n<circle cx=\"50\" cy=\"63\" r=\"2\" fill=\"#2c2c2a\"></circle><circle cx=\"70\" cy=\"63\" r=\"2\" fill=\"#2c2c2a\"></circle>\n<line x1=\"53\" y1=\"75\" x2=\"67\" y2=\"75\" stroke=\"#7a3a2a\" stroke-width=\"2\" stroke-linecap=\"round\"></line>\n<path d=\"M80 102 Q88 92 96 102\" stroke=\"#412402\" stroke-width=\"3\" fill=\"none\"></path>\n<rect x=\"72\" y=\"102\" width=\"34\" height=\"24\" rx=\"3\" fill=\"#854F0B\"></rect>\n<rect x=\"85\" y=\"108\" width=\"8\" height=\"5\" rx=\"1\" fill=\"#FAC775\"></rect>\n</svg>",
    "desc": "Mafiyani himoya qiladi: Komissar uni \"mafiya emas\" deb ko'radi.",
    "team": "Mafiya jamoasi",
    "bg": "#1c1c1a",
    "border": "2px solid #888780"
  }
}
};
