import Consts from "./consts"
import Gather from "./gather"
import Geometry from "./geometry"
import Utils from "./utils"

const Fight = {
  fightBasic: (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) {
      const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestShootSpirit(spiritEnemiesBeamable, spirit)
      if (closestEnemyToMe) {
        spirit.energize(closestEnemyToMe)
        closestEnemyToMe.energy -= spirit.size * 2
        spirit.energy -= spirit.size
      }
    }
  },

  fightBaseEmergency: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      return
    }

    const baseEnemies = base.sight.enemies
      .map((s) => spirits[s])
      .filter((s) => {
        return Geometry.calcDistance(s.position, base.position) < 220
      })

    if (baseEnemies.length > 0) {
      console.log("Base emergency!");
      if (spirit.energy / spirit.energy_capacity <= .31) {
        spirit.set_mark("empty")
        return Gather.gatherClosestStar(spirit, [Consts.myStar])
      }

      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(Geometry.calcPointBetweenPoints(closestEnemyToMe.position, spirit.position, Consts.specialProximity))
        }
      }
    }
  },

  fightForTheStar: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      return
    }

    const starAttackers = Consts.enemyAliveSpirits.filter((es) => {
      return Geometry.calcDistance(es.position, Consts.myStar.position) < 400
    })
    if (starAttackers.length > 0) {
      console.log("Star under attack!");
      if (spirit.energy / spirit.energy_capacity <= .31) {
        spirit.set_mark("empty")
        return Gather.gatherClosestStar(spirit, [Consts.myStar])
      }
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(starAttackers, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(Geometry.calcPointBetweenPoints(closestEnemyToMe.position, spirit.position, Consts.specialProximity))
        }
      }
    }
  },

  fightForTheBase: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      return
    }

    const baseEnemies = Consts.enemyAliveSpirits.filter((es) => {
      return Geometry.calcDistance(es.position, base.position) < 500
    })
    if (baseEnemies.length > 0) {
      console.log("Base under attack!");
      if (spirit.energy / spirit.energy_capacity <= .31) {
        spirit.set_mark("empty")
        return Gather.gatherClosestStar(spirit, [Consts.myStar])
      }
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(Geometry.calcPointBetweenPoints(closestEnemyToMe.position, spirit.position, Consts.specialProximity))
        }
      }
    }
  },

  fightSmart: (spirit: Spirit, idx: number, strategyLevel?: number) => {
    if (spirit.mark == "empty") {
      return
    }

    if (spirit.sight.enemies.length > 0) {
      const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(spiritEnemiesNearby, spirit);
      if (closestEnemyToMe && spirit.energy > 0) {
        const aggressionOptions = [
          (spirit.energy / spirit.energy_capacity) >= (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity), // 0 not safe
          (spirit.energy / spirit.energy_capacity) > (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity), // 1 safe
          spirit.energy > closestEnemyToMe.energy, // 2 even safer
          spirit.energy == spirit.energy_capacity, // 3 only when max
          spirit.energy > 5, // 4 something aggressive
          spirit.energy > 1, // 5 something aggressive
          false // 6 always run
        ]
        const aggressionLevel = strategyLevel !== undefined ? strategyLevel : 1

        if (!(aggressionOptions[aggressionLevel])) {
          if (closestDistanceToMe < 200) {
            spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
          } else if (closestDistanceToMe < 280) {
            spirit.move(Geometry.calcTangentWithIndex(spirit, closestEnemyToMe, 240, idx))
          }
        } else {
          if (closestDistanceToMe > 200) {
            spirit.move(Geometry.calcPointBetweenPoints(closestEnemyToMe.position, spirit.position, Consts.specialProximity))
          }
        }
      }
    }
  },

  fightToWin: (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) return // Fight basic

    const enemyStructs = spirit.sight.structures.filter((s) => s.indexOf("Carsair") < 0 && s.indexOf("base") >= 0)
    if (enemyStructs.length > 0) {
      spirit.energize(enemy_base)
    }
  }
}

export default Fight
