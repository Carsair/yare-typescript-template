import Geometry from './geometry'

const isSouthSpawn = base.position[0] === 2600
const myStar = isSouthSpawn ? star_a1c : star_zxq;
const enemySpirits = Object.keys(spirits).map((s: string) => spirits[s]).filter((s: Spirit) => s.id.indexOf("Carsair") < 0)
const enemySize = enemySpirits[0].size
const mySize = my_spirits[0].size

const Consts = {
  isSouthSpawn: isSouthSpawn,
  myStar: isSouthSpawn ? star_a1c : star_zxq,
  enemyStar: isSouthSpawn ? star_zxq : star_a1c,
  middleStar: star_p89,
  myNexusPos: Geometry.calcAveragePos(myStar.position, base.position),
  myAliveSpirits: my_spirits.filter((s: Spirit) => s.hp),
  enemySpirits: Object.keys(spirits).map((s: string) => spirits[s]).filter((s: Spirit) => s.id.indexOf("Carsair") < 0),
  enemyAliveSpirits: enemySpirits.filter((s: Spirit) => s.hp),
  enemySize: enemySpirits[0].size,
  mySize: my_spirits[0].size,
  enemyShape: enemySize == 1 ? 'circle' : (enemySize == 3 ? 'triangle' : 'square'),
  myShape: mySize == 1 ? 'circle' : (enemySize == 3 ? 'triangle' : 'square'),
  playerTotalEnergies: Object.keys(spirits).reduce((acc, id) => {
    const s = spirits[id];
      if (!s.hp) return acc
    if (s.id.indexOf("Carsair") >= 0) {
      acc[0] += s.energy
    } else {
      acc[1] += s.energy
    }
    return acc
  }, [0, 0]),
  MAX_GATHERERS: 24,
  plannedEnergyObj: {},
  desiredStarEnergy: Math.min(970, Math.pow(tick, 1.35)),
  CLOSE_TO_STAR_POS: Geometry.calcPointBetweenPoints(myStar.position, base.position, 199),
  CLOSE_TO_BASE_POS: Geometry.calcPointBetweenPoints(base.position, myStar.position, 199),
  MIDDLE_POINT_POS: Geometry.calcAveragePos(base.position, myStar.position),
  NEW_SPAWN_POS: isSouthSpawn ? [2620,1760] as Position : [1580,640] as Position
}

export default Consts
