/** @param {NS} ns */
export async function main(ns) {
	ns.run('Core/ServerFarmUpgrade.js',1,1);
	if(ns.getPlayer().mults.hacking_exp<5)
		ns.run('Core/HacknetMGM.js',1,6);
	ns.run('Core/Worm.js');
	ns.run('Dispatcher.js');
	ns.run('Core/GangMGM.js');
	
	//ns.run('Core/CreatePrograms.js');
}
