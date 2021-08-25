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

  const getGatherMax = () => {
    // return 4
    // return 8
    // return 12
    // return 12
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
    // return 152
    return 52
    // return Math.round((0.08 * tick + 12))
  }

  ///

  /// CONSTS

  ///
  const myStar = base.position[0] === 2600 ? star_a1c : star_zxq;
  const enemyStar = base.position[0] === 2600 ? star_zxq : star_a1c;
  const myNexusPos = Geometry.calcAveragePos(myStar.position, base.position)

  const myAliveSpirits = my_spirits.filter((s: Spirit) => s.hp)
  const enemyAliveSpirits = Object.keys(spirits).reduce((acc, id) => {
    const s = spirits[id]
    if (s.hp && s.id.indexOf('Carsair') < 0) acc.push(s)
    return acc
  }, [] as Spirit[])
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


  const MAX_GATHERERS = getGatherMax()//Math.min(getGatherMax(), 4 * Math.round(myStar.energy * .01 + 3))
  const plannedEnergyObj = {}
  const desiredStarEnergy = Math.min(970, Math.pow(tick, 1.25))//Math.min(974, Math.pow(tick, 1.35))
  // const lineReserveCapacity = Math.min(8, Math.round(tick/10))
  console.log("Base: ", base.position)
  console.log("myStar: ", myStar.position)
  console.log("enemyStar: ", enemyStar.position)
  console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)")
  console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)")
  console.log("Planning for tick, star: ", tick, desiredStarEnergy)
  console.log("Planning for energies: us:", playerTotalEnergies[0], " them: ", playerTotalEnergies[1])

  ///

  /// MOVE/GATHER

  // ///

  const gatherHauling = (spirit: Spirit) => {
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    const starStructBeamable = Geometry.calcDistance(spirit.position, myStar.position) <= 200
    if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
      spirit.energize(base)
      spirit.energy -= spirit.size
    } else if (starStructBeamable && myStar.energy > desiredStarEnergy) {
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
    } else if (!starStructBeamable && spirit.mark == "empty") {
      spirit.move(myStar.position)
    }
  }

  const gatherChain = (spirit: Spirit, idx: number) => {
    const DUMP_UNTIL = 900
    const safeEnergy = tick > DUMP_UNTIL ? 8 : 0
    const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0)
    if (baseStructs.length > 0 && spirit.energy > 0 && spirit.energy >= safeEnergy) {
      if (Geometry.calcDistance(spirit.position, base.position) > 200) {
        spirit.move(base.position)
      } else {
        spirit.energize(base)
      }
    } else if (idx % 4 == 3) {
      const closeToStar = Geometry.calcAveragePos(myStar.position, myStar.position, myStar.position, base.position)
      spirit.move(closeToStar)
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
      const closeToBase = Geometry.calcAveragePos(base.position, base.position, base.position, myStar.position)
      spirit.move(closeToBase)
      const connection = base
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity &&
        spirit.energy > 0 &&
        spirit.energy >= safeEnergy) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else if (idx % 4 == 1) {
      const middlePoint = Geometry.calcAveragePos(base.position, myStar.position)
      spirit.move(middlePoint)
      const connection = myAliveSpirits[idx + 1]
      const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0
      if (connection &&
        isBeamable &&
        connection.energy < connection.energy_capacity) {
        spirit.energize(connection)
        connection.energy += spirit.size
      }
    } else {
      const closeToStar = Geometry.calcAveragePos(myStar.position, myStar.position, myStar.position, base.position)
      spirit.move(closeToStar)
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
      if (availableStar.energy > desiredStarEnergy/2) spirit.energize(spirit)
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

  const fightForTheBase = (spirit: Spirit) => {
    if (base.sight.enemies.length > 0) {
      const baseEnemies = base.sight.enemies.map((s) => spirits[s]);
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(baseEnemies, spirit);
      if (closestEnemyToMe) {
        if (closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        }
      }
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

    for (let idx = 0; idx < gatherSpirits.length; idx++) {
      const spirit = gatherSpirits[idx]



      // Prod strategy
      tick < 20 ? gatherHauling(spirit) : gatherChain(spirit, idx)
      fightForTheBase(spirit)
      fightBasic(spirit)
    }

    const fightingSpirits = [...leftoverSpirits]
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      // if (parseInt(spirit.id.split('_')[1]) % 2 == 1) curveToStarStrategy(spirit)
      // else chargeOutpostStrategy(spirit)
      // curveToStarStrategy(spirit)
      // spirit.move(enemyStar.position)
      // chargeOutpostStrategy(spirit)
      // spirit.move(outpost.position)
      // if (fightingSpirits.length > 10) moveWithStrategy(spirit)

      // mergewi(spirit)
      // fightSmart(spirit)
      // mergeTogetherStrategy(spirit)

      // Prod strategy
      // fightToWin(spirit)
      // fightForTheBase(spirit)
      // fightBasic(spirit)
    }
  }
  main()


} catch (e) {
  console.log(e.message)
}
