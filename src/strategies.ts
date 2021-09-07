import Consts from "./consts";
import Fight from "./fight";
import Gather from "./gather";

const Strategies = {
  spreadAttack: (spiritsArr: Spirit[]) => {
    // move to outpost,
    // move to outpost star
  },
  chargeOutpostStrategy: (spirit: Spirit) => {
    // If we control the outpost, normal moves, perhaps energize it
    // If enemy controls the outpost, avoid the range if we're too close
    // Eventuallly do maybe a sum of friend/enemy energy within outpost range
    // const enemyControlsOutpost = true//outpost.control ? outpost.control.indexOf("Carsair") < 0 : false;
    const enemyControlsOutpost = (outpost as any).control.indexOf("Carsair") < 0;
    // const outpostRange = 200; //typescript making me out 400 because ?range
    // if (enemyControlsOutpost && calcDistance(spirit.position, outpost.position) <  outpostRange + 20) {
    //   spirit.move(calcRunAwayPoint(spirit, outpost))
    //   return
    // }
    const outpostStructs = spirit.sight.structures.filter((s) => s.indexOf("outpost") >= 0)
    const enemyBaseStructs = spirit.sight.structures.filter((s) => s.indexOf(enemy_base.id) >= 0)

    if (spirit.mark == "empty") {
      Gather.gatherClosestStar(spirit, [Consts.middleStar, Consts.myStar])
      return
    }

    if (spirit.energy == 0) {
      Gather.gatherClosestStar(spirit, [Consts.middleStar, Consts.myStar])
      return
    }
    // const outpost = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
    // if (spirit.energy >= 8) return gatherClosestStar(spirit)
    // let strategyDestination
    // if (outpost.energy < 725) strategyDestination = outpost.position
    // else strategyDestination = enemy_base.position
    if (outpostStructs.length > 0 && spirit.energy > 0 && (outpost.energy < 725 || enemyControlsOutpost)) {
      spirit.energy -= spirit.size
      outpost.energy += spirit.size
      spirit.energize(outpost)
    } else if (enemyControlsOutpost && spirit.energy > 0) {
      spirit.move(outpost.position)
    } else if (!enemyControlsOutpost && spirit.energy > 0 && outpost.energy >= 725 && enemyBaseStructs.length == 0) {
      // spirit.move(Consts.enemyStar.position)
      spirit.move(enemy_base.position)
    } else {
      spirit.move(Consts.OUTPOST_MAINT_POS)
      Fight.fightSmart(spirit)
    }
    // console.log("outpost?", outpostStructs)
    // console.log("outpost structs?", spirit.sight.structures)
    // spirit.move(outpost.position)
    // let defendPoint;
    // defendPoint = Geometry.calcTangentPointFromPoint(spirit, outpost, 620)
    // if (parseInt(spirit.id.split('_')[1]) % 2 == 1) defendPoint = Geometry.calcClockwiseTangentPointFromPoint(spirit, outpost, 620)

    // if (Array.isArray(defendPoint)) {
    //   const seedX = 0//Math.floor(Math.random() * 100) - 50
    //   const seedY = 0//Math.floor(Math.random() * 100) - 50
    //   spirit.move([defendPoint[0]+seedX, defendPoint[1]+seedY]);
    // }
  },
  moveEnemy: (spirit: Spirit) => {
    spirit.move(enemy_base.position)
  }
}

export default Strategies
