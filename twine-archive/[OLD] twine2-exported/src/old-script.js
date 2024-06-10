// UI Bar 
UIBar.destroy();
UIBar.stow();

// BASIC FUNCTIONS -----------------------------------------

  /* sum function */
    setup.sum = function (arr) {
        var s = 0;
        for (var i = 0; i < arr.length; i++) {
            s += arr[i];
        }
        return s;
    }

  /* sum except one function */
    setup.sumExcept = function (arr, j) {
        var s = 0;
        for (var i = 0; i < arr.length; i++) {
          if (i!=j){
            s += arr[i];
          }
        }
        return s;
    }

  /* array sum function */
    setup.arraySum= function (A, B) {
      var res=[]
      for (var i = 0; i < A.length; i++) {
        res.push(A[i]+B[i])
      }
      return res;
    }


  /* array substract function */
    setup.arraySub= function (A, B) {
      var res=[]
      for (var i = 0; i < A.length; i++) {
        res.push(A[i]-B[i])
      }
      return res;
    }

  /* array multiply function */
    setup.arrayMult= function (A, B) {
      var res=[]
      for (var i = 0; i < A.length; i++) {
        res.push(A[i]*B[i])
      }
      return res;
    }

  /* shuffle array*/
    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    return(arr);
    }

// PLAGUE DYNAMICS -----------------------------------------

    /**
     * Rat plague starting point
     * Description: Generates a district number between 
     * Slaughterhouse, Distillery, Downmarket, & Old Port
     * @return {number} # that corresponds to a district
     */
    setup.ratInit= function () {
      let gen = Math.floor(Math.random() * 4 + 9);
      if (gen != 12) {
        return gen;
      } else {
        return 7;
      }
    }

  // Rat population
    setup.ratUpdate= function () {
      var current=[...State.variables.districtRat];
      var max=State.variables.districtPopInit
      var inter=0;
      var neighbor=State.variables.districtNeighbor;
      var wallOff=State.variables.wallOff;
      var hunt=State.variables.actualHunt;

      for (var i = 0; i < current.length; i++) {

        /*rat travel*/
        inter=0;    
        for (var j = 0; j < current.length; j++) {
          inter+=wallOff[j]*Math.floor(neighbor[i][j]*State.variables.districtRat[j]*0.0002);/*0.02% of rats move through each border*/
        }

        if (max[i]!=0){
          current[i]=Math.floor(current[i]+(1-current[i]/(max[i]*1.5))*(current[i]*(0.1)+inter));/* base reproduction rate is 10%*/
        }
        else{
            current[i]=0; /*just in case there's an empty district*/
        }

        current[i]=current[i]-Math.floor(hunt[i]*(10+current[i]/10));
        if (current[i]<0){
          current[i]=0;
        }

      }
      return current;
    }

  /**
   * Infection Rate
   * @returns {Array.number} Infection rate per district
   */
    setup.infRate= function () {
      // All Array variables
      let rate = [];
      let mask = State.variables.actualMaskD;
      let elDist = State.variables.actualElD;
      let lockdown = State.variables.lockdown;
      let hosp = State.variables.hospital;
      let quar = State.variables.quarantine;

      for (let i = 0; i < elDist.length; i++){
        rate[i] = 0.2 - elDist[i] * 0.02 - mask[i] * 0.03 - 
          lockdown[i] * 0.07 - hosp[i] * 0.03 - 
          quar[i] * 0.03;
        if (rate[i]<0){
          rate[i]=0;
        }
      }

      return rate;
    }

  /**
   * Rat Human Infection Rate
   * @returns {Array.number} Rat-human infection rate per
   * district
   */
    setup.ratInfRate= function () {
      let rate = [];
      let elDist = State.variables.actualElD;
      let lockdown = State.variables.lockdown;
      let sewer = State.variables.sewer;

      for (let i = 0; i < elDist.length; i++){
        rate[i] = 0.005 - elDist[i] * 0.002 - lockdown[i] * 
          0.002 - sewer[i] * 0.001;
        if (rate[i]<0){
          rate[i]=0;
        }
      }

      return rate;
    }

  /* infection */
    setup.infUpdate= function () {
      var current=[...State.variables.districtInf];
      var total=[];
      var rat=[...State.variables.districtRat];
      var update=0;
      var dead =0;
      var inter=0;
      var humanTrav=0.0002;
      var neighbor=State.variables.districtNeighbor;
      var infRate=setup.infRate();
      var ratHumInf=setup.ratInfRate();
      var lockdown=State.variables.lockdown;
      var wallOff=State.variables.wallOff;

      for (var i = 0; i < current.length; i++) {

        /*inter district contamination*/
        inter=0;
        for (var j = 0; j < current.length; j++) {
          if (lockdown[j]==0){
            inter+=wallOff[j]*Math.floor(neighbor[i][j]*State.variables.districtInf[j]*humanTrav);
          }
          else if (lockdown[j]==1){
            inter+=wallOff[j]*Math.floor(neighbor[i][j]*State.variables.districtInf[j]*humanTrav/2);
          }
        }
        if (lockdown[i]==1){
          inter=inter/2;    
        }
        else if(lockdown[i]==2){
          inter=0;
        }

        /*when people have started dying*/
        if (State.variables.turn>7){

            dead=State.variables.infHistory.shift();
          State.variables.deadThisTurn[i]=dead;
            State.variables.districtPop[i]-=dead; /*kill the dead*/
            total=State.variables.districtPop;
            current[i]=current[i]-dead; /*new total infected*/

            /*if the district isn't empty*/
            if (total[i]!=0){
                update=Math.floor( ((total[i]-current[i]) /total[i])*(rat[i]*ratHumInf[i] + (current[i]+inter)*(infRate[i])) ); /*new infected this turn*/

                /*if it's enough to contaminate the entire district*/
                if (update>total[i]-current[i]){
                    update=total[i]-current[i]; /*adjust the new number of infected*/
                    current[i]=total[i];/*the entire district is infected*/
                }
                else{
                    current[i]=current[i]+update;/*add the new infected*/
                }
                State.variables.infHistory.push(update);/*log the new infected so they can die later*/
            }
            /*if district empty*/
            else{
                State.variables.infHistory.push(0);
            }
        }

        /*before people die*/
        else{
            /*if not empty district*/
            if (total[i]!=0){

                total=State.variables.districtPop;

                update=Math.floor( (total[i]-current[i])/total[i]*(rat[i]*ratHumInf[i] + (current[i]+inter)*(infRate[i])) ); /*new infected*/
                current[i]=current[i]+update; /*add the infected*/

                State.variables.infHistory.push(update);/*log the infected*/

            }
          else{
            State.variables.infHistory.push(0);        
          }
        }
      }
      return current;
    }

// RESOURCE UPDATING

// MONEY

  // Money update
    setup.moneyUpdate=function(){
      var lockdown=State.variables.lockdown;
      var money=State.variables.money;
      var modif=State.variables.deathModif;
      //this turn's gains
      for (var i = 0; i < lockdown.length; i++) {
        if (lockdown[i]==2){
            money+=Math.floor(modif[i]*State.variables.districtMoney[i]/2);
        }
        else{
          money+=Math.floor(modif[i]*State.variables.districtMoney[i]);
        }
      }
      money-=setup.huntCost();
      money-=setup.maskCost();
      State.variables.money=money;
    }
	
	/*extract money produced*/
    setup.moneyProd=function(district){
      var lockdown=State.variables.lockdown;
      var total=0;
      var modif=State.variables.deathModif;
      //this turn's gains
      if (lockdown[district]==2){
            total+=Math.floor(modif[district]*State.variables.districtMoney[district]/2);
        }
        else{
          total+=Math.floor(modif[district]*State.variables.districtMoney[district]);
        }
      return(total);
    }


  /*rat hunt cost function*/
    setup.huntCost=function(){
      var money=State.variables.money;

      var spend=0;
      var revTable1=[];
      var revTable2=[];
      var revTable3=[];
      var keep=0;
      var pop=State.variables.districtPop;
      var hunt=[...State.variables.ratHunt];
      var actual=State.variables.actualHunt;
      var alert=""
      var name=State.variables.districtName;

      var huntCost=10;

      //make a reverse table of which districts need masks
      for (var i = 0; i < hunt.length; i++) {
        if (hunt[i]==1){
          revTable1.push(i);
        }
        else if (hunt[i]==2){
          revTable2.push(i);
        }
        else if (hunt[i]==3){
          revTable3.push(i);
        }
      }

      actual=[...hunt]

      revTable1=shuffleArray(revTable1);
      revTable2=shuffleArray(revTable2);
      revTable3=shuffleArray(revTable3);//randomize the reverse table
      spend=0;
      var i=0;
      var l=revTable1.length;
      //while there's still money to spend, start hunt
      while (spend+huntCost<=money && i<l){
        spend+=huntCost;
        revTable1.pop();
        i++;
      }
      var i=0;
      var l=revTable2.length;
      while (spend+huntCost+15<=money && i<l){
        spend+=huntCost+15;
        revTable2.pop();
        i++;
      }
      var i=0;
      var l=revTable3.length;
      while (spend+huntCost+25<=money && i<l){
        spend+=huntCost+25;
        revTable3.pop();
        i++;
      }

      //switch off the hunts for each district that wasn't served
      for (var i = 0; i < revTable1.length; i++) {
        actual[revTable1[i]]=0;
        alert+='<br>'+name[revTable1[i]]+'</br>'
      }
      for (var i = 0; i < revTable2.length; i++) {
        actual[revTable2[i]]=0;
        alert+='<br>'+name[revTable2[i]]+'</br>'
      }
      for (var i = 0; i < revTable3.length; i++) {
        actual[revTable3[i]]=0;
        alert+='<br>'+name[revTable3[i]]+'</br>'
      }

      //send a popup
      if (alert!=""){
        State.variables.dialog+=("The following districts didn't get rat suppression:"+alert);
      }
      State.variables.actualHunt=actual;
      return(spend);
    }

  /*mask cost fucntion*/
    setup.maskCost=function(){
      var money=State.variables.money;

      var spend=0;
      var revTable=[];
      var keep=0;
      var pop=State.variables.districtPop;
      var mask=[...State.variables.districtMaskDist];
      var actual=State.variables.actualMaskD;
      var alert=""
      var name=State.variables.districtName;

      var maskCost=[];
      for (var i = 0; i < mask.length; i++) {
        maskCost.push(Math.ceil(pop[i]/100000)+4); //mask spending depending on population
      }

      //make a reverse table of which districts need masks
      for (var i = 0; i < mask.length; i++) {
        if (mask[i]==1){
          revTable.push(i);
        }
      }

      actual=[...mask]

      revTable.sort(function(a, b){return pop[b] - pop[a]}); //order the reverse table by descending population
      spend=0;
      var i=0;
      var l=revTable.length;
      //while there's still money to spend, send masks
      while (spend+maskCost[i]<=money && i<l){
        spend+=maskCost[revTable.pop()];
        i++;
      }

      //switch off the mask distribution for each district that wasn't served
      for (var i = 0; i < revTable.length; i++) {
        actual[revTable[i]]=1-actual[revTable[i]];
        alert+='<br>'+name[revTable[i]]+'</br>'
      }

      //send a popup
      if (revTable.length!=0){
        State.variables.dialog+=("The following districts couldn't get masks distributed:"+alert);
      }
      State.variables.actualMaskD=actual;
      return(spend);
    }

/*ELIXIR*/

  /* elixir update */
    setup.elixirUpdate=function(){
      var lockdown=State.variables.lockdown;
      var elixir=State.variables.districtElixirStock;
      var trade=State.variables.elixirRoutes;
      var prod=State.variables.districtElixir;
      var cancel="";
      var modif=State.variables.deathModif;
      
      //check every trade route
      for (var i = 0; i < prod.length; i++){
        if (setup.sum(trade[i])>elixir[i]+prod[i]){
          trade[i]=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
          cancel+='<br>'+name[i]+'</br>';
        }
      }
      if (cancel!=""){
        State.variables.dialog+=("The following districts had their outgoing trade routes cancelled due to lack of stock:"+cancel);
      }

      
      //this turn's gains
      for (var i = 0; i < lockdown.length; i++) {
        if (lockdown[i]==2){
            elixir[i]+=Math.floor(modif[i]*prod[i]/2);
        }
        else{
          elixir[i]+=Math.floor(modif[i]*prod[i]);
        }
        for (var j = 0; j < elixir.length; j++){
          elixir[i]-=trade[i][j];
          elixir[i]+=trade[j][i];
        }
      }


      var elDist=State.variables.districtElDist;
      var pop=State.variables.districtPop;
      var alert="";
      var name=State.variables.districtName;

      var elCost=[];
      for (var i = 0; i < elixir.length; i++) {
        elCost.push(Math.ceil(elDist[i]*pop[i]/2000)); //elixir spending depending on population
      }

      var actualEl=State.variables.actualElD;
      actualEl=[...elDist];

      for (var i = 0; i < elixir.length; i++) {
        if (elixir[i]>=elCost[i]){ //if there's enough elixir
          elixir[i]-=elCost[i];//remove the spending
        }
        else{
          actualEl[i]=0;
          alert+='<br>'+name[i]+'</br>';
        }
      }

      for (var i = 0; i < actualEl.length; i++){
        State.variables.actualElD[i]=actualEl[i];
      }
      State.variables.districtElixirStock=elixir;

      if (alert!=""){
        State.variables.dialog+=("The following districts couldn't get elixir distributed:"+alert);
      }
    }

  /*extract elixir consumed*/
	setup.elCons=function(district){
      var pop=State.variables.districtPop;
      var dist=State.variables.districtElDist;
      return(Math.ceil(dist[district]*pop[district]/2000));
    }

  /*extract elixir produced*/
	setup.elProd=function(district){
      var lockdown=State.variables.lockdown;
      var prod=State.variables.districtElixir;
      var total=0;
      var modif=State.variables.deathModif;
        if (lockdown[district]==2){
          total+=Math.floor(modif[district]*prod[district]/2);
        }
        else{
          total+=Math.floor(modif[district]*prod[district]);
        }
      return(total);
    }

  /*extract elixir incoming trade*/
	setup.elImp=function(district){
      var trade=State.variables.elixirRoutes;
      var imp=0;
      for (var j = 0; j < trade.length; j++){
        imp+=trade[j][district];
      }
      return(imp);
    }

/*ENERGY*/

  /*energy update*/
    setup.energyUpdate=function(){
      var energy=State.variables.energy;
      var prod=State.variables.districtEnergy;
      var lockdown=State.variables.lockdown;
      var modif=State.variables.deathModif;
      
      for (var i = 0; i < prod.length; i++){
        if (lockdown[i]==2){
          energy+=Math.floor(modif[i]*prod[i]/2);
        }
        else{
          energy+=Math.floor(modif[i]*prod[i]);
        }
      }
      State.variables.energy=energy;
    }

  /*energy production extract*/
    setup.energyProd=function(district){
      var total=0;
      var prod=State.variables.districtEnergy;
      var lockdown=State.variables.lockdown;
      var modif=State.variables.deathModif;
      
      if (lockdown[district]==2){
          total+=Math.floor(modif[district]*prod[district]/2);
        }
        else{
          total+=Math.floor(modif[district]*prod[district]);
        }
      
      return(total);
    }

/*FOOD*/

  /*extract food outgoing trade*/
	setup.elExp=function(district){
      var trade=State.variables.elixirRoutes;
      var exp=0;
      for (var j = 0; j < trade.length; j++){
        exp+=trade[district][j];
      }
      return(exp);
    }

  /*food update*/
    setup.foodUpdate=function(){
      var stock=State.variables.districtFoodStock;
      var prod=State.variables.districtFood;
      var lockdown=State.variables.lockdown;
      var trade=State.variables.foodRoutes;
      var pop=State.variables.districtPop;
      var name=State.variables.districtName;
      var alert="";
      var isStarving=State.variables.isStarving;
      var cancel="";
      var modif=State.variables.deathModif;
      var newStarve=0;
      
      //check every trade route
      for (var i = 0; i < prod.length; i++){
        if (setup.sum(trade[i])>stock[i]+prod[i]){
          trade[i]=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
          cancel+='<br>'+name[i]+'</br>';
        }
      }
      if (cancel!=""){
        State.variables.dialog+=("The following districts had their outgoing trade routes cancelled due to lack of stock:"+cancel);
      }

      for (var i = 0; i < prod.length; i++){
        if (lockdown[i]==2){
          stock[i]+=Math.floor(modif[i]*prod[i]/2);
        }
        else{
          stock[i]+=Math.floor(modif[i]*prod[i]);
        }
        for (var j = 0; j < prod.length; j++){
          stock[i]-=trade[i][j];
          stock[i]+=trade[j][i];
        }
        
        if (stock[i]<Math.ceil(pop[i]/1000)){
          stock[i]=0;
          if (isStarving[i]!=1){
          alert+='<br>'+name[i]+'</br>';
            isStarving[i]=1;
            newStarve=1;
          }
        }
        else{
          stock[i]-=Math.ceil(pop[i]/1000);
          isStarving[i]=0;
        }
      }

      if (newStarve){
        State.variables.dialog+=("The following districts started starving:"+alert);
      }

      State.variables.districtFoodStock=stock;
      State.variables.isStarving=isStarving;
    }

  /*extract food consumed*/
	setup.foodCons=function(district){
      var pop=State.variables.districtPop;
      return(Math.ceil(pop[district]/1000));
    }

  /*extract food produced*/
	setup.foodProd=function(district){
      var lockdown=State.variables.lockdown;
      var prod=State.variables.districtFood;
      var modif=State.variables.deathModif;
      var total=0;
        if (lockdown[district]==2){
          total+=Math.floor(modif[district]*prod[district]/2);
        }
        else{
          total+=Math.floor(modif[district]*prod[district]);
        }
      return(total);
    }

  /*extract food incoming trade*/	
	setup.foodImp=function(district){
      var trade=State.variables.foodRoutes;
      var imp=0;
      for (var j = 0; j < trade.length; j++){
        imp+=trade[j][district];
      }
      return(imp);
    }

  /*extract food outgoing trade*/
	setup.foodExp=function(district){
      var trade=State.variables.foodRoutes;
      var exp=0;
      for (var j = 0; j < trade.length; j++){
        exp+=trade[district][j];
      }
      return(exp);
    }

  /*extract food outgoing trade*/
	setup.foodExp=function(district){
      var trade=State.variables.foodRoutes;
      var exp=0;
      for (var j = 0; j < trade.length; j++){
        exp+=trade[district][j];
      }
      return(exp);
    }

/*GENERAL UPDATES*/

  /*update prod modif*/
    setup.upDeathMod=function(){
      var pop=State.variables.districtPop;
      var popInit=State.variables.districtPopInit;
      
      for (var j = 0; j < pop.length; j++){
        if (pop[j]/popInit[j]>0.5){
          State.variables.deathModif[j]=Math.ceil(pop[j]/popInit[j]*20)*0.05;
        }
        else if (pop[j]/popInit[j]>0.1){
           State.variables.deathModif[j]=Math.ceil(pop[j]/popInit[j]*20)*0.5/9-0.5/9;
        }
        else
            State.variables.deathModif[j]=0;
      }
    }

  /*update popularity*/
    setup.upPopularity=function(){
      var com=50;
      var noble=50;
      var crime=50;
      var abbey=50;
      var watch=50;
      
      var watchPost=State.variables.watchPost;
      var districtInf=State.variables.districtInf;
      var districtPop=State.variables.districtPop;
      var popInit=State.variables.districtPopInit;
      var districtClass=State.variables.districtClass;
      var lockdown=State.variables.lockdown;
      var message=['','','','',''];
      var newDead=State.variables.deadThisTurn;
      var money=State.variables.money;
      var food=State.variables.districtFood;
      var isStarving=State.variables.isStarving;
      var isVoted=State.variables.isVoted;
      var distMF=State.variables.distMF;
      
      var totOutpost=0;
      
      var comInf=0;
      var nobInf=0;
      var criInf=0;
      
      var elDist=State.variables.actualElD;
      var maDist=State.variables.actualMaskD;
      var hunt=State.variables.actualHunt;
      
      var totComCurf=0;
      var totNobCurf=0;
      var totCriCurf=0;
      
      var totComLock=0;
      var totNobLock=0;
      var totCriLock=0;
      
      var totBury=0;
      
      var totComEl=0;
      var totNobEl=0;
      var totCriEl=0;
      
      var totComMa=0;
      var totNobMa=0;
      var totCriMa=0;
      
      var totComHu=0;
      var totNobHu=0;
      var totCriHu=0;
      
      var totComCol=0;
      var totNobCol=0;
      var totCriCol=0;
      
      var totfood=0;
      
      var totComStarv=0;
      var totNobStarv=0;
      var totCriStarv=0;
      
      var collapse=0;
      
      var plagueMF=0;
      
      var understaffing=0;
      
      for (var i=0; i<watchPost.length; i++){
        //watch outpost
        if(watchPost[i]==1){
	        watch+=5;
    	    crime-=5;
          totOutpost+=5;
        }
        
        //infection
        if (districtInf[i]/districtPop[i]>0.05){
          if (districtClass[i]=="Commoners"){
            com-=5;
            comInf+=5;
          }
          if (districtClass[i]=="Nobles"){
            noble-=5;
            nobInf+=5;
          }
          if (districtClass[i]=="Criminals"){
            crime-=5;
            criInf+=5;
          }
        }
          
          //curfew
        if (lockdown[i]==1){
          if (districtClass[i]=="Commoners"){
            com-=10;
            totComCurf+=10;
          }
          if (districtClass[i]=="Nobles"){
            noble-=10;
            totNobCurf+=10;
          }
          if (districtClass[i]=="Criminals"){
            crime-=10;
            totCriCurf+=10;
          }
        }
        
        //lockdown
        if (lockdown[i]==2){
          if (districtClass[i]=="Commoners"){
            com-=15;
            totComLock+=15;
          }
          if (districtClass[i]=="Nobles"){
            noble-=15;
            totNobLock+=15;
          }
          if (districtClass[i]=="Criminals"){
            crime-=15;
            totCriLock+=15;
          }
        }
        
        //dead per turn
        if (newDead[i]>=500){
          abbey-=15;
          totBury+=15;
        }
        
        //elixir distribution
        if (elDist[i]>=1){
          if (districtClass[i]=="Commoners"){
            com+=10;
            totComEl+=10;
          }
          if (districtClass[i]=="Nobles"){
            noble+=10;
            totNobEl+=10;
          }
          if (districtClass[i]=="Criminals"){
            crime+=10;
            totCriEl+=10;
          }
        }
          
        //mask distribution
        if (maDist[i]>=1){
          if (districtClass[i]=="Commoners"){
            com+=5;
            totComMa+=5;
          }
          if (districtClass[i]=="Nobles"){
            noble+=5;
            totNobMa+=5;
          }
          if (districtClass[i]=="Criminals"){
            crime+=5;
            totCriMa+=5;
          }
        }
        
        //rat hunting
        if (hunt[i]>=1){
          if (districtClass[i]=="Commoners"){
            com+=10;
            totComHu+=10;
          }
          if (districtClass[i]=="Nobles"){
            noble+=10;
            totNobHu+=10;
          }
          if (districtClass[i]=="Criminals"){
            crime+=10;
            totCriHu+=10;
          }
        }
                
        //food stock
        if (food[i]>=1000){
          if (districtClass[i]=="Commoners"){
            com+=10;
            totfood+=10;
          }
        }
        
        //starvation
        if (isStarving[i]>=1 && isStarving[i]<10){
          if (districtClass[i]=="Commoners"){
            com-=isStarving[i];
            totComStarv-=isStarving[i];
          }
          if (districtClass[i]=="Nobles"){
            noble-=isStarving[i];
            totNobStarv-=isStarving[i];
          }
          if (districtClass[i]=="Criminals"){
            crime-=isStarving[i];
            totCriStarv-=isStarving[i];
          }
        }
        else if (isStarving[i]>=10){
          if (districtClass[i]=="Commoners"){
            com-=10;
            totComStarv-=10;
          }
          if (districtClass[i]=="Nobles"){
            noble-=10;
            totNobStarv-=10;
          }
          if (districtClass[i]=="Criminals"){
            crime-=10;
            totCriStarv-=10;
          }
        }
        
        //collapse into criminality
        if (i==9 || i==0 || i==13){
          if (districtClass[i]=="Criminals"){
            watch-=15;
            collapse-=15;
          }
        }
        
        //MFs in plagued district
        if(distMF[i]>=10 && districtInf/districtPop>=0.1){
          watch-=5;
          plagueMF-=5;
        }
        
        //understaffing
        if(isVoted[1]==1 && ((distMF[i]<3 && lockdown[i]==1)||(distMF[i]<5 && lockdown[i]==2))){
          watch-=5;
          understaffing-=5;
        }
        
      }
      
      //laws
      if(isVoted[0]==1){
        abbey+=10;
        message[2]+='<br> Plague victims get last rites: +5%';
      }
      if(isVoted[2]==1){
        abbey+=10;
        message[2]+='<br> Funding for new chapels: +10%';
      }
      if(isVoted[3]==1){
        watch+=10;
        message[1]+='<br> Funding for the armory: +10%';
      }
      if(isVoted[4]==1){
        abbey+=10;
        message[2]+='<br> Warfare Overseers: +10%';
      }   
      if(isVoted[5]==1){
        abbey+=15;
        message[2]+='<br> Raids on heretics: +15%';
      }   
      if(isVoted[6]==1){
        com-=15;
        message[3]+='<br> Drafting: -15%';
      }           
      
      //money
      if (money>=500000){
      com-=15;
        message[3]+='<br> Full treasury: -15%';
      noble+=10;
        message[0]+='<br> Full treasury: +10%';
      }
      
      //message outposts
      if (totOutpost!=0){
        message[1]+='<br> Watch outposts: +'+totOutpost+'%';
        message[4]+='<br> Watch outposts: -'+totOutpost+'%';
      }
      
      //message infection
      if (comInf!=0){
          message[3]+='<br> Infection: -'+comInf+'%';
        }
      if (nobInf!=0){
          message[0]+='<br> Infection: -'+nobInf+'%';
        }
      if (criInf!=0){
          message[4]+='<br> Infection: -'+criInf+'%';
        }
      
      //message curfew
      if (totComCurf!=0){
          message[3]+='<br> Curfews: -'+totComCurf+'%';
        }
      if (totNobCurf!=0){
          message[0]+='<br> Curfews: -'+totNobCurf+'%';
        }
      if (totCriCurf!=0){
          message[4]+='<br> Curfews: -'+totCriCurf+'%';
        }
      
      //message lockdown
      if (totComLock!=0){
          message[3]+='<br> Lockdown: -'+totComLock+'%';
        }
      if (totNobLock!=0){
          message[0]+='<br> Lockdown: -'+totNobLock+'%';
        }
      if (totCriLock!=0){
          message[4]+='<br> Lockdown: -'+totCriLock+'%';
        }
      
      //message too many dead to bury
      if (totBury!=0){
        message[2]+='<br> Too many dead to bury: -'+totBury+'%';
      }
      
      //message elixir distribution
      if (totComEl!=0){
          message[3]+='<br> Elixir distribution: +'+totComEl+'%';
        }
      if (totNobEl!=0){
          message[0]+='<br> Elixir distribution: +'+totNobEl+'%';
        }
      if (totCriEl!=0){
          message[4]+='<br> Elixir distribution: +'+totCriEl+'%';
        } 
      
      //message mask distribution
      if (totComEl!=0){
          message[3]+='<br> Mask distribution: +'+totComMa+'%';
        }
      if (totNobEl!=0){
          message[0]+='<br> Mask distribution: +'+totNobMa+'%';
        }
      if (totCriEl!=0){
          message[4]+='<br> Mask distribution: +'+totCriMa+'%';
        } 
      
      //message rat hunt
      if (totComEl!=0){
          message[3]+='<br> Rat hunt: +'+totComHu+'%';
        }
      if (totNobEl!=0){
          message[0]+='<br> Rat hunt: +'+totNobHu+'%';
        }
      if (totCriEl!=0){
          message[4]+='<br> Rat hunt: +'+totCriHu+'%';
        } 
      
      //message food
      if (totfood!=0){
          message[3]+='<br> High food stocks: +'+totfood+'%';
        }
      
      //message starvation
      if (totComStarv!=0){
          message[3]+='<br> Starvation: '+totComStarv+'%';
        }
      if (totNobStarv!=0){
          message[0]+='<br> Starvation: '+totNobStarv+'%';
        }
      if (totCriStarv!=0){
          message[4]+='<br> Starvation: '+totCriStarv+'%';
        } 
        
      //message collapse
      if (collapse!=0){
          message[1]+='<br> Some districts have fallen into criminal hands: '+collapse+'%';
        }
      
      //message plagued MFs
      if (plagueMF!=0){
          message[1]+='<br> Many Watchmen are stationed in plagued areas: '+plagueMF+'%';
        }
      
      //message understaffing
      if(understaffing!=0){
        message[1]+='<br> Understaffing: '+understaffing+'%';
      }
      
      State.variables.commonerPop=com;
      State.variables.noblePop=noble;
      State.variables.criminalPop=crime;
      State.variables.abbeyPop=abbey;
      State.variables.watchPop=watch;
      State.variables.popMessage=message;
      
    }

  /*district collapse into crime*/
    setup.collapse=function(){
      var pop=State.variables.districtPop;
      var popInit=State.variables.districtPopInit;
      var name=State.variables.districtName;
      var dclass=State.variables.districtClass;
      var DDR=[0,9,13];
      
      for (let i in DDR ){
        if (pop[DDR[i]]/popInit[DDR[i]]<0.25 && dclass[DDR[i]]!='Criminals'){
          dclass[DDR[i]]='Criminals';
        State.variables.dialog+=(name[DDR[i]]+" has collapsed into criminality.");
        }
      }
      State.variables.districtClass=dclass;
    }

	/*voting update*/
	setup.upVote=function(){
      var vote=State.variables.vote;
      vote=vote+10;
      State.variables.vote=vote;
    }

	/*MFs update*/
	setup.upMF=function(){
      var mf=State.variables.mf;
      var isVoted=State.variables.isVoted;
      mf=20+isVoted[7]*20;
      State.variables.mf=mf;
    }

  /*update function*/
    setup.update=function(){
      State.variables.dialog="";
      State.variables.turn+=1;
      State.variables.day+=1;
      setup.moneyUpdate();
      setup.foodUpdate();
      setup.elixirUpdate();
      setup.energyUpdate(); 
      State.variables.districtRat=setup.ratUpdate();
      State.variables.districtInf=setup.infUpdate();
      setup.upDeathMod();
      setup.collapse();
      setup.upVote();
      setup.upPopularity();
      setup.upMF();
      
      if (State.variables.dialog!=""){
        Dialog.append(State.variables.dialog);
        Dialog.open();
      }
    }

/*UI BARS*/

  /* Create the Right UI Bar. */
    var $rightUiBar = $('<div id="right-ui-bar" class="stowed"></div>').insertAfter("#ui-overlay");

    var rightTray = $rightUiBar.append('<div id="right-ui-bar-tray"><button id="right-ui-bar-toggle" tabindex="0" title="Toggle the Right UI bar" aria-label="Toggle the Right UI bar" type="button"></button></div>');

    var rightBody = $rightUiBar.append('<div id="right-ui-bar-body"></div>');
    $rightUiBar.find('#right-ui-bar-toggle').ariaClick({label : "Toggle the Right UI bar"}, () => $rightUiBar.toggleClass('stowed'));
    postrender["Display Right Sidebar Contents"] = function (content, taskName) {
        setPageElement('right-ui-bar-body', 'StoryRightSidebar');
    };

  /*toggle the right UI bar depending on district*/

    window.stowRightUi=function(current) {
      var rub = document.getElementById('right-ui-bar');
      var last=State.variables.district;

        if (rub.classList.contains('stowed')){
         rub.classList.remove('stowed');
         State.variables.district=current;
        }
        else{
          if (last==current)
            rub.classList.add('stowed');
          else
            State.variables.district=current;
      }
    }

  /*stow right UI bar*/

    window.stowRightUi2=function() {
      var rub = document.getElementById('right-ui-bar');
      if (rub.classList.contains('stowed')){
      }
        else{
            rub.classList.add('stowed');
      }
    }

  /*click on the trade map*/

    window.clickTrade=function(click){
      var isTrading=State.variables.isTrading;
      var max=State.variables.rail[click]+2;

      if (isTrading==1){
        if (setup.countRoutes(click)==max){
          UI.alert("This district can't have more than "+max+" outgoing routes.");
        }
        else{
        	State.variables.source=click;
        	State.variables.isTrading=2;
        }
      }
      if(isTrading==2){
        State.variables.dest=click;
        State.variables.isTrading=3;
      }
    }

  /*passage when clicking on the trade map*/

    window.passageTrade=function(){
      var isTrading=State.variables.isTrading;

      if (isTrading==1){
        return("Trade map");
      }
      else{
        return("Main map");
      }
    }

  /*passage when deleting routes*/

    window.passageDelete=function(){
      var isTrading=State.variables.isTrading;

      if (isTrading==1||isTrading==2){
        return("Trade map");
      }
      else{
        return("Main map");
      }
    }

  /*confirm trade*/

    setup.confirmTrade=function(){
      var trade=State.variables.trade;
      var resourceTrade=State.variables.resourceTrade;
      var source=State.variables.source;
      var dest=State.variables.dest;

      if (resourceTrade==1) {
        State.variables.foodRoutes[source][dest]=trade;
      }
      else{
        State.variables.elixirRoutes[source][dest]=trade;
      }
      State.variables.isTrading=0;
      State.variables.trade=0;
    }

  /*number of outgoing trade routes*/
	setup.countRoutes=function(district){
      var food=State.variables.foodRoutes;
      var elixir=State.variables.elixirRoutes;
      var count=0;
      for (var j = 0; j < food.length; j++){
        if (food[district][j]!=0){
          count+=1;
        }
        if (elixir[district][j]!=0){
          count+=1;
        }
      }
      return(count);
    }

  /* Create the trade routes UI Bar. */
    var $tradeUiBar = $('<div id="trade-ui-bar" class="stowed"></div>').insertAfter("#right-ui-bar");

    var tradeTray = $tradeUiBar.append('<div id="trade-ui-bar-tray"><button id="trade-ui-bar-toggle" tabindex="0" title="Toggle the Trade UI bar" aria-label="Toggle the Trade UI bar" type="button"></button></div>');

    var tradeBody = $tradeUiBar.append('<div id="trade-ui-bar-body"></div>');
    $tradeUiBar.find('#trade-ui-bar-toggle').ariaClick({label : "Toggle the Trade UI bar"}, () => $tradeUiBar.toggleClass('stowed'));
    postrender["Display Trade Sidebar Contents"] = function (content, taskName) {
        setPageElement('trade-ui-bar-body', 'StoryTradeSidebar');
    };

  /*stow the trade UI bar*/

    window.stowTradeUi=function() {
      var tub = document.getElementById('trade-ui-bar');
      tub.classList.add('stowed');
    }

  /*toggle the right UI bar*/

    window.toggleTradeUI=function() {
      var tub = document.getElementById('trade-ui-bar');

        if (tub.classList.contains('stowed')){
         tub.classList.remove('stowed');
        }
        else{
            tub.classList.add('stowed');
      }
    }

/*map highlight*/
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):b(a.jQuery)}(window,function(a){var b,c,d,e,f,g,h,i,j,k,l;if(c=!!document.createElement("canvas").getContext,b=function(){var a=document.createElement("div");a.innerHTML='<v:shape id="vml_flag1" adj="1" />';var b=a.firstChild;return b.style.behavior="url(#default#VML)",!b||"object"==typeof b.adj}(),!c&&!b)return void(a.fn.maphilight=function(){return this});if(c){i=function(a){return Math.max(0,Math.min(parseInt(a,16),255))},j=function(a,b){return"rgba("+i(a.substr(0,2))+","+i(a.substr(2,2))+","+i(a.substr(4,2))+","+b+")"},d=function(b){var c=a('<canvas style="width:'+a(b).width()+"px;height:"+a(b).height()+'px;"></canvas>').get(0);return c.getContext("2d").clearRect(0,0,a(b).width(),a(b).height()),c};var m=function(a,b,c,d,e){if(d=d||0,e=e||0,a.beginPath(),"rect"==b)a.rect(c[0]+d,c[1]+e,c[2]-c[0],c[3]-c[1]);else if("poly"==b){a.moveTo(c[0]+d,c[1]+e);for(var f=2;f<c.length;f+=2)a.lineTo(c[f]+d,c[f+1]+e)}else"circ"==b&&a.arc(c[0]+d,c[1]+e,c[2],0,2*Math.PI,!1);a.closePath()};e=function(b,c,d,e,f){var h=b.getContext("2d");if(e.shadow){h.save(),"inside"==e.shadowPosition&&(m(h,c,d),h.clip());var i=100*b.width,k=100*b.height;m(h,c,d,i,k),h.shadowOffsetX=e.shadowX-i,h.shadowOffsetY=e.shadowY-k,h.shadowBlur=e.shadowRadius,h.shadowColor=j(e.shadowColor,e.shadowOpacity);var l=e.shadowFrom;l||(l="outside"==e.shadowPosition?"fill":"stroke"),"stroke"==l?(h.strokeStyle="rgba(0,0,0,1)",h.stroke()):"fill"==l&&(h.fillStyle="rgba(0,0,0,1)",h.fill()),h.restore(),"outside"==e.shadowPosition&&(h.save(),m(h,c,d),h.globalCompositeOperation="destination-out",h.fillStyle="rgba(0,0,0,1);",h.fill(),h.restore())}h.save(),m(h,c,d),e.fill&&(h.fillStyle=j(e.fillColor,e.fillOpacity),h.fill()),e.stroke&&(h.strokeStyle=j(e.strokeColor,e.strokeOpacity),h.lineWidth=e.strokeWidth,h.stroke()),h.restore(),e.fade&&a(b).css("opacity",0).animate({opacity:1},100)},f=function(a){a.getContext("2d").clearRect(0,0,a.width,a.height)}}else d=function(b){return a('<var style="zoom:1;overflow:hidden;display:block;width:'+b.width+"px;height:"+b.height+'px;"></var>').get(0)},e=function(b,c,d,e,f){var g,h,i,j;for(var k in d)d[k]=parseInt(d[k],10);g='<v:fill color="#'+e.fillColor+'" opacity="'+(e.fill?e.fillOpacity:0)+'" />',h=e.stroke?'strokeweight="'+e.strokeWidth+'" stroked="t" strokecolor="#'+e.strokeColor+'"':'stroked="f"',i='<v:stroke opacity="'+e.strokeOpacity+'"/>',"rect"==c?j=a('<v:rect name="'+f+'" filled="t" '+h+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+d[0]+"px;top:"+d[1]+"px;width:"+(d[2]-d[0])+"px;height:"+(d[3]-d[1])+'px;"></v:rect>'):"poly"==c?j=a('<v:shape name="'+f+'" filled="t" '+h+' coordorigin="0,0" coordsize="'+b.width+","+b.height+'" path="m '+d[0]+","+d[1]+" l "+d.join(",")+' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:'+b.width+"px;height:"+b.height+'px;"></v:shape>'):"circ"==c&&(j=a('<v:oval name="'+f+'" filled="t" '+h+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+(d[0]-d[2])+"px;top:"+(d[1]-d[2])+"px;width:"+2*d[2]+"px;height:"+2*d[2]+'px;"></v:oval>')),j.get(0).innerHTML=g+i,a(b).append(j)},f=function(b){var c=a("<div>"+b.innerHTML+"</div>");c.children("[name=highlighted]").remove(),b.innerHTML=c.html()};g=function(a){var b,c=a.getAttribute("coords").split(",");for(b=0;b<c.length;b++)c[b]=parseFloat(c[b]);return[a.getAttribute("shape").toLowerCase().substr(0,4),c]},l=function(b,c){var d=a(b);return a.extend({},c,!!a.metadata&&d.metadata(),d.data("maphilight"))},k=function(a){return!!a.complete&&("undefined"==typeof a.naturalWidth||0!==a.naturalWidth)},h={position:"absolute",left:0,top:0,padding:0,border:0};var n=!1;a.fn.maphilight=function(i){return i=a.extend({},a.fn.maphilight.defaults,i),c||n||(a(window).ready(function(){document.namespaces.add("v","urn:schemas-microsoft-com:vml");var b=document.createStyleSheet(),c=["shape","rect","oval","circ","fill","stroke","imagedata","group","textbox"];a.each(c,function(){b.addRule("v\\:"+this,"behavior: url(#default#VML); antialias:true")})}),n=!0),this.each(function(){var j,m,n,o,p,q,s;if(j=a(this),!k(this))return window.setTimeout(function(){j.maphilight(i)},200);if(n=a.extend({},i,!!a.metadata&&j.metadata(),j.data("maphilight")),s=j.get(0).getAttribute("usemap"),s&&(o=a('map[name="'+s.substr(1)+'"]'),j.is('img,input[type="image"]')&&s&&o.length>0)){if(j.hasClass("maphilighted")){var t=j.parent();j.insertBefore(t),t.remove(),a(o).unbind(".maphilight")}m=a("<div></div>").css({display:"block",backgroundImage:'url("'+this.src+'")',backgroundSize:"contain",position:"relative",padding:0,width:this.width,height:this.height}),n.wrapClass&&(n.wrapClass===!0?m.addClass(a(this).attr("class")):m.addClass(n.wrapClass)),j.before(m).css("opacity",0).css(h).remove(),b&&j.css("filter","Alpha(opacity=0)"),m.append(j),p=d(this),a(p).css(h),p.height=this.height,p.width=this.width,a(o).bind("alwaysOn.maphilight",function(){q&&f(q),c||a(p).empty(),a(o).find("area[coords]").each(function(){var b,f;f=l(this,n),f.alwaysOn&&(!q&&c&&(q=d(j[0]),a(q).css(h),q.width=j[0].width,q.height=j[0].height,j.before(q)),f.fade=f.alwaysOnFade,b=g(this),c?e(q,b[0],b[1],f,""):e(p,b[0],b[1],f,""))})}).trigger("alwaysOn.maphilight").bind("mouseover.maphilight, focus.maphilight",function(b){var d,f,h=b.target;if(f=l(h,n),!f.neverOn&&!f.alwaysOn){if(d=g(h),e(p,d[0],d[1],f,"highlighted"),f.groupBy){var i;i=/^[a-zA-Z][\-a-zA-Z]+$/.test(f.groupBy)?o.find("area["+f.groupBy+'="'+a(h).attr(f.groupBy)+'"]'):o.find(f.groupBy);var j=h;i.each(function(){if(this!=j){var a=l(this,n);if(!a.neverOn&&!a.alwaysOn){var b=g(this);e(p,b[0],b[1],a,"highlighted")}}})}c||a(p).append("<v:rect></v:rect>")}}).bind("mouseout.maphilight, blur.maphilight",function(a){f(p)}),j.before(p),j.addClass("maphilighted")}})},a.fn.maphilight.defaults={fill:!0,fillColor:"000000",fillOpacity:.2,stroke:!0,strokeColor:"ff0000",strokeOpacity:1,strokeWidth:1,fade:!0,alwaysOn:!1,neverOn:!1,groupBy:!1,wrapClass:!0,shadow:!1,shadowX:0,shadowY:0,shadowRadius:6,shadowColor:"000000",shadowOpacity:.8,shadowPosition:"outside",shadowFrom:!1}});

//numberpool macro

/*! <<numberpool>> macro set for SugarCube v2 */
!function(){"use strict";if("undefined"==typeof version||void 0===version.title||"SugarCube"!==version.title||void 0===version.major||version.major<2||void 0===version.minor||version.minor<22)throw new Error("<<numberpool>> macro set requires SugarCube 2.22.0 or greater, aborting load");Macro.add("numberinput",{handler:function(){function validateAndApply(el,addend){var curValue=Math.trunc(State.getVar(varName)),newValue=Math.trunc(el.value),newPoolValue=null;if(Number.isNaN(newValue)||!Number.isFinite(newValue))return el.value=curValue,!1;if(null!=addend&&(newValue+=addend),newValue<minValue?newValue=minValue:newValue>maxValue&&(newValue=maxValue),null!==pool){var poolValue=pool.get(),delta=(newValue-curValue)*poolCost;delta<0?newPoolValue=poolValue-delta:delta>0&&poolValue>=poolCost?(poolValue<delta&&(newValue=curValue+Math.trunc(poolValue/poolCost),delta=poolValue-poolValue%poolCost),newPoolValue=poolValue-delta):newValue=curValue}return State.setVar(varName,newValue),el.value=newValue,null!==newPoolValue&&pool.set(newPoolValue),!0}var _this=this;if(this.args.length<4){var errors=[];return this.args.length<1&&errors.push("variable name"),this.args.length<2&&errors.push("default value"),this.args.length<3&&errors.push("min value"),this.args.length<4&&errors.push("max value"),this.error("no "+errors.join(" or ")+" specified")}if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var varId=Util.slugify(varName),defValue=Number(this.args[1]),minValue=Number(this.args[2]),maxValue=Number(this.args[3]),poolCost=1,autofocus=!1;if(this.args.length>5?(poolCost=Number(this.args[4]),autofocus="autofocus"===this.args[5]):this.args.length>4&&("autofocus"===this.args[4]?autofocus=!0:poolCost=Number(this.args[4])),Number.isNaN(defValue)||!Number.isFinite(defValue)||Math.trunc(defValue)!==defValue)return this.error("default value ("+this.args[1]+") is not a whole number");if(Number.isNaN(minValue)||!Number.isFinite(minValue)||Math.trunc(minValue)!==minValue)return this.error("min value ("+this.args[2]+") is not a whole number");if(Number.isNaN(maxValue)||!Number.isFinite(maxValue)||Math.trunc(maxValue)!==maxValue)return this.error("max value ("+this.args[3]+") is not a whole number");if(Number.isNaN(poolCost)||!Number.isFinite(poolCost)||Math.trunc(poolCost)!==poolCost||poolCost<=0)return this.error("pool cost ("+this.args[4]+") is not a whole number greater than zero");if(defValue<minValue)return this.error("default value ("+this.args[1]+") is less than min value ("+this.args[2]+")");if(defValue>maxValue)return this.error("default value ("+this.args[1]+") is greater than max value ("+this.args[3]+")");var pool=function(){var parent=_this.contextSelect(function(ctx){return"numberpool"===ctx.name});return null!==parent&&parent.hasOwnProperty("pool")?parent.pool:null}();Config.debug&&this.debugView.modes({block:!0});var $elControl=jQuery(document.createElement("div")),$elInput=jQuery(document.createElement("input"));$elControl.attr("id",this.name+"-body-"+varId).addClass("macro-"+this.name).appendTo(this.output),jQuery(document.createElement("button")).attr({id:this.name+"-minus-"+varId}).text("").ariaClick(this.createShadowWrapper(function(){return validateAndApply($elInput.get(0),-1)})).appendTo($elControl),$elInput.attr({id:this.name+"-input-"+varId,name:this.name+"-input-"+varId,type:"text",pattern:"\\d+",tabindex:0}).on("change",this.createShadowWrapper(function(){validateAndApply(this)})).on("keypress",function(ev){13===ev.which&&(ev.preventDefault(),$elInput.trigger("change"))}).appendTo($elControl),jQuery(document.createElement("button")).attr({id:this.name+"-plus-"+varId}).text("").ariaClick(this.createShadowWrapper(function(){return validateAndApply($elInput.get(0),1)})).appendTo($elControl),$elInput.val(defValue),validateAndApply($elInput.get(0)),autofocus&&($elInput.attr("autofocus","autofocus"),jQuery(document).one(":passagedisplay",function(){return setTimeout(function(){return $elInput.focus()},Engine.minDomActionDelay)}))}}),Macro.add("numberpool",{tags:["onchange"],handler:function(){if(0===this.args.length)return this.error("no variable name specified");if(this.payload.length>2)return this.error("multiple <<onchange>> sections specified");if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var curValue=State.getVar(varName);if("number"!=typeof curValue||Number.isNaN(curValue)||!Number.isFinite(curValue))return this.error("pool value is not a number");var varId=Util.slugify(varName);TempState.hasOwnProperty(this.name)||(TempState[this.name]={}),TempState[this.name].hasOwnProperty(varId)||(TempState[this.name][varId]=0),Object.defineProperty(this,"pool",{value:Object.defineProperties({},{get:{value:function(){return State.getVar(varName)}},set:{value:function(content){return function(value){value!==State.getVar(varName)&&(State.setVar(varName,value),content&&new Wikifier(null,content))}}(this.payload.length>1?this.payload[1].contents.trim():"")}})}),jQuery(document.createElement("div")).attr("id",this.name+"-"+varId+"-"+TempState[this.name][varId]++).addClass("macro-"+this.name).wiki(this.payload[0].contents.replace(/^\n/,"")).appendTo(this.output)}}),Macro.add("numberslider",{handler:function(){function stepValidate(value){if(fracDigits>0){var ma=Number(minValue+"e"+fracDigits),sa=Number(stepValue+"e"+fracDigits),_va=Number(value+"e"+fracDigits)-ma;return Number(_va-_va%sa+ma+"e-"+fracDigits)}var va=value-minValue;return va-va%stepValue+minValue}function validateAndApply(el){var curValue=State.getVar(varName),newValue=Number(el.value),newPoolValue=null;if(Number.isNaN(newValue)||!Number.isFinite(newValue))return el.value=curValue,!1;if(newValue=stepValidate(newValue),newValue<minValue?newValue=minValue:newValue>maxValue&&(newValue=maxValue),null!==pool)if(fracDigits>0){var pa=Number(pool.get()+"e"+fracDigits),ca=Number(curValue+"e"+fracDigits),na=Number(newValue+"e"+fracDigits),delta=na-ca;pa<delta&&(na-=delta-pa,delta=na-ca,newValue=Number(na+"e-"+fracDigits)),newPoolValue=Number(pa-delta+"e-"+fracDigits)}else{var poolValue=pool.get(),_delta=newValue-curValue;poolValue<_delta&&(newValue-=_delta-poolValue,_delta=newValue-curValue),newPoolValue=poolValue-_delta}return State.setVar(varName,newValue),el.value=newValue,null!==newPoolValue&&pool.set(newPoolValue),!0}var _this2=this;if(this.args.length<5){var errors=[];return this.args.length<1&&errors.push("variable name"),this.args.length<2&&errors.push("default value"),this.args.length<3&&errors.push("min value"),this.args.length<4&&errors.push("max value"),this.args.length<5&&errors.push("step value"),this.error("no "+errors.join(" or ")+" specified")}if("string"!=typeof this.args[0])return this.error("variable name argument is not a string");var varName=this.args[0].trim();if("$"!==varName[0]&&"_"!==varName[0])return this.error('variable name "'+this.args[0]+'" is missing its sigil ($ or _)');var varId=Util.slugify(varName),defValue=Number(this.args[1]),minValue=Number(this.args[2]),maxValue=Number(this.args[3]),stepValue=Number(this.args[4]),autofocus=this.args.length>5&&"autofocus"===this.args[5];if(Number.isNaN(defValue)||!Number.isFinite(defValue))return this.error("default value ("+this.args[1]+") is not a number");if(Number.isNaN(minValue)||!Number.isFinite(minValue))return this.error("min value ("+this.args[2]+") is not a number");if(Number.isNaN(maxValue)||!Number.isFinite(maxValue))return this.error("max value ("+this.args[3]+") is not a number");if(Number.isNaN(stepValue)||!Number.isFinite(stepValue)||stepValue<=0)return this.error("step value ("+this.args[4]+") is not a number greater than zero");if(defValue<minValue)return this.error("default value ("+this.args[1]+") is less than min value ("+this.args[2]+")");if(defValue>maxValue)return this.error("default value ("+this.args[1]+") is greater than max value ("+this.args[3]+")");var fracDigits=function(){var str=String(stepValue),pos=str.lastIndexOf(".");return-1===pos?0:str.length-pos-1}();if(stepValidate(maxValue)!==maxValue)return this.error("max value ("+this.args[3]+") is not a multiple of the step value ("+this.args[4]+") plus the min value ("+this.args[2]+")");var pool=function(){var parent=_this2.contextSelect(function(ctx){return"numberpool"===ctx.name});return null!==parent&&parent.hasOwnProperty("pool")?parent.pool:null}();Config.debug&&this.debugView.modes({block:!0});var $elControl=jQuery(document.createElement("div")),$elInput=jQuery(document.createElement("input")),$elValue=void 0,showValue=void 0;$elControl.attr("id",this.name+"-body-"+varId).addClass("macro-"+this.name).appendTo(this.output),$elInput.attr({id:this.name+"-input-"+varId,name:this.name+"-input-"+varId,type:"range",min:minValue,max:maxValue,step:stepValue,tabindex:0}).on("change input."+Util.slugify(this.name),this.createShadowWrapper(function(){validateAndApply(this),"function"==typeof showValue&&showValue()})).on("keypress",function(ev){13===ev.which&&(ev.preventDefault(),$elInput.trigger("change"))}).appendTo($elControl),!Browser.isIE||Browser.ieVersion>9?($elValue=jQuery(document.createElement("span")).attr("id",this.name+"-value-"+varId).appendTo($elControl),showValue=function(){$elValue.text(Number($elInput.val()).toFixed(fracDigits))}):$elInput.off("input."+Util.slugify(this.name)),$elInput.val(defValue),validateAndApply($elInput.get(0)),"function"==typeof showValue&&showValue(),autofocus&&($elInput.attr("autofocus","autofocus"),jQuery(document).one(":passagedisplay",function(){return setTimeout(function(){return $elInput.focus()},Engine.minDomActionDelay)}))}})}();
