try {

  ///

  /// UTILS

  ///

  const shout = (spirit: Spirit, message: string) => {
    spirit.shout(('' + message).substring(0, 20))
  }

  const calcAveragePos = (...posArr: Position[]) => {
    let x = 0, y = 0;
    for (const pos in posArr) {
      x = x + posArr[pos][0]
      y = y + posArr[pos][1]
    }
    return [x / posArr.length, y / posArr.length] as Position
  }

  const calcDistance = (a: number[], b: number[]) => {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  }

  const calcRunAwayPoint = (a: Spirit, entityToRunFrom: Entity) => {
    return [a.position[0] + a.position[0] - entityToRunFrom.position[0], a.position[1] + a.position[1] - entityToRunFrom.position[1]] as Position
  }

  const calcClosestSpirit = (spiritsArr: Spirit[], point: Entity) => {
    let closestSpirit = null;
    let closestDistance = Infinity;
    for (let j = 0; j < spiritsArr.length; j++) {
      const enemy = spiritsArr[j];
      const distance = calcDistance(point.position, enemy.position);

      if (distance < closestDistance) {
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
      const distance = calcDistance(spirit.position, enemy.position);

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
    if (tick < 50) return 8
    if (tick < 100) return 12
    if (tick < 150) return 8
    if (tick < 200) return 12
    if (tick < 250) return 8
    if (tick < 300) return 16
    if (tick < 350) return 24
    if (tick < 400) return 32
    if (tick < 450) return 44
    if (tick < 500) return 48
    return 52
  }

  ///

  /// CONSTS

  ///
  const myStar = base.position[0] === 2600 ? star_a1c : star_zxq;
  const enemyStar = base.position[0] === 2600 ? star_zxq : star_a1c;
  const myNexusPos = calcAveragePos(myStar.position, base.position)

  const myAliveSpirits = my_spirits.filter((s: Spirit) => s.hp)
  const enemyAliveSpirits = Object.keys(spirits).reduce((acc, id) => {
    const s = spirits[id]
    if (s.hp && s.id.indexOf('Carsair') < 0) acc.push(s)
    return acc
  }, [] as Spirit[])
  const MAX_GATHERERS = Math.min(getGatherMax(), 4 * Math.round(myStar.energy * .01 + 3))
  const plannedEnergyObj = {}
  const desiredStarEnergy = Math.min(974, Math.pow(tick, 1.35))
  // const lineReserveCapacity = Math.min(8, Math.round(tick/10))
  console.log("Base: ", base.position)
  console.log("myStar: ", myStar.position)
  console.log("enemyStar: ", enemyStar.position)
  console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)")
  console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)")
  console.log("Planning for tick, star: ", tick, desiredStarEnergy)

  ///

  /// MOVE/GATHER

  // ///

  var gather2 = (spirit: Spirit, idx: number) => {
    if (idx % 4 == 3) {
      const closeToStar = calcAveragePos(myStar.position, myStar.position, myStar.position, base.position)
      spirit.move(closeToStar)
      if (myStar.energy > desiredStarEnergy) spirit.energize(spirit)
      const connection = myAliveSpirits[idx - 2]
      if (connection &&
        connection.energy <= connection.energy_capacity - 1 &&
        spirit.energy == spirit.energy_capacity) {
        spirit.energize(connection)
      }
    } else if (idx % 4 == 2) {
      const closeToBase = calcAveragePos(base.position, base.position, base.position, myStar.position)
      spirit.move(closeToBase)
      if (base.energy < base.energy_capacity &&
        spirit.energy >= spirit.energy_capacity - 1 &&
        true) {
        spirit.energize(base)
      }
    } else if (idx % 4 == 1) {
      const middlePoint = calcAveragePos(base.position, myStar.position)
      spirit.move(middlePoint)
      const connection = myAliveSpirits[idx + 1]
      if (connection &&
        connection.energy < connection.energy_capacity &&
        spirit.energy >= spirit.energy_capacity - 1) {
        spirit.energize(myAliveSpirits[idx + 1])
      }
    } else {
      const closeToStar = calcAveragePos(myStar.position, myStar.position, myStar.position, base.position)
      spirit.move(closeToStar)
      if (myStar.energy > desiredStarEnergy) spirit.energize(spirit)
      const connection = myAliveSpirits[idx + 1]
      if (connection &&
        connection.energy <= connection.energy_capacity &&
        spirit.energy == spirit.energy_capacity) {
        spirit.energize(connection)
      }
    }
  }

  const moveWithStrategy = (spirit: Spirit) => {
    // If we control the outpost, normal moves, perhaps energize it
    // If enemy controls the outpost, avoid the range if we're too close
    // Eventuallly do maybe a sum of friend/enemy energy within outpost range
    const enemyControlsOutpost = outpost.control ? outpost.control.indexOf("Carsair") < 0 : false;
    outpost.range = outpost.range || 400; //typescript making me out 400 because ?range
    if (enemyControlsOutpost && calcDistance(spirit.position, outpost.position) <  outpost.range + 10) {
      spirit.move(calcRunAwayPoint(spirit, outpost))
      return
    }
    if (spirit.energy < spirit.energy_capacity) {
      gatherClosestStar(spirit)
      return
    }
    let defendPoint;
    if (parseInt(spirit.id.split('_')[1]) % 2 == 0) {
      defendPoint = calcAveragePos(base.position, [enemy_base.position[0], enemy_base.position[1]])
    } else {
      defendPoint = calcAveragePos(base.position, [enemyStar.position[0], enemyStar.position[1]])
    }

    const seedX = Math.floor(Math.random() * 100) - 50
    const seedY = Math.floor(Math.random() * 100) - 50
    spirit.move([defendPoint[0]+seedX, defendPoint[1]+seedY]);
  }

  const gatherClosestStar = (spirit: Spirit) => {
    let closestDist = null as null|number;
    // const availableStar = [star_p89, star_a1c, star_zxq].reduce((acc, star) => {
    const availableStar = [myStar, enemyStar].reduce((acc: Star, star) => {
      const dist = calcDistance(spirit.position, star.position)
      if (closestDist == null || dist < closestDist) {
        closestDist = dist
        acc = star
      }
      return acc
    }, null as any)
    // Use distance calc to avoid getting too close.
    if (calcDistance(availableStar.position, spirit.position) > 200) {
      spirit.move(availableStar.position)
    } else {
      if (availableStar.energy > desiredStarEnergy) spirit.energize(spirit)
    }
  }

  // ///

  // /// FIGHT

  // ///

  const fightBasic = (spirit: Spirit) => {
    let isFighting = false
    if (spirit.sight.enemies_beamable.length > 0) {
      const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
      const {closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe} = calcClosestSpirit(spiritEnemiesBeamable, spirit)
      if (closestEnemyToMe) {
        spirit.energize(closestEnemyToMe)
        if (closestDistanceToMe < 200) spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe))
      }
    }
    return isFighting;
  }

  const fightAggressive = (spirit: Spirit) => {
    let isFighting = false
    if (spirit.sight.enemies_beamable.length > 0) {
      const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s: string) => spirits[s])
      const {closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe} = calcClosestSpirit(spiritEnemiesBeamable, spirit)
      if (closestEnemyToMe) {
        spirit.energize(closestEnemyToMe)
        if (closestDistanceToMe > 200) spirit.move(closestEnemyToMe.position)
        if (closestDistanceToMe < 200) spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe))
      }
    }
    return isFighting;
  }

  // ///

  // /// MERGE

  // ///

  // var mergeTogetherStrategy = (spirit: Spirit) => {
  //   const maxCapac = 10 * enemyAliveSpirits[0].energy_capacity;
  //   if (spirit.sight.friends.length > 0) {
  //     const friends = spirit.sight.friends.map((s) => spirits[s])
  //     let [closestFriendToMe, closestDistanceToMe] = calcClosestSpirit(friends, spirit)
  //     if (closestFriendToMe) {
  //       if (closestDistanceToMe <= 10 &&
  //         spirit.energy_capacity + closestFriendToMe.energy_capacity <= maxCapac) {
  //         spirit.shout(closestFriendToMe.id)
  //         spirit.merge(closestFriendToMe)
  //       }
  //     }
  //   }
  // }


  // ///

  // /// MAIN

  // ///
  const main = () => {
    // Could sort this based on proximity to star or corner. (done-ish?)
    // var gatherSpirits = myAliveSpirits.slice(0, MAX_GATHERERS)
    let potentialGatherSpiritsClose = [] as Spirit[]
    let potentialGatherSpiritsFar  = [] as Spirit[]
    myAliveSpirits.forEach((s) => {
      if (calcDistance(myNexusPos, s.position) < 500) potentialGatherSpiritsClose.push(s)
      else potentialGatherSpiritsFar.push(s)
    })
    potentialGatherSpiritsFar.sort((spiritA, spiritB) => calcDistance(spiritB.position, myNexusPos) -  calcDistance(spiritA.position, myNexusPos))
    const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar]

    const gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS)
    const leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS)

    for (let idx = 0; idx < gatherSpirits.length; idx++) {
      const spirit = gatherSpirits[idx]
      gather2(spirit, idx)
      fightBasic(spirit)
    }
    const fightingSpirits = [...leftoverSpirits]
    for (let idx = 0; idx < fightingSpirits.length; idx++) {
      const spirit = fightingSpirits[idx]
      moveWithStrategy(spirit)
      fightAggressive(spirit)
    }
  }
  main()


} catch (e) {
  console.log(e.message)
}
