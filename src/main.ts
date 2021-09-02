import Utils from './utils'
import Geometry from './geometry'

try {

  ///

  /// UTILS

  ///
  const calcClosestSpirit = (spiritsArr: Spirit[], point: Entity) => {
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
  }

  const calcClosestShootSpirit = (spiritsArr: Spirit[], point: Entity) => {
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
  }

  const getSpiritsWithinRange = (spirit: Spirit, spiritsArr: Spirit[], range: number) => {
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
  }

  ///

  /// End UTILS

  ///

  ///

  /// BUSINESS UTILS

  ///

  const getMaxGather = () => {
    // return 4
    // return 6
    // return 7
    // return 8
    // return 9
    // return 12
    // return 16
    // return 24
    // return 28
    return 30
    return 36
    // return 12
    // return 4
    return 52
    // return 152
    // if (tick < 50) return 12
    // if (tick < 100) return 12
    // if (tick < 150) return 12
    // if (tick < 200) return 16
    // if (tick < 250) return 16
    // if (tick < 300) return 16
    // if (tick < 350) return 16
    // if (tick < 400) return 16
    // if (tick < 450) return 40
    // if (tick < 500) return 48
    // return Math.round((0.08 * tick + 12))
  }

  ///

  /// CONSTS

  ///
  const isSouthSpawn = base.position[0] === 2600
  const myStar = isSouthSpawn ? star_a1c : star_zxq;
  const enemyStar = isSouthSpawn ? star_zxq : star_a1c;
  const myNexusPos = Geometry.calcAveragePos(myStar.position, base.position)

  const myAliveSpirits = my_spirits.filter((s: Spirit) => s.hp)
  const enemySpirits = Object.keys(spirits).map((s: string) => spirits[s]).filter((s: Spirit) => s.id.indexOf("Carsair") < 0)
  const enemyAliveSpirits = enemySpirits.filter((s: Spirit) => s.hp)
  const enemySize = enemySpirits[0].size
  const enemyShape = enemySize == 1 ? 'circle' : (enemySize == 3 ? 'triangle' : 'square')
  const playerTotalEnergies = Object.keys(spirits).reduce((acc, id) => {
    const s = spirits[id];
      if (!s.hp) return acc
    if (s.id.indexOf("Carsair") >= 0) {
      acc[0] += s.energy
    } else {
      acc[1] += s.energy
    }
    return acc
  }, [0, 0])


  const MAX_GATHERERS = getMaxGather()//Math.min(getMaxGather(), 4 * Math.round(myStar.energy * .01 + 3))
  const plannedEnergyObj = {}
  const desiredStarEnergy = 0 //Math.min(970, Math.pow(tick, 1.15))//Math.min(974, Math.pow(tick, 1.35))
  // const lineReserveCapacity = Math.min(8, Math.round(tick/10))
  // console.log("Base: ", base.position)
  // console.log("myStar: ", myStar.position)
  // console.log("enemyStar: ", enemyStar.position)

  console.log("Enemy Shape: ", enemyShape, enemySize)
  console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)")
  console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)")
  console.log("Planning for tick, star: ", tick, desiredStarEnergy)
  console.log("Planning for energies: us:", playerTotalEnergies[0], " them: ", playerTotalEnergies[1])

  const CLOSE_TO_STAR_POS = Geometry.calcPointBetweenPoints(myStar.position, base.position, 199) //Geometry.calcAveragePos(myStar.position, myStar.position, myStar.position, base.position)
  const CLOSE_TO_BASE_POS = Geometry.calcPointBetweenPoints(base.position, myStar.position, 199) //Geometry.calcAveragePos(base.position, base.position, base.position, base.position, base.position, base.position, myStar.position, myStar.position, myStar.position)
  // console.log('CLOSE_TO_BASE_POS: ', CLOSE_TO_BASE_POS, Geometry.calcPointBetweenPoints(base.position, myStar.position, 200));
  const MIDDLE_POINT_POS = Geometry.calcAveragePos(base.position, myStar.position)
  const NEW_SPAWN_POS = isSouthSpawn ? [2620,1760] as Position : [1580,640] as Position
  ///

  /// GATHER

  // ///
  const gatherDumpSimple = (spirit: Spirit) => {
    const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0
    if (!isBaseBeamable) spirit.move(base.position)
    spirit.energize(base)
  }

  const gatherHauling = (spirit: Spirit) => {
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    const isStarBeamable = Geometry.calcDistance(spirit.position, myStar.position) <= 200
    if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
      spirit.energize(base)
      spirit.energy -= spirit.size
    } else if (isStarBeamable && myStar.energy > desiredStarEnergy) {
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
      spirit.move(myStar.position)
    }
  }

  const gatherBase = (spiritArr: Spirit[]) => {
    const safeEnergy = 0
    spiritArr.forEach((spirit) => {
      if (spirit.size > 1) spirit.divide && spirit.divide() // ???
      const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0
      spirit.move(CLOSE_TO_BASE_POS);
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
  }

  // const gatherMidpoint = (spiritArr: Spirit[], connectionArr: Spirit[]) => {})

  const gatherChainHauling = (spiritArr: Spirit[], connectionArr: Spirit[]) => {
    const safeEnergy = 0
    spiritArr = spiritArr.sort((a, b) => a.energy - b.energy) //inverted to dump lowest first
    spiritArr.forEach((spirit) => {
      if (spirit.size > 1) spirit.divide && spirit.divide() // ???
      const isStarBeamable = Geometry.calcDistance(spirit.position, myStar.position) <= 200
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
      } else if (isStarBeamable && myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
        myStar.energy -= spirit.size
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
        spirit.move(CLOSE_TO_BASE_POS)
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(myStar.position)
      }
      spirit.shout(spirit.mark)
    })
  }

  const gatherStar = (spiritArr: Spirit[], connectionArr: Spirit[]) => {
    // Find connection
    //

    // for (let idx = 0; idx < gatherSpirits.length; idx++) {
    spiritArr.forEach((spirit) => {
      spirit.move(CLOSE_TO_STAR_POS)
      if (myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
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
  }

  const gatherChain = (spirit: Spirit, idx: number) => {
    const DUMP_UNTIL = 111900
    const safeEnergy = tick > DUMP_UNTIL ? 8 : 0
    if (idx % 4 == 3) {
      spirit.move(CLOSE_TO_STAR_POS)
      if (myStar.energy > desiredStarEnergy &&
        spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit) // Add here?
      }
      const connection = myAliveSpirits[idx - 2]
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
      spirit.move(CLOSE_TO_BASE_POS)
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
      spirit.move(MIDDLE_POINT_POS)
      const connection = myAliveSpirits[idx + 1]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else {
      spirit.move(CLOSE_TO_STAR_POS)
      if (myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit)
      }
      const connection = myAliveSpirits[idx + 1]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity &&
        spirit.energy > 0) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    }
  }

  const gatherNew = (gatherSpirits: Spirit[]) => {
    const firstSpirit = gatherSpirits[0]
    // const isBaseBeamable = firstSpirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0).length > 0
    // if (!isBaseBeamable) firstSpirit.move(base.position)
    // if (Math.random() < .8) firstSpirit.move(NEW_SPAWN_POS)
    firstSpirit.energize(base)
    // console.log(firstSpirit.energy_capacity, firstSpirit.size)
    // const secondSpirit = gatherSpirits[1]
    firstSpirit.move(NEW_SPAWN_POS)
    // firstSpirit.energize(secondSpirit)
    // secondSpirit.move(MIDDLE_POINT_POS)
    // secondSpirit.merge && secondSpirit.merge(firstSpirit)
    // firstSpirit.divide && firstSpirit.divide()

    // Utils.shout(firstSpirit, `First: ${firstSpirit.id}`)
    const restOfSpirits = gatherSpirits.slice(1)
    // // console.log(restOfSpirits[0].id)
    restOfSpirits.forEach((s) => {
      // if (Geometry.calcDistance(s.position, firstSpirit.position) > 10) s.move(firstSpirit.position)
      s.move(NEW_SPAWN_POS)
      s.merge && s.merge(firstSpirit)
      // Utils.shout(s, `${s.id}${s.position}`)
    })

    // firstSpirit.divide && firstSpirit.divide()

    // firstSpirit.move(base.position)
    // firstSpirit.energize(base)

    // firstSpirit.move(myStar.position)
    // firstSpirit.energize(firstSpirit)
  }

  ///

  /// GATHER

  // ///

  const moveWithStrategy = (spirit: Spirit) => {
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
      gatherClosestStar(spirit)
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
  }

  const curveToStarStrategy = (spirit: Spirit) => {
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
      gatherClosestStar(spirit, [enemyStar, star_p89])
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
  }

  const chargeOutpostStrategy = (spirit: Spirit) => {
    // If we control the outpost, normal moves, perhaps energize it
    // If enemy controls the outpost, avoid the range if we're too close
    // Eventuallly do maybe a sum of friend/enemy energy within outpost range
    // const enemyControlsOutpost = true//outpost.control ? outpost.control.indexOf("Carsair") < 0 : false;
    const enemyControlsOutpost = (outpost as any).control.indexOf("Carsair") < 0;
    // const outpostRange = 200; //typescript making me out 400 because ?range
    // if (enemyControlsOutpost && calcDistance(spirit.position, outpost.position) <  outpostRange + 20) {
    //   spirit.move(calcRunAwayPoint(spirit, outpost))
    //   return
    // }
    const outpostStructs = spirit.sight.structures.filter((s) => s.indexOf("outpost") >= 0)
    // const outpost = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
    // if (spirit.energy >= 8) return gatherClosestStar(spirit)
    // let strategyDestination
    // if (outpost.energy < 725) strategyDestination = outpost.position
    // else strategyDestination = enemy_base.position
    if (outpostStructs.length > 0 && spirit.energy >= 8 && (outpost.energy < 725 || enemyControlsOutpost)) {
      spirit.energize(outpost)
    } else if (spirit.energy == spirit.energy_capacity && outpost.energy < 725) {
      spirit.move(outpost.position)
    } else if (spirit.energy >= spirit.energy_capacity && outpost.energy >= 725) {
      spirit.move(enemy_base.position)
    } else {
      gatherClosestStar(spirit)
    }
    // console.log("outpost?", outpostStructs)
    // console.log("outpost structs?", spirit.sight.structures)
    // spirit.move(outpost.position)
    // let defendPoint;
    // defendPoint = Geometry.calcTangentPointFromPoint(spirit, outpost, 620)
    // if (parseInt(spirit.id.split('_')[1]) % 2 == 1) defendPoint = Geometry.calcClockwiseTangentPointFromPoint(spirit, outpost, 620)

    // if (Array.isArray(defendPoint)) {
    //   const seedX = 0//Math.floor(Math.random() * 100) - 50
    //   const seedY = 0//Math.floor(Math.random() * 100) - 50
    //   spirit.move([defendPoint[0]+seedX, defendPoint[1]+seedY]);
    // }
  }

  const gatherClosestStar = (spirit: Spirit, starArr?: Star[]) => {
    let closestDist = null as null|number;
    starArr = starArr ? starArr : [myStar, star_p89, enemyStar]
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
      if (spirit.energy < spirit.energy_capacity && availableStar.energy > desiredStarEnergy) spirit.energize(spirit)
    }
  }

  // ///

  // /// FIGHT

  // ///

  const fightBasic = (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) {
      const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
      const {closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe} = calcClosestShootSpirit(spiritEnemiesBeamable, spirit)
      if (closestEnemyToMe) {
        spirit.energize(closestEnemyToMe)
        closestEnemyToMe.energy = closestEnemyToMe.energy - spirit.size * 2
        // if (closestDistanceToMe < 200) {
        //   spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
        // }
      }
    }
  }

  const fightBaseEmergency = (spirit: Spirit) => {
    const baseEnemies = base.sight.enemies
      .map((s) => spirits[s])
      .filter((s) => Geometry.calcDistance(s.position, base.position) < 250)
    if (baseEnemies.length > 0) {
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
      if (spirit.energy == 0) {
        memory[spirit.id] = memory[spirit.id] || {}
        memory[spirit.id].status = "depleted"
      }
      if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
        gatherClosestStar(spirit, [myStar])

        if (spirit.energy == spirit.energy_capacity) {
          memory[spirit.id].status = ""
        }
      }
    } else if (memory[spirit.id] && memory[spirit.id].status) {
      memory[spirit.id].status = ""
    }
  }

  const fightForTheBase = (spirit: Spirit) => {
    if (base.sight.enemies.length > 0) {
      const baseEnemies = base.sight.enemies.map((s) => spirits[s]);
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
      if (spirit.energy == 0) {
        memory[spirit.id] = memory[spirit.id] || {}
        memory[spirit.id].status = "depleted"
      }
      if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
        gatherClosestStar(spirit, [myStar])

        if (spirit.energy == spirit.energy_capacity) {
          memory[spirit.id].status = ""
        }
      }
    } else if (memory[spirit.id] && memory[spirit.id].status) {
      memory[spirit.id].status = ""
    }
  }

  const fightAggressive = (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) {
      const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
      const {closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe} = calcClosestSpirit(spiritEnemiesBeamable, spirit)
      if (closestEnemyToMe) {
        spirit.energize(closestEnemyToMe)
        if (closestDistanceToMe > 200) spirit.move(closestEnemyToMe.position)
        if (closestDistanceToMe < 200) spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
      }
    }
  }

  const fightAggressive2 = (spirit: Spirit) => {
    const {closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe} = calcClosestSpirit(enemyAliveSpirits, spirit)
    if (closestEnemyToMe) {
      const weBigger = spirit.energy/spirit.energy_capacity > closestEnemyToMe.energy/closestEnemyToMe.energy_capacity
      if (weBigger && closestDistanceToMe > 200) {
        spirit.move(closestEnemyToMe.position)
      } else if (true || closestDistanceToMe > 225) {
        spirit.move(closestEnemyToMe.position)
      } else if (closestDistanceToMe < 200) {
        spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe.position))
      }
    }
  }

  const fightAggressive3 = (spiritArr: Spirit[]) => {
    spiritArr.forEach((spirit, idx) => {
      const sizeIdeal = 3//enemySize*10/2 //1//3//enemySize/5+1
      const buddy = spiritArr[idx-1]
      if (spirit.size >= sizeIdeal && spirit.energy < spirit.energy_capacity) {
        spirit.divide && spirit.divide()
      } else if (buddy && buddy.size < sizeIdeal) {
        if (Geometry.calcDistance(spirit.position, buddy.position) > 10) spirit.move(buddy.position)
        spirit.merge && spirit.merge(buddy)
      }

      if (spirit.size >= sizeIdeal) spirit.move(enemy_base.position)
      if (spirit.sight.enemies) {
        const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesNearby, spirit);
        if (closestEnemyToMe) {
          const weBigger = spirit.energy/spirit.energy_capacity >= closestEnemyToMe.energy/closestEnemyToMe.energy_capacity
          if (weBigger && closestDistanceToMe > 450) {
            spirit.move(closestEnemyToMe.position)
          } else if (!weBigger && closestDistanceToMe < 300) {
            spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
          }
        }
      }
      if (spirit.energy == 0) {
        gatherClosestStar(spirit, [myStar, star_p89])
      }
    })
  }

  const fightSmart = (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) return // Fight basic

    if (spirit.sight.enemies) {
      const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesNearby, spirit);
      if (closestEnemyToMe) {
        if (closestEnemyToMe.energy/closestEnemyToMe.energy_capacity > spirit.energy/spirit.energy_capacity &&
        Geometry.calcDistance(closestEnemyToMe.position, base.position) > 400) {
          spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
        } else if (closestEnemyToMe.energy/closestEnemyToMe.energy_capacity > spirit.energy/spirit.energy_capacity &&
          closestDistanceToMe < 200) {
          spirit.move(Geometry.calcRunAwayPoint(spirit, closestEnemyToMe))
        } else {
          spirit.move(closestEnemyToMe.position)
        }
      }
    }
  }

  const fightToWin = (spirit: Spirit) => {
    if (spirit.sight.enemies_beamable.length > 0) return // Fight basic

    const enemyStructs = spirit.sight.structures.filter((s) => s.indexOf("Carsair") < 0 && s.indexOf("base") >= 0)
    if (enemyStructs.length > 0) {
      spirit.energize(enemy_base)
    }
  }

  // ///

  // /// MERGE

  // ///

  const mergeTogetherStrategy = (spirit: Spirit) => {
    const maxCapac = 10 * enemyAliveSpirits[0].energy_capacity;
    if (spirit.sight.friends.length > 0) {
      const friendsNearby = spirit.sight.friends.map((s) => spirits[s])
      const { closestSpirit: closestFriendToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(friendsNearby, spirit);
      if (closestFriendToMe) {
        if (closestDistanceToMe <= 10 &&
          spirit.energy_capacity + closestFriendToMe.energy_capacity <= maxCapac) {
          spirit.shout(closestFriendToMe.id)
          if (spirit.merge) spirit.merge(closestFriendToMe)
        }
      }
    }
  }


  // ///

  // /// MAIN

  // ///
  const main = () => {
    // Could sort this based on proximity to star or corner. (done-ish?)
    // var gatherSpirits = myAliveSpirits.slice(0, MAX_GATHERERS)
    let potentialGatherSpiritsClose = [] as Spirit[]
    let potentialGatherSpiritsFar  = [] as Spirit[]
    myAliveSpirits.forEach((s) => {
      if (Geometry.calcDistance(myNexusPos, s.position) < 500) potentialGatherSpiritsClose.push(s)
      else potentialGatherSpiritsFar.push(s)
    })
    potentialGatherSpiritsFar.sort((spiritA, spiritB) => Geometry.calcDistance(spiritB.position, myNexusPos) -  Geometry.calcDistance(spiritA.position, myNexusPos))
    const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar]
    const gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS)
    const leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS)

    // gatherNew(gatherSpirits)
    // const gatherBasers = gatherSpirits.filter((s, idx) => idx % 3 == 0)
    // const gatherHaulers = gatherSpirits.filter((s, idx) => idx % 3 > 0)
    const transitionTime = 2
    if (tick >= transitionTime) {
      const indexLimit = Math.round(gatherSpirits.length * .27)
      const gatherBasers = gatherSpirits.slice(0, indexLimit)
      const gatherHaulers = gatherSpirits.slice(indexLimit)
      gatherBase(gatherBasers)
      gatherChainHauling(gatherHaulers, gatherBasers)
    }

    for (let idx = 0; idx < gatherSpirits.length; idx++) {
      const spirit = gatherSpirits[idx]
      // gatherHauling(spirit)
      // gatherChain(spirit, idx)

      // Prod strategy
      if (tick < transitionTime) gatherDumpSimple(spirit)
      // if (tick < transitionTime) gatherHauling(spirit)
      // tick < 22 ? gatherHauling(spirit) : gatherChain(spirit, idx)
      fightBaseEmergency(spirit)
      fightBasic(spirit)
    }

    const fightingSpirits = [...leftoverSpirits]
    fightAggressive3(fightingSpirits)
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // enemyAliveSpirits.filter((es) => {
      //   es.
      // })
      // if (parseInt(spirit.id.split('_')[1]) % 2 == 1) curveToStarStrategy(spirit)
      // else chargeOutpostStrategy(spirit)
      // curveToStarStrategy(spirit)
      // spirit.move(enemyStar.position)
      // chargeOutpostStrategy(spirit)
      // fightAggressive2(spirit)
      // spirit.move(outpost.position)
      // spirit.move(enemy_base.position)
      // if (fightingSpirits.length > 10) moveWithStrategy(spirit)

      // mergewi(spirit)
      // fightSmart(spirit)
      // mergeTogetherStrategy(spirit)

      // Prod strategy
      fightForTheBase(spirit)
      fightBasic(spirit)
      fightToWin(spirit)
    }
  }
  main()


} catch (e) {
  console.log(e.message)
}
