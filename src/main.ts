import Geometry from './geometry'
import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"

try {

  ///

  /// BUSINESS UTILS

  ///

  const getMaxGather = () => {
    // return 4
    // return 6
    // return 7
    // return 8
    // return 9
    // return 12
    // return 16
    // return 20
    // return 24
    // return 28
    return 30
    // return 36
    // return 12
    // return 4
    // return 52
    // return 152
    // if (tick < 50) return 12
    // if (tick < 100) return 12
    // if (tick < 150) return 12
    // if (tick < 200) return 16
    // if (tick < 250) return 16
    // if (tick < 300) return 16
    // if (tick < 350) return 16
    // if (tick < 400) return 16
    // if (tick < 450) return 40
    // if (tick < 500) return 48
    return Math.round((0.1 * tick + 16))
  }

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

    const transitionTime = 2
    if (tick >= transitionTime) {
      const indexLimit = Math.round(gatherSpirits.length * .27)
      const gatherBasers = gatherSpirits.slice(0, indexLimit)
      const gatherHaulers = gatherSpirits.slice(indexLimit)
      Gather.gatherBase(gatherBasers)
      Gather.gatherChainHauling(gatherHaulers, gatherBasers)
    }

    for (let idx = 0; idx < gatherSpirits.length; idx++) {
      const spirit = gatherSpirits[idx]
      // Prod strategy
      if (tick < transitionTime) Gather.gatherDumpSimple(spirit)
      Fight.fightBaseEmergency(spirit)
      Fight.fightBasic(spirit)
    }

    const fightingSpirits = [...leftoverSpirits]
    // fightAggressive3(fightingSpirits)
    // Merge.moveWithBuddy(fightingSpirits)
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
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
