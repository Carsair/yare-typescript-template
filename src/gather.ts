import Consts from './consts'
import Geometry from './geometry'
import Utils from './utils'

const Gather = {
  gatherDumpSimple: (spirit: Spirit) => {
    const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0
    if (!isBaseBeamable) spirit.move(base.position)
    spirit.energize(base)
  },

  gatherHauling: (spirit: Spirit) => {
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    const isStarBeamable = Geometry.calcDistance(spirit.position, Consts.myStar.position) <= 200
    if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
      spirit.energize(base)
      spirit.energy -= spirit.size
    } else if (isStarBeamable && Consts.myStar.energy > Consts.desiredStarEnergy) {
      spirit.energize(spirit)
      spirit.energy += spirit.size
    }

    if (spirit.energy == spirit.energy_capacity) {
      spirit.set_mark("full")
    } else if (spirit.energy == 0) {
      spirit.set_mark("empty")
    }

    if (baseStructs.length == 0 && spirit.mark == "full") {
      spirit.move(base.position)
    } else if (!isStarBeamable && spirit.mark == "empty") {
      spirit.move(Consts.myStar.position)
    }
  },

  gatherBase: (spiritArr: Spirit[]) => {
    const safeEnergy = 0
    spiritArr.forEach((spirit) => {
      if (spirit.size > 1) Consts.myShape == 'circle' && spirit.divide && spirit.divide() // ???
      const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0
      spirit.move(Consts.CLOSE_TO_BASE_POS);
      (spirit as any).hasConnection = false
      if (isBaseBeamable &&
        base.energy < base.energy_capacity &&
        spirit.energy > 0 &&
        spirit.energy >= safeEnergy) {
        spirit.energize(base)
        spirit.energy -= spirit.size
        base.energy += spirit.size
      }
    })
  },

  gatherChainHauling: (spiritArr: Spirit[], connectionArr: Spirit[]) => {
    const safeEnergy = 0
    spiritArr = spiritArr.sort((a, b) => a.energy - b.energy) //inverted to dump lowest first
    spiritArr.forEach((spirit) => {
      if (spirit.size > 1) Consts.myShape == 'circle' && spirit.divide && spirit.divide() // ???
      const isStarBeamable = Geometry.calcDistance(spirit.position, Consts.myStar.position) <= 200
      const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0)
      const connection = connectionArr
        .sort((a, b) => a.energy - b.energy) // inverted to energize lowest first
        .find((s) => {
        if (spirit.sight.friends_beamable.find((s2) => s2 == s.id) &&
        s.energy < s.energy_capacity &&
        (!(s as any).hasConnection)) {
          return true
        }
      })
      if (isBaseBeamable) {
        spirit.energize(base)
        spirit.energy -= spirit.size
        base.energy += spirit.size
      } else if (isStarBeamable && Consts.myStar.energy > Consts.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
        Consts.myStar.energy -= spirit.size
        spirit.energy += spirit.size
      } else if (connection) {
        spirit.energize(connection)
        spirit.energy -= spirit.size
        connection.energy += spirit.size;
        // ((connection as any).hasConnection = true)
      }

      // if (tick < 10) {
      //   spirit.set_mark("empty")
      // } else
      if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("full")
      } else if (spirit.energy == 0) {
        spirit.set_mark("empty")
      } else if (!spirit.mark) {
        spirit.set_mark("empty")  // new spawns??
      }

      if (!connection && spirit.mark == "full") {
        spirit.move(Consts.CLOSE_TO_BASE_POS)
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(Consts.myStar.position)
      }
      spirit.shout(spirit.mark)
    })
  },

  gatherStar: (spiritArr: Spirit[], connectionArr: Spirit[]) => {
    // Find connection
    //

    // for (let idx = 0; idx < gatherSpirits.length; idx++) {
    spiritArr.forEach((spirit) => {
      spirit.move(Consts.CLOSE_TO_STAR_POS)
      if (Consts.myStar.energy > Consts.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
      }


      // const connection = myAliveSpirits[idx + 1]
      // const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      // if (connection &&
      //   isBeamable &&
      //   connection.energy < connection.energy_capacity &&
      //   spirit.energy > 0) {
      //   spirit.energize(connection)
      //   connection.energy += spirit.size
      // }

    })
  },

  gatherChain: (spirit: Spirit, idx: number) => {
    const DUMP_UNTIL = 111900
    const safeEnergy = tick > DUMP_UNTIL ? 8 : 0
    if (idx % 4 == 3) {
      spirit.move(Consts.CLOSE_TO_STAR_POS)
      if (Consts.myStar.energy > Consts.desiredStarEnergy &&
        spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit) // Add here?
      }
      const connection = Consts.myAliveSpirits[idx - 2]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity &&
        spirit.energy > 0 &&
        spirit.energy >= safeEnergy) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else if (idx % 4 == 2) {
      spirit.move(Consts.CLOSE_TO_BASE_POS)
      const connection = base
      const isBeamable = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity &&
        spirit.energy > 0 &&
        spirit.energy >= safeEnergy) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else if (idx % 4 == 1) {
      spirit.move(Consts.MIDDLE_POINT_POS)
      const connection = Consts.myAliveSpirits[idx + 1]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else {
      spirit.move(Consts.CLOSE_TO_STAR_POS)
      if (Consts.myStar.energy > Consts.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
      }
      const connection = Consts.myAliveSpirits[idx + 1]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity &&
        spirit.energy > 0) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    }
  },

  gatherNew: (gatherSpirits: Spirit[]) => {
    const firstSpirit = gatherSpirits[0]
    // const isBaseBeamable = firstSpirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0).length > 0
    // if (!isBaseBeamable) firstSpirit.move(base.position)
    // if (Math.random() < .8) firstSpirit.move(NEW_SPAWN_POS)
    firstSpirit.energize(base)
    // console.log(firstSpirit.energy_capacity, firstSpirit.size)
    // const secondSpirit = gatherSpirits[1]
    firstSpirit.move(Consts.NEW_SPAWN_POS)
    // firstSpirit.energize(secondSpirit)
    // secondSpirit.move(MIDDLE_POINT_POS)
    // secondSpirit.merge && secondSpirit.merge(firstSpirit)
    // firstfirstmyShape == 'circle' && Spirit.divide && firstSpirit.divide()

    // Utils.shout(firstSpirit, `First: ${firstSpirit.id}`)
    const restOfSpirits = gatherSpirits.slice(1)
    // // console.log(restOfSpirits[0].id)
    restOfSpirits.forEach((s) => {
      // if (Geometry.calcDistance(s.position, firstSpirit.position) > 10) s.move(firstSpirit.position)
      s.move(Consts.NEW_SPAWN_POS)
      s.merge && s.merge(firstSpirit)
      // Utils.shout(s, `${s.id}${s.position}`)
    })

    // firstfirstmyShape == 'circle' && Spirit.divide && firstSpirit.divide()

    // firstSpirit.move(base.position)
    // firstSpirit.energize(base)

    // firstSpirit.move(Consts.myStar.position)
    // firstSpirit.energize(firstSpirit)
  },

  moveWithStrategy: (spirit: Spirit) => {
    // If we control the outpost, normal moves, perhaps energize it
    // If enemy controls the outpost, avoid the range if we're too close
    // Eventuallly do maybe a sum of friend/enemy energy within outpost range
    // const enemyControlsOutpost = true//outpost.control ? outpost.control.indexOf("Carsair") < 0 : false;
    // const outpostRange = 200; //typescript making me out 400 because ?range
    // if (enemyControlsOutpost && calcDistance(spirit.position, outpost.position) <  outpostRange + 20) {
    //   spirit.move(calcRunAwayPoint(spirit, outpost))
    //   return
    // }
    if (spirit.energy < spirit.energy_capacity) {
      Gather.gatherClosestStar(spirit)
      return
    }
    let defendPoint;
    defendPoint = Geometry.calcTangentPointFromPoint(spirit, outpost, 620)
    if (parseInt(spirit.id.split('_')[1]) % 2 == 1) defendPoint = Geometry.calcClockwiseTangentPointFromPoint(spirit, outpost, 620)

    if (Array.isArray(defendPoint)) {
      const seedX = 0//Math.floor(Math.random() * 100) - 50
      const seedY = 0//Math.floor(Math.random() * 100) - 50
      spirit.move([defendPoint[0]+seedX, defendPoint[1]+seedY]);
    }
  },

  curveToStarStrategy: (spirit: Spirit) => {
    // If we control the outpost, normal moves, perhaps energize it
    // If enemy controls the outpost, avoid the range if we're too close
    // Eventuallly do maybe a sum of friend/enemy energy within outpost range
    const enemyControlsOutpost = true//outpost.control ? outpost.control.indexOf("Carsair") < 0 : false;
    const outpostRange = 600; //typescript making me out 600 because ?range
    // if (enemyControlsOutpost && calcDistance(spirit.position, outpost.position) <  outpostRange + 20) {
    //   spirit.move(calcRunAwayPoint(spirit, outpost))
    //   return
    // }
    if (spirit.energy < spirit.energy_capacity) {
      Gather.gatherClosestStar(spirit, [Consts.enemyStar, star_p89])
      return
    }
    let defendPoint;
    defendPoint = Geometry.calcClockwiseTangentPointFromPoint(spirit, outpost, 950)
    // defendPoint = Geometry.calcClockwiseTangentPointFromPoint(spirit, enemyStar, 350)

    if (Array.isArray(defendPoint)) {
      const seedX = 0//Math.floor(Math.random() * 100) - 50
      const seedY = 0//Math.floor(Math.random() * 100) - 50
      spirit.move([defendPoint[0]+seedX, defendPoint[1]+seedY]);
    }
  },

  gatherClosestStar: (spirit: Spirit, starArr?: Star[]) => {
    let closestDist = null as null|number;
    starArr = starArr ? starArr : [Consts.myStar, star_p89, Consts.enemyStar]
    // const availableStar = [star_p89, star_a1c, star_zxq].reduce((acc, star) => {
    const availableStar = starArr.reduce((acc: Star, star) => {
      const dist = Geometry.calcDistance(spirit.position, star.position)
      if (closestDist == null || dist < closestDist) {
        closestDist = dist
        acc = star
      }
      return acc
    }, null as any)
    // Use distance calc to avoid getting too close.
    if (Geometry.calcDistance(availableStar.position, spirit.position) > 200) {
      spirit.move(availableStar.position)
    } else {
      if (spirit.energy < spirit.energy_capacity && availableStar.energy > Consts.desiredStarEnergy) spirit.energize(spirit)
    }
    // if (spirit.energy == spirit.energy_capacity) {
    //   spirit.set_mark("full")
    // } else if (spirit.energy == 0) {
    //   spirit.set_mark("empty")
    // }
  }
}

export default Gather