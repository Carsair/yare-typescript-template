import Consts from "./consts";
import Geometry from "./geometry";

export default {
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
  },

  fuzzyPos: (pos: Position, fuzz: number) => {
    const fuzX = Math.round(Math.random() * fuzz) - fuzz/2
    const fuzY = Math.round(Math.random() * fuzz) - fuzz/2
    return [pos[0] + fuzX, pos[1] + fuzY] as Position
  }
}
