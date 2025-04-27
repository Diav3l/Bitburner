/** @param {NS} ns */
export async function main(ns) {
  let masterHosts = await listAllHosts(ns, "home");
  let hosts = getHosts(ns, masterHosts);
  let targets = getTargets(ns, masterHosts);
  let hackRam = 1.7;
  let growRam = 1.75;
  let weakenRam = 1.75;
  let waitTime = 60;


  while (true) {//run forever

    /** Iterates through all my servers*/
    for (let i = 0; i < hosts.length; i++) {
      await ns.sleep(10);
      let currentHost = hosts[i]
      pushFiles(ns, currentHost);
      let availRam = ns.getServerMaxRam(currentHost) - ns.getServerUsedRam(currentHost);
      if (availRam < 2)
        continue;

      /**Iterates through all targets*/
      for (let i = 0; i < targets.length; i++) {

        let current = targets[i];
        let weakenThreads = getWeakenThreads(ns, availRam, weakenRam, current);
        let growThreads = getGrowThreads(ns, availRam, growRam, current);
        let hackThreads = getHackThreads(ns, availRam, hackRam, current);
        const timeMax = 300000
        if (ns.getWeakenTime(current) > timeMax || ns.getGrowTime(current) > timeMax || ns.getHackTime(current) > timeMax){
          ns.tprint("did to act on" + current + "due to time requirments");
          continue;
        }

        if (Math.floor(ns.getServerSecurityLevel(current)) > ns.getServerMinSecurityLevel(current) && !checkRunning(ns, hosts, current) && weakenThreads > 0) {
          ns.print('Weakening ' + current + ' with ' + weakenThreads + ' threads' + ' on ' + currentHost)
          ns.exec('SimpleScripts/Weaken.js', currentHost, weakenThreads, current);
          continue;
        }
        else if (Math.ceil(ns.getServerMoneyAvailable(current)) < ns.getServerMaxMoney(current) && !checkRunning(ns, hosts, current) && growThreads > 0) {
          ns.print('Growing ' + current + ' with ' + growThreads + ' threads' + ' on ' + currentHost)
          ns.exec('SimpleScripts/Grow.js', currentHost, growThreads, current);
          continue;
        }
        else if (!checkRunning(ns, hosts, current) && hackThreads > 0) {
          ns.print('Hacking ' + current + ' with ' + hackThreads + ' threads' + ' on ' + currentHost);
          ns.exec('SimpleScripts/Hack.js', currentHost, hackThreads, current)
          continue;
        }
        await ns.sleep(10);
      }
    }
    // Recompiles all lists
    //masterHosts = await listAllHosts(ns, "home"); The masteHost list should never need to be recompiled
    targets = getTargets(ns, masterHosts);
    hosts = getHosts(ns, masterHosts);
    await ns.sleep(waitTime)
  }
}


export function checkRunning(ns, hosts, arg) {
  for (let i = 0; i < hosts.length; i++) {
    let weaken = ns.isRunning('SimpleScripts/Weaken.js', hosts[i], arg)
    let grow = ns.isRunning('SimpleScripts/Grow.js', hosts[i], arg)
    let hack = ns.isRunning('SimpleScripts/Hack.js', hosts[i], arg)
    if (weaken || grow || hack)
      return true;
  }
  return false;
}


/**@returns the number of threads needed to weaken to minimum
 * @returns max threads that can be used
 * 
 * @param {NS} ns
*/
export function getWeakenThreads(ns, availRam, weakenRam, current) {
  let i = 1
  let maxThreads = Math.floor(availRam / weakenRam)
  while (i <= maxThreads) {
    if (ns.getServerSecurityLevel(current) - ns.weakenAnalyze(i) <= ns.getServerMinSecurityLevel(current)) {
      return (i);
    }
    i++
  }
  return (maxThreads);
}


/**@returns the number of threads needed to grow to maximum
 * @returns max threads that can be used
 * 
 * @param {NS} ns
*/
export function getGrowThreads(ns, availRam, growRam, current) {
  let maxThreads = Math.floor(availRam / growRam)
  let serverMax = ns.getServerMaxMoney(current);
  let serverCurent = ns.getServerMoneyAvailable(current);
  //let required = Math.ceil(ns.growthAnalyze(serverMax/serverCurent));
  let required = Math.ceil(ns.growthAnalyze(current, Math.ceil(serverMax/serverCurent)))
  //ns.tprint(current+" Max = "+ serverMax +" Current = "+serverCurent+" Mod = "+ Math.ceil(serverMax/serverCurent)+"("+Math.ceil(serverMax/serverCurent)*Math.ceil(serverCurent)+")");
  if (required > maxThreads) {
    return maxThreads;
  }
  return required;
}


/**@returns the number of threads needed to Hack to all money from a server
 * @returns max threads that can be used
*/
export function getHackThreads(ns, availRam, hackRam, current) {
  let maxThreads = Math.floor(availRam / hackRam)
  let required = Math.ceil(ns.hackAnalyzeThreads(current, ns.getServerMoneyAvailable(current) / 2))
  if (required > maxThreads) {
    return maxThreads;
  }
  return required;
}


/**Pushes files to host if they dont exist*/
function pushFiles(ns, current) {
  if (!ns.fileExists('SimpleScripts/Hack.js', current))
    ns.scp('SimpleScripts/Hack.js', current, 'home');
  if (!ns.fileExists('SimpleScripts/Grow.js', current))
    ns.scp('SimpleScripts/Grow.js', current, 'home');
  if (!ns.fileExists('SimpleScripts/Weaken.js', current))
    ns.scp('SimpleScripts/Weaken.js', current, 'home');
}


/**
 *  Get listing of all hosts on the network.
 *  This function was not writen by me.
 *
 *  @param {NS} ns
 *  @param {string} rootHost
 *  @param {Set} found
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


export function getTargets(ns, masterHosts) {
  let targetList = []
  for (let i = 0; i < masterHosts.length; i++)
    if (ns.getServerMaxMoney(masterHosts[i]) > 0 && ns.hasRootAccess(masterHosts[i]))
      targetList.push(masterHosts[i]);
  return targetList;
}


export function getHosts(ns, masterHosts) {
  let hostList = [];
  for (let i = 0; i < masterHosts.length; i++)
    if (masterHosts[i].includes('Diavel'))//Change this string to reflect server names
      hostList.push(masterHosts[i]);
  if (hostList.length < 25) {
    hostList = []
    let weakHostList = getWeakHosts(ns, masterHosts);
    for (let i = 0; i < weakHostList.length; i++)
      hostList.push(weakHostList[i]);
  }
  return hostList;
}

export function getWeakHosts(ns, masterHosts) {
  let weakHostList = [];
  for (let i = 0; i < masterHosts.length; i++)
    if (ns.hasRootAccess(masterHosts[i]) && masterHosts[i] != 'home')
      weakHostList.push(masterHosts[i]);
  return weakHostList;
}
