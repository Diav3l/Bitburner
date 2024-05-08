/** @param {NS} ns */
export async function main(ns) {
	/**Get list of all hosts */
	const masterlist = await listAllHosts(ns, "home");
	/**Make a list of targets that are hackable and have money */
	const targetList = []
	for (let i = 0; i < masterlist.length; i++) {
		if (ns.getServerMaxMoney(masterlist[i])>0 && ns.hasRootAccess(masterlist[i])) {
			targetList.push(masterlist[i]);
		}
	}


	for(let i = 0; i<targetList.length;i++){
		let secLVL = String(Math.floor(ns.getServerSecurityLevel(targetList[i])));
		let minSecLVL = String(Math.floor(ns.getServerMinSecurityLevel(targetList[i])));
		let availMoney = String(normalizeValues(ns.getServerMoneyAvailable(targetList[i])));
		let maxMoney = String(normalizeValues(ns.getServerMaxMoney(targetList[i])));
		let serverLevel = String(ns.getServerRequiredHackingLevel(targetList[i]));
		let hackable = '';
		if(ns.getServerRequiredHackingLevel(targetList[i])<=ns.getHackingLevel())
			hackable = '*';
		ns.tprint(hackable.padStart(1) + targetList[i].padStart(20) +" :: Current Sec : " + secLVL.padEnd(3) + ", Min Sec : " + minSecLVL.padEnd(3) + " :: Money avail : " + availMoney.padStart(4) + ", money max : " + maxMoney.padStart(4) + ", Server level : " + serverLevel.padStart(4));
	}
}

export function normalizeValues(value){
	let retValue = '';
	if(value>1_000_000_000_000_000_000)
		retValue = Math.round(value/1_000_000_000_000_000_000)+'Q';
	else if(value>1_000_000_000_000_000)
		retValue = Math.round(value/1_000_000_000_000_000)+'q';
	else if(value>1_000_000_000_000)
		retValue = Math.round(value/1_000_000_000_000)+'T';
	else if(value>1_000_000_000)
		retValue = Math.round(value/1_000_000_000)+'B';
	else if(value>1_000_000)
		retValue = Math.round(value/1_000_000)+'M';
	else if(value>1_000)
		retValue = Math.round(value/1_000)+'K';
	else
		retValue = Math.round(value);
	return retValue;
}

/** 
 * 	Get listing of all hosts on the network.
 * 
 * 	@param {NS} ns
 *      @param {string} rootHost
 * 	@param {Set} found
**/
export async function listAllHosts(ns, rootHost, found) {
	if (!found) {
		found = new Set([])
	}

	const hosts = new Set(ns.scan(rootHost));

	for (const host of hosts) {
		if (!found.has(host)) {
			found.add(host);
			for (const child of await listAllHosts(ns, host, found)) {
				found.add(child)
			}
		}
	}

	// Convert final result back to an array
	return [...found];
}
