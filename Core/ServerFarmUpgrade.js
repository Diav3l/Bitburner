/** @param {NS} ns */
export async function main(ns) {
	/** reserves cash based on a factor of your income so you retain more over time */
	let income = ns.getTotalScriptIncome();
	let reserveCash = Math.round((income[1]+hacknetProduction(ns))*100);
	let ramsize = Math.pow(2,ns.args[0]);

	if(ns.args[0]>14){
		ns.tprint('Servers fully upgraded');
		ns.exit();
	}

	let i = 1;
	while(i<=25){
		if(ns.serverExists('DiavelServer'+i)){
			if((ns.getServerMoneyAvailable('home')-ns.getPurchasedServerUpgradeCost('DiavelServer'+i,ramsize))>reserveCash){
				ns.upgradePurchasedServer('DiavelServer'+i,ramsize);
				i++;
				continue;
			}
		} else{
			if((ns.getServerMoneyAvailable('home')-ns.getPurchasedServerCost(ramsize))>reserveCash && !ns.serverExists('DiavelServer'+i)){
			ns.purchaseServer('DiavelServer'+i,ramsize);
			i++;
			continue;
			}
		}

		ns.print('RAM size = ' + ramsize);
		printCost(ns,ns.getPurchasedServerCost(ramsize),'Server Cost = ');
		printCost(ns,reserveCash, 'Reserve Cash = ');
		ns.print('Last bought/upgraded server  = ' + 'DiavelServer'+(i-1));
		await ns.asleep(100);
	}

	ns.tprint('Compleeted upgrade for '+ Math.pow(2,ns.args[0])+'GB, Teir ' + ns.args[0]);
	ns.spawn('Core/ServerFarmUpgrade.js',1,(ns.args[0]+1));
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

export function hacknetProduction(ns){
  let total = 0;
	for(let i = 0; i<ns.hacknet.numNodes();i++){
		total += ns.hacknet.getNodeStats(i).production;
	}
	return total;
}
