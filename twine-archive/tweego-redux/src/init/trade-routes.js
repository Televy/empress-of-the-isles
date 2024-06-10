console.log("Trade routes successfully accessed.");

let foodRoutes = [{
    "from": "Old Waterfront",
    "to": "Draper's Ward",
    "amount": 60
}, {
    "from": "Slaughterhouse Row",
    "to": "Draper's Ward",
    "amount": 60
}, {
    "from": "Slaugterhouse Row",
    "to": "Legal District",
    "amount": 10
}, {
    "from": "Distillery District",
    "to": "Estate District",
    "amount": 60
}, {
    "from": "Distillery District",
    "to": "Rudshore Financial District",
    "amount": 110
}, {
    "from": "Downmarket District",
    "to": "Tower District",
    "amount": 50
}, {
    "from": "Downmarket District",
    "to": "Academy District",
    "amount": 150
}, {
    "from": "Old Port District",
    "to": "Legal District",
    "amount": 100
}];

let elixirRoutes = [];

State.variables.foodRoutes = foodRoutes;
State.variables.elixirRoutes = elixirRoutes;
State.variables.tradeState = 0;
State.variables.tradeFrom = {};
State.variables.tradeTo = {};
State.variables.tradeResource = "none";
State.variables.tradeAmount = 0;