import Consts from "./consts"
import Geometry from "./geometry"
import Utils from "./utils"

const Merge = {
  moveWithBuddy: (spiritArr: Spirit[]) => {
    spiritArr.forEach((spirit, idx) => {
      const sizeIdeal = 2//enemySize*10/2 //1//3//enemySize/5+1
      const buddy = spiritArr[idx-1]
      if (spirit.size >= sizeIdeal && spirit.energy < spirit.energy_capacity) {
        Consts.myShape == 'circle' && spirit.divide && spirit.divide()
      } else if (buddy && buddy.size < sizeIdeal && spirit.energy == spirit.energy_capacity) {
        if (Geometry.calcDistance(spirit.position, buddy.position) > 10) spirit.move(buddy.position)
        spirit.merge && spirit.merge(buddy)
      }
    })
  },

  mergeTogetherStrategy: (spirit: Spirit) => {
    const maxCapac = 10 * Consts.enemyAliveSpirits[0].energy_capacity;
    if (spirit.sight.friends.length > 0) {
      const friendsNearby = spirit.sight.friends.map((s) => spirits[s])
      const { closestSpirit: closestFriendToMe, closestDistance: closestDistanceToMe } = Utils.calcClosestSpirit(friendsNearby, spirit);
      if (closestFriendToMe) {
        if (closestDistanceToMe <= 10 &&
          spirit.energy_capacity + closestFriendToMe.energy_capacity <= maxCapac) {
          spirit.shout(closestFriendToMe.id)
          if (spirit.merge) spirit.merge(closestFriendToMe)
        }
      }
    }
  }
}

export default Merge