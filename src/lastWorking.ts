// var calcAveragePos = (...posArr) => {
//     let x = 0, y = 0;
//     for (pos in posArr) {
//         x += posArr[pos][0]
//         y += posArr[pos][1]
//     }
//     return [x/posArr.length, y/posArr.length]
// }

// var calcDistance = (a, b) => {
//     return Math.sqrt(
//         (a[0]-b[0]) * (a[0]-b[0])
//         +
//         (a[1]-b[1]) * (a[1]-b[1])
//     )
// }

// var calcRunAwayPoint = (a, b) => {
//     return [a.position[0] + a.position[0] - b.position[0], a.position[1] + a.position[1] - b.position[1]]
// }

// var calcClosestSpirit = (spiritsArr, point) => {
//     let closestEnemy = null;
//     let closestDistance = Infinity;
//     for (j = 0; j < spiritsArr.length; j++) {
//         const enemy = spiritsArr[j];
//         const distance = calcDistance(point.position, enemy.position);

//         if (distance < closestDistance) {
//             closestEnemy = enemy
//             closestDistance = distance
//         }
//     }
//     if (closestEnemy) {
//         return [closestEnemy, closestDistance]
//     } else {
//         return [null, null]
//     }
// }

// var getSpiritsWithinRange = (spirit, spiritsArr, range) => {
//     let closestEnemy = null;
//     let closestDistance = Infinity;
//     for (j = 0; j < spiritsArr.length; j++) {
//         const enemy = spiritsArr[j];
//         const distance = calcDistance(point.position, enemy.position);

//         if (distance < closestDistance) {
//             closestEnemy = enemy
//             closestDistance = distance
//         }
//     }
//     if (closestEnemy) {
//         return [closestEnemy, closestDistance]
//     } else {
//         return [null, null]
//     }
// }

// var getGatherMax = () => {
//     if (tick < 50) return 8
//     if (tick < 100) return 12
//     if (tick < 200) return 16
//     if (tick < 250) return 20
//     if (tick < 300) return 24
//     if (tick < 350) return 28
//     if (tick < 400) return 32
//     if (tick < 450) return 36
//     if (tick < 500) return 40
//     if (tick < 600) return 44
//     return 52
// }

// var shout = (spirit, message) => {
//     spirit.shout((''+message).substring(0,20))
// }

// var closestStar = base.position[0] === 2600 ? star_a1c : star_zxq;
// var enemyStar = base.position[0] === 2600 ? star_zxq : star_a1c;
// var specialDefend = calcAveragePos(closestStar.position, base.position, star_p89.position)
// var specialAttack = calcAveragePos(enemy_base.position, enemyStar.position)
// var my_alive_spirits = my_spirits.filter((s) => s.hp)
// var enemy_alive_spirits = Object.keys(spirits).reduce((acc, sName) => {
//     const s = spirits[sName]
//     if (s.hp && s.id.indexOf('Carsair') < 0) acc.push(s)
//     return acc
// }, [])
// var MAX_GATHERERS = Math.min(getGatherMax(), 4*Math.round(closestStar.energy*.01 + 3))
// var plannedEnergyObj = {}
// var desiredStarEnergy = Math.min(974, Math.pow(tick,1.35))
// // var lineReserveCapacity = Math.min(8, Math.round(tick/10))
// console.log("Base: ", base.position)
// console.log("closestStar: ", closestStar.position)
// console.log("enemyStar: ", enemyStar.position)
// console.log("specialDefend: ", specialDefend)
// console.log("specialAttack: ", specialAttack)
// console.log("We have", my_spirits.length, my_alive_spirits.length, "(alive)", MAX_GATHERERS, "(gather)")
// console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemy_alive_spirits.length, "(alive)")
// console.log("Planning for tick, star: ", tick, desiredStarEnergy)

// var gather2 = (spirit, idx) => {
//     if (idx%4==3) {
//         const closeToStar = calcAveragePos(closestStar.position, closestStar.position, closestStar.position, base.position)
//         spirit.move(closeToStar)
//         if (closestStar.energy > desiredStarEnergy) spirit.energize(spirit)
//         const connection = my_alive_spirits[idx-2]
//         if (connection &&
//             connection.energy <= connection.energy_capacity - 1 &&
//             spirit.energy == spirit.energy_capacity) {
//             spirit.energize(connection)
//         }
//     } else if (idx%4==2) {
//         const closeToBase = calcAveragePos(base.position, base.position, base.position, closestStar.position)
//         spirit.move(closeToBase)
//         if (base.energy < base.energy_capacity &&
//             spirit.energy >= spirit.energy_capacity - 1 &&
//             true) {
//             spirit.energize(base)
//         }
//     } else if (idx%4==1) {
//         const middlePoint = calcAveragePos(base.position, closestStar.position)
//         spirit.move(calcAveragePos(closestStar.position, base.position))
//         const connection = my_alive_spirits[idx+1]
//         if (connection &&
//             connection.energy < connection.energy_capacity &&
//             spirit.energy >= spirit.energy_capacity - 1) {
//             spirit.energize(my_alive_spirits[idx+1])
//         }
//     } else {
//         const closeToStar = calcAveragePos(closestStar.position, closestStar.position, closestStar.position, base.position)
//         spirit.move(closeToStar)
//         if (closestStar.energy > desiredStarEnergy) spirit.energize(spirit)
//         const connection = my_alive_spirits[idx+1]
//         if (connection &&
//             connection.energy <= connection.energy_capacity &&
//             spirit.energy == spirit.energy_capacity) {
//             spirit.energize(connection)
//         }
//     }
// }

// var gatherClosestStar = (spirit) => {
//     let closestDist = null;
//     // const availableStar = [star_p89, star_a1c, star_zxq].reduce((acc, star) => {
//     const availableStar = [closestStar].reduce((acc, star) => {
//         const dist = calcDistance(spirit.position, star.position)
//         if (closestDist == null || dist < closestDist) {
//             closestDist = dist
//             acc = star
//         }
//         return acc
//     }, null)
//     // Use distance calc to avoid getting too close.
//     if (calcDistance(availableStar.position, spirit.position) > 200) {
//         spirit.move(availableStar.position)
//     } else {
//         if (availableStar.energy > desiredStarEnergy) spirit.energize(spirit)
//     }

// }

// var fightWithStrategy = (spirit, strategy) => {
//     let isFighting = false

//     // Comment out to attack enemy base (win condition).
//     if (spirit.sight.structures.find((s) => s.indexOf('base') >= 0 && s != 'base_Carsair')) {
//         spirit.energize(enemy_base)
//         isFighting = true
//     }

//     if (strategy == 2) {

//     } else if (strategy == 1) {
//         if (base.sight.enemies.length > 0) {
//             const enemies = base.sight.enemies.map((s) => spirits[s])
//             let [closestEnemyToBase, closestDistanceToBase] = calcClosestSpirit(enemies, base)
//             if (closestEnemyToBase) {
//                 let [closestEnemyToMe, closestDistanceToMe] = calcClosestSpirit(enemies, spirit)
//                 if (spirit.energy > 0) {
//                     if (closestDistanceToMe > 200) {
//                         spirit.move(closestEnemyToMe.position)
//                     } else {
//                         spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe))
//                     }
//                 } else {
//                     gatherClosestStar(spirit)
//                 }
//                 if (closestDistanceToMe < 200) {
//                     isFighting = true
//                     spirit.energize(closestEnemyToMe) // Leaving this outside of the if just in case?
//                 }
//             }
//         } else if (spirit.sight.enemies.length > 0) {
//             const enemies = spirit.sight.enemies.map((s) => spirits[s])
//             let [closestEnemyToMe, closestDistanceToMe] = calcClosestSpirit(enemies, spirit)
//             if (closestEnemyToMe) {
//                 if (spirit.energy - spirit.size > 4) {
//                     if (closestDistanceToMe > 200) {
//                         spirit.move(closestEnemyToMe.position)
//                     } else {
//                         spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe))
//                     }
//                 } else {
//                     gatherClosestStar(spirit)
//                 }
//                 if (closestDistanceToMe < 200) {
//                     isFighting = true
//                     spirit.energize(closestEnemyToMe) // Leaving this outside of the if just in case?
//                 }
//             }
//         }
//     } else {
//         if (spirit.sight.enemies.length > 0) {
//             const enemies = spirit.sight.enemies.map((s) => spirits[s])
//             let [closestEnemyToMe, closestDistanceToMe] = calcClosestSpirit(enemies, spirit)
//             if (closestEnemyToMe) {
//                 if (closestDistanceToMe < 200) {
//                     isFighting = true
//                     spirit.energize(closestEnemyToMe) // Leaving this outside of the if just in case.
//                 }
//             }
//         }
//     }
//     return isFighting;
// }

// var moveWithStrategy = (spirit) => {
//     if (spirit.energy < spirit.energy_capacity) {
//         gatherClosestStar(spirit)
//         return
//     }
//     const defendPoint = calcAveragePos(star_p89.position, base.position, base.position, base.position, base.position, base.position, base.position, closestStar.position)//star_p89.position //enemy_base.position//
//     const seedX = Math.floor(Math.random() * 100) - 100
//     const seedY = Math.floor(Math.random() * 100) - 100
//     defendPoint[0] += seedX
//     defendPoint[1] += seedY
//     spirit.move(defendPoint)
// }

// var mergeTogetherStrategy = (spirit) => {
//     const maxCapac = 10*enemy_alive_spirits[0].energy_capacity;
//     if (spirit.sight.friends.length > 0) {
//         const friends = spirit.sight.friends.map((s) => spirits[s])
//         let [closestFriendToMe, closestDistanceToMe] = calcClosestSpirit(friends, spirit)
//         if (closestFriendToMe) {
//             if (closestDistanceToMe <= 10 &&
//             spirit.energy_capacity + closestFriendToMe.energy_capacity <= maxCapac) {
//                 spirit.shout(closestFriendToMe.id)
//                 spirit.merge(closestFriendToMe)
//             }
//         }
//     }
// }

// main = () => {
//     // Could sort this based on proximity to star or corner.
//     // var gatherSpirits = my_alive_spirits.slice(0, MAX_GATHERERS)
//     var potentialGatherSpirits = my_alive_spirits.filter((s) => s.energy_capacity == 10)
//     gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS)
//     leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS)
//     var potenialBigSpirits = my_alive_spirits.filter((s) => s.energy_capacity > 10)

//     if (gatherSpirits.length < MAX_GATHERERS) {
//         // console.log("NOT ENOUCH")
//         // const spiritDeficit = MAX_GATHERERS - gatherSpirits.length
//         // for (idx = 0; idx < Math.min(spiritDeficit, potenialBigSpirits.length); idx++){
//         //     potenialBigSpirits[idx].divide()
//         // }
//         for (idx = 0; idx < potenialBigSpirits.length; idx++){
//             var spirit = potenialBigSpirits[idx]
//             if (base.energy < base.energy_capacity) {
//                 spirit.energize(base)
//                 spirit.move(base.position)
//             }
//         }
//     }


//     for (idx = 0; idx < gatherSpirits.length; idx++){
//         var spirit = gatherSpirits[idx]
//         gather2(spirit, idx)
//         fightWithStrategy(spirit, 0)
//     }

//     var fightingSpirits = [...potenialBigSpirits, ...leftoverSpirits]
//     // for (idx = 0; idx < fightingSpirits.length; idx++){
//     //     var spirit = fightingSpirits[idx]
//     //     shout(spirit, spirit.energy + "/" + spirit.energy_capacity)
//     //     mergeTogetherStrategy(spirit)
//     // }

//     // fightingSpirits = my_alive_spirits.slice(MAX_GATHERERS)
//     for (idx = 0; idx < fightingSpirits.length; idx++){
//         var spirit = fightingSpirits[idx]
//         moveWithStrategy(spirit)
//         fightWithStrategy(spirit, 1)
//     }

//     // spirits['Carsair_307'].shout(''+spirits['Carsair_307'].energy_capacity)
//     // const myDebugSpirit = spirits['Carsair_62']
//     // if (myDebugSpirit && myDebugSpirit.energy_capacity == 160) myDebugSpirit.set_mark('ready')
//     // if (myDebugSpirit && myDebugSpirit.mark == "ready") {
//     //     myDebugSpirit.set_mark('divided')
//     //     myDebugSpirit.divide()
//     // }
// }

// main()
