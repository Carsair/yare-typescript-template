import Geometry from './geometry'
import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"
import Merge from './merge'
import Utils from './utils'
import Circles from './circles'
import Squares from './squares'


try {
  console.log("Enemy Shape: ", Consts.enemyShape, Consts.enemySize)
  console.log("We have", my_spirits.length, Consts.myAliveSpirits.length, "(alive)", Consts.MAX_GATHERERS, "(gather)")
  console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, Consts.enemyAliveSpirits.length, "(alive)")
  console.log("Planning for tick, star: ", tick, Consts.desiredStarEnergy)
  console.log("Planning for energies: us:", Consts.playerTotalEnergies[0], " them: ", Consts.playerTotalEnergies[1])

  // ///

  // /// MAIN

  // ///
  Circles.main()
  // Squares.main()


} catch (e) {
  console.log(e.message)
}
