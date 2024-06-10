/**
 * TODO:
 */
console.log("Script.js successfully accessed.");
// UI Bar 
UIBar.destroy();
UIBar.stow();

// TURN SYSTEM =================================================================

/**
 * Change Turn and Date: Changes the turn and date variables.
 * Called In: setup.update
 */
setup.changeTurn = function() {
  let day = State.variables.day;
  let month = State.variables.month;
  let monthCount = State.variables.monthCount;

  // Set Date
  if (day >= 28) {
    if (month == "Songs" && day == 28) { // Fugue Feast
      State.variables.day += 1;
    } else if (month == "Songs") { // After Fugue Feast
      State.variables.year += 1;
      State.variables.month = "Earth";
      State.variables.day = 1;
    }
    else { // After regular months
      State.variables.month = MONTHS[monthCount + 1];
      State.variables.monthCount += 1;
      State.variables.day = 1;
    }
  } else {
    State.variables.day += 1;
  }

  // Change Turn Count
  State.variables.turn += 1;
}

// PLAGUE DYNAMICS =============================================================

/** 
 * Infection Rate: Calculates base infection rate.
 * Called In: setup.infectionUpdate
 * @param {object} district - District data
 * @returns {float} infection rate in this district
 */
setup.infectionRate = function(district) {
  let rate = 0;
  let mask = district.antiPlague.maskDist*State.variables.antiPlague.mask;
  let elixir = district.antiPlague.elixirDist*district.antiPlague.elixirMod;
  let lockdown = district.antiPlague.lockdown;
  let hospital = district.infrastructures.hospital;
  let quarantine = district.infrastructures.quarantine;
  let isStarving=0;

  if (district.events.starving>=1){
    isStarving=0.02;
  }

  rate = 0.2 - elixir * 0.02 - mask * 0.03 - lockdown * 0.07 - hospital * 0.03 - quarantine * 0.03 + isStarving;
  if (rate < 0) {
    rate = 0;
  }
  
  rate=0;
  return rate;
}

/**
 * Rat Human Infection Rate: Calculates rat-human infection rate.
 * Called In: setup.infectionUpdate
 * @param {object} district - District data
 * @returns {float} rat-human infection rate in this district
 */
setup.ratInfectionRate = function(district) {
  let rate = 0;
  let elixir = district.antiPlague.elixirDist*district.antiPlague.elixirMod;
  let lockdown = district.antiPlague.lockdown;
  let sewer = district.infrastructures.sewer;
  let isStarving=0;
  
  if (district.events.starving>=1){
    isStarving=0.002;
  }

  rate = 0.005 - elixir * 0.002 - lockdown * 0.002 - sewer * 0.001 + isStarving;
  if (rate < 0) {
    rate = 0;
  }

  return rate;
}

/** 
 * Rat Population Updating: Updates rat population of a district.
 * Called In: setup.update()
 */
setup.ratUpdate = function() {
  let districts = State.variables.d;

  for (let i = 0; i < districts.length; i++) {
    let district = State.variables.d[i];
    let current = district.plague.rats;
    let max = district.initPop;
    let adjNeighbors = district.adjNeighbors;
    let bridgeNeighbors= district.bridgeNeighbors;
    let wallOff = district.antiPlague.wallOff;
    let hunt = district.antiPlague.ratHunt*State.variables.antiPlague.hunt;
  
    // 0.2% of rats move through each border
    let inter =0;
    for (let j = 0; j < adjNeighbors.length; j++) {
      let currentDistrict = retrieveDistrict(adjNeighbors[j], "object");
      let adjRat = currentDistrict.plague.ratsOld;
      inter += wallOff * Math.floor(0.002*adjRat);
    }
    if (bridgeNeighbors.length > 0) { // check if district has bridge neighbors
      for (let j = 0; j < bridgeNeighbors.length; j++) {
        let currentDistrict = retrieveDistrict(bridgeNeighbors[j], "object");
        let bridgeRat = currentDistrict.plague.ratsOld;
        inter += wallOff * Math.floor(0.002*bridgeRat);
      }
    }
  
    // Base reproduction rate is 10%
    if (max != 0) { // if the district isn't Holger, Wyrmwood, or Kingsparrow
      current = Math.floor(current + (1 - current/(max * 1.5)) * (current * (0.1) + inter));
    } else {
      current = 0;
    }
  
    // Account for rat hunting
    current = current - Math.floor(hunt * (10 + current/25));
    if (current < 0) {
      current = 0;
    }
  
    State.variables.d[i].plague.rats = current;
  } 
  
  for (let i = 0; i < districts.length; i++) {
    State.variables.d[i].plague.ratsOld=districts[i].plague.rats;
  }
}

/** 
 * Infection Updating: Updates the current infection population for a district.
 * Called In: setup.update()
 */
setup.infectionUpdate = function() {
  let districts = State.variables.d;

  for (let i = 0; i < districts.length; i++) {
    let district = State.variables.d[i];
    let current = district.plague.infection; // POPULATION of infected
    let totalPop = district.population;
    let rat = district.plague.rats;
    let inter = 0;
    let humanTrav = 0.0002;
    let adjNeighbors = district.adjNeighbors;
    let bridgeNeighbors = district.bridgeNeighbors;
    let infectionRate = setup.infectionRate(district);
    let ratHumanInfection = setup.ratInfectionRate(district);
    let turn = State.variables.turn;
    let lockdown = district.antiPlague.lockdown;
    let wallOff = district.antiPlague.wallOff;

  
    // Inter-district Contamination
    if (lockdown == 2) {
      inter = 0;
    } else {
      for (let j = 0; j < adjNeighbors.length; j++) {
        let currentDistrict = retrieveDistrict(adjNeighbors[j], "object");
        let adjLock = currentDistrict.antiPlague.lockdown;
        let adjInf = currentDistrict.plague.infectionOld;

        if (adjLock == 0) {
          inter += wallOff * Math.floor(5 * adjInf * humanTrav);
        } else if (adjLock == 1) {
          inter += wallOff * Math.floor(5 * adjInf * humanTrav/2);
        }
      }
      if (bridgeNeighbors.length > 0) { // check if district has bridge neighbors
        for (let j = 0; j < bridgeNeighbors.length; j++) {
          let currentDistrict = retrieveDistrict(bridgeNeighbors[j], "object");
          let bridgeLock = currentDistrict.antiPlague.lockdown;
          let bridgeInf = currentDistrict.plague.infectionOld;

          if (bridgeLock == 0) {
            inter += wallOff * Math.floor(bridgeInf * humanTrav);
          } else if (bridgeLock == 1) {
            inter += wallOff * Math.floor(bridgeInf * humanTrav/2);
          }
        }
      }
      if (lockdown == 1) {
        inter = inter/2;
      }

      if (setup.retrieveLaw("Customs Processing","object").isOn==1){
        inter= inter/2;
      }
    }
  
    // Death
    if (turn <= 7) { // Before People Get Infected
      let update=0;
      if (totalPop!=0){
        update = Math.floor((totalPop - current)/totalPop * (rat * ratHumanInfection + (current + inter) * infectionRate));
      }

      current += update;
      State.variables.d[i].plague.history.push(update);

    } else { // People Start Catching the Plague
      let dead = district.plague.history.shift();
      State.variables.d[i].plague.deadThisTurn = dead;
      State.variables.d[i].plague.totalDeaths += dead;
      State.variables.d[i].population -= dead; // Kill the dead
      current -= dead; // New total infected
      if (totalPop != 0) {
        // New infected this turn
        let update = Math.floor(((totalPop - current)/totalPop) * (rat * ratHumanInfection + (current + inter) * infectionRate));
        // If the district gets fully contaminated this turn
        if (update > (totalPop - current)) {
          update = totalPop - current;
          current = totalPop;
        } else {
          current += update;
        }
        State.variables.d[i].plague.history.push(update);
      } else {
        State.variables.d[i].plague.history.push(0);
      }
    }

    State.variables.d[i].plague.infection = current; // Set current district's infection population
  }
  for (let i = 0; i < districts.length; i++) { 
    districts[i].plague.infectionOld=districts[i].plague.infection;
  }
}

/** 
 * Walls off the input district, kills its entire population, cuts off its trade routes and removes it from neighbor lists.
 * Called In: StoryRightSidebar
 * @param {id} district - District ID
 */
setup.wallOffDistrict=function(district){
  let distList=State.variables.d;
  let distObj=distList[district];

  //remove this district from neighbor lists
  let adjacent=distObj.adjNeighbors;
  for (let i=0; i<adjacent.length; i++){
    let adjId=retrieveDistrict(adjacent[i],"id");
    let adjObj=distList[adjId];
    let index = adjObj.adjNeighbors.indexOf(distObj.name);
      if (index > -1) { // only splice array when item is found
        State.variables.d[adjId].adjNeighbors.splice(index, 1); // 2nd parameter means remove one item only
      }
  }
  let bridge=distObj.bridgeNeighbors;
  for (let i=0; i<bridge.length; i++){
    let bridgeId=retrieveDistrict(bridge[i],"id");
    let bridgeObj=distList[bridgeId];
    let index = bridgeObj.bridgeNeighbors.indexOf(distObj.name);
      if (index > -1) { // only splice array when item is found
        State.variables.d[bridgeId].bridgeNeighbors.splice(index, 1); // 2nd parameter means remove one item only
      }
  }

  //basic info
  State.variables.d[district].population=0;
  State.variables.d[district].adjNeighbors=[];
  State.variables.d[district].bridgeNeighbors=[];

  

  //production
  State.variables.d[district].production.money=0;
  State.variables.d[district].production.energy=0;
  State.variables.d[district].production.food=0;
  State.variables.d[district].production.elixir=0;

  //stock
  State.variables.d[district].stock.food=0;
  State.variables.d[district].stock.elixir=0;
  State.variables.mf+=distList[district].stock.mf; //remove al tropps from the district
  State.variables.d[district].stock.mf=0;

  //plague
  State.variables.d[district].plague.infection=0;
  State.variables.d[district].plague.infectionOld=0;
  State.variables.d[district].plague.rats=0;
  State.variables.d[district].plague.ratsOld=0;
  State.variables.d[district].plague.history=[0,0,0,0,0,0,0]
  State.variables.d[district].plague.deadThisTurn=0;
  State.variables.d[district].plague.totalDeaths=distObj.initPop;
  
  //antiplague
  State.variables.d[district].antiPlague.ratHunt=0;
  State.variables.d[district].antiPlague.elixirDist=0;
  State.variables.d[district].antiPlague.maskDist=0;
  State.variables.d[district].antiPlague.lockdown=0;
  State.variables.d[district].antiPlague.wallOff=0;
  
  //infrastructures
  State.variables.d[district].infrastructures.sewer=0;
  State.variables.d[district].infrastructures.docks=0;
  State.variables.d[district].infrastructures.warehouses=0;
  State.variables.d[district].infrastructures.hospital=0;
  State.variables.d[district].infrastructures.quarantine=0;
  State.variables.d[district].infrastructures.elixirFactory=0;
  State.variables.d[district].infrastructures.rail=0;
  State.variables.d[district].infrastructures.slaughterhouse=0;
  State.variables.d[district].infrastructures.watchPost=0;

  //events
  State.variables.d[district].events.starving=0;

  //trade routes
  let foodIn=setup.getTradeRoutes(district,"food","in","array");
  for (let i=0; i<foodIn.length; i++){
    setup.deleteRoute(foodIn[i],"food");
  }
  let foodOut=setup.getTradeRoutes(district,"food","out","array");
  for (let i=0; i<foodOut.length; i++){
    setup.deleteRoute(foodOut[i],"food");
  }
  let elixirIn=setup.getTradeRoutes(district,"elixir","in","array");
  for (let i=0; i<elixirIn.length; i++){
    setup.deleteRoute(elixirIn[i],"elixir");
  }
  let elixirOut=setup.getTradeRoutes(district,"elixir","in","array");
  for (let i=0; i<elixirOut.length; i++){
    setup.deleteRoute(elixirOut[i],"elixir");
  }
}

// GENERAL RESOURCE FUNCTIONS ==================================================

/**
 * Resource Production: Calculates how much of a resource is produced by a district.
 * Called In: setup.moneyUpdate(), setup.energyUpdate(),setup.elixirUpdate(), setup.foodUpdate(), StoryRightSidebar
 * @param {int} id Index of a district
 * @param {str} resource Name of resource
 * @returns Resource production as a result of lockdown and death modifier calculations
 */
setup.resourceProduction = function(id, resource) {
  let district = State.variables.d[id];
  let prod = district.production[resource];
  let lockdown = district.antiPlague.lockdown;
  let modif = district.production.deathMod;
  let isStarving=district.events.starving;
  let result = 0;
  let multiplier = 1;

  if (lockdown == 2){
    result += Math.floor(modif * prod/2);
  }
  else{
    result += Math.floor(modif * prod);
  }

  if (isStarving>=1){
    result*=0.7;
  }

  if (resource=="food"){
    if (setup.retrieveLaw("Farming Contracts","object").isVoted){
      multiplier+=0.2;
    }
    if (setup.retrieveLaw("Lower Food Quality Standards","object").isVoted){
      multiplier+=0.2;
    }
    if (setup.retrieveLaw("Raise Standards in Food Conservation","object").isVoted){
      multiplier+=0.2;
    }
    multiplier+=Math.floor((retrieveFaction("Commoner","object").popularity-50)/10)*0.1;
  }
  else if (resource=="energy"){
    if (setup.retrieveLaw("Lengthen Work Hours in Slaughterhouses","object").isVoted){
      multiplier+=0.2;
    }
    if (setup.retrieveLaw("Impose Whaling Quotas","object").isVoted){
      multiplier+=0.2;
    }
    multiplier+=Math.floor((retrieveFaction("Commoner","object").popularity-50)/10)*0.1;
  }
  else if (resource=="elixir"){
    if (setup.retrieveLaw("Cut Regulations on Medicine","object").isVoted){
      multiplier+=0.2;
    }
    if (setup.retrieveLaw("Publicizing of Medicine Patents","object").isVoted){
      multiplier+=0.2;
    }
  }
  else if (resource=="money"){
    if (setup.retrieveLaw("Tax Basic Resources","object").isOn==1){
      multiplier+=0.2;
    }
    if (setup.retrieveLaw("Tax Luxury Resources","object").isOn==1){
      multiplier+=0.2;
    }
    multiplier+=Math.floor((retrieveFaction("Nobility","object").popularity-50)/10)*0.1;
  }

  result=Math.floor(result* multiplier);
  return result;
}

/**
 * Resource Update: Bundles all resource update functions.
 * Called In: setup.update
 */
setup.resourceUpdate = function() {
  setup.moneyUpdate();
  setup.energyUpdate();
  setup.foodUpdate();
  setup.elixirUpdate();
}
/**
 * getTradeRoutes: checks all the trade routes coming in OR going from a district, for a specific resource, and returns either an array of all routes or the total number of routes
 * @param {int} id Index of a district
 * @param {str} resource Food or elixir
 * @param {str} outOrIn Trade routes incoming or outgoing
 * @param {str} returnType "array" or "total": Determines whether to return total outgoing trade or array of each route
 * @returns {array or int} array of routes or total number of routes
 */
setup.getTradeRoutes = function(id, resource, outOrIn, returnType) {
  let allRoutes = [];
  let routes = [];
  let name = State.variables.d[id].name;

  // Gets either food or elixir routes
  if (resource == "food") {
    allRoutes = State.variables.foodRoutes;
  } else if (resource == "elixir") {
    allRoutes = State.variables.elixirRoutes;
  } else {
    console.log("getTradeOutgoing: Not a valid resource name.");
  }

  // Goes through all routes and gets routes that are sending resource from named district
  for (let i = 0; i < allRoutes.length; i++) {
    let currRoute = allRoutes[i];
    if ((currRoute.from == name) && (outOrIn == "out")) { // Outgoing
      routes.push(currRoute);
    } else if ((currRoute.to == name) && (outOrIn == "in")) { // Incoming
      routes.push(currRoute);
    }
  }

  // Sets return value depending on type
  if (returnType == "array") {
    return routes;
  } else if (returnType == "total") {
    let result = 0;
    for (let i = 0; i < routes.length; i++) {
      result += routes[i].amount;
    }
    return result;
  } else {
    console.log("getTradeOutgoing: Not a valid return type.");
  }
}

setup.MFupdate = function() {
  let watchPop=retrieveFaction("Watch","object").popularity;
  let districts=State.variables.d;
  let mf=20;
  let dialog="";
  let US=setup.retrieveLaw("Understaffing","object").isOn;

  if (setup.retrieveLaw("Drafting","object").isVoted){
    mf+=10;
  }

  mf+=Math.floor((watchPop-50)/10)*4;

  let headcount=0;
  for (let i=0; i<districts.length; i++){
    headcount+=districts[i].stock.mf;
  }

  if (headcount>mf){
    //remove non necessary 
    for (let i=0; i<districts.length; i++){
      let currentD=districts[i];
      if(currentD.antiPlague.lockdown==0){
        let remove=Math.min(headcount-mf, currentD.stock.mf);
        State.variables.d[i].stock.mf-=remove;
        headcount-=remove;
        if(remove>0){
          dialog+="<br>" + currentD.name;
        }        
      }
      //cutoff for plague measures if understaffing is in effect
      if (US){
        if(currentD.antiPlague.lockdown==1 && currentD.stock.mf>2){
          let remove=Math.min(headcount-mf, currentD.stock.mf-2);
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(remove>0){
            dialog+="<br>" + currentD.name;
          }        
        }
        if(currentD.antiPlague.lockdown==2 && currentD.stock.mf>4){
          let remove=Math.min(headcount-mf, currentD.stock.mf-4);
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(remove>0){
            dialog+="<br>" + currentD.name;
          }        
        }
      }
      //cutoff for measures if no understaffing
      else{
        if(currentD.antiPlague.lockdown==1 && currentD.stock.mf>3){
          let remove=Math.min(headcount-mf, currentD.stock.mf-3);
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(remove>0){
            dialog+="<br>" + currentD.name;
          }        
        }
        if(currentD.antiPlague.lockdown==2 && currentD.stock.mf>5){
          let remove=Math.min(headcount-mf, currentD.stock.mf-5);
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(remove>0){
            dialog+="<br>" + currentD.name;
          }        
        }
      }
      
      if (headcount<=mf){
        break;
      }
    }
    //downgrade measures by one level
    for (let i=0; i<districts.length; i++){
      let currentD=districts[i];
      if (headcount<=mf){
        break;
      }
      if (US){
        if(currentD.antiPlague.lockdown==1){
          let remove=Math.min(headcount-mf, currentD.stock.mf);
          State.variables.d[i].antiPlague.lockdown=0;
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(dialog.indexOf("<br>" + currentD.name) < 0 && remove>0) {
            dialog+="<br>" + currentD.name;
          }
        }
        if(currentD.antiPlague.lockdown==2){
          let remove=Math.min(headcount-mf, currentD.stock.mf-2);
          State.variables.d[i].antiPlague.lockdown=1;
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(dialog.indexOf("<br>" + currentD.name) < 0 && remove>0) {
            dialog+="<br>" + currentD.name;
          }
        }
      }
      //cutoff for measures if no understaffing
      else{
        if(currentD.antiPlague.lockdown==1){
          let remove=Math.min(headcount-mf, currentD.stock.mf);
          State.variables.d[i].antiPlague.lockdown=0;
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(dialog.indexOf("<br>" + currentD.name) < 0 && remove>0) {
            dialog+="<br>" + currentD.name;
          }
        }
        if(currentD.antiPlague.lockdown==2){
          let remove=Math.min(headcount-mf, currentD.stock.mf-2);
          State.variables.d[i].antiPlague.lockdown=1;
          State.variables.d[i].stock.mf-=remove;
          headcount-=remove;
          if(dialog.indexOf("<br>" + currentD.name) < 0 && remove>0) {
            dialog+="<br>" + currentD.name;
          }
        }
      }
    }
    //remove all measures
    for (let i=0; i<districts.length; i++){
      let currentD=districts[i];
      if (headcount<=mf){
        break;
      }
      let remove=Math.min(headcount-mf, currentD.stock.mf);
      State.variables.d[i].antiPlague.lockdown=0;
      State.variables.d[i].stock.mf-=remove;
      headcount-=remove;
      if(dialog.indexOf("<br>" + currentD.name) < 0 && remove>0) {
        dialog+="<br>" + currentD.name;
      }
    }
  }
  
  headcount=0;
  for (let i=0; i<districts.length; i++){
    headcount+=districts[i].stock.mf;
  }

  if (dialog!=""){
    State.variables.dialog+=("Watch guards have deserted from the following districts. This may affect curfews and lockdowns:"+dialog);
  }

  State.variables.mf=mf-headcount;
}

// MONEY =======================================================================

/**
 * Money Update: Updates the amount of total money the player has.
 * Called In: setup.resourceUpdate()
 */
setup.moneyUpdate = function() {
  let districts = State.variables.d; // Array of district objects

  // For each district in the districts array, add the district's money production to total money
  for (let i = 0; i < districts.length; i++) {
    State.variables.money += setup.resourceProduction(i, "money");
  }

  // Account for anti-plague costs: Both of these are functions
  State.variables.money -= setup.huntCost(districts); 
  State.variables.money -= setup.maskCost(districts);
}

/**
 * Rat Hunting Cost: Calculates rat hunting costs and distributes costs based on current money.
 * Called In: setup.moneyUpdate()
 * @param {array} districts Array of all district objects
 * @returns Total amount of money spent on rat hunting
 */
setup.huntCost = function(districts) {
  let money = State.variables.money;
  let spend = 0; // Total amount of money being spent for hunting

  for (let i = 0; i < districts.length; i++) {
    let huntLVL=districts[i].antiPlague.ratHunt;
    if (huntLVL==1){
      spend+=1000;
    }
    else if (huntLVL==2){
      spend+=2500;
    }
    else if (huntLVL==3){
      spend+=3500;
    }
  }
  
  if (spend>money){
    State.variables.antiPlague.hunt=money/spend;
    State.variables.dialog += ("Lack of funding: the rat hunters are understaffed. They will be less effective.");
    return(money);
  }
  else{
    State.variables.antiPlague.hunt=1;
    return spend;
  }
}

/**
 * Mask Costs: Calculates mask distribution costs and pays them off based on current money.
 * Called In: setup.moneyUpdate()
 * @param {array} districts Array of all district objects
 * @returns Total amount of money spent on masks
 */
setup.maskCost = function(districts){
  let money = State.variables.money;
  let spend = 0;

  if (setup.retrieveLaw("Textile Negotiation","object").isVoted){
    for (let i = 0; i < districts.length; i++) {
      spend+=districts[i].antiPlague.maskDist* Math.ceil((districts[i].population/200)+400);
    }
  }
  else{
    for (let i = 0; i < districts.length; i++) {
      spend+=districts[i].antiPlague.maskDist *Math.ceil((districts[i].population/100)+400);
    }
  }
  
  if (spend>money){
    State.variables.antiPlague.mask=money/spend;
    State.variables.dialog += ("Not enough masks could be distributed. They will be less effective.");
    return(money);
  }
  else{
    State.variables.antiPlague.mask=1;
    return spend;
  }
}

// ENERGY ======================================================================

/**
 * Energy Update: Updates amount of energy the player has.
 * Called In: setup.resourceUpdate()
 */
setup.energyUpdate = function() {
  let districts = State.variables.d;
  let energy = State.variables.energy;
  
  for (let i = 0; i < districts.length; i++) {
     energy += setup.resourceProduction(i, "energy");
  }

  State.variables.energy = energy;
}

// FOOD ========================================================================

/**
 * Food Update: Updates food trade routes, food production, and food consumption. Activates starvation if needed.
 * Called In: setup.resourceUpdate()
 */
setup.foodUpdate = function() {
  let districts = State.variables.d;
  let cancel = "";
  let alert = "";
  
  districts.forEach((district) => {
    let id = retrieveDistrict(district.name, "id");
    let stock = district.stock.food;

    // Determine amount of food produced
    stock += setup.resourceProduction(id, "food");

    // Check all trade routes
    let outgoingRoutes = setup.getTradeRoutes(id, "food", "out", "array");
    for (let i = 0; i < outgoingRoutes.length; i++) {
      if (stock >= outgoingRoutes[i].amount) { // Enough food
        stock -= outgoingRoutes[i].amount;
      } else { // Not enough food
        // Delete route from global array
        let route = outgoingRoutes[i];
        let index = State.variables.foodRoutes.indexOf(route);
        if (index !== -1) {
          State.variables.foodRoutes.splice(index, 1);
        }
        cancel += "<br>" + district.name + "</br>";
      }
    }
    let ingoingRoutes=setup.getTradeRoutes(id, "food", "in", "array");
    for (let i = 0; i < ingoingRoutes.length; i++) {
      stock+=ingoingRoutes[i].amount;
    }

    // Attempt to distribute food
    let foodNeed = setup.foodConsumption(id);
    let isStarving = district.events.starving;
    // If not enough food:
    if (stock < foodNeed) {
      stock = 0;
      if (isStarving ==0) {
        alert += "<br>" + district.name + "</br>";
        isStarving = 1;
      }
      else if (isStarving<10){
        isStarving+=1;
      }
    } else { // Enough food to feed district
      stock -= foodNeed;
      isStarving = 0;
    }

    // Set global variables
    State.variables.d[id].events.starving = isStarving;
    State.variables.d[id].stock.food = stock;
  });

  if (cancel != ""){
    State.variables.dialog += ("The following districts had their outgoing trade routes cancelled due to lack of stock:" + cancel);
  }

  if (alert != ""){
    State.variables.dialog += ("The following districts started starving:" + alert);
  }
}

/**
 * Food Consumption: Calculates how much food a district needs to consume (based on population).
 * Called In: setup.foodUpdate(), StoryRightBar Passage, under Resources.
 * @param {int} id Index of a district
 * @returns How much food a district needs
 */
setup.foodConsumption = function(id){
  let district = State.variables.d[id];
  let pop = district.population;
  
  if (district.antiPlague.rationing==1){
    return Math.ceil(pop/2000);
  }
  else{
    return Math.ceil(pop/1000);
  }
}

// ELIXIR ======================================================================

/**
 * Elixir Update: Updates elixir trade routes, elixir production, and elixir distribution.
 * Called In: setup.resourceUpdate()
 */
setup.elixirUpdate = function() {
  let districts = State.variables.d;
  let cancel = "";
  let alert = "";

  for (let k = 0; k < districts.length; k++) {
    let district=districts[k];
    let stock = district.stock.elixir;

    // Determine amount of elixir produced
    stock += setup.resourceProduction(k, "elixir");

    // Check all trade routes
    let outgoingRoutes = setup.getTradeRoutes(k, "elixir", "out", "array");
    for (let i = 0; i < outgoingRoutes.length; i++) {
      if (stock >= outgoingRoutes[i].amount) { // Enough elixir
        stock -= outgoingRoutes[i].amount;
      } else { // Not enough elixir
        // Delete route from global array
        let route = outgoingRoutes[i];
        let index = State.variables.elixirRoutes.indexOf(route);
        if (index !== -1) {
          State.variables.elixirRoutes.splice(index, 1);
        }
        cancel += "<br>" + district.name + "</br>";
      }
    }
    let ingoingRoutes=setup.getTradeRoutes(k, "elixir", "in", "array");
    for (let i = 0; i < ingoingRoutes.length; i++) {
      stock+=ingoingRoutes[i].amount;
    }

    // Attempt to distribute elixir
    let distCost = setup.elixirConsumption(k);
    // If district's elixir request can be fulfilled
    if (stock >= distCost) {
      stock -= distCost;
    } else { // Not enough elixir
      State.variables.d[k].antiPlague.elixirMod = Math.floor(stock/distCost);
      stock=0;
      alert += "<br>" + district.name + "</br>";
    }

    // Set global variables
    State.variables.d[k].stock.elixir = stock;
  }

  if (cancel != "") {
    State.variables.dialog += ("The following districts had their outgoing trade routes cancelled due to lack of stock:" + cancel);
  }

  if (alert !="") {
    State.variables.dialog += ("The following districts are short on elixir:" + alert);
  }
}

/**
 * Elixir Consumed: Calculates how much elixir a district needs to consume (based on population).
 * Called In: setup.elixirUpdate(), StoryRightBar Passage, under Resources.
 * @param {int} id Index of a district
 * @returns How much elixir a district needs
 */
setup.elixirConsumption = function(id){
  let district = State.variables.d[id];
  let pop = district.population;
  let distribution = district.antiPlague.elixirDist;
  return Math.ceil(distribution * pop/2000);
}

// TRADE =======================================================================

/**
 * Click on Trade: Modify the tradeState and set the trade source/destination accordingly.
 * Called In: Trade Map Passage, for each map area
 * @param {int} id Index of a district
 */
window.clickTrade = function(id){
  let tradeState = State.variables.tradeState;
  let max = State.variables.d[id].infrastructures.rail + 2;

  if (tradeState == 1) {
    if (setup.countRoutes(id) == max){
      UI.alert("This district can't have more than " + max + " outgoing routes.");
    }
    else {
      State.variables.tradeFrom = {
        "name": State.variables.d[id].name,
        "id": id};
      State.variables.tradeState = 2;
    }
  }
  if (tradeState == 2) {
    State.variables.tradeTo = {
      "name": State.variables.d[id].name,
      "id": id};
    State.variables.tradeState = 3;
  }
}

/**
 * Determine Passage When Trading: Sets the current passage depending on tradeState.
 * Called In: Trade Map Passage, for each map area
 * @returns Passage name
 */
window.passageTrade = function() {
  let tradeState = State.variables.tradeState;

  if (tradeState == 1){
    return "Trade Map";
  }
  else{
    return "Main Map";
  }
}

/**
 * Delete Trade Route: Takes a route and deletes it from its respective array.
 * Called In: StoryTradeSidebar Passage, under the for loop to display each trade route
 * @param {object} route Route object
 * @param {str} resource Food or elixir
 */
setup.deleteRoute = function(route, resource) {
  let listOfRoutes = [];
  if (resource == "food") {
    listOfRoutes = State.variables.foodRoutes;
  } else if (resource == "elixir") {
    listOfRoutes = State.variables.elixirRoutes;
  }
  for (let i = 0; i < listOfRoutes.length; i++) {
    let currRoute = listOfRoutes[i];
    if (currRoute.from == route.from && currRoute.to == route.to) {
      listOfRoutes.splice(i, 1);
    }
  }
  if (resource == "food") {
    State.variables.foodRoutes = listOfRoutes;
  } else if (resource == "elixir") {
    State.variables.elixirRoutes = listOfRoutes;
  }
}

/**
 * Confirm Trade: Actually adds the new trade route to the global array.
 * Called In: StoryTradeSidebar Passage, final tradeStage else condition
 */
setup.confirmTrade = function() {
  let tradeAmount = State.variables.tradeAmount
  let tradeResource = State.variables.tradeResource;
  let tradeFrom = State.variables.tradeFrom;
  let tradeTo = State.variables.tradeTo;
  let existingRoute=setup.routeExists(tradeFrom.id,tradeTo.id,tradeResource);

  if (existingRoute!=-1){
    setup.deleteRoute(existingRoute,tradeResource);
  }
  if (tradeResource == "food") {
    State.variables.foodRoutes.push({
      "id": State.variables.foodRoutes.length,
      "from": tradeFrom.name,
      "to": tradeTo.name,
      "amount": tradeAmount
    });
  }
  else if (tradeResource == "elixir") {
    State.variables.elixirRoutes.push({
      "id": State.variables.elixirRoutes.length,
      "from": tradeFrom.name,
      "to": tradeTo.name,
      "amount": tradeAmount
    });
  }
  State.variables.tradeState = 0;
  State.variables.tradeFrom = {};
  State.variables.tradeTo = {};
  State.variables.tradeResource = "none";
  State.variables.tradeAmount = 0;
}

/**
 * Count Trade Routes: Counts how many trade routes a district has in order to determine route capacity.
 * @param {int} id Index of a district
 * @returns Number of trade routes a district currently maintains
 */
setup.countRoutes = function(id){
  let name = State.variables.d[id].name;
  let food = State.variables.foodRoutes;
  let elixir = State.variables.elixirRoutes;
  let count = 0;

  for (let i = 0; i < food.length; i++){
    if (food[i].from == name) {
      count += 1;
    }
  }

  for (let i = 0; i < elixir.length; i++) {
    if (elixir[i].from == name) {
      count += 1;
    }
  }
  return count;
}

/**
 * routeExists: searches a route exists based on resource, source and destination district.
 * @param {int} sourceId Index of the source district
 * @param {int} destId Index of the destination district
 * @param {str} resource resource of the route: elixir or food 
 * @returns the route
 */
setup.routeExists = function(sourceId,destId,resource){
  let listOfRoutes=setup.getTradeRoutes(sourceId,resource,"out","array");
  let destName=State.variables.d[destId].name;


  for (let i = 0; i < listOfRoutes.length; i++){
    if (listOfRoutes[i].to == destName) {
      return(listOfRoutes[i]);
    }
  }
  return(-1);
}

// INFRASTRUCTURES ==================================================================

/**
 * buildInfra: Builds or upgrade the input infrastructure in the input district
 * @param {int} district Index of the district
 * @param {Object} infra infrastructure in question
 */
setup.buildInfra = function(district,infra){
  State.variables.d[district].infrastructures[infra.propertyName]+=1;

  if (setup.retrieveLaw("Southern Bank Development Plan","object").isVoted && State.variables.d[district].class=="Commoners"){
    State.variables.money-=Math.ceil(infra.cost*0.75);
  }
  else {    
    State.variables.money-=infra.cost;
  }

  if (infra.propertyName=="elixirFactory"){
    State.variables.d[district].production.elixir+=100;
  }
  else if (infra.propertyName=="docks"){
    State.variables.d[district].production.food+=100;
  }
  else if (infra.propertyName=="slaughterhouse"){
    State.variables.d[district].production.energy+=5;
  }
}


// LAWS ========================================================================

/**
 * addLaw: Votes the law, removes spent votes and makes the changes caused by the law
 * @param {int} lawId Index of the law
 */
setup.addLaw = function(lawId){
  let laws=State.variables.laws;

  State.variables.laws[lawId].isVoted=true;
  State.variables.vote-=laws[lawId].price;

  if (laws[lawId].name=="Underground City Planning"){
    setup.retrieveInfra("Sewers","object").cost=150;
  }
  else if (laws[lawId].name=="Public Transportation Act"){
    setup.retrieveInfra("Railways","object").cost=225;
  }
  else if (laws[lawId].name=="Emergency Health Fund"){
    setup.retrieveInfra("Hospital","object").cost=325;
    setup.retrieveInfra("Quarantine house","object").cost=150;
  }
  else if (laws[lawId].name=="Wrenhaven Development Plan"){
    setup.retrieveInfra("Docks","object").cost=150;
  }
  else if (laws[lawId].name=="Warehouse Subsidies"){
    setup.retrieveInfra("Warehouse","object").cost=150;
  }
  else if (laws[lawId].name=="Big Pharm Lobbying"){
    setup.retrieveInfra("Elixir factory","object").cost=375;
  }
  else if (laws[lawId].name=="Chop Shop"){
    setup.retrieveInfra("Slaughterhouse","object").cost=300;
  }
}

/**
 * Toggle law: switches a law on and off. Applies the law's effect if needed.
 * @param {int} lawId Index of the law
 */
setup.toggleLaw=function(lawId){
  let law=State.variables.laws[lawId];

  if (law.isOn==1){
    State.variables.laws[lawId].isOn=0;
    if(law.name=="Drafting"){
      if (State.variables.mf>=20){
        State.variables.mf-=20;
      }
      else{
        State.variables.laws[lawId].isOn=1;
        Dialog.append("Not enough Watch squads to cease drafting.");
        Dialog.open();
      }
    }
  }
  else{
    State.variables.laws[lawId].isOn=1;

    if (law.name=="Customs Processing"){
      let food=State.variables.foodRoutes;
      let elixir=State.variables.elixirRoutes;

      for(let i=0; i<food.length; i++){
        if(food[i].amount>75){
          State.variables.foodRoutes[i].amount=75;
        }
      }
      for(let i=0; i<elixir.length; i++){
        if(elixir[i].amount>75){
          State.variables.elixirRoutes[i].amount=75;
        }
      }
    }
    else if(law.name=="Drafting"){
      State.variables.mf+=20;
    }
  }

}

/**
 * How long law: Calculates the approximate time to complete a law, based on current voting speed
 * @param {int} id Index of a district
 * @returns {int} number of turn before completion, -1 if the time is infinite or if there's no law being voted
 */
setup.howLongLaw=function(lawId){
  let newVote=setup.newVote();
  let vote=State.variables.vote;
  let price=State.variables.laws[lawId].price;

  let result=0
  if (price==0){
    result=-1;
  }
  else{
    if (newVote>0){
      result=Math.ceil((price-vote)/newVote);
      if (result<1){
        result=1;
      }
    }
    else{
      result=-1;
    }
  }
  
  return(result)
}

/**
 * New Votes: calculates the number of new votes per turn
 * @returns Number of new votes this turn
 */
setup.newVote=function(){
  return(10)
}

/**
 * update law: checks if the law is completed this turn, adds it if it's the case
 */
setup.updateLaw=function(){
  let vote=State.variables.vote;
  let lawWIP=State.variables.lawWIP;

  if (lawWIP.name!="None"){
    if (vote>=lawWIP.price){
      let lawId=setup.retrieveLaw(lawWIP.name,"id");
      setup.addLaw(lawId);
      if (lawWIP.isOn==-1){
        State.variables.dialog += ("The law "+lawWIP.name+" has been voted.");
      }
      else{
        State.variables.dialog += ("The law "+lawWIP.name+" has been voted. Go to Parliament to apply it.");
      }

      State.variables.lawWIP = {
        "name": "None",
        "desc": "No law is currently debated.",
        "tier": 1,
        "price": 0,
        "isVoted": false,
        "isOn": -1
      };
    }
  }
}


// POPULARITY ==================================================================

/**
 * Popularity Update: Updates every faction's popularity and their summary messages.
 * Called In: setup.update()
 */
setup.popularityUpdate = function() {

  //resets popularity
  for (let i = 0; i < State.variables.factions.length; i++) {
    State.variables.factions[i]={...State.variables.factionsDefault[i]};
  }
  // Evaluates district population factors first
  setup.popularityDistrict();
  // Store each faction as an object.
  let criminal = retrieveFaction("Criminal", "object");
  let nobility = retrieveFaction("Nobility", "object");
  let commoner = retrieveFaction("Commoner", "object");
  let watch = retrieveFaction("Watch", "object");

  let districts = State.variables.d;
  let districtFactors = {
    "foodStock": 0,
    "collapse": 0,
    "mfInPlagued": 0,
    "watchPost": 0,
    "deadPerTurn": 0,
    "highMF": 0
  }
  
  // For each district, modify faction popularity and add/subtract from popularity gain/loss in districtFactors
  for (let i = 0; i < districts.length; i++) {
    let district = districts[i];

    // Food Stock
    if (district.stock.food >= 1000 && district.class == "Commoners") {
      commoner.popularity += 10;
      districtFactors.foodStock += 10;
    }
    // Collapsing Into Criminality
    if (district.class == "Criminals" && district.name != "Wyrmwood District") {
      watch.popularity -= 15;
      districtFactors.collapse -= 15;
    }
    // MF in a Plagued District
    if (district.stock.mf >= 10 && district.plague.infection / district.population >= 0.1) {
      watch.popularity -= 5;
      districtFactors.mfInPlagued -= 5;
    }
    // high MFs
    if (district.stock.mf >= 10) {
      criminal.popularity -= 10;
      districtFactors.highMF -= 10;
    }
    // Watch Posts
    if (district.infrastructures.watchPost == 1) {
      watch.popularity += 5;
      criminal.popularity -= 5;
      districtFactors.watchPost += 5;
    }
  }

  // For each factor in districtFactors, decide which message to add and to where
  Object.entries(districtFactors).forEach(factor => {
      let [f, n] = factor;
      if (n != 0) {
        if (f == "foodStock") {
          commoner.summary += "<br> High Food Stocks: " + n + "%";
        } else if (f == "collapse") {
          watch.summary += "<br> Some districts have fallen into criminal hands: " + n + "%";
        } else if (f == "mfInPlagued") {
          watch.summary += "<br> Many Watchmen are stationed in plagued areas: " + n + "%";
        } else if (f == "watchPost") {
          watch.summary += "<br> Watch outposts: " + n + "%";
          criminal.summary += "<br> Watch outposts: -" + n + "%";
        } else if (f == "highMF") {
          criminal.summary += "<br> Too many patrols: " + n + "%";
        }
      } 
  });  

  // LAWS ====================================================================

  if(setup.retrieveLaw("Armory Funding", "object").isVoted){
    watch.popularity += 10;
    watch.summary += "<br> Funding for the armory: +10%";
  }
  if(setup.retrieveLaw("Drafting", "object").isOn==1){
    commoner.popularity -= 15;
    commoner.summary += "<br> Drafting: -15%";
  }
  if(setup.retrieveLaw("Rehabilitation Centers", "object").isVoted){
    watch.popularity += 5;
    watch.summary += "<br> Rehabilitation Centers: +5%";
  }
  if(setup.retrieveLaw("Tax Basic Resources", "object").isOn==1){
    commoner.popularity -= 10;
    commoner.summary += "<br> Tax Basic Resources: -10%";
  }
  if(setup.retrieveLaw("Whale Oil Technologies", "object").isVoted){
    watch.popularity += 15;
    watch.summary += "<br> Whale Oil Technologies: +15%";
  }
  if(setup.retrieveLaw("Tax Basic Resources", "object").isOn==1){
    nobility.popularity -= 10;
    nobility.summary += "<br> Tax Luxury Resources: -10%";
  }

  // Understaffing
  if (setup.retrieveLaw("Understaffing", "object").isOn==1){
    State.variables.understaffing+=1;
    let understaffing=State.variables.understaffing;
    watch.popularity -= understaffing;
    watch.summary +="<br> Understaffing: -"+understaffing+"%";
  }
  else if (State.variables.understaffing>1){
    State.variables.understaffing-=1;
    let understaffing=State.variables.understaffing;
    watch.popularity -= understaffing;
    watch.summary +="<br> Understaffing recovery: -"+understaffing+"%";
  }
  else if (State.variables.understaffing==1){
    State.variables.understaffing-=1;
  }

  // Money
  if (State.variables.money >= 500000) {
    commoner.popularity -= 15;
    commoner.summary += "<br> Full treasury: -15%";
    nobility.popularity += 10;
    nobility.summary += "<br> Full treasury: +10%";
  }

  State.variables.factions = [criminal, nobility, commoner, watch];
  for (let i = 0; i < State.variables.factions.length; i++) {
    if (State.variables.factions[i].popularity<0){
      State.variables.factions[i].popularity=0;
    }
  }
}

/**
 * Popularity District Population Related Factors: Checks district population factors that influence popularity
 * and computes the percentages + adds related summary messages to their corresponding object.
 * Called In: setup.popularityUpdate()
 */
setup.popularityDistrict = function() {
  let commoner = retrieveFaction("Commoner", "object");
  let nobility = retrieveFaction("Nobility", "object");
  let criminal = retrieveFaction("Criminal", "object");
  let maskMod=State.variables.antiPlague.mask;
  let huntMod=State.variables.antiPlague.hunt;

  let districts = State.variables.d;
  // Initialize objects to store values of each population-related factor
  let commonerFactors = {
    "name": "commoner",
    "values": {
      "infection": 0, "curfew": 0, "lockdown": 0, "ratHunt": 0, "elixir": 0, "mask": 0, "starve": 0, "wallOff": 0, "ration": 0,
    }
  };
  let nobilityFactors = {
    "name": "nobility",
    "values": {
      "infection": 0, "curfew": 0, "lockdown": 0, "ratHunt": 0, "elixir": 0, "mask": 0, "starve": 0, "wallOff": 0, "ration": 0,
    }
  };
  let criminalFactors = {
    "name": "criminal",
    "values": {
      "infection": 0, "curfew": 0, "lockdown": 0, "ratHunt": 0, "elixir": 0, "mask": 0, "starve": 0, "wallOff": 0, "ration": 0,
    }
  };

  // For each district, modify a faction's OVERALL popularity value (faction.popularity) and
  // a faction's population related factor (factionFactors.factor)
  for (let i = 0; i < districts.length; i++) {
    let district = State.variables.d[i];
    let elixirMod=district.antiPlague.elixirMod;
    // Infection Rate
    if (district.plague.infection / district.population > 0.05) {
      if (district.class == "Commoners") {
        commoner.popularity -= 5;
        commonerFactors.values.infection -= 5;
      } else if (district.class == "Nobles") {
        nobility.popularity -= 5;
        nobilityFactors.values.infection -= 5;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 5;
        criminalFactors.values.infection -= 5;
      }
    }
    // Curfew
    if (district.antiPlague.lockdown == 1) {
      if (district.class == "Commoners") {
        commoner.popularity -= 10;
        commonerFactors.values.curfew -= 10;
      } else if (district.class == "Nobles") {
        nobility.popularity -= 10;
        nobilityFactors.values.curfew -= 10;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 10;
        criminalFactors.values.curfew -= 10;
      }
    }
    // Lockdown
    if (district.antiPlague.lockdown == 2) {
      if (district.class == "Commoners") {
        commoner.popularity -= 15;
        commonerFactors.values.lockdown -= 15
      } else if (district.class == "Nobles") {
        nobility.popularity -= 15;
        nobilityFactors.values.lockdown -= 15;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 15;
        criminalFactors.values.lockdown -= 15;
      }
    }
    // Rat Hunting
    if (district.antiPlague.ratHunt >= 1){
      if (district.class == "Commoners") {
        commoner.popularity += Math.floor(10*huntMod);
        commonerFactors.values.ratHunt += Math.floor(10*huntMod);
      } else if (district.class == "Nobles") {
        nobility.popularity += Math.floor(10*huntMod);
        nobilityFactors.values.ratHunt += Math.floor(10*huntMod);
      } else if (district.class == "Criminals") {
        criminal.popularity += Math.floor(10*huntMod);
        criminalFactors.values.ratHunt += Math.floor(10*huntMod);
      }
    }
    // Elixir Distribution
    if (district.antiPlague.elixirDist >= 1){
      if (district.class == "Commoners") {
        commoner.popularity += Math.floor(10*elixirMod);
        commonerFactors.values.elixir += Math.floor(10*elixirMod);
      } else if (district.class == "Nobles") {
        nobility.popularity += Math.floor(10*elixirMod);
        nobilityFactors.values.elixir += Math.floor(10*elixirMod);
      } else if (district.class == "Criminals") {
        criminal.popularity += Math.floor(10*elixirMod);
        criminalFactors.values.elixir += Math.floor(10*elixirMod);
      }
    }
    // Mask Distribution
    if (district.antiPlague.maskDist >= 1) {
      if (district.class == "Commoners") {
        commoner.popularity += Math.floor(5*maskMod);
        commonerFactors.values.mask += Math.floor(5*maskMod);
      } else if (district.class == "Nobles") {
        nobility.popularity += Math.floor(5*maskMod);
        nobilityFactors.values.mask += Math.floor(5*maskMod);
      } else if (district.class == "Criminals") {
        criminal.popularity += Math.floor(5*maskMod);
        criminalFactors.values.mask += Math.floor(5*maskMod);
      }
    }
    // Starvation
    if (district.events.starving >=1 && district.events.starving < 10) {
      if (district.class == "Commoners") {
        commoner.popularity -= district.events.starving;
        commonerFactors.values.starve -= district.events.starving;
      } else if (district.class == "Nobles") {
        nobility.popularity -= district.events.starving;
        nobilityFactors.values.starve -= district.events.starving;
      } else if (district.class == "Criminals") {
        criminal.popularity -= district.events.starving;
        criminalFactors.values.starve -= district.events.starving;
      }
    } else if (district.events.starving >= 10){
      if (district.class == "Commoners") {
        commoner.popularity -= 10;
        commonerFactors.values.starve -= 10;
      } else if (district.class == "Nobles") {
        nobility.popularity -= 10;
        nobilityFactors.values.starve -= 10;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 10;
        criminalFactors.values.starve -= 10;
      }
    }

    // Walled off district
    if (district.antiPlague.wallOff ==0) {
      if (district.class == "Commoners") {
        commoner.popularity -= 30;
        commonerFactors.values.wallOff -= 30;
      } else if (district.class == "Nobles") {
        nobility.popularity -= 30;
        nobilityFactors.values.wallOff -= 30;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 30;
        criminalFactors.values.wallOff -= 30;
      }
    }

    // Rationing
    if (district.antiPlague.rationing ==1) {
      if (district.class == "Commoners") {
        commoner.popularity -= 5;
        commonerFactors.values.ration -= 5;
      } else if (district.class == "Nobles") {
        nobility.popularity -= 5;
        nobilityFactors.values.ration -= 5;
      } else if (district.class == "Criminals") {
        criminal.popularity -= 5;
        criminalFactors.values.ration -= 5;
      }
    }
  }
  let factionFactors = [commonerFactors, nobilityFactors, criminalFactors]; // Array of the above

  // For each factionFactor object, add object of message values and add messages to faction
  // object as needed
  for (let i = 0; i < factionFactors.length; i++) {
    let obj = factionFactors[i];
    let faction = obj.name;
    obj.messages = {
      "infection": "Infections: " + obj.values.infection,
      "curfew": "Curfews: " + obj.values.curfew,
      "lockdown": "Lockdowns: " + obj.values.lockdown,
      "ratHunt": "Rat Hunting: " + obj.values.ratHunt,
      "elixir": "Elixir Distribution: " + obj.values.elixir,
      "mask": "Mask Distribution: " + obj.values.mask,
      "starve": "People are starving: " + obj.values.starve,
      "wallOff": "Districts left to die: "+obj.values.wallOff,
      "ration": "Rationing: "+obj.values.ration
    };

    Object.entries(obj.messages).forEach(entry => {
      let [k, v] = entry;
      if (obj.values[k] != 0) {
        if (faction == "commoner") {
          commoner.summary += "<br> " + v + "% ";
        } else if (faction == "nobility") {
          nobility.summary += "<br> " + v + "% ";
        } else {
          criminal.summary += "<br> " + v + "% ";
        }
      }
    });
  }

  State.variables.factions[retrieveFaction("Commoner", "id")] = commoner;
  State.variables.factions[retrieveFaction("Nobility", "id")] = nobility;
  State.variables.factions[retrieveFaction("Criminal", "id")] = criminal;
}

// GENERAL OTHER UPDATES =======================================================

/**
 * Update Death Modifier: Updates the death modifier for each district based on current population.
 * Called In: setup.update()
 */
setup.deathModUpdate = function() {
  let districts = State.variables.d;
  
  for (let i = 0; i < districts.length; i++) {
    let district = State.variables.d[i];
    let percentage = district.population /district.initPop;

    if (percentage > 0.5) {
      State.variables.d[i].production.deathMod = Math.ceil(percentage * 20) * 0.05;
    } else if (percentage > 0.1) {
      State.variables.d[i].production.deathMod = Math.ceil(percentage * 20) * 0.5/9 - 0.5/9
    } else {
      State.variables.d[i].production.deathMod = 0;
    }
  }
}

/**
 * Check If DDR Collapsed: Checks if Draper's Ward, the Distillery District, or Rudshore has collapsed. If it
 * has collapsed, adjusts district info accordingly.
 * Called In: setup.update()
 */
setup.collapse = function() {
  let DDR = [
    retrieveDistrict("Draper's Ward", "object"),
    retrieveDistrict("Distillery District", "object"),
    retrieveDistrict("Rudshore Financial District", "object")
  ];

  for (let i = 0; i < DDR.length; i++) {
    let d = DDR[i];
    if (d.population / d.initPop < 0.25 && d.class != "Criminals" && d.antiPlague.wallOff>0) {
      State.variables.dialog += d.name + " has collapsed into criminality.";
      State.variables.d[retrieveDistrict(d.name, "id")].class = "Criminals";
    }
  }
}

// CORE UPDATE FUNCTION ========================================================

/**
 * Update: When the "Next Turn" button is clicked, calls all of the other update functions.
 * Called In: PassageFooter, the Next Turn link/button.
 */
setup.update = function() {
  State.variables.dialog = "";
  setup.changeTurn();
  // Update plague info
  setup.ratUpdate();
  setup.infectionUpdate();
  setup.resourceUpdate(); // Update resource info
  setup.deathModUpdate(); // Update death modifier info
  setup.collapse(); // Check if any of the DDR districts have collapsed
  if (State.variables.lawWIP.name!="None"){
    State.variables.vote+=setup.newVote(); // Update votes
  }
  setup.updateLaw();

  //State.variables.mf = State.variables.mf + (20 + lawVotedValue(setup.retrieveLaw("Drafting", "id")) * 20); // Update military force
  setup.popularityUpdate();
  setup.MFupdate();

  if (State.variables.dialog!=""){
    Dialog.append(State.variables.dialog);
    Dialog.open();
  }
}

// UI =====================================================================

setup.highlightMap = function() {
  // Apply maphilight to all images that have a usemap attribute, e.g.
  // all the maps that are in this twine. This sets the default styling
  // for all the maps. These are all the possible styling options.
  // Note: for picking colors, check out http://hslpicker.com/. You can
  // copy the HEX value as long as you leave off the "#".
  $("img[usemap]").maphilight({
    fill: true,             	// Fill the area?
    fillColor: 'caa81a',    	// HEX format without the starting "#"
    fillOpacity: 0.5,       	// Opacity of the filled area
    stroke: true,           	// Outline the area?
    strokeColor: 'b99500',
    strokeOpacity: 1,
    strokeWidth: 3,			// Outline width
    fade: true,             	// Animate when hovered with a fade?
    alwaysOn: false,        	// Always show the areas?
    neverOn: false,
    groupBy: false,
    wrapClass: true,
    shadow: false,
    shadowX: 0,
    shadowY: 0,
    shadowRadius: 6,
    shadowColor: '000000',
    shadowOpacity: 0.8,
    shadowPosition: 'outside',
    shadowFrom: false
  });
}

// Create the Right UI Bar
var $rightUiBar = $('<div id="right-ui-bar" class="stowed"></div>').insertAfter("#ui-overlay");

var rightTray = $rightUiBar.append('<div id="right-ui-bar-tray"><button id="right-ui-bar-toggle" tabindex="0" title="Toggle the Right UI bar" aria-label="Toggle the Right UI bar" type="button"></button></div>');

var rightBody = $rightUiBar.append('<div id="right-ui-bar-body"></div>');
$rightUiBar.find('#right-ui-bar-toggle').ariaClick({label : "Toggle the Right UI bar"}, () => $rightUiBar.toggleClass('stowed'));
postrender["Display Right Sidebar Contents"] = function (content, taskName) {
    setPageElement('right-ui-bar-body', 'StoryRightSidebar');
};

// Create the trade routes UI Bar.
var $tradeUiBar = $('<div id="trade-ui-bar" class="stowed"></div>').insertAfter("#right-ui-bar");

var tradeTray = $tradeUiBar.append('<div id="trade-ui-bar-tray"><button id="trade-ui-bar-toggle" tabindex="0" title="Toggle the Trade UI bar" aria-label="Toggle the Trade UI bar" type="button"></button></div>');

var tradeBody = $tradeUiBar.append('<div id="trade-ui-bar-body"></div>');
$tradeUiBar.find('#trade-ui-bar-toggle').ariaClick({label : "Toggle the Trade UI bar"}, () => $tradeUiBar.toggleClass('stowed'));
postrender["Display Trade Sidebar Contents"] = function (content, taskName) {
    setPageElement('trade-ui-bar-body', 'StoryTradeSidebar');
};

/**
 * Toggle right UI: manages the opening, closing and updating of the Right UI Bar when clicking the districts on the map
 * @param {int} current Index of the clicked district
 */
window.toggleRightUi = function(current) {
  let bar = id("right-ui-bar");
  let last = State.variables.district;

  if (bar.classList.contains("stowed")) {
    bar.classList.remove("stowed");
    State.variables.district = current;
  }
  else {
    if (last == current)
      bar.classList.add("stowed");
    else
      State.variables.district = current;
  }
}

/**
 * Stow right UI: stows the right UI bar
 */
window.stowRightUi=function() {
  let bar = id("right-ui-bar");
  if (!bar.classList.contains('stowed')){
    bar.classList.add('stowed');
  }
}

/**
 * Stows the trade UI bar
 */
window.stowTradeUi = function() {
  let bar = id("trade-ui-bar");
  bar.classList.add('stowed');
}

/**
 * Toggles the trade UI bar
 */
window.toggleTradeUI = function() {
  let bar = id('trade-ui-bar');
    if (bar.classList.contains('stowed')){
      bar.classList.remove('stowed');
    }
    else{
      bar.classList.add('stowed');
  }
}

/**
 * Makes the Lockdown and Curfew buttons appear and disappear depending on MFs and if Understaffing is voted or not
 */
window.toggleMFDisplay = function() {
  let district = State.variables.district;
  let lockdown = State.variables.d[district].antiPlague.lockdown;        
  let distMF = State.variables.d[district].stock.mf;
  let MFcurfew=-1;
  let MFld=-1;

  if (setup.retrieveLaw("Understaffing","object").isVoted==1){
    MFcurfew=2;
    MFld=4;
  }
  else{
    MFcurfew=3;
    MFld=5;
  }
  
  // Not enough MFs
  if (distMF < MFld && lockdown == 2) {
    State.variables.d[district].antiPlague.lockdown = 1;
    lockdown=1;
  } 

  if (distMF < MFcurfew && lockdown == 1) {
    State.variables.d[district].antiPlague.lockdown = 0;
    lockdown=0;
  }
  
  if (lockdown == 0) {
    id("LD").classList.add("hidden");
    id("StopCurfew").classList.add("hidden");
    if (distMF >= MFld) {
      id("NoWatchCurfew").classList.add("hidden");
      id("OrdCurfew").classList.remove("hidden");
      id("NoWatchLockdown").classList.add("hidden");
      id("OrdLockdown").classList.remove("hidden");
    } else if (distMF >= MFcurfew) {
      id("NoWatchCurfew").classList.add("hidden");
      id("OrdCurfew").classList.remove("hidden");
      id("NoWatchLockdown").classList.remove("hidden");
      id("OrdLockdown").classList.add("hidden");
    } else {
      id("NoWatchCurfew").classList.remove("hidden");
      id("OrdCurfew").classList.add("hidden");
      id("NoWatchLockdown").classList.remove("hidden");
      id("OrdLockdown").classList.add("hidden");
    }
  } else if (lockdown == 1){
    id("LD").classList.add("hidden");
    id("NoWatchCurfew").classList.add("hidden");
    id("OrdCurfew").classList.add("hidden");
    id("StopCurfew").classList.remove("hidden");
    if (distMF >= MFld){
      id("NoWatchLockdown").classList.add("hidden");
      id("OrdLockdown").classList.remove("hidden");
    }
    else {
      id("NoWatchLockdown").classList.remove("hidden");
      id("OrdLockdown").classList.add("hidden");
    }
  } else {
    id("LD").classList.remove("hidden");
    id("NoWatchCurfew").classList.add("hidden");
    id("OrdCurfew").classList.add("hidden");
    id("StopCurfew").classList.add("hidden");
    id("NoWatchLockdown").classList.add("hidden");
    id("OrdLockdown").classList.add("hidden");
  }

  State.variables._maxMF = distMF + State.variables.mf;
}

// EXTERNAL HELPER CODE ========================================================

/**
 * Map Highlight Function
 */
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):b(a.jQuery)}(window,function(a){var b,c,d,e,f,g,h,i,j,k,l;if(c=!!document.createElement("canvas").getContext,b=function(){var a=document.createElement("div");a.innerHTML='<v:shape id="vml_flag1" adj="1" />';var b=a.firstChild;return b.style.behavior="url(#default#VML)",!b||"object"==typeof b.adj}(),!c&&!b)return void(a.fn.maphilight=function(){return this});if(c){i=function(a){return Math.max(0,Math.min(parseInt(a,16),255))},j=function(a,b){return"rgba("+i(a.substr(0,2))+","+i(a.substr(2,2))+","+i(a.substr(4,2))+","+b+")"},d=function(b){var c=a('<canvas style="width:'+a(b).width()+"px;height:"+a(b).height()+'px;"></canvas>').get(0);return c.getContext("2d").clearRect(0,0,a(b).width(),a(b).height()),c};var m=function(a,b,c,d,e){if(d=d||0,e=e||0,a.beginPath(),"rect"==b)a.rect(c[0]+d,c[1]+e,c[2]-c[0],c[3]-c[1]);else if("poly"==b){a.moveTo(c[0]+d,c[1]+e);for(var f=2;f<c.length;f+=2)a.lineTo(c[f]+d,c[f+1]+e)}else"circ"==b&&a.arc(c[0]+d,c[1]+e,c[2],0,2*Math.PI,!1);a.closePath()};e=function(b,c,d,e,f){var h=b.getContext("2d");if(e.shadow){h.save(),"inside"==e.shadowPosition&&(m(h,c,d),h.clip());var i=100*b.width,k=100*b.height;m(h,c,d,i,k),h.shadowOffsetX=e.shadowX-i,h.shadowOffsetY=e.shadowY-k,h.shadowBlur=e.shadowRadius,h.shadowColor=j(e.shadowColor,e.shadowOpacity);var l=e.shadowFrom;l||(l="outside"==e.shadowPosition?"fill":"stroke"),"stroke"==l?(h.strokeStyle="rgba(0,0,0,1)",h.stroke()):"fill"==l&&(h.fillStyle="rgba(0,0,0,1)",h.fill()),h.restore(),"outside"==e.shadowPosition&&(h.save(),m(h,c,d),h.globalCompositeOperation="destination-out",h.fillStyle="rgba(0,0,0,1);",h.fill(),h.restore())}h.save(),m(h,c,d),e.fill&&(h.fillStyle=j(e.fillColor,e.fillOpacity),h.fill()),e.stroke&&(h.strokeStyle=j(e.strokeColor,e.strokeOpacity),h.lineWidth=e.strokeWidth,h.stroke()),h.restore(),e.fade&&a(b).css("opacity",0).animate({opacity:1},100)},f=function(a){a.getContext("2d").clearRect(0,0,a.width,a.height)}}else d=function(b){return a('<var style="zoom:1;overflow:hidden;display:block;width:'+b.width+"px;height:"+b.height+'px;"></var>').get(0)},e=function(b,c,d,e,f){var g,h,i,j;for(var k in d)d[k]=parseInt(d[k],10);g='<v:fill color="#'+e.fillColor+'" opacity="'+(e.fill?e.fillOpacity:0)+'" />',h=e.stroke?'strokeweight="'+e.strokeWidth+'" stroked="t" strokecolor="#'+e.strokeColor+'"':'stroked="f"',i='<v:stroke opacity="'+e.strokeOpacity+'"/>',"rect"==c?j=a('<v:rect name="'+f+'" filled="t" '+h+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+d[0]+"px;top:"+d[1]+"px;width:"+(d[2]-d[0])+"px;height:"+(d[3]-d[1])+'px;"></v:rect>'):"poly"==c?j=a('<v:shape name="'+f+'" filled="t" '+h+' coordorigin="0,0" coordsize="'+b.width+","+b.height+'" path="m '+d[0]+","+d[1]+" l "+d.join(",")+' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:'+b.width+"px;height:"+b.height+'px;"></v:shape>'):"circ"==c&&(j=a('<v:oval name="'+f+'" filled="t" '+h+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+(d[0]-d[2])+"px;top:"+(d[1]-d[2])+"px;width:"+2*d[2]+"px;height:"+2*d[2]+'px;"></v:oval>')),j.get(0).innerHTML=g+i,a(b).append(j)},f=function(b){var c=a("<div>"+b.innerHTML+"</div>");c.children("[name=highlighted]").remove(),b.innerHTML=c.html()};g=function(a){var b,c=a.getAttribute("coords").split(",");for(b=0;b<c.length;b++)c[b]=parseFloat(c[b]);return[a.getAttribute("shape").toLowerCase().substr(0,4),c]},l=function(b,c){var d=a(b);return a.extend({},c,!!a.metadata&&d.metadata(),d.data("maphilight"))},k=function(a){return!!a.complete&&("undefined"==typeof a.naturalWidth||0!==a.naturalWidth)},h={position:"absolute",left:0,top:0,padding:0,border:0};var n=!1;a.fn.maphilight=function(i){return i=a.extend({},a.fn.maphilight.defaults,i),c||n||(a(window).ready(function(){document.namespaces.add("v","urn:schemas-microsoft-com:vml");var b=document.createStyleSheet(),c=["shape","rect","oval","circ","fill","stroke","imagedata","group","textbox"];a.each(c,function(){b.addRule("v\\:"+this,"behavior: url(#default#VML); antialias:true")})}),n=!0),this.each(function(){var j,m,n,o,p,q,s;if(j=a(this),!k(this))return window.setTimeout(function(){j.maphilight(i)},200);if(n=a.extend({},i,!!a.metadata&&j.metadata(),j.data("maphilight")),s=j.get(0).getAttribute("usemap"),s&&(o=a('map[name="'+s.substr(1)+'"]'),j.is('img,input[type="image"]')&&s&&o.length>0)){if(j.hasClass("maphilighted")){var t=j.parent();j.insertBefore(t),t.remove(),a(o).unbind(".maphilight")}m=a("<div></div>").css({display:"block",backgroundImage:'url("'+this.src+'")',backgroundSize:"contain",position:"relative",padding:0,width:this.width,height:this.height}),n.wrapClass&&(n.wrapClass===!0?m.addClass(a(this).attr("class")):m.addClass(n.wrapClass)),j.before(m).css("opacity",0).css(h).remove(),b&&j.css("filter","Alpha(opacity=0)"),m.append(j),p=d(this),a(p).css(h),p.height=this.height,p.width=this.width,a(o).bind("alwaysOn.maphilight",function(){q&&f(q),c||a(p).empty(),a(o).find("area[coords]").each(function(){var b,f;f=l(this,n),f.alwaysOn&&(!q&&c&&(q=d(j[0]),a(q).css(h),q.width=j[0].width,q.height=j[0].height,j.before(q)),f.fade=f.alwaysOnFade,b=g(this),c?e(q,b[0],b[1],f,""):e(p,b[0],b[1],f,""))})}).trigger("alwaysOn.maphilight").bind("mouseover.maphilight, focus.maphilight",function(b){var d,f,h=b.target;if(f=l(h,n),!f.neverOn&&!f.alwaysOn){if(d=g(h),e(p,d[0],d[1],f,"highlighted"),f.groupBy){var i;i=/^[a-zA-Z][\-a-zA-Z]+$/.test(f.groupBy)?o.find("area["+f.groupBy+'="'+a(h).attr(f.groupBy)+'"]'):o.find(f.groupBy);var j=h;i.each(function(){if(this!=j){var a=l(this,n);if(!a.neverOn&&!a.alwaysOn){var b=g(this);e(p,b[0],b[1],a,"highlighted")}}})}c||a(p).append("<v:rect></v:rect>")}}).bind("mouseout.maphilight, blur.maphilight",function(a){f(p)}),j.before(p),j.addClass("maphilighted")}})},a.fn.maphilight.defaults={fill:!0,fillColor:"000000",fillOpacity:.2,stroke:!0,strokeColor:"ff0000",strokeOpacity:1,strokeWidth:1,fade:!0,alwaysOn:!1,neverOn:!1,groupBy:!1,wrapClass:!0,shadow:!1,shadowX:0,shadowY:0,shadowRadius:6,shadowColor:"000000",shadowOpacity:.8,shadowPosition:"outside",shadowFrom:!1}});

/**
 * Numberpool Macro Set
 */
!function(){"use strict";if("undefined"==typeof version||void 0===version.title||"SugarCube"!==version.title||void 0===version.major||version.major<2||void 0===version.minor||version.minor<22)throw new Error("<<numberpool>> macro set requires SugarCube 2.22.0 or greater, aborting load");Macro.add("numberinput",{handler:function(){function validateAndApply(el,addend){var curValue=Math.trunc(State.getVar(varName)),newValue=Math.trunc(el.value),newPoolValue=null;if(Number.isNaN(newValue)||!Number.isFinite(newValue))return el.value=curValue,!1;if(null!=addend&&(newValue+=addend),newValue<minValue?newValue=minValue:newValue>maxValue&&(newValue=maxValue),null!==pool){var poolValue=pool.get(),delta=(newValue-curValue)*poolCost;delta<0?newPoolValue=poolValue-delta:delta>0&&poolValue>=poolCost?(poolValue<delta&&(newValue=curValue+Math.trunc(poolValue/poolCost),delta=poolValue-poolValue%poolCost),newPoolValue=poolValue-delta):newValue=curValue}return State.setVar(varName,newValue),el.value=newValue,null!==newPoolValue&&pool.set(newPoolValue),!0}var _this=this;if(this.args.length<4){var errors=[];return this.args.length<1&&errors.push("variable name"),this.args.length<2&&errors.push("default value"),this.args.length<3&&errors.push("min value"),this.args.length<4&&errors.push("max value"),this.error("no "+errors.join(" or ")+" specified")}if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var varId=Util.slugify(varName),defValue=Number(this.args[1]),minValue=Number(this.args[2]),maxValue=Number(this.args[3]),poolCost=1,autofocus=!1;if(this.args.length>5?(poolCost=Number(this.args[4]),autofocus="autofocus"===this.args[5]):this.args.length>4&&("autofocus"===this.args[4]?autofocus=!0:poolCost=Number(this.args[4])),Number.isNaN(defValue)||!Number.isFinite(defValue)||Math.trunc(defValue)!==defValue)return this.error("default value ("+this.args[1]+") is not a whole number");if(Number.isNaN(minValue)||!Number.isFinite(minValue)||Math.trunc(minValue)!==minValue)return this.error("min value ("+this.args[2]+") is not a whole number");if(Number.isNaN(maxValue)||!Number.isFinite(maxValue)||Math.trunc(maxValue)!==maxValue)return this.error("max value ("+this.args[3]+") is not a whole number");if(Number.isNaN(poolCost)||!Number.isFinite(poolCost)||Math.trunc(poolCost)!==poolCost||poolCost<=0)return this.error("pool cost ("+this.args[4]+") is not a whole number greater than zero");if(defValue<minValue)return this.error("default value ("+this.args[1]+") is less than min value ("+this.args[2]+")");if(defValue>maxValue)return this.error("default value ("+this.args[1]+") is greater than max value ("+this.args[3]+")");var pool=function(){var parent=_this.contextSelect(function(ctx){return"numberpool"===ctx.name});return null!==parent&&parent.hasOwnProperty("pool")?parent.pool:null}();Config.debug&&this.debugView.modes({block:!0});var $elControl=jQuery(document.createElement("div")),$elInput=jQuery(document.createElement("input"));$elControl.attr("id",this.name+"-body-"+varId).addClass("macro-"+this.name).appendTo(this.output),jQuery(document.createElement("button")).attr({id:this.name+"-minus-"+varId}).text("").ariaClick(this.createShadowWrapper(function(){return validateAndApply($elInput.get(0),-1)})).appendTo($elControl),$elInput.attr({id:this.name+"-input-"+varId,name:this.name+"-input-"+varId,type:"text",pattern:"\\d+",tabindex:0}).on("change",this.createShadowWrapper(function(){validateAndApply(this)})).on("keypress",function(ev){13===ev.which&&(ev.preventDefault(),$elInput.trigger("change"))}).appendTo($elControl),jQuery(document.createElement("button")).attr({id:this.name+"-plus-"+varId}).text("").ariaClick(this.createShadowWrapper(function(){return validateAndApply($elInput.get(0),1)})).appendTo($elControl),$elInput.val(defValue),validateAndApply($elInput.get(0)),autofocus&&($elInput.attr("autofocus","autofocus"),jQuery(document).one(":passagedisplay",function(){return setTimeout(function(){return $elInput.focus()},Engine.minDomActionDelay)}))}}),Macro.add("numberpool",{tags:["onchange"],handler:function(){if(0===this.args.length)return this.error("no variable name specified");if(this.payload.length>2)return this.error("multiple <<onchange>> sections specified");if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var curValue=State.getVar(varName);if("number"!=typeof curValue||Number.isNaN(curValue)||!Number.isFinite(curValue))return this.error("pool value is not a number");var varId=Util.slugify(varName);TempState.hasOwnProperty(this.name)||(TempState[this.name]={}),TempState[this.name].hasOwnProperty(varId)||(TempState[this.name][varId]=0),Object.defineProperty(this,"pool",{value:Object.defineProperties({},{get:{value:function(){return State.getVar(varName)}},set:{value:function(content){return function(value){value!==State.getVar(varName)&&(State.setVar(varName,value),content&&new Wikifier(null,content))}}(this.payload.length>1?this.payload[1].contents.trim():"")}})}),jQuery(document.createElement("div")).attr("id",this.name+"-"+varId+"-"+TempState[this.name][varId]++).addClass("macro-"+this.name).wiki(this.payload[0].contents.replace(/^\n/,"")).appendTo(this.output)}}),Macro.add("numberslider",{handler:function(){function stepValidate(value){if(fracDigits>0){var ma=Number(minValue+"e"+fracDigits),sa=Number(stepValue+"e"+fracDigits),_va=Number(value+"e"+fracDigits)-ma;return Number(_va-_va%sa+ma+"e-"+fracDigits)}var va=value-minValue;return va-va%stepValue+minValue}function validateAndApply(el){var curValue=State.getVar(varName),newValue=Number(el.value),newPoolValue=null;if(Number.isNaN(newValue)||!Number.isFinite(newValue))return el.value=curValue,!1;if(newValue=stepValidate(newValue),newValue<minValue?newValue=minValue:newValue>maxValue&&(newValue=maxValue),null!==pool)if(fracDigits>0){var pa=Number(pool.get()+"e"+fracDigits),ca=Number(curValue+"e"+fracDigits),na=Number(newValue+"e"+fracDigits),delta=na-ca;pa<delta&&(na-=delta-pa,delta=na-ca,newValue=Number(na+"e-"+fracDigits)),newPoolValue=Number(pa-delta+"e-"+fracDigits)}else{var poolValue=pool.get(),_delta=newValue-curValue;poolValue<_delta&&(newValue-=_delta-poolValue,_delta=newValue-curValue),newPoolValue=poolValue-_delta}return State.setVar(varName,newValue),el.value=newValue,null!==newPoolValue&&pool.set(newPoolValue),!0}var _this2=this;if(this.args.length<5){var errors=[];return this.args.length<1&&errors.push("variable name"),this.args.length<2&&errors.push("default value"),this.args.length<3&&errors.push("min value"),this.args.length<4&&errors.push("max value"),this.args.length<5&&errors.push("step value"),this.error("no "+errors.join(" or ")+" specified")}if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var varId=Util.slugify(varName),defValue=Number(this.args[1]),minValue=Number(this.args[2]),maxValue=Number(this.args[3]),stepValue=Number(this.args[4]),autofocus=this.args.length>5&&"autofocus"===this.args[5];if(Number.isNaN(defValue)||!Number.isFinite(defValue))return this.error("default value ("+this.args[1]+") is not a number");if(Number.isNaN(minValue)||!Number.isFinite(minValue))return this.error("min value ("+this.args[2]+") is not a number");if(Number.isNaN(maxValue)||!Number.isFinite(maxValue))return this.error("max value ("+this.args[3]+") is not a number");if(Number.isNaN(stepValue)||!Number.isFinite(stepValue)||stepValue<=0)return this.error("step value ("+this.args[4]+") is not a number greater than zero");if(defValue<minValue)return this.error("default value ("+this.args[1]+") is less than min value ("+this.args[2]+")");if(defValue>maxValue)return this.error("default value ("+this.args[1]+") is greater than max value ("+this.args[3]+")");var fracDigits=function(){var str=String(stepValue),pos=str.lastIndexOf(".");return-1===pos?0:str.length-pos-1}();if(stepValidate(maxValue)!==maxValue)return this.error("max value ("+this.args[3]+") is not a multiple of the step value ("+this.args[4]+") plus the min value ("+this.args[2]+")");var pool=function(){var parent=_this2.contextSelect(function(ctx){return"numberpool"===ctx.name});return null!==parent&&parent.hasOwnProperty("pool")?parent.pool:null}();Config.debug&&this.debugView.modes({block:!0});var $elControl=jQuery(document.createElement("div")),$elInput=jQuery(document.createElement("input")),$elValue=void 0,showValue=void 0;$elControl.attr("id",this.name+"-body-"+varId).addClass("macro-"+this.name).appendTo(this.output),$elInput.attr({id:this.name+"-input-"+varId,name:this.name+"-input-"+varId,type:"range",min:minValue,max:maxValue,step:stepValue,tabindex:0}).on("change input."+Util.slugify(this.name),this.createShadowWrapper(function(){validateAndApply(this),"function"==typeof showValue&&showValue()})).on("keypress",function(ev){13===ev.which&&(ev.preventDefault(),$elInput.trigger("change"))}).appendTo($elControl),!Browser.isIE||Browser.ieVersion>9?($elValue=jQuery(document.createElement("span")).attr("id",this.name+"-value-"+varId).appendTo($elControl),showValue=function(){$elValue.text(Number($elInput.val()).toFixed(fracDigits))}):$elInput.off("input."+Util.slugify(this.name)),$elInput.val(defValue),validateAndApply($elInput.get(0)),"function"==typeof showValue&&showValue(),autofocus&&($elInput.attr("autofocus","autofocus"),jQuery(document).one(":passagedisplay",function(){return setTimeout(function(){return $elInput.focus()},Engine.minDomActionDelay)}))}})}();

// INTERNAL HELPER FUNCTIONS ===================================================

/**
 * Returns the element that has the ID attribute with the specified value.
 * @param {HTMLElement} id ID of HTML element to select.
 * @returns DOM object associated with ID.
 */
function id(id) {
  return document.getElementById(id);
}

/**
 * Returns first element matching selector.
 * @param {string} selector - CSS query selector.
 * @returns {object} - DOM object associated selector.
 */
function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Returns an array of elements matching the given query.
 * @param {string} selector - CSS query selector.
 * @returns {array} - Array of DOM objects matching the given query.
 */
function qsa(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Returns a newly generated HTML element.
 * @param {string} tagName - Name of an HTML element.
 * @return {HTMLElement} DOM object associated with the defined element.
 */
function gen(tagName) {
  return document.createElement(tagName);
}

/**
 * Takes an array and shuffles the order of its contents.
 * @param {array} arr Array to shuffle
 * @returns The new shuffled array
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns a district object or a district's id by name.
 * @param {string} districtName Name of district to return.
 * @param {string} returnType Object or id.
 * @returns Global district object or id of the requested district. Returns null if invalid parameters given.
 */
function retrieveDistrict(districtName, returnType) {
  for (let i = 0; i < districts.length; i++) {
    if (State.variables.d[i].name == districtName) {
      if (returnType == "object") {
        return State.variables.d[i];
      } else if (returnType == "id") {
        return i;
      } else {
        console.log("retrieveDistrict(): Not a valid returnType variable. You can choose between 'object' or 'id'.");
      }
    }
  }
  return null;
}

/**
 * Returns a law object or a law's id by name.
 * @param {string} lawName Name of law to return.
 * @param {string} returnType Object or id.
 * @returns Global district object or id of the requested law. Returns null if invalid parameters given.
 */
setup.retrieveLaw=function (lawName, returnType) {
  for (let i = 0; i < laws.length; i++) {
    if (State.variables.laws[i].name == lawName) {
      if (returnType == "object") {
        return State.variables.laws[i];
      } else if (returnType == "id") {
        return i;
      } else {
        console.log("setup.retrieveLaw(): Not a valid returnType variable. You can choose between 'object' or 'id'.");
      }
    }
  }
  return null;
}

/**
 * Returns an infrastructure object or its id by name.
 * @param {string} infraName Name of infrastructure to return.
 * @param {string} returnType Object or id.
 * @returns Global district object or id of the requested law. Returns null if invalid parameters given.
 */
setup.retrieveInfra=function (infraName, returnType) {
  infra=State.variables.infrastructures;

  for (let i = 0; i < infra.length; i++) {
    if (infra[i].name == infraName) {
      if (returnType == "object") {
        return infra[i];
      } else if (returnType == "id") {
        return i;
      } else {
        console.log("setup.retrieveInfra(): Not a valid returnType variable. You can choose between 'object' or 'id'.");
      }
    }
  }
  return null;
}

/**
 * Returns an infrastructure object or its id by name.
 * @param {string} factionName Name of faction to return.
 * @param {string} returnType Object or id.
 * @returns Global faction object or id of the requested faction. Returns null if invalid parameters given.
 */
function retrieveFaction(factionName, returnType) {
  for (let i = 0; i < factions.length; i++) {
    if (State.variables.factions[i].name == factionName) {
      if (returnType == "object") {
        return State.variables.factions[i];
      } else if (returnType == "id") {
        return i;
      } else {
        console.log("retrieveFaction(): Not a valid returnType variable. You can choose between 'object' or 'id'.");
      }
    }
  }
  return null;
}

/**
 * Get Value of isVoted: Translates the boolean value of isVoted on a law into 0 or 1.
 * @param {int} lawId Index of a law. 
 * @returns 0 if False (law not enacted), 1 if True (law has been enacted).
 */
function lawVotedValue(lawId) {
  let lawIsVoted = State.variables.laws[lawId].isVoted;
  if (lawIsVoted) {
    return 1;
  } else {
    return 0;
  }
}