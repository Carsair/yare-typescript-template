import Consts from "./consts"
import Gather from "./gather"
import Strategies from "./strategies"
import Fight from "./fight"

export default {
  main: () => {
    const fightingSpirits = [...Consts.myAliveSpirits]

    Strategies.squareJumpEnemy(fightingSpirits)

    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // Utils.shout(spirit, "fight/strategy" + spirit.id)

      const match = spirit.id.match(/Carsair_(\d+)/)
      const permIdx = match ? parseInt(match[1]) : 1
      Gather.gatherAlwaysNearStar(spirit) // Questionable
      // Strategies.chargeOutpostStrategy(spirit, permIdx)
      // Strategies.avoidOutpostStrategy(spirit, permIdx)
      // Strategies.indexProngedAttack(spirit, permIdx)

      // Merge.mergeTogetherStrategy(spirit)
      // spirit.move(enemy_base.position)
      // Prod strategy


      Fight.fightSmart(spirit, permIdx)
      Fight.fightBasic(spirit)
      Fight.fightToWin(spirit)
    }
  }
}
