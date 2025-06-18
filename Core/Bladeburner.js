/** @param {NS} ns */
export async function main(ns) {
	/** Initial variables */
	ns.disableLog("bladeburner.upgradeSkill")
	let blackOps = ns.bladeburner.getBlackOpNames();
	let activities = [
		["general", "Incite Violence"],
		["contracts", "Tracking"],
		["contracts", "Bounty Hunter"],
		["contracts", "Retirement"],
		["operations", "Investigation"],
		["operations", "Undercover Operation"],
		["operations", "Stealth Retirement Operation"],
		["operations", "Assassination"],
	];
	for (let i = blackOps.length - 1; i >= 0; i--)
		activities.push(["black Ops", blackOps[i]]);
	let cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

	/** Looped Code */
	while (ns.bladeburner.inBladeburner()) {
		upgrade(ns);
		//travel(ns, cities);
		setAction(ns, activities);

		await ns.bladeburner.nextUpdate();
	}
}
/**
 * Travel where needed
 * 
 * @param {String[]} cities
 * @param {NS} ns
 */
function travel(ns, cities) {
	let cityChaos = []
	let goTo = "";
	for (let i = 0; i < cities.length; i++)
		cityChaos.push([cities[i], ns.bladeburner.getCityChaos(cities[i])]);

	let highestChaos = ["", 0];
	for (let i = 0; i < cities.length; i++)
		if (cityChaos[i][1] > highestChaos[1] && cityChaos[i][1] >= 50)
			highestChaos = [i, cityChaos[i][1]];
	goTo = cities[highestChaos[0]]



	ns.bladeburner.switchCity(goTo);
	//ns.print(cityChaos);
}

/**
 * Upgrades Skills
 * 
 * @param {NS} ns
 */
function upgrade(ns) {
	//let highestCost = 0;
	let allSkills = ns.bladeburner.getSkillNames();

	for (let i = 0; i < allSkills.length; i++)
				ns.bladeburner.upgradeSkill(allSkills[i]);
	/*
	for (let i = 0; i < allSkills.length; i++)
		if (ns.bladeburner.getSkillUpgradeCost(allSkills[i]) > highestCost)
			highestCost = ns.bladeburner.getSkillUpgradeCost(allSkills[i]);


	while (ns.bladeburner.getSkillPoints() > highestCost) {
		
		let lowestSkill = 10000;
		for (let i = 0; i < allSkills.length; i++)
			if (ns.bladeburner.getSkillLevel(allSkills[i]) < lowestSkill)
				lowestSkill = ns.bladeburner.getSkillLevel(allSkills[i]);		
	}
	*/
}

/**
 * Sets Action
 * 
 * @param {NS} ns
 */
function setAction(ns, activities) {

	let action = ["general", "Training"];

	let stamina = ns.bladeburner.getStamina();
	let playerStats = ns.getPlayer();

	if (playerStats.hp.current <= playerStats.hp.max / 2) {
		action = ["general", "Hyperbolic Regeneration Chamber"];
	} else if (stamina[1] <= stamina[2] / 2) {
		action = ["general", "Recruitment"];
	} else if (ns.bladeburner.getCityChaos(ns.bladeburner.getCity()) >= 50) {
		action = ["general", "Diplomacy"];
	} else {
		for (let i = activities.length - 1; i >= 0; i--) {
			let successChance = ns.bladeburner.getActionEstimatedSuccessChance(activities[i][0], activities[i][1]);
			if (successChance[0] >= 1 && canDoBlackOp(ns, activities[i])) {
				action = [activities[i][0], activities[i][1]];
				break;
			} else if (successChance[1] >= 1 && successChance[0] != successChance[1]) {
				action = ["general", "Field Analysis"];
				break;
			} else if (successChance[0] != successChance[1]) {
				action = ["general", "Field Analysis"];
			}
		}
		//
	}

	if (newAction(ns, action))
		ns.bladeburner.startAction(action[0], action[1]);
	//ns.tprint(action,ns.bladeburner.getActionCountRemaining(action[0],action[1]));

}

/**
 * test to see if the selected action is new
 * 
 * @param {NS} ns
 * @param {String[]} action
 */
function newAction(ns, action) {
	if (!ns.bladeburner.getCurrentAction())
		return true;
	if (action[1] != ns.bladeburner.getCurrentAction().name)
		return true;
	return false;
}

/**Test to see if it is possible to compleete set objective
 * 
 * @param {NS} ns
 * @param {String[]} activitiy
*/
function canDoBlackOp(ns, activitiy) {
	if (ns.bladeburner.getActionCountRemaining(activitiy[0], activitiy[1]) < 1)
		return false;
	if (activitiy[0] != "black Ops")
		return true;
	if (ns.bladeburner.getBlackOpRank(activitiy[1]) <= ns.bladeburner.getRank())
		return true;
	return false;
}
