import Consts from './consts'
import Geometry from './geometry'
import Utils from './utils'

const Gather = {
  // Hauling strategy tailored for my star.
  gatherHaulingMyBase: (spirit: Spirit, star: Star) => {
    star = star || Consts.myStar
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    const isStarBeamable = Geometry.calcDistance(spirit.position, star.position) <= 200
    if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
      spirit.energize(base)
      spirit.energy -= spirit.size
      spirit.move(Consts.CLOSE_TO_BASE_POS)
    } else if (isStarBeamable && star.energy > Consts.desiredStarEnergy) {
      spirit.energize(spirit)
      spirit.energy += spirit.size
    }

    if (spirit.energy == spirit.energy_capacity) {
      spirit.set_mark("full")
    } else if (spirit.energy == 0) {
      spirit.set_mark("empty")
    }

    if (baseStructs.length == 0 && spirit.mark == "full") {
      // spirit.shout("full"+spirit.id)
      spirit.move(base.position)
    } else if (!isStarBeamable && spirit.mark == "empty") {
      // spirit.shout("empty"+spirit.id)
      spirit.move(star.position)
    }
  },

  // Gather hauling, supposed to be universal.
  gatherHauling: (spirit: Spirit, star: Star) => {
    star = star || Consts.myStar
    const desiredStarEnergy = Consts.desiredStarEnergyMap[star.id]
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    const isStarBeamable = Geometry.calcDistance(spirit.position, star.position) <= Consts.specialProximity
    if (baseStructs.length > 0 && base.energy < base.energy_capacity && spirit.energy > 0) {
      spirit.energize(base)
      spirit.energy -= spirit.size
    } else if (isStarBeamable && star.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
      spirit.energize(spirit)
      spirit.energy += spirit.size
    }

    if (isStarBeamable && star.energy <= desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
      spirit.shout("not enough")
    }

    if (spirit.energy == spirit.energy_capacity) {
      spirit.set_mark("full")
    } else if (spirit.energy == 0) {
      spirit.set_mark("empty")
    }

    if (!(spirit.mark == "full" || spirit.mark == "empty")) {
      if (spirit.energy / spirit.energy_capacity > .5) {
        spirit.set_mark("full")
      } else {
        spirit.set_mark("empty")
      }
    }

    if (baseStructs.length == 0 && spirit.mark == "full") {
      spirit.shout("full"+spirit.id)
      spirit.move(base.position)
    } else if (!isStarBeamable && spirit.mark == "empty") {
      spirit.shout("empty"+spirit.id)
      spirit.move(star.position)
    }
  },

  // Group of spirits stationary for dumping into base.
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

  // Group of spirits
  gatherChainHauling: (spiritArr: Spirit[], connectionArr: Spirit[]) => {
    const safeEnergy = 0
    spiritArr = spiritArr.sort((a, b) => a.energy - b.energy) //inverted to dump lowest first
    spiritArr.forEach((spirit) => {
      if (spirit.size > 1) Consts.myShape == 'circle' && spirit.divide && spirit.divide() // ???
      const isStarBeamable = Geometry.calcDistance(spirit.position, Consts.myStar.position) <= Consts.specialProximity
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
        spirit.move(Consts.CLOSE_TO_BASE_POS)
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
      // else if (isStarBeamable && Consts.myStar.energy <= Consts.desiredStarEnergy && spirit.energy > 0) {
      //   // Optimization to energize star
      //   spirit.shout("Dumping in")
      //   spirit.energize(Consts.myStar)
      //   spirit.energy -= spirit.size
      //   Consts.myStar.energy += spirit.size;
      // }

      if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("full")
      } else if (spirit.energy == 0) {
        spirit.set_mark("empty")
      } else if (!(spirit.mark == "full" || spirit.mark == "empty")) {
        if (spirit.energy / spirit.energy_capacity > .5) {
          spirit.set_mark("full")
        } else {
          spirit.set_mark("empty")
        }
      }

      if (!connection && spirit.mark == "full") {
        spirit.move(Consts.CLOSE_TO_BASE_POS)
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(Consts.myStar.position)
      }
      // spirit.shout(spirit.id+spirit.mark)
    })
  },

  // WIP Gather from all spirits to all bases?
  gatherInfiniteChain: (spiritArr: Spirit[]) => {
    spiritArr = spiritArr.sort((a, b) => a.energy - b.energy) //inverted to dump lowest first
    spiritArr.forEach((spirit) => {
      const isStarBeamable = Geometry.calcDistance(spirit.position, Consts.myStar.position) <= 200
      const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0)
      const connectionArr = spiritArr
        .slice(0)
        .filter((s) => s.mark != 'empty')
        .filter((s) => spirit.sight.friends_beamable.find((s2) => s2 == s.id))
        .filter((s) => Geometry.calcDistance(s.position, base.position) < Geometry.calcDistance(spirit.position, base.position))
        .sort((s) => Geometry.calcDistance(s.position, base.position) - Geometry.calcDistance(spirit.position, base.position))

      const connection = connectionArr
        .sort((a, b) => a.energy - b.energy) // inverted to energize lowest first
        .find((s) => {
          if (s.energy < s.energy_capacity) {
            return true
          }
        })

      if (spirit.energy > 0 && isBaseBeamable) {
        spirit.energize(base)
        spirit.energy -= spirit.size
        base.energy += spirit.size
      } else if (isStarBeamable && Consts.myStar.energy > Consts.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
        Consts.myStar.energy -= spirit.size
        spirit.energy += spirit.size
      } else if (spirit.energy > 0 && connection && connection.energy < connection.energy_capacity) {
        spirit.energize(connection)
        spirit.energy -= spirit.size
        connection.energy += spirit.size;
        (spirit as any).connection = connection
      }
    })
    spiritArr.forEach((spirit) => {
      const isStarBeamable = Geometry.calcDistance(spirit.position, Consts.myStar.position) <= 200
      const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0)
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

      if (!isBaseBeamable && spirit.mark == "full") {
        spirit.move(Consts.CLOSE_TO_BASE_POS)
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(Consts.CLOSE_TO_STAR_POS)
      }
      // spirit.shout(spirit.mark)
    })
  },

  // Chain method for gathering from my star
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

  // If we need energy, and there is a star around, snag some.
  // Debatable, but seems to be only helpful.
  gatherAlwaysNearStar: (spirit: Spirit, starArr?: Star[]) => {
    // spirit.sight.structures.filter((s) => {  })  //Should be doing it like this
    let closestDist = null as null|number;
    starArr = starArr ? starArr : [Consts.myStar, star_p89, Consts.enemyStar]
    const availableStar = starArr.reduce((acc: Star, star) => {
      const dist = Geometry.calcDistance(spirit.position, star.position)
      const desiredStarEnergy = Consts.desiredStarEnergyMap[star.id]

      if (star.id == Consts.middleStar.id && tick < 100) return acc

      if ((closestDist == null || dist < closestDist) && star.energy > desiredStarEnergy) {
        closestDist = dist
        acc = star
      }
      return acc
    }, null as any)
    if (availableStar) {
      const desiredStarEnergy = Consts.desiredStarEnergyMap[availableStar.id]
      if (availableStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
        availableStar.energy -= spirit.size
        spirit.energy += spirit.size
      }
    }
  },

  // Individual spirit marked empty needs to replenish itself.
  gatherClosestStar: (spirit: Spirit, starArr?: Star[]) => {
    if (spirit.energy == 0) {
      spirit.set_mark("empty")
    }
    if (spirit.energy == spirit.energy_capacity) {
      spirit.set_mark("ready")
      return;
    }
    let closestDist = null as null|number;
    starArr = starArr ? starArr : [Consts.myStar, star_p89, Consts.enemyStar]
    let availableStar = starArr.reduce((acc: Star, star) => {
      const dist = Geometry.calcDistance(spirit.position, star.position)
      const desiredStarEnergy = Consts.desiredStarEnergyMap[star.id]
      if ((closestDist == null || dist < closestDist) && star.energy > desiredStarEnergy) {
        closestDist = dist
        acc = star
      }
      return acc
    }, null as any)
    if (!availableStar) availableStar = Consts.myStar;

    // Use distance calc to avoid getting too close.
    if (Geometry.calcDistance(availableStar.position, spirit.position) > 200) {
      spirit.move(Geometry.calcPointBetweenPoints(spirit.position, availableStar.position, Consts.specialProximity))
    } else {
      const desiredStarEnergy = Consts.desiredStarEnergyMap[availableStar.id]
      if (spirit.energy < spirit.energy_capacity && availableStar.energy > desiredStarEnergy) {
        spirit.energize(spirit)
        availableStar.energy -= spirit.size
        spirit.energy += spirit.size
      }
      // This doesn't work because the star is already filtered out of availableStar because of energy.
      // else if (spirit.energy > 0 && availableStar.energy <= desiredStarEnergy) {
      //   console.log("put back", spirit.id);
      //   spirit.energize(availableStar)
      //   availableStar.energy += spirit.size
      //   spirit.energy -= spirit.size
      // }
    }

  },

  gatherWhenEmpty: (spirit: Spirit, limit?: number, starArr?: Star[]) => {
    limit = limit || 0;
    // if (spirit.size > 1) console.log('spirit.energy / spirit.energy_capacity: ', spirit.energy / spirit.energy_capacity, spirit.energy / spirit.energy_capacity <= limit);
    if (spirit.energy / spirit.energy_capacity <= limit) {
      spirit.set_mark("empty")
    }
    if (spirit.mark == "empty") {
      Gather.gatherClosestStar(spirit, starArr)
    }
  }
}

export default Gather
