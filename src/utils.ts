import Geometry from "./geometry";

export default {
  getMaxGather: () => {
    // return 1
    // return 2
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
    // return 30
    // return 34
    // return 36
    // return 40
    // return 44
    // return 46
    // return 48
    // return 50
    // return 52
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
    // if (tick < 200) return 16
    // if (tick < 250) return 16
    // if (tick < 300) return 16
    // if (tick < 350) return 16
    // if (tick < 400) return 16
    // if (tick < 450) return 40
    // if (tick < 500) return 48
    return Math.min(68, Math.round((0.1 * tick + 22)))
  },
  shout: (spirit: Spirit, message: string) => {
    spirit.shout(('' + message).substring(0, 20))
  },
  calcClosestSpirit: (spiritsArr: Spirit[], point: Entity) => {
    let closestSpirit = null;
    let closestDistance = Infinity;
    for (let j = 0; j < spiritsArr.length; j++) {
      const enemy = spiritsArr[j];
      const distance = Geometry.calcDistance(point.position, enemy.position);

      if (distance < closestDistance) {
        closestSpirit = enemy
        closestDistance = distance
      }
    }

    return { closestSpirit, closestDistance }
  },

  calcClosestShootSpirit: (spiritsArr: Spirit[], point: Entity) => {
    let closestSpirit = null;
    let closestDistance = Infinity;
    for (let j = 0; j < spiritsArr.length; j++) {
      const enemy = spiritsArr[j];
      const distance = Geometry.calcDistance(point.position, enemy.position);

      if (distance < closestDistance &&
        enemy.energy >= 0) {
        closestSpirit = enemy
        closestDistance = distance
      }
    }

    return { closestSpirit, closestDistance }
  },

  getSpiritsWithinRange: (spirit: Spirit, spiritsArr: Spirit[], range: number) => {
    let closestEnemy = null;
    let closestDistance = Infinity;
    for (let j = 0; j < spiritsArr.length; j++) {
      const enemy = spiritsArr[j];
      const distance = Geometry.calcDistance(spirit.position, enemy.position);

      if (distance < closestDistance) {
        closestEnemy = enemy
        closestDistance = distance
      }
    }
    if (closestEnemy) {
      return [closestEnemy, closestDistance]
    } else {
      return [null, null]
    }
  }
}
