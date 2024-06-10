console.log("Laws successfully accessed.");

State.variables.lawTier = 1;
let laws = [
    {
        "name": "Last Rites",
        "desc": "Allows Overseers to perform last rites on plague victims. Increases Abbey popularity.",
        "tier": 1,
        "price": 75,
        "isVoted": false,
        "isOn": -1
    }, 
    {
        "name": "Understaffing",
        "desc": "Reduces the number of Watch squad to enforce a curfew or a lockdown, but reduces Watch popularity when in effect",
        "tier": 3,
        "price": 200,
        "isVoted": false,
        "isOn": 0
    },
    {
        "name": "Chapel Fund",
        "desc": "Funds the construction of new chapels. Increases Abbey popularity.",
        "tier": 2,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Armory Funding",
        "desc": "Increases the funds allocated to the Watch's weaponry. Increases Watch popularity.",
        "tier": 2,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Warfare Overseers",
        "desc": "Allows for the training of Warfare Overseers. Increases Abbey popularity.",
        "tier": 3,
        "price": 250,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Rehabilitation Centers",
        "desc": "Funds new rehabilitation centers for Watch and Army veterans. Increases Watch popularity.",
        "tier": 3,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Raids on Heretics",
        "desc": "Allows raids on people suspected of heresy. Increases Abbey popularity.",
        "tier": 4,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Drafting",
        "desc": "Start mandatory drafting to bolster the ranks of the City Watch. Increases your troops, but lowers Commoners popularity.",
        "tier": 4,
        "price": 225,
        "isVoted": false,
        "isOn": 0,
    },
    {
        "name": "Whale Oil Technologies",
        "desc": "Double down on whale oil-based defensive infrastructures. Increases Watch popularity.",
        "tier": 4,
        "price": 100,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Rat Exterminators",
        "desc": "Unlock the option to pay exterminators to control the rat population.",
        "tier": 1,
        "price": 100,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Customs Processing",
        "desc": "Enacts custom processing on trade routes. Lowers contamination between districts, but caps the trade to 100 units per route.",
        "tier": 2,
        "price": 150,
        "isVoted": false,
        "isOn": 0
    },
    {
        "name": "Curfews",
        "desc": "Allows you to impose curfews on a district. Reduces plague propagation, but makes the local population unhappy.",
        "tier": 1,
        "price": 175,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Textile Negotiation",
        "desc": "Negotiate with textile companies to get a discount on mask production. Halves the price of masks.",
        "tier": 3,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Lockdown",
        "desc": "Allows you to put a district under lockdown. Reduces plague propagation a lot, but makes the local population very unhappy",
        "tier": 2,
        "price": 275,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "District Termination",
        "desc": "Allows you to wall off a district permanently, leaving its population to die. This district won't infect any other district and rats won't travel from there, but doing this will scandalize your citizens.",
        "tier": 4,
        "price": 250,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Farming Contracts",
        "desc": "Tie new contracts with farmers from the surrounding countryside. Increases food production.",
        "tier": 1,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Lower Food Quality Standards",
        "desc": "Lower standards means more food approved for consumption. Increases food production.",
        "tier": 2,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Raise Standards in Food Conservation",
        "desc": "Imposes new regulations on food conservation techniques, resulting in less waste. Increases food production.",
        "tier": 3,
        "price": 250,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Lengthen Work Hours in Slaughterhouses",
        "desc": "Allows employers to impose longer hours in the butchering industry. Increases energy production.",
        "tier": 3,
        "price": 100,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Cut Regulations on Medicine",
        "desc": "Cuts the amount of regulation testing elixirs have to go through before commercialization.",
        "tier": 3,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Tax Basic Resources",
        "desc": "Impose taxes on basic resources, such as food, whale oil, or textiles. Increases coin income but lowers Commoner popularity.",
        "tier": 3,
        "price": 150,
        "isVoted": false,
        "isOn": 0
    },
    {
        "name": "Impose Whaling Quotas",
        "desc": "Forces whaling ships to hunt farther from the coast to avoid depleting the local whale populations. Increases whale oil production.",
        "tier": 4,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Publicizing of Medicine Patents",
        "desc": "Make medicine patents public domain, allowing anyone to produce them. Increases elixir production.",
        "tier": 4,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Tax Luxury Resources",
        "desc": "Impose a tax on luxury resources such as alcohol, furs, or jewelry. Increases coin income, but lowers Nobility popularity.",
        "tier": 4,
        "price": 250,
        "isVoted": false,
        "isOn": 0,
    },
    {
        "name": "Rationing",
        "desc": "Allows you to impose rationing on a district. Halves food consumption, but lowers your popularity with the local population.",
        "tier": 4,
        "price": 275,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Increase Number of Students in Medicine",
        "desc": "Force the Academy of Natural Philosophy to accept more students. Increases research speed.",
        "tier": 1,
        "price": 75,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Seize Plague Victim Corpses",
        "desc": "Organize the seizing of plague victim bodies for research. Increases research speed.",
        "tier": 2,
        "price": 100,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Increase Natural Philosopher Work Hours",
        "desc": "Run your researchers ragged. Increases research speed.",
        "tier": 2,
        "price": 75,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Government Planification",
        "desc": "In light of the emergency situation, all research is now controlled by the government. Surprisingly, this increases your research speed.",
        "tier": 3,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Experimentation on Weepers",
        "desc": "Allows the capture of weepers to be used as test subjects. Increases research speed.",
        "tier": 3,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Seize Private Laboratories",
        "desc": "Nationalize private laboratories, including equipment and human resources. Increases research speed.",
        "tier": 4,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Human Experimentation",
        "desc": "Prisoners from Coldridge will be used as test subjects. Increases research speed.",
        "tier": 4,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Research Under Military Supervision",
        "desc": "Military regimen can only improve their catastrophical organization. Increases research speed.",
        "tier": 3,
        "price": 275,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Underground City Planning",
        "desc": "Lowers the cost of sewers.",
        "tier": 1,
        "price": 100,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Public Transportation Act",
        "desc": "Lowers the cost of railways.",
        "tier": 2,
        "price": 150,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Emergency Health Fund",
        "desc": "Lowers the cost of hospital and quarantine houses.",
        "tier": 2,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Wrenhaven Development Plan",
        "desc": "Lowers the cost of docks.",
        "tier": 3,
        "price": 175,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Southern Bank Development Plan",
        "desc": "Lowers the cost of infrastructures in Commoner districts.",
        "tier": 3,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Warehouse Subsidies",
        "desc": "Lowers the cost of warehouses.",
        "tier": 4,
        "price": 250,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Big Pharm Lobbying",
        "desc": "Lowers the cost of elixir factories.",
        "tier": 4,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Chop Shop",
        "desc": "Lowers the cost of slaughterhouses.",
        "tier": 4,
        "price": 275,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "None",
        "desc": "No law is currently debated.",
        "tier": 0,
        "price": 0,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "None",
        "desc": "No law is currently debated.",
        "tier": 0,
        "price": 0,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Crisis management",
        "desc": "Expands your power due to the exceptional situation.",
        "tier": 0,
        "price": 200,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "State of emergency",
        "desc": "Expands your power due to the exceptional situation.",
        "tier": 0,
        "price": 300,
        "isVoted": false,
        "isOn": -1
    },
    {
        "name": "Martial law",
        "desc": "Expands your power due to the exceptional situation.",
        "tier": 0,
        "price": 400,
        "isVoted": false,
        "isOn": -1
    }
];

State.variables.laws = laws;