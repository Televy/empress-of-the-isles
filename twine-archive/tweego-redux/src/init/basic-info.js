console.log("Basic game info successfully accessed.");

// Empire Resources
State.variables.money = 0;
State.variables.energy = 0;
State.variables.mf = 20;
State.variables.dialog = "";

//Parliament
State.variables.vote = 0;
State.variables.understaffing = 0;
State.variables.lawWIP = {
    "name": "None",
    "desc": "No law is currently debated.",
    "tier": 1,
    "price": 0,
    "isVoted": false,
    "isOn": -1
};

//antiplague measures effect
let aplague = {
    "mask": 1,
    "hunt": 1
}
State.variables.antiPlague=aplague;

// Turn System

const MONTHS = ['Clans', 'Songs', 'Earth', 'Harvest', 'Nets', 'Rain', 'Wind', 'Darkness', 'High Cold', 'Ice', 'Hearths', 'Seeds', 'Timber']
State.variables.turn = 1;
State.variables.year = 1835;
State.variables.monthCount = 0;
State.variables.month = MONTHS[State.variables.monthCount];
State.variables.day = 1;