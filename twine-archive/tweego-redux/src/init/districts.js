console.log("District info successfully accessed.");

// Establish Districts
let districts = [
  {
    "name": "Draper's Ward",
    "initPop": 120000,
    "population": 120000,
    "adjNeighbors": ["Old Waterfront"],
    "bridgeNeighbors": ["Distillery District"],
    "class": "Nobles",
    "production": {
      "money": 700,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 120,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 1,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    }, 
    "events": {
      "starving": 0
    }
  }, 
  {
    "name": "Old Waterfront",
    "initPop": 120000,
    "population": 120000,
    "adjNeighbors": ["Draper's Ward", "Civil Service District", "Estate District"],
    "bridgeNeighbors": ["Distillery District"],
    "class": "Commoners",
    "production": {
      "money": 500,
      "energy": 1,
      "food": 180,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 120,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  }, 
  {
    "name": "Civil Service District",
    "initPop": 120000,
    "population": 120000,
    "adjNeighbors": ["Old Waterfront", "Estate District", "Tower District", "Academy District"],
    "bridgeNeighbors": [],
    "class": "Commoners",
    "production": {
      "money": 500,
      "energy": 0,
      "food": 120,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 120,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  }, 
  {
    "name": "Estate District",
    "initPop": 60000,
    "population": 60000,
    "adjNeighbors": ["Old Waterfront", "Civil Service District", "Tower District"],
    "bridgeNeighbors": ["Downmarket District"],
    "class": "Nobles",
    "production": {
      "money": 900,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 60,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 1,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Tower District",
    "initPop": 50000,
    "population": 50000,
    "adjNeighbors": ["Estate District", "Civil Service District", "Academy District"],
    "bridgeNeighbors": ["Old Port District"],
    "class": "Nobles",
    "production": {
      "money": 1000,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 50,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 1,
      "docks": 0,
      "warehouses": 0,
      "hospital": 1,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Academy District",
    "initPop": 150000,
    "population": 150000,
    "adjNeighbors": ["Civil Service District", "Tower District", "Legal District"],
    "bridgeNeighbors": [],
    "class": "Nobles",
    "production": {
      "money": 400,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 150,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Legal District",
    "initPop": 110000,
    "population": 110000,
    "adjNeighbors": ["Legal District"],
    "bridgeNeighbors": [],
    "class": "Nobles",
    "production": {
      "money": 600,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 110,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 1,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Slaughterhouse Row",
    "initPop": 150000,
    "population": 150000,
    "adjNeighbors": ["Distillery District", "Downmarket District"],
    "bridgeNeighbors": [],
    "class": "Commoners",
    "production": {
      "money": 200,
      "energy": 5,
      "food": 220,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 150,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 1,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Holger Square",
    "initPop": 0,
    "population": 0,
    "adjNeighbors": [],
    "bridgeNeighbors": [],
    "class": "Overseers",
    "production": {
      "money": 0,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 0,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Distillery District",
    "initPop": 350000,
    "population": 350000,
    "adjNeighbors": ["Slaughterhouse Row", "Downmarket District"],
    "bridgeNeighbors": ["Draper's Ward", "Old Waterfront"],
    "class": "Commoners",
    "production": {
      "money": 200,
      "energy": 0,
      "food": 520,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 350,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Downmarket District",
    "initPop": 400000,
    "population": 400000,
    "adjNeighbors": ["Slaughterhouse Row", "Distillery District", "Old Port District"],
    "bridgeNeighbors": ["Estate District"],
    "class": "Commoners",
    "production": {
      "money": 100,
      "energy": 0,
      "food": 600,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 400,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Old Port District",
    "initPop": 200000,
    "population": 200000,
    "adjNeighbors": ["Downmarket District", "Rudshore Financial District"],
    "bridgeNeighbors": ["Tower District"],
    "class": "Commoners",
    "production": {
      "money": 300,
      "energy": 0,
      "food": 300,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 200,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Wyrmwood District",
    "initPop": 0,
    "population": 0,
    "adjNeighbors": [],
    "bridgeNeighbors": [],
    "class": "Criminals",
    "production": {
      "money": 0,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 0,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0,
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Rudshore Financial District",
    "initPop": 110000,
    "population": 110000,
    "adjNeighbors": ["Old Port District"],
    "bridgeNeighbors": [],
    "class": "Nobles",
    "production": {
      "money": 800,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 110,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 1,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  },
  {
    "name": "Kingsparrow Island",
    "initPop": 0,
    "population": 0,
    "adjNeighbors": [],
    "bridgeNeighbors": [],
    "class": "Nobles",
    "production": {
      "money": 0,
      "energy": 0,
      "food": 0,
      "elixir": 0,
      "deathMod": 1
    },
    "stock": {
      "food": 0,
      "elixir": 0,
      "mf": 0
    },
    "plague": {
      "infection": 0,
      "infectionOld": 0,
      "rats": 0,
      "ratsOld": 0,
      "history": [0],
      "deadThisTurn": 0, 
      "totalDeaths": 0
    },
    "antiPlague": {
      "rationing": 0,
      "ratHunt": 0, 
      "elixirDist": 0,
      "elixirMod": 1,
      "maskDist": 0, 
      "lockdown": 0,
      "wallOff": 1
    },
    "infrastructures": {
      "sewer": 0,
      "docks": 0,
      "warehouses": 0,
      "hospital": 0,
      "quarantine": 0,
      "elixirFactory": 0,
      "rail": 0,
      "slaughterhouse": 0,
      "watchPost": 0
    },
    "events": {
      "starving": 0
    }
  }
];
const POSS_INFECTED_DISTRICTS = ["Slaughterhouse Row", "Distillery District", "Downmarket District", "Old Port District"];

// Choose First Infected District
(function ratInit() {
  let r = Math.floor(Math.random() * 4);
  let infectedDistrict = POSS_INFECTED_DISTRICTS[r];
  console.log("Selected initially infected district: " + infectedDistrict);
  for (let i = 0; i < districts.length; i++) {
    let current = districts[i].name;
    if (current == infectedDistrict) {
      districts[i].plague.rats = 100;
      districts[i].plague.ratsOld = 100;
    }
  }
})();

// Set State variables
State.variables.d = districts; // array of districts
State.variables.district = -1; // Current district selected; -1 = no district selected