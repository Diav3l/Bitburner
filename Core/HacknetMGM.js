/** @param {NS} ns */
export async function main(ns) {
	let currentMeasure = Math.round(ns.getServerMoneyAvailable('home'));
	let maxServers = 21;
	if(ns.args[0])
		maxServers = ns.args[0];


	while (true) {
		/**sets the reserve cash equal to what you make in 2 min (The multiplier is a second)*/
		let income = ns.getTotalScriptIncome();
		let reserveCash = Math.round((income[1]+hacknetProduction(ns))*120);
		/**Killswitch, kills the program if player money has an extra zero between itererations. Like when logged out*/
		currentMeasure = Math.round(ns.getServerMoneyAvailable('home'));
		printCost(ns,reserveCash,'Reserve Cash = ');

		/**Buys a new node if possible and there are less than maxServers*/
		if(currentMeasure - ns.hacknet.getPurchaseNodeCost() > reserveCash && ns.hacknet.numNodes()<maxServers){
			printCost(ns,ns.hacknet.getPurchaseNodeCost(),'Purchased Node for = ');
			ns.hacknet.purchaseNode();
			continue;
		}

		/**Upgrade nodes as needed*/
		for(let i = 0; i<ns.hacknet.numNodes();i++){
			//ns.hacknet.upgradeCache(i);
			if(currentMeasure - ns.hacknet.getCoreUpgradeCost(i) > reserveCash){
				printCost(ns,ns.hacknet.getCoreUpgradeCost(i),'Purchased core upgrade for node '+i+' = ');
				ns.hacknet.upgradeCore(i);
				break;
			}
			if(currentMeasure - ns.hacknet.getLevelUpgradeCost(i,10) > reserveCash){
				printCost(ns,ns.hacknet.getLevelUpgradeCost(i,10),'Purchased level upgrade for node '+i+' = ');
				ns.hacknet.upgradeLevel(i,10);
				break;
			}
			if(currentMeasure - ns.hacknet.getRamUpgradeCost(i) > reserveCash){
				printCost(ns,ns.hacknet.getRamUpgradeCost(i),'Purchased RAM upgrade for node '+i+' = ');
				ns.hacknet.upgradeRam(i);
				break;
			}
		}
		if(ns.hacknet.numNodes() >= maxServers)
			checkDone(ns);
		/*stops the loop from breaking the game*/
		await ns.sleep(1000);
	}
}


function checkDone(ns){
	let lastNode = ns.hacknet.numNodes()-1
	let core = ns.hacknet.getNodeStats(lastNode).cores >= 16;
	let level = ns.hacknet.getNodeStats(lastNode).level >= 200;
	let ram = ns.hacknet.getNodeStats(lastNode).ram >= 64;
	if(core && level && ram){
		ns.tprint('Killed HacknetMGM.js due to script compleetion');
		ns.exit();
	}
}


export function hacknetProduction(ns){
  let total = 0;
	for(let i = 0; i<ns.hacknet.numNodes();i++){
		total += ns.hacknet.getNodeStats(i).production;
	}
	return total;
}

function printCost(ns,value,string){
	if(value>1_000_000_000_000)
		ns.print(string + Math.round(value/1_000_000_000_000)+'T');
	else if(value>1_000_000_000)
		ns.print(string + Math.round(value/1_000_000_000)+'B');
	else if(value>1_000_000)
		ns.print(string + Math.round(value/1_000_000)+'M');
	else if(value>1_000)
		ns.print(string + Math.round(value/1_000)+'K');
	else
		ns.print(string + Math.round(value));
}
