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
        closestEnemyToMe.energy = closestEnemyToMe.energy - spirit.size * 2
        // if (closestDistanceToMe < 200) {
        //   spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
        // }
      }
    }
  },

  fightBaseEmergency: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      const starArr = tick < 100 ? [Consts.myStar] : [Consts.myStar, Consts.middleStar]
      return Gather.gatherClosestStar(spirit, starArr)
    }

    const baseEnemies = base.sight.enemies
      .map((s) => spirits[s])
      .filter((s) => Geometry.calcDistance(s.position, base.position) < 220)
    if (baseEnemies.length > 0) {
      console.log("Base emergency!");
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
      if (spirit.energy == 0) {
        memory[spirit.id] = memory[spirit.id] || {}
        memory[spirit.id].status = "depleted"
      }
      if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
        Gather.gatherClosestStar(spirit, [Consts.myStar])

        if (spirit.energy == spirit.energy_capacity) {
          memory[spirit.id].status = ""
        }
      }
    } else if (memory[spirit.id] && memory[spirit.id].status) {
      memory[spirit.id].status = ""
    }
  },

  fightForTheStar: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      const starArr = tick < 100 ? [Consts.myStar] : [Consts.myStar, Consts.middleStar]
      return Gather.gatherClosestStar(spirit, starArr)
    }

    const starAttackers = Consts.enemyAliveSpirits.filter((es) => {
      return Geometry.calcDistance(es.position, Consts.myStar.position) < 400
    })
    if (starAttackers.length > 0) {
      console.log("Star under attack!");
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(starAttackers, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
      if (spirit.energy == 0) {
        memory[spirit.id] = memory[spirit.id] || {}
        memory[spirit.id].status = "depleted"
      }
      if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
        Gather.gatherClosestStar(spirit, [Consts.myStar])

        if (spirit.energy == spirit.energy_capacity) {
          memory[spirit.id].status = ""
        }
      }
    } else if (memory[spirit.id] && memory[spirit.id].status) {
      memory[spirit.id].status = ""
    }
  },

  fightForTheBase: (spirit: Spirit) => {
    if (spirit.mark == "empty") {
      const starArr = tick < 100 ? [Consts.myStar] : [Consts.myStar, Consts.middleStar]
      return Gather.gatherClosestStar(spirit, starArr)
    }
    const baseEnemies = Consts.enemyAliveSpirits.filter((es) => {
      return Geometry.calcDistance(es.position, Consts.myStar.position) < 400
    })
    if (baseEnemies.length > 0) {
      console.log("Base under attack!");
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
      if (spirit.energy == 0) {
        memory[spirit.id] = memory[spirit.id] || {}
        memory[spirit.id].status = "depleted"
      }
      if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
        Gather.gatherClosestStar(spirit, [Consts.myStar])

        if (spirit.energy == spirit.energy_capacity) {
          memory[spirit.id].status = ""
        }
      }
    } else if (memory[spirit.id] && memory[spirit.id].status) {
      memory[spirit.id].status = ""
    }
  },

  fightSmart: (spirit: Spirit, idx: number) => {
    if (spirit.sight.enemies.length > 0) {
      const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(spiritEnemiesNearby, spirit);
      if (closestEnemyToMe && spirit.energy > 0) {
        const weFuller = (spirit.energy / spirit.energy_capacity) > (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity)
        const weBigger = spirit.energy >= closestEnemyToMe.energy
        const weOverHalf = spirit.energy / spirit.energy_capacity
        const shouldAggress = Consts.enemyShape == 'circle' ? weFuller : weBigger

        // We bigger to be more avoidance, weFuller to go for it vs bigger shapes
        // if (false) {
        if (!(weOverHalf)) {

        // if (!(weFuller)) {
        // if (!(weBigger)) {
        // if (!(shouldAggress)) {
          if (closestDistanceToMe < 200) {
            spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
          } else if (closestDistanceToMe < 300) {
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
