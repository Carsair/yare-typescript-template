import Geometry from './geometry'
import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"
import Merge from "./merge"
import Utils from './utils'

const getMaxGather = () => {
  // return 1
  // return 2
  // return 3
  // return 4
  // return 6
  // return 7
  // return 8
  // return 9
  // return 12
  // return 16
  // return 18  // max for triangles seems to be 18
  // return 20
  // return 22
  // return 24
  // return 26
  // return 28
  // return 30
  // return 32
  // return 34
  // return 36
  // return 38
  // return 40
  // return 42
  // return 44
  // return 46
  // return 48
  // return 50
  // return 52
  // return 54
  // return 58
  // return 62
  // return 66
  // return 68
  // return 72
  // return 76
  // return 152
  // if (tick < 50) return 12
  // if (tick < 100) return 12
  // if (tick < 150) return 12
  // if (tick < 55) return 16
  // if (tick < 100) return 18
  // if (tick < 100) return Math.max(0, Consts.myAliveSpirits.length - 2)
  // if (tick < 150) return Math.min(68, Math.round((0.06 * tick + 12)))
  // if (tick < 300) return 16
  // if (tick < 200) return 40
  // if (tick < 400) return 16
  // if (tick < 450) return 40
  // if (tick < 500) return 48
  return Math.min(60, Math.round(Math.pow(tick, 1.15)/10 + 14))
  // return Math.min(60, Math.round((0.05 * 3 * Math.round(tick/3) + 16)))
}

export default {
  main: () => {
    const maxGatherers = getMaxGather()
    console.log("Enemy Shape: ", Consts.enemyShape, Consts.enemySize)
    console.log("We have", my_spirits.length, Consts.myAliveSpirits.length, "(alive)", maxGatherers, "(gather)")
    console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, Consts.enemyAliveSpirits.length, "(alive)")
    console.log("Planning for tick, star: ", tick, Consts.desiredStarEnergy)
    console.log("Planning for energies: us:", Consts.playerTotalEnergies[0], " them: ", Consts.playerTotalEnergies[1])


    // const midGathers = 0
    // const gathers = [] as Spirit[]
    // const fighters = [] as Spirit[]
    // const mids = [] as Spirit[]
    // const leftovers = [] as Spirit[]

    // Consts.myAliveSpirits.forEach((s) => {
    //   if (memory[s.id] && memory[s.id].gather) {
    //     gathers.push(s)
    //   } else if (memory[s.id] && memory[s.id].fighter) {
    //     fighters.push(s)
    //   } else if (memory[s.id] && memory[s.id].midGather) {
    //     mids.push(s)
    //   } else {
    //     leftovers.push(s)
    //   }
    // })

    // for (let idx = 0; idx < maxGatherers.length; idx++) {

    // }




    // Could sort this based on proximity to star or corner. (done-ish?)
    let potentialGatherSpiritsClose = [] as Spirit[]
    let potentialGatherSpiritsFar = [] as Spirit[]
    Consts.myAliveSpirits.forEach((s) => {
      if (Geometry.calcDistance(Consts.myNexusPos, s.position) < 500) potentialGatherSpiritsClose.push(s)
      else potentialGatherSpiritsFar.push(s)
    })
    // const potentialGatherSpiritsFarSorted = potentialGatherSpiritsFar.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, Consts.myNexusPos) -  Geometry.calcDistance(spiritA.position, Consts.myNexusPos))
    const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar]
    const gatherSpirits = potentialGatherSpirits.slice(0, maxGatherers)
    const leftoverSpirits = potentialGatherSpirits.slice(maxGatherers)

    const extraNeeded = 20
    const amountToMidGather = 20
    const haveEnoughExtra = tick > 100 && Consts.myAliveSpirits.length - maxGatherers > extraNeeded
    const totalGatherersNeeded = haveEnoughExtra ? maxGatherers + amountToMidGather : maxGatherers
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
      newMGs.forEach((s) => { memory[s.id] = { midGather: true } })
      midGatherers = [...existingMGs, ...newMGs]
    }
    let fightingSpirits = !haveEnoughExtra ? leftoverSpirits : leftoverSpirits.filter((s) => {
      return !(memory[s.id] && memory[s.id].midGather)
    })

    const transitionTime = 5
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
      // Fight.fightForTheStar(spirit)
      Fight.fightBaseEmergency(spirit)
      // Fight.fightForTheBase(spirit)
      Fight.fightBasic(spirit)
    }

    // const midGatherers = !haveEnoughExtra ? [] : leftoverSpirits.slice(0, amountToMidGather)
    // const fightingSpirits = !haveEnoughExtra ? [...leftoverSpirits] : leftoverSpirits.slice(amountToMidGather)
    console.log('haveEnoughExtra: ', haveEnoughExtra, midGatherers.length, fightingSpirits.length);
    for (let i = 0; i < midGatherers.length; i++) {
      const spirit = midGatherers[i]
      spirit.divide && spirit.divide()
      // Utils.shout(spirit, "gather" + spirit.id)
      Gather.gatherHauling(spirit, Consts.middleStar) // when we have center secured
    }

    fightingSpirits = fightingSpirits.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, base.position) -  Geometry.calcDistance(spiritA.position, base.position))
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // Utils.shout(spirit, "fight/strategy" + spirit.id)

      const match = spirit.id.match(/Carsair_(\d+)/)
      const permIdx = match ? parseInt(match[1]) : 1
      Gather.gatherAlwaysNearStar(spirit) // Questionable
      Strategies.chargeOutpostStrategy(spirit, permIdx, 725)
      // Strategies.avoidOutpostStrategy(spirit, permIdx)
      // Strategies.indexProngedAttack(spirit, permIdx)



      if (spirit.mark != "empty") {
        // Merge.mergeTogetherStrategy(spirit)


        // spirit.shout("candidate")
        // Strategies.indexProngedAttack(spirit, permIdx)

        // spirit.move(Consts.CLOSE_TO_BASE_POS) //Secret close to base
        // spirit.move(base.position)
        // Merge.mergeTogetherStrategy(spirit)
        // spirit.move(Consts.NEW_SPAWN_POS) //Better?

        // spirit.move(Geometry.calcRunAwayPoint(enemy_base, Consts.middleStar)) // behind them
        // spirit.move(Geometry.calcRunAwayPoint(Consts.middleStar, outpost)) // star mid?

        // spirit.move()
        // spirit.move(enemy_base.position) // enemy base
        // spirit.move(Consts.enemyStar.position)
        // spirit.move(Utils.fuzzyPos(Consts.enemyStar.position, 100))
        // spirit.move(Utils.fuzzyPos(enemy_base.position, 500))


        spirit.move(Utils.fuzzyPos(Consts.OUTPOST_MAINT_POS, 0)) //Oupost maint regular

        // if (Geometry.calcDistance(spirit.position, base.position) < 500) spirit.move(Utils.fuzzyPos(Consts.CLOSE_TO_BASE_POS, 0))

        // spirit.move(Utils.fuzzyPos(Consts.enemyStar.position, 50))
        // spirit.move(Consts.enemyStar.position)
        // spirit.move(Geometry.calcPointBetweenPoints(enemy_base.position, Consts.enemyStar.position, 1400))
        // spirit.move(Geometry.calcPointBetweenPoints(enemy_base.position, Consts.OUTPOST_MAINT_POS, 400))  // Bother big time

        // spirit.move(Consts.OUTPOST_MAINT_POS)
        if (spirit.size > 15) {
          if (spirit.sight.enemies_beamable.length == 0) {
            spirit.move(Geometry.calcPointBetweenPoints(enemy_base.position, Consts.OUTPOST_MAINT_POS, 400))  // Bother big time
            // Strategies.indexProngedAttack(spirit, permIdx)
            // Strategies.avoidOutpostStrategy(spirit, permIdx)
          }
          // Strategies.indexProngedAttack(spirit, permIdx)
          Gather.gatherWhenEmpty(spirit, .90)
        }
      }

      Strategies.avoidOutpostStrategy(spirit, permIdx)

      Gather.gatherWhenEmpty(spirit, .65)

      // Prod strategy
      if (spirit.size > 14) {
        Fight.fightSmart(spirit, permIdx, 0)  // Comment to not run away
      } else {
        Fight.fightSmart(spirit, permIdx, 0)
      }
      Fight.fightForTheStar(spirit)
      // if (spirit.size < 2) Fight.fightForTheBase(spirit)
      // if (Geometry.calcDistance(spirit.position, base.position) < 400) Fight.fightForTheBase(spirit)
      // Fight.fightForTheBase(spirit)
      Fight.fightBasic(spirit)
      Fight.fightToWin(spirit)
    }
  }
}
