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
  // ///

  // /// MAIN

  // ///
  Circles.main()
  // Squares.main()


} catch (e) {
  console.log(e.message)
}
