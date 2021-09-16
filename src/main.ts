import Geometry from './geometry'
import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"
import Merge from './merge'
import Utils from './utils'

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
    let potentialGatherSpiritsClose = [] as Spirit[]
    let potentialGatherSpiritsFar  = [] as Spirit[]
    Consts.myAliveSpirits.forEach((s) => {
      if (Geometry.calcDistance(Consts.myNexusPos, s.position) < 500) potentialGatherSpiritsClose.push(s)
      else potentialGatherSpiritsFar.push(s)
    })
    // const potentialGatherSpiritsFarSorted = potentialGatherSpiritsFar.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, Consts.myNexusPos) -  Geometry.calcDistance(spiritA.position, Consts.myNexusPos))
    const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar]
    const gatherSpirits = potentialGatherSpirits.slice(0, Consts.MAX_GATHERERS)
    const leftoverSpirits = potentialGatherSpirits.slice(Consts.MAX_GATHERERS)

    const extraNeeded = 35
    const amountToMidGather = 20
    const haveEnoughExtra = tick > 100 && Consts.myAliveSpirits.length - Consts.MAX_GATHERERS > extraNeeded
    const totalGatherersNeeded = haveEnoughExtra ? Consts.MAX_GATHERERS + amountToMidGather : Consts.MAX_GATHERERS
    // const potentialGatherSpirits = [...Consts.myAliveSpirits]
    // const potentialGatherSpirits = Consts.myAliveSpirits.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, Consts.myNexusPos) -  Geometry.calcDistance(spiritA.position, Consts.myNexusPos))
    let midGatherers = [] as Spirit[];

    if (haveEnoughExtra) {
      const existingMGs = leftoverSpirits.filter((s) => {
        return memory[s.id] && memory[s.id].midGather
      })
      let newMGs = [] as Spirit[];
      if (existingMGs.length < amountToMidGather) {
        newMGs = leftoverSpirits.slice(0, amountToMidGather - existingMGs.length)
      } else {
        newMGs = []
      }
      newMGs.forEach((s) => {memory[s.id] = {midGather: true}})
      midGatherers = [...existingMGs, ...newMGs]
    }
    let fightingSpirits = leftoverSpirits.filter((s) => {
      return !(memory[s.id] && memory[s.id].midGather)
    });

    const transitionTime = 35
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
      if (tick < transitionTime) Gather.gatherHaulingMyBase(spirit, Consts.myStar)
      Fight.fightForTheStar(spirit)
      // Fight.fightBaseEmergency(spirit)
      Fight.fightBasic(spirit)
    }


    // const midGatherers = !haveEnoughExtra ? [] : leftoverSpirits.slice(0, amountToMidGather)
    // const fightingSpirits = !haveEnoughExtra ? [...leftoverSpirits] : leftoverSpirits.slice(amountToMidGather)
    console.log('haveEnoughExtra: ', haveEnoughExtra, midGatherers.length, fightingSpirits.length);
    for (let i = 0; i < midGatherers.length; i++) {
      const spirit = midGatherers[i]
      Utils.shout(spirit, "gather" + spirit.id)
      Gather.gatherHauling(spirit, Consts.middleStar) // when we have center secured
    }


    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // Utils.shout(spirit, "fight/strategy" + spirit.id)

      const match = spirit.id.match(/Carsair_(\d+)/)
      const permIdx = match ? parseInt(match[1]) : 1
      Gather.gatherAlwaysNearStar(spirit) // Questionable
      Strategies.chargeOutpostStrategy(spirit, permIdx)
      Strategies.avoidOutpostStrategy(spirit, permIdx)
      // Strategies.indexProngedAttack(spirit, permIdx)

      // Merge.mergeTogetherStrategy(spirit)
      // spirit.move(enemy_base.position)
      // Prod strategy

      Fight.fightSmart(spirit, permIdx)  // Comment to not run away
      Fight.fightForTheStar(spirit)
      Fight.fightForTheBase(spirit)
      Fight.fightBasic(spirit)
      Fight.fightToWin(spirit)
    }
  }
  main()


} catch (e) {
  console.log(e.message)
}
