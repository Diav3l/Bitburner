/** @param {NS} ns */
export async function main(ns){
	/**Hacknet setup */
	let hacknetMults = ns.getHacknetMultipliers()
	let hacknetservers = Math.floor(Math.log(hacknetMults.production/hacknetMults.purchaseCost)+1)*4
	if(hacknetservers>0)
		ns.run('Core/HacknetMGM.js',1,hacknetservers);
	/**All else */
	ns.run('Core/ServerFarmUpgrade.js',1,15);
	ns.run('Core/Worm.js');
	ns.run('Core/Dispatcher.js');
	ns.run('Core/GangMGM.js');
	//ns.run('Core/CreatePrograms.js');
}
