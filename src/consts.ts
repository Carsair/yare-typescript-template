// Todo: redo to ge rid of unknown, use replace instead of regex?
const myNameMatch = base.id.match(/base_(.+)/)
const enemyNameMatch = enemy_base.id.match(/base_(.+)/)
const myName = myNameMatch ? myNameMatch[1] : "unknown"
const enemyName = enemyNameMatch ? enemyNameMatch[1] : "unknown"

const isSouthSpawn = base.position[0] === 2600
const myStar = isSouthSpawn ? star_a1c : star_zxq;
const enemyStar = isSouthSpawn ? star_zxq : star_a1c;
const enemySpirits = Object.keys(spirits).map((s: string) => spirits[s]).filter((s: Spirit) => s.id.indexOf(myName) < 0) // Todo: Check with regex
const enemySize = enemySpirits[0].size
const mySize = my_spirits[0].size

const SHAPES = {
  CIRCLE: "circle",
  TRIANGLE: "triangle",
  SQUARE: "square"
};

const Consts = {
  SHAPES,
  myName,
  enemyName,
  myStar,
  enemyStar,
  middleStar: star_p89,
  myBase: base,
  enemyBase: enemy_base,
  mySpirits: my_spirits,
  enemySpirits,
  myAliveSpirits: my_spirits.filter((s: Spirit) => s.hp),
  enemyAliveSpirits: enemySpirits.filter((s: Spirit) => s.hp),
  mySize: my_spirits[0].size,
  enemySize: enemySpirits[0].size,
  myShape: mySize == 1 ? 'circle' : (enemySize == 3 ? 'triangle' : 'square'),
  enemyShape: enemySize == 1 ? 'circle' : (enemySize == 3 ? 'triangle' : 'square'),
  playerTotalEnergies: Object.keys(spirits).reduce((acc, id) => {
    const s = spirits[id];
    if (!s.hp) return acc;
    if (s.id.indexOf(myName) >= 0) {
      acc[0] += s.energy
    } else {
      acc[1] += s.energy
    }
    return acc
  }, [0, 0]),
  NEW_SPAWN_POS: isSouthSpawn ? [2620,1760] as Position : [1580,640] as Position
}

export default Consts
