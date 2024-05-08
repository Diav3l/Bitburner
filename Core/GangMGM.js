/** @param {NS} ns */
export async function main(ns) {
	var weapons = ["Baseball Bat","Katana","Glock 18C","P90C","Steyr AUG","AK-47","M15A10 Assault Rifle","AWM Sniper Rifle"]
	var armor = ["Bulletproof Vest","Full Body Armor","Liquid Body Armor","Graphene Plating Armor"]
	var vehicles = ["Ford Flex V20","ATX1070 Superbike","Mercedes-Benz S9001","White Ferrari"]
	var rootkits = ["NUKE Rootkit","Soulstealer Rootkit","Demon Rootkit","Hmap Node","Jack the Ripper"]
	var augments =["Bionic Arms","Bionic Legs","Bionic Spine","BrachiBlades","Nanofiber Weave","Synthetic Heart","Synfibril Muscle","BitWire","Neuralstimulator","DataJack","Graphene Bone Lacings"]
	var gangs = ["Tetrads", "The Syndicate", "The Dark Army", "Speakers for the Dead", "NiteSec, The Black Hand"]
	


	while(!ns.gang.inGang()){
		if(ns.gang.createGang('Slum Snakes'))
			break;
		else
			await ns.sleep(100);
	}

	let gangMembers = ns.gang.getMemberNames();
	while(ns.gang.inGang){
		let skillGoal = gangMembers.length*20
		let gangInfo = ns.gang.getGangInformation();
		let reserveCash = gangInfo.moneyGainRate*100;

		/** Loop Through All Members */
		for(let i=0;i<gangMembers.length;i++){
			let member = gangMembers[i];
			let memberInfo = ns.gang.getMemberInformation(gangMembers[i]);
			let result = ns.gang.getAscensionResult(member);

			/**Ascension*/
			if(typeof result !== 'undefined')
				if((result.agi>1.1 || result.def>1.1 || result.dex>1.1 || result.str>1.1) && result.respect<ns.gang.getGangInformation().respect*(1/2))
					ns.gang.ascendMember(member)

			/*Training*/
			if(memberInfo.agi<skillGoal || memberInfo.dex<skillGoal || memberInfo.def<skillGoal || memberInfo.str<skillGoal){
				ns.gang.setMemberTask(member, "Train Combat");//train members
				continue;//stop trainees from buying equipment
			}
			/*Reduce Heat if needed*/
			else if(gangInfo.wantedLevel>gangInfo.respect*.1 && gangInfo.wantedLevel>10 && i<1){
				ns.gang.setMemberTask(member, "Vigilante Justice");
			}

			/*Probationary assignments*/
			else if(memberInfo.agi+memberInfo.dex+memberInfo.def+memberInfo.str<1000){
				if(i<gangMembers.length*(2/3))
					if(memberInfo.agi+memberInfo.dex+memberInfo.def+memberInfo.str<400)
						ns.gang.setMemberTask(member, "Mug People")
					else
						ns.gang.setMemberTask(member, "Strongarm Civilians")
				else
					ns.gang.setMemberTask(member, "Territory Warfare");
			}
			/*Prep for war*/
			else if(gangMembers.length<12){
				if(i<gangMembers.length*(1/2))
					ns.gang.setMemberTask(member, "Terrorism");
				else
					ns.gang.setMemberTask(member, "Territory Warfare");
			}
			/*Gang war phase */
			else if(gangInfo.territory<1){					
				if(i<gangMembers.length*(1/4))
					ns.gang.setMemberTask(member, "Human Trafficking");
				else
					ns.gang.setMemberTask(member, "Territory Warfare");
			/*Post war money generation & gang maximisation*/
			}else{
				ns.gang.setMemberTask(member, "Human Trafficking");
				
				/*Buy rootkits at last step becasue why not */
				for(let index=0;index<rootkits.length;index++)
					ns.gang.purchaseEquipment(member, rootkits[index])
			}
			
			/*Purchase gear for those not training */
			for(let index=0;index<weapons.length;index++)
				ns.gang.purchaseEquipment(member, weapons[index])
			for(let index=0;index<armor.length;index++)
				ns.gang.purchaseEquipment(member, armor[index])
			for(let index=0;index<vehicles.length;index++)
				ns.gang.purchaseEquipment(member, vehicles[index])
			for(let index=0;index<augments.length;index++)
				ns.gang.purchaseEquipment(member, augments[index])
		}
		/*Auto recruit */
		while(ns.gang.canRecruitMember()){
			ns.gang.recruitMember(getName());
		}
		/*Gang war if gang full*/
		if(gangMembers.length>=12){
			let winChances = [];
			for(let i=0;i<gangs.length-1;i++)
				winChances.push(ns.gang.getChanceToWinClash(gangs[i]));
			ns.gang.setTerritoryWarfare(winChances.every(greaterThanNPercent));
		}
		//print block
		ns.print('Reserve Cash : '+normalizeValues(reserveCash));
		ns.print('Income       : '+normalizeValues(gangInfo.moneyGainRate));
		ns.print('Respect Rate : '+normalizeValues(gangInfo.respectGainRate));
		ns.print('Power        : '+normalizeValues(gangInfo.power));
		await ns.gang.nextUpdate()
		gangMembers = ns.gang.getMemberNames();		
	}
}
/**Generate names for gang members */
export function getName(){
	const names = ['Tank', 'Dr.Feelgood', 'WatchTower', 'BlazeRunner', 'IronWolf', 'Quantum', 'NightHawk', 'FrostByte', 'EchoStrike', 'SilverSpear', 'Vortex', 'GhostRider']
	return names[Math.floor(Math.random()*names.length)];
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

function greaterThanNPercent(decimal){
	return decimal>0.50;
}
