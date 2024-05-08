/** @param {NS} ns */
export async function main(ns) {

	const blacklist = ['home'];
	const hosts = await listAllHosts(ns, "home");

	for (let i = 0; i < hosts.length; i++) {
		if(ns.hasRootAccess(hosts[i])){
			blacklist.push(hosts[i]);
			continue;
		}

		if (blacklist.includes(hosts[i])) {
			continue;
		}
		var openablePorts = crack(ns, hosts[i]);
		if (ns.getServerNumPortsRequired(hosts[i]) > openablePorts) {
			ns.print("Cannot crack " + hosts[i] + " have " + openablePorts + " of the required " + ns.getServerNumPortsRequired(hosts[i]));
			continue;
		}
		ns.nuke(hosts[i]);
	}
}

function crack(ns, hostName) {
	var crackablePorts = 0;
	if(ns.fileExists('BruteSSH.exe')){
		ns.brutessh(hostName);
		crackablePorts++;
	}
	if(ns.fileExists('FTPCrack.exe')){
		ns.ftpcrack(hostName);
		crackablePorts++;
	}
	if(ns.fileExists('relaySMTP.exe')){
		ns.relaysmtp(hostName);
		crackablePorts++;
	}
	if(ns.fileExists('HTTPWorm.exe')){
		ns.httpworm(hostName);
		crackablePorts++;
	}
	if(ns.fileExists('SQLInject.exe')){
		ns.sqlinject(hostName);
		crackablePorts++;
	}
	return crackablePorts;
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
