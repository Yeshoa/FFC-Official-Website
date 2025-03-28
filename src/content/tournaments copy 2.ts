export interface Participant {
  [key: string]: string;
}

export interface Tournament {
  id: number;
  name: string;
  host: string;
  image: string;
  year: number;
  winner: string;
  runner_up: string;
  route: string;
  participants: Participant;
  stages?: Stage[];
}

export interface Stage {
  type: 'group' | 'knockout' ;
  name: string; // Nombre de la fase
  fixture?: Fixture[];
}

export interface Fixture {
  name: string; // Nombre de la fecha
  matches?: Match[];
}

export interface Match {
  match_id: number;
  stage: string;
  team1: string;
  team2: string;
  score: {
    team1_goals: number;
    team2_goals: number;
  };
  goals: {
    team: string;
    player: string;
    minute: number;
    penalty: boolean;
  }[];
}

export const tournaments = [
  {
    "id": 1,
    "name": "Bilsa 2020",
    "host": "Bilsa",
    "image": "/src/assets/images/forest-cup/2020/logo.png",
    "year": 2020,
    "winner": "Ruinenlust",
    "runner_up": "Cannibaland",
    "route": "/forest-cup/forest-cup-2020"
  },
  {
    "id": 2,
    "name": "Bilsa 2022",
    "host": "Bilsa",
    "image": "/src/assets/images/forest-cup/2022/logo.png",
    "year": 2022,
    "winner": "Atsvea",
    "runner_up": "Cacusia",
    "route": "/forest-cup/forest-cup-2022",
    "participants": {
      "Atsvea": "/src/assets/images/forest-cup/2022/atsvea.png",
      "Cacusia": "/src/assets/images/forest-cup/2022/cacusia.png",
      "Einswenn": "/src/assets/images/forest-cup/2022/einswenn.png",
      "Roless": "/src/assets/images/forest-cup/2022/roless.png",
      "Bilsa": "/src/assets/images/forest-cup/2022/bilsa.png",
      "Reannia": "/src/assets/images/forest-cup/2022/reannia.png",
      "Kase": "/src/assets/images/forest-cup/2022/kase.png",
      "Cat-Herders United": "/src/assets/images/forest-cup/2022/cat-herders-united.png",
      "Daarwyrth": "/src/assets/images/forest-cup/2022/daarwyrth.png",
      "Terrawynn": "/src/assets/images/forest-cup/2022/terrawynn.png",
      "Bunkaiia": "/src/assets/images/forest-cup/2022/bunkaiia.png",
      "Trebenia": "/src/assets/images/forest-cup/2022/trebenia.png",
      "Stralla": "/src/assets/images/forest-cup/2022/stralla.png",
      "Novian Republics": "/src/assets/images/forest-cup/2022/novian-republics.png",
      "Turbeaux": "/src/assets/images/forest-cup/2022/turbeaux.png",
      "Jutsa": "/src/assets/images/forest-cup/2022/jutsa.png"
    },
    stages: [
      {
        type: 'group',
        name: 'Group A',
        date: 'Matchday 1',
        matches: [
          {
            "match_id": 1,
            "stage": "Group A",
            "team1": "Einswenn",
            "team2": "Bilsa",
            "score": {
              "team1_goals": 2,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Bilsa", "player": "M. Solheim", "minute": 20, "penalty": false },
              { "team": "Bilsa", "player": "Sowjan", "minute": 39, "penalty": false },
              { "team": "Einswenn", "player": "Sowjan", "minute": 17, "penalty": false },
              { "team": "Einswenn", "player": "M. Eriksen", "minute": 59, "penalty": false },
              { "team": "Einswenn", "player": "Sowjan", "minute": 75, "penalty": false }
            ]
          },
          {
            "match_id": 2,
            "stage": "Group A",
            "team1": "Stralla",
            "team2": "Daarwyrth",
            "score": {
              "team1_goals": 0,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Daarwyrth", "player": "Z. Young", "minute": 25, "penalty": false }
            ]
          }
        ]
      },
      {
        type: 'group',
        name: 'Group B',
        date: 'Matchday 1', 
        matches: [
          {
            "match_id": 7,
            "stage": "Group B",
            "team1": "Atsvea",
            "team2": "Bunkaiia",
            "score": {
              "team1_goals": 1,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Atsvea", "player": "Nysnub", "minute": 53, "penalty": false },
              { "team": "Bunkaiia", "player": "B. Jaian", "minute": 60, "penalty": false },
              { "team": "Bunkaiia", "player": "L. Keian", "minute": 85, "penalty": false }
            ]
          },
          {
            "match_id": 8,
            "stage": "Group B",
            "team1": "Cat-Herders United",
            "team2": "Novian Republics",
            "score": {
              "team1_goals": 1,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Cat-Herders United", "player": "Garfield", "minute": 53, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group C',
        date: 'Matchday 1', 
        matches: [
          {
            "match_id": 13,
            "stage": "Group C",
            "team1": "Roless",
            "team2": "Cacusia",
            "score": {
              "team1_goals": 0,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 6, "penalty": false }
            ]
          },
          {
            "match_id": 14,
            "stage": "Group C",
            "team1": "Turbeaux",
            "team2": "Trebenia",
            "score": {
              "team1_goals": 0,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Trebenia", "player": "T. Wolf", "minute": 62, "penalty": false },
              { "team": "Trebenia", "player": "F. Elliott", "minute": 89, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group D',
        date: 'Matchday 1', 
        matches: [
          {
            "match_id": 19,
            "stage": "Group D",
            "team1": "Reannia",
            "team2": "Terrawynn",
            "score": {
              "team1_goals": 3,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Reannia", "player": "D. Vela", "minute": 7, "penalty": false },
              { "team": "Reannia", "player": "J. Carmona", "minute": 12, "penalty": false },
              { "team": "Reannia", "player": "J. Carmona", "minute": 51, "penalty": false }
            ]
          },
          {
            "match_id": 20,
            "stage": "Group D",
            "team1": "Jutsa",
            "team2": "Kase",
            "score": {
              "team1_goals": 1,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Jutsa", "player": "H. Kazñeisei", "minute": 46, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group A',
        date: 'Matchday 2', 
        matches: [
          {
            "match_id": 3,
            "stage": "Group A",
            "team1": "Einswenn",
            "team2": "Stralla",
            "score": {
              "team1_goals": 1,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Einswenn", "player": "R. Kask", "minute": 5, "penalty": false }
            ]
          },
          {
            "match_id": 4,
            "stage": "Group A",
            "team1": "Bilsa",
            "team2": "Daarwyrth",
            "score": {
              "team1_goals": 0,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Daarwyrth", "player": "T. Henderson", "minute": 82, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group B',
        date: 'Matchday 2', 
        matches: [
          {
            "match_id": 9,
            "stage": "Group B",
            "team1": "Atsvea",
            "team2": "Cat-Herders United",
            "score": {
              "team1_goals": 2,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Atsvea", "player": "Nysnub", "minute": 55, "penalty": true },
              { "team": "Atsvea", "player": "Nysnub", "minute": 60, "penalty": false },
              { "team": "Cat-Herders United", "player": "J. L. Meowri", "minute": 64, "penalty": false }
            ]
          },
          {
            "match_id": 10,
            "stage": "Group B",
            "team1": "Bunkaiia",
            "team2": "Novian Republics",
            "score": {
              "team1_goals": 2,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Bunkaiia", "player": "D. Tsafimakoua", "minute": 79, "penalty": false },
              { "team": "Bunkaiia", "player": "G. Lotefin", "minute": 90, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group C',
        date: 'Matchday 2', 
        matches: [
          {
            "match_id": 15,
            "stage": "Group C",
            "team1": "Roless",
            "team2": "Turbeaux",
            "score": {
              "team1_goals": 2,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Roless", "player": "C. Mcarthur", "minute": 10, "penalty": false },
              { "team": "Turbeaux", "player": "J. Greenaway", "minute": 30, "penalty": false },
              { "team": "Roless", "player": "G. Hua-Bai", "minute": 81, "penalty": false }
            ]
          },
          {
            "match_id": 16,
            "stage": "Group C",
            "team1": "Cacusia",
            "team2": "Trebenia",
            "score": {
              "team1_goals": 2,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 35, "penalty": false },
              { "team": "Cacusia", "player": "H. Blackmoor", "minute": 71, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group D',
        date: 'Matchday 2', 
        matches: [
          {
            "match_id": 21,
            "stage": "Group D",
            "team1": "Reannia",
            "team2": "Jutsa",
            "score": {
              "team1_goals": 2,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Reannia", "player": "J. Carmona", "minute": 34, "penalty": false },
              { "team": "Reannia", "player": "D. Vela", "minute": 75, "penalty": false }
            ]
          },
          {
            "match_id": 22,
            "stage": "Group D",
            "team1": "Terrawynn",
            "team2": "Kase",
            "score": {
              "team1_goals": 0,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Kase", "player": "C. Schon", "minute": 39, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group A',
        date: 'Matchday 3', 
        matches: [
          {
            "match_id": 5,
            "stage": "Group A",
            "team1": "Stralla",
            "team2": "Bilsa",
            "score": {
              "team1_goals": 0,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Bilsa", "player": "Sowjan", "minute": 68, "penalty": false },
              { "team": "Bilsa", "player": "Sowjan", "minute": 83, "penalty": false }
            ]
          },
          {
            "match_id": 6,
            "stage": "Group A",
            "team1": "Daarwyrth",
            "team2": "Einswenn",
            "score": {
              "team1_goals": 0,
              "team2_goals": 0
            },
            "goals": []
          }
        ],
      },
      {
        type: 'group',
        name: 'Group B',
        date: 'Matchday 3', 
        matches: [
          {
            "match_id": 11,
            "stage": "Group B",
            "team1": "Cat-Herders United",
            "team2": "Bunkaiia",
            "score": {
              "team1_goals": 1,
              "team2_goals": 0
            },
            "goals": [
              { "team": "Cat-Herders United", "player": "J. L. Meowri", "minute": 47, "penalty": false }
            ]
          },
          {
            "match_id": 12,
            "stage": "Group B",
            "team1": "Novian Republics",
            "team2": "Atsvea",
            "score": {
              "team1_goals": 0,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Atsvea", "player": "Nysnub", "minute": 29, "penalty": false },
              { "team": "Atsvea", "player": "E. Stell", "minute": 66, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'group',
        name: 'Group C',
        date: 'Matchday 3', 
        matches: [
          {
        "match_id": 17,
        "stage": "Group C",
        "team1": "Turbeaux",
        "team2": "Cacusia",
        "score": {
          "team1_goals": 0,
          "team2_goals": 3
        },
        "goals": [
          { "team": "Cacusia", "player": "H. Blackmoor", "minute": 20, "penalty": false },
          { "team": "Cacusia", "player": "H. Blackmoor", "minute": 37, "penalty": false },
          { "team": "Cacusia", "player": "M. Dartmouth", "minute": 74, "penalty": false }
        ]
      },
      {
        "match_id": 18,
        "stage": "Group C",
        "team1": "Trebenia",
        "team2": "Roless",
        "score": {
          "team1_goals": 1,
          "team2_goals": 2
        },
        "goals": [
          { "team": "Trebenia", "player": "T. Wolf", "minute": 39, "penalty": false },
          { "team": "Roless", "player": "F. Kumar", "minute": 33, "penalty": true },
          { "team": "Roless", "player": "J. Greenaway", "minute": 93, "penalty": false }
        ]
      }
        ],
      },
      {
        type: 'group',
        name: 'Group D',
        date: 'Matchday 3', 
        matches: [
          {
            "match_id": 23,
            "stage": "Group D",
            "team1": "Jutsa",
            "team2": "Terrawynn",
            "score": {
              "team1_goals": 0,
              "team2_goals": 0
            },
            "goals": []
          },
          {
            "match_id": 24,
            "stage": "Group D",
            "team1": "Kase",
            "team2": "Reannia",
            "score": {
              "team1_goals": 0,
              "team2_goals": 3
            },
            "goals": [
              { "team": "Reannia", "player": "J. Carmona", "minute": 8, "penalty": false },
              { "team": "Reannia", "player": "S. Sterling", "minute": 37, "penalty": false },
              { "team": "Reannia", "player": "S. Sterling", "minute": 67, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'knockout',
        name: 'Quarter Finals',
        matches: [
          {
            "match_id": 25,
            "stage": "Quarter Finals",
            "team1": "Daarwyrth",
            "team2": "Bunkaiia",
            "score": {
              "team1_goals": 3,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Daarwyrth", "player": "T. Marsh", "minute": 8, "penalty": false },
              { "team": "Bunkaiia", "player": "G. Lotefin", "minute": 32, "penalty": false },
              { "team": "Daarwyrth", "player": "T. Marsh", "minute": 82, "penalty": false },
              { "team": "Daarwyrth", "player": "T. Marsh", "minute": 88, "penalty": false }
            ]
          },
          {
            "match_id": 26,
            "stage": "Quarter Finals",
            "team1": "Cacusia",
            "team2": "Jutsa",
            "score": {
              "team1_goals": 3,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Jutsa", "player": "R. Cairoi", "minute": 6, "penalty": false },
              { "team": "Jutsa", "player": "H. Kazñeisei", "minute": 22, "penalty": false },
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 29, "penalty": false },
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 69, "penalty": false },
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 74, "penalty": false }
            ]
          },
          {
            "match_id": 27,
            "stage": "Quarter Finals",
            "team1": "Atsvea",
            "team2": "Einswenn",
            "score": {
              "team1_goals": 4,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Atsvea", "player": "Nysnub", "minute": 3, "penalty": false },
              { "team": "Einswenn", "player": "R. Jogi", "minute": 62, "penalty": false },
              { "team": "Atsvea", "player": "E. Stell", "minute": 72, "penalty": false },
              { "team": "Atsvea", "player": "T. Davis", "minute": 81, "penalty": false },
              { "team": "Einswenn", "player": "S. Vythxo", "minute": 99, "penalty": false },
              { "team": "Atsvea", "player": "K. Zaajaagah", "minute": 109, "penalty": false }
            ]
          },
          {
            "match_id": 28,
            "stage": "Quarter Finals",
            "team1": "Reannia",
            "team2": "Roless",
            "score": {
              "team1_goals": 3,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Reannia", "player": "S. Sterling", "minute": 9, "penalty": false },
              { "team": "Roless", "player": "J. Greenway", "minute": 47, "penalty": false },
              { "team": "Reannia", "player": "D. Vela", "minute": 77, "penalty": false },
              { "team": "Reannia", "player": "S. Sterling", "minute": 82, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'knockout',
        name: 'Semi Finals',
        matches: [
          {
            "match_id": 29,
            "stage": "Semi Finals",
            "team1": "Daarwyrth",
            "team2": "Cacusia",
            "score": {
              "team1_goals": 0,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Cacusia", "player": "C. Islay", "minute": 19, "penalty": false },
              { "team": "Cacusia", "player": "H. Blackmoor", "minute": 46, "penalty": false }
            ]
          },
          {
            "match_id": 30,
            "stage": "Semi Finals",
            "team1": "Atsvea",
            "team2": "Reannia",
            "score": {
              "team1_goals": 2,
              "team2_goals": 1
            },
            "goals": [
              { "team": "Atsvea", "player": "E. Stell", "minute": 17, "penalty": false },
              { "team": "Reannia", "player": "D. Vela", "minute": 23, "penalty": false },
              { "team": "Atsvea", "player": "Nysnub", "minute": 123, "penalty": false }
            ]
          }
        ],
      },
      {
        type: 'knockout',
        name: 'Final',
        matches: [
          {
            "match_id": 31,
            "stage": "Final",
            "team1": "Cacusia",
            "team2": "Atsvea",
            "score": {
              "team1_goals": 1,
              "team2_goals": 2
            },
            "goals": [
              { "team": "Cacusia", "player": "M. Dartmouth", "minute": 33, "penalty": false },
              { "team": "Atsvea", "player": "O. Khisiddah", "minute": 36, "penalty": false },
              { "team": "Atsvea", "player": "S. Vythxo", "minute": 65, "penalty": false }
            ]
          }
        ],
      }
    ],
  },
  {
    "id": 3,
    "name": "Anxious & Kevin 2024",
    "host": "Anxious & Kevin",
    "image": "/src/assets/images/forest-cup/2024/logo.png",
    "year": 2024,
    "winner": "Nardin",
    "runner_up": "Jutsa",
    "route": "/forest-cup/forest-cup-2024",
    "participants": [
      "Bilsa",
      "Einswenn",
      "Atsvea",
      "Cacusia",
      "Roless",
      "Stralla",
      "Jutsa",
      "Anxious and Kevin",
      "Furilisca",
      "Freistaat Ostpreussen",
      "RKD",
      "United Malay Federation",
      "Cat Army",
      "Schachland",
      "Verdant Haven",
      "Nardin",
      "Ruinenlust",
      "Columbiqash",
      "Lumiose",
      "Zerphen",
      "Sehir",
      "Republic of Yucatan",
      "Tylvana",
      "Washeyye",
      "New Libertalia Kingdom",
      "Mozolephies",
      "Nordustra",
      "Otterland",
      "Clown town city",
      "The Realizer",
      "Orcuo",
      "Aresetia",
    ],
  },
  {
    "id": 4,
    "name": "Forest Cup 2026",
    "host": "TBA",
    "image": "/src/assets/images/forest-cup/2026/logo.png",
    "year": 2026,
    "winner": "-",
    "runner_up": "-",
    "route": "/forest-cup/forest-cup-2026"
  },
];
