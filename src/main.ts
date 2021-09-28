import Consts from './consts'
import Circles from './circles'
import Squares from './squares'
import Triangles from './triangles'

// ///

// /// MAIN
// /// Basic game state logging, shape setup, and error handling - no need to edit.
// /// Most of your strategy code should go in the individual shape files.

// ///
try {
  console.log(`Battle: ${Consts.myName} (${Consts.myShape})  versus  ${Consts.enemyName} (${Consts.enemyShape})`)
  console.log(`${Consts.myName}: ${Consts.playerTotalEnergies[0]} energy, ${Consts.myAliveSpirits.length} spirits alive, ${Consts.mySpirits.length} total spirits created`)
  console.log(`${Consts.enemyName}: ${Consts.playerTotalEnergies[1]} energy, ${Consts.enemyAliveSpirits.length} spirits alive, ${Consts.enemySpirits.length} total spirits created`)

  if (Consts.myShape === Consts.SHAPES.SQUARE) {
    Squares.main()
  } else if (Consts.myShape === Consts.SHAPES.TRIANGLE) {
    Triangles.main()
  } else {
    Circles.main()
  }
} catch (e) {
  console.log(e.message)
}
