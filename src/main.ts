import Geometry from './geometry'
import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"

try {
  console.log("Enemy Shape: ", Consts.enemyShape, Consts.enemySize)
  console.log("We have", my_spirits.length, Consts.myAliveSpirits.length, "(alive)", Consts.MAX_GATHERERS, "(gather)")
  console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, Consts.enemyAliveSpirits.length, "(alive)")
  console.log("Planning for tick, star: ", tick, Consts.desiredStarEnergy)
  console.log("Planning for energies: us:", Consts.playerTotalEnergies[0], " them: ", Consts.playerTotalEnergies[1])

  // ///

  // /// MAIN

  // ///
  const main = () => {
    // Could sort this based on proximity to star or corner. (done-ish?)
    // var gatherSpirits = myAliveSpirits.slice(0, MAX_GATHERERS)
    let potentialGatherSpiritsClose = [] as Spirit[]
    let potentialGatherSpiritsFar  = [] as Spirit[]
    Consts.myAliveSpirits.forEach((s) => {
      if (Geometry.calcDistance(Consts.myNexusPos, s.position) < 500) potentialGatherSpiritsClose.push(s)
      else potentialGatherSpiritsFar.push(s)
    })
    potentialGatherSpiritsFar.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, Consts.myNexusPos) -  Geometry.calcDistance(spiritA.position, Consts.myNexusPos))
    const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar]
    const gatherSpirits = potentialGatherSpirits.slice(0, Consts.MAX_GATHERERS)
    const leftoverSpirits = potentialGatherSpirits.slice(Consts.MAX_GATHERERS)

    const transitionTime = 35
    if (tick >= transitionTime) {
      const indexLimit = Math.round(gatherSpirits.length * .27)
      const gatherBasers = gatherSpirits.slice(0, indexLimit)
      const gatherHaulers = gatherSpirits.slice(indexLimit)
      Gather.gatherBase(gatherBasers)
      Gather.gatherChainHauling(gatherHaulers, gatherBasers)
      // Gather.gatherInfiniteChain(gatherSpirits)
    }

    for (let idx = 0; idx < gatherSpirits.length; idx++) {
      const spirit = gatherSpirits[idx]
      // Prod strategy
      if (tick < transitionTime) Gather.gatherHauling(spirit)
      Fight.fightBaseEmergency(spirit)
      Fight.fightBasic(spirit)
    }

    const fightingSpirits = [...leftoverSpirits]
    // fightAggressive3(fightingSpirits)
    // Merge.moveWithBuddy(fightingSpirits)
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // Gather.gatherHauling(spirit)
      Strategies.chargeOutpostStrategy(spirit)
      // Prod strategy
      Fight.fightForTheBase(spirit)
      Fight.fightBasic(spirit)
      Fight.fightToWin(spirit)
    }
  }
  main()


} catch (e) {
  console.log(e.message)
}
