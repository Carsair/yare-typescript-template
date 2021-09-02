(() => {
  // src/geometry.ts
  var Geometry = {
    calcDistance: (a, b) => {
      return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    },
    calcPointBetweenPoints: (a, b, distFromA) => {
      const totalDist = Geometry.calcDistance(a, b);
      const percentAlong = distFromA / totalDist;
      const [x1, y1] = a;
      const [x2, y2] = b;
      return [x1 + percentAlong * (x2 - x1), y1 + percentAlong * (y2 - y1)];
    },
    calcRunAwayPoint: (a, entityToRunFrom) => {
      return [a.position[0] + a.position[0] - entityToRunFrom.position[0], a.position[1] + a.position[1] - entityToRunFrom.position[1]];
    },
    calcAveragePos: (...posArr) => {
      let x = 0, y = 0;
      for (const pos in posArr) {
        x = x + posArr[pos][0];
        y = y + posArr[pos][1];
      }
      return [x / posArr.length, y / posArr.length];
    },
    calcTangentPointFromPoint: (spirit, avoidEntity, radius) => {
      const d = Geometry.calcDistance(spirit.position, avoidEntity.position);
      if (d < radius)
        return Geometry.calcRunAwayPoint(spirit, avoidEntity);
      const [x1, y1] = spirit.position;
      const [x2, y2] = avoidEntity.position;
      let orientation = "upright";
      if (x2 < x1 && y2 < y1)
        orientation = "upleft";
      if (x2 > x1 && y2 > y1)
        orientation = "downright";
      if (x2 < x1 && y2 > y1)
        orientation = "downleft";
      const flipperX = orientation.indexOf("upleft") >= 0 || orientation.indexOf("upright") >= 0 ? -1 : 1;
      const flipperY = orientation.indexOf("upleft") >= 0 || orientation.indexOf("upright") >= 0 ? -1 : 1;
      const r = radius;
      const alpha = Math.sqrt(Math.pow(d, 2) + Math.pow(r, 2));
      const delX = x2 - x1;
      const delY = y2 - y1;
      const angle1 = Math.asin(r / d);
      const angle2 = Math.atan(delX / delY);
      const angle3 = angle2 - angle1;
      const tanDelX = flipperX * alpha * Math.sin(angle3);
      const tanDelY = flipperY * alpha * Math.cos(angle3);
      const tangentPoint = [x1 + tanDelX, y1 + tanDelY].map(Math.round);
      return tangentPoint;
    },
    calcClockwiseTangentPointFromPoint: (spirit, avoidEntity, radius) => {
      const d = Geometry.calcDistance(spirit.position, avoidEntity.position);
      if (d < radius)
        return Geometry.calcRunAwayPoint(spirit, avoidEntity);
      const [x1, y1] = spirit.position;
      const [x2, y2] = avoidEntity.position;
      let orientation = "upright";
      if (x2 < x1 && y2 < y1)
        orientation = "upleft";
      if (x2 > x1 && y2 > y1)
        orientation = "downright";
      if (x2 < x1 && y2 > y1)
        orientation = "downleft";
      const flipperX = orientation.indexOf("upleft") >= 0 || orientation.indexOf("downleft") >= 0 ? -1 : 1;
      const flipperY = orientation.indexOf("upleft") >= 0 || orientation.indexOf("downleft") >= 0 ? -1 : 1;
      const r = radius;
      const alpha = Math.sqrt(Math.pow(d, 2) + Math.pow(r, 2));
      const delX = x2 - x1;
      const delY = y2 - y1;
      const angle1 = Math.asin(r / d);
      const angle2 = Math.atan(delY / delX);
      const angle3 = angle2 - angle1;
      const tanDelX = flipperY * alpha * Math.cos(angle3);
      const tanDelY = flipperX * alpha * Math.sin(angle3);
      const tangentPoint = [x1 + tanDelX, y1 + tanDelY].map(Math.round);
      return tangentPoint;
    }
  };
  var geometry_default = Geometry;

  // src/main.ts
  try {
    const calcClosestSpirit = (spiritsArr, point) => {
      let closestSpirit = null;
      let closestDistance = Infinity;
      for (let j = 0; j < spiritsArr.length; j++) {
        const enemy = spiritsArr[j];
        const distance = geometry_default.calcDistance(point.position, enemy.position);
        if (distance < closestDistance) {
          closestSpirit = enemy;
          closestDistance = distance;
        }
      }
      return { closestSpirit, closestDistance };
    };
    const calcClosestShootSpirit = (spiritsArr, point) => {
      let closestSpirit = null;
      let closestDistance = Infinity;
      for (let j = 0; j < spiritsArr.length; j++) {
        const enemy = spiritsArr[j];
        const distance = geometry_default.calcDistance(point.position, enemy.position);
        if (distance < closestDistance && enemy.energy >= 0) {
          closestSpirit = enemy;
          closestDistance = distance;
        }
      }
      return { closestSpirit, closestDistance };
    };
    const getSpiritsWithinRange = (spirit, spiritsArr, range) => {
      let closestEnemy = null;
      let closestDistance = Infinity;
      for (let j = 0; j < spiritsArr.length; j++) {
        const enemy = spiritsArr[j];
        const distance = geometry_default.calcDistance(spirit.position, enemy.position);
        if (distance < closestDistance) {
          closestEnemy = enemy;
          closestDistance = distance;
        }
      }
      if (closestEnemy) {
        return [closestEnemy, closestDistance];
      } else {
        return [null, null];
      }
    };
    const getMaxGather = () => {
      return 36;
      return 52;
    };
    const isSouthSpawn = base.position[0] === 2600;
    const myStar = isSouthSpawn ? star_a1c : star_zxq;
    const enemyStar = isSouthSpawn ? star_zxq : star_a1c;
    const myNexusPos = geometry_default.calcAveragePos(myStar.position, base.position);
    const myAliveSpirits = my_spirits.filter((s) => s.hp);
    const enemySpirits = Object.keys(spirits).map((s) => spirits[s]).filter((s) => s.id.indexOf("Carsair") < 0);
    const enemyAliveSpirits = enemySpirits.filter((s) => s.hp);
    const enemySize = enemySpirits[0].size;
    const enemyShape = enemySize == 1 ? "circle" : enemySize == 3 ? "triangle" : "square";
    const playerTotalEnergies = Object.keys(spirits).reduce((acc, id) => {
      const s = spirits[id];
      if (!s.hp)
        return acc;
      if (s.id.indexOf("Carsair") >= 0) {
        acc[0] += s.energy;
      } else {
        acc[1] += s.energy;
      }
      return acc;
    }, [0, 0]);
    const MAX_GATHERERS = getMaxGather();
    const plannedEnergyObj = {};
    const desiredStarEnergy = 0;
    console.log("Enemy Shape: ", enemyShape, enemySize);
    console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)");
    console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)");
    console.log("Planning for tick, star: ", tick, desiredStarEnergy);
    console.log("Planning for energies: us:", playerTotalEnergies[0], " them: ", playerTotalEnergies[1]);
    const CLOSE_TO_STAR_POS = geometry_default.calcPointBetweenPoints(myStar.position, base.position, 199);
    const CLOSE_TO_BASE_POS = geometry_default.calcPointBetweenPoints(base.position, myStar.position, 199);
    const MIDDLE_POINT_POS = geometry_default.calcAveragePos(base.position, myStar.position);
    const NEW_SPAWN_POS = isSouthSpawn ? [2620, 1760] : [1580, 640];
    const gatherDumpSimple = (spirit) => {
      const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0;
      if (!isBaseBeamable)
        spirit.move(base.position);
      spirit.energize(base);
    };
    const gatherHauling = (spirit) => {
      const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0);
      const isStarBeamable = geometry_default.calcDistance(spirit.position, myStar.position) <= 200;
      if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
        spirit.energize(base);
        spirit.energy -= spirit.size;
      } else if (isStarBeamable && myStar.energy > desiredStarEnergy) {
        spirit.energize(spirit);
        spirit.energy += spirit.size;
      }
      if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("full");
      } else if (spirit.energy == 0) {
        spirit.set_mark("empty");
      }
      if (baseStructs.length == 0 && spirit.mark == "full") {
        spirit.move(base.position);
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(myStar.position);
      }
    };
    const gatherBase = (spiritArr) => {
      const safeEnergy = 0;
      spiritArr.forEach((spirit) => {
        if (spirit.size > 1)
          spirit.divide && spirit.divide();
        const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0;
        spirit.move(CLOSE_TO_BASE_POS);
        spirit.hasConnection = false;
        if (isBaseBeamable && base.energy < base.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(base);
          spirit.energy -= spirit.size;
          base.energy += spirit.size;
        }
      });
    };
    const gatherChainHauling = (spiritArr, connectionArr) => {
      const safeEnergy = 0;
      spiritArr = spiritArr.sort((a, b) => a.energy - b.energy);
      spiritArr.forEach((spirit) => {
        if (spirit.size > 1)
          spirit.divide && spirit.divide();
        const isStarBeamable = geometry_default.calcDistance(spirit.position, myStar.position) <= 200;
        const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0);
        const connection = connectionArr.sort((a, b) => a.energy - b.energy).find((s) => {
          if (spirit.sight.friends_beamable.find((s2) => s2 == s.id) && s.energy < s.energy_capacity && !s.hasConnection) {
            return true;
          }
        });
        if (isBaseBeamable) {
          spirit.energize(base);
          spirit.energy -= spirit.size;
          base.energy += spirit.size;
        } else if (isStarBeamable && myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
          myStar.energy -= spirit.size;
          spirit.energy += spirit.size;
        } else if (connection) {
          spirit.energize(connection);
          spirit.energy -= spirit.size;
          connection.energy += spirit.size;
        }
        if (spirit.energy == spirit.energy_capacity) {
          spirit.set_mark("full");
        } else if (spirit.energy == 0) {
          spirit.set_mark("empty");
        } else if (!spirit.mark) {
          spirit.set_mark("empty");
        }
        if (!connection && spirit.mark == "full") {
          spirit.move(CLOSE_TO_BASE_POS);
        } else if (!isStarBeamable && spirit.mark == "empty") {
          spirit.move(myStar.position);
        }
        spirit.shout(spirit.mark);
      });
    };
    const gatherStar = (spiritArr, connectionArr) => {
      spiritArr.forEach((spirit) => {
        spirit.move(CLOSE_TO_STAR_POS);
        if (myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
      });
    };
    const gatherChain = (spirit, idx) => {
      const DUMP_UNTIL = 111900;
      const safeEnergy = tick > DUMP_UNTIL ? 8 : 0;
      if (idx % 4 == 3) {
        spirit.move(CLOSE_TO_STAR_POS);
        if (myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
        const connection = myAliveSpirits[idx - 2];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else if (idx % 4 == 2) {
        spirit.move(CLOSE_TO_BASE_POS);
        const connection = base;
        const isBeamable = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else if (idx % 4 == 1) {
        spirit.move(MIDDLE_POINT_POS);
        const connection = myAliveSpirits[idx + 1];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else {
        spirit.move(CLOSE_TO_STAR_POS);
        if (myStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
        const connection = myAliveSpirits[idx + 1];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      }
    };
    const gatherNew = (gatherSpirits) => {
      const firstSpirit = gatherSpirits[0];
      firstSpirit.energize(base);
      firstSpirit.move(NEW_SPAWN_POS);
      const restOfSpirits = gatherSpirits.slice(1);
      restOfSpirits.forEach((s) => {
        s.move(NEW_SPAWN_POS);
        s.merge && s.merge(firstSpirit);
      });
    };
    const moveWithStrategy = (spirit) => {
      if (spirit.energy < spirit.energy_capacity) {
        gatherClosestStar(spirit);
        return;
      }
      let defendPoint;
      defendPoint = geometry_default.calcTangentPointFromPoint(spirit, outpost, 620);
      if (parseInt(spirit.id.split("_")[1]) % 2 == 1)
        defendPoint = geometry_default.calcClockwiseTangentPointFromPoint(spirit, outpost, 620);
      if (Array.isArray(defendPoint)) {
        const seedX = 0;
        const seedY = 0;
        spirit.move([defendPoint[0] + seedX, defendPoint[1] + seedY]);
      }
    };
    const curveToStarStrategy = (spirit) => {
      const enemyControlsOutpost = true;
      const outpostRange = 600;
      if (spirit.energy < spirit.energy_capacity) {
        gatherClosestStar(spirit, [enemyStar, star_p89]);
        return;
      }
      let defendPoint;
      defendPoint = geometry_default.calcClockwiseTangentPointFromPoint(spirit, outpost, 950);
      if (Array.isArray(defendPoint)) {
        const seedX = 0;
        const seedY = 0;
        spirit.move([defendPoint[0] + seedX, defendPoint[1] + seedY]);
      }
    };
    const chargeOutpostStrategy = (spirit) => {
      const enemyControlsOutpost = outpost.control.indexOf("Carsair") < 0;
      const outpostStructs = spirit.sight.structures.filter((s) => s.indexOf("outpost") >= 0);
      if (outpostStructs.length > 0 && spirit.energy >= 8 && (outpost.energy < 725 || enemyControlsOutpost)) {
        spirit.energize(outpost);
      } else if (spirit.energy == spirit.energy_capacity && outpost.energy < 725) {
        spirit.move(outpost.position);
      } else if (spirit.energy >= spirit.energy_capacity && outpost.energy >= 725) {
        spirit.move(enemy_base.position);
      } else {
        gatherClosestStar(spirit);
      }
    };
    const gatherClosestStar = (spirit, starArr) => {
      let closestDist = null;
      starArr = starArr ? starArr : [myStar, star_p89, enemyStar];
      const availableStar = starArr.reduce((acc, star) => {
        const dist = geometry_default.calcDistance(spirit.position, star.position);
        if (closestDist == null || dist < closestDist) {
          closestDist = dist;
          acc = star;
        }
        return acc;
      }, null);
      if (geometry_default.calcDistance(availableStar.position, spirit.position) > 200) {
        spirit.move(availableStar.position);
      } else {
        if (spirit.energy < spirit.energy_capacity && availableStar.energy > desiredStarEnergy)
          spirit.energize(spirit);
      }
    };
    const fightBasic = (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestShootSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          closestEnemyToMe.energy = closestEnemyToMe.energy - spirit.size * 2;
        }
      }
    };
    const fightBaseEmergency = (spirit) => {
      const baseEnemies = base.sight.enemies.map((s) => spirits[s]).filter((s) => geometry_default.calcDistance(s.position, base.position) < 250);
      if (baseEnemies.length > 0) {
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(baseEnemies, spirit);
        if (closestEnemyToMe) {
          if (closestDistanceToMe > 200) {
            spirit.move(closestEnemyToMe.position);
          }
        }
        if (spirit.energy == 0) {
          memory[spirit.id] = memory[spirit.id] || {};
          memory[spirit.id].status = "depleted";
        }
        if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
          gatherClosestStar(spirit, [myStar]);
          if (spirit.energy == spirit.energy_capacity) {
            memory[spirit.id].status = "";
          }
        }
      } else if (memory[spirit.id] && memory[spirit.id].status) {
        memory[spirit.id].status = "";
      }
    };
    const fightForTheBase = (spirit) => {
      if (base.sight.enemies.length > 0) {
        const baseEnemies = base.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(baseEnemies, spirit);
        if (closestEnemyToMe) {
          if (closestDistanceToMe > 200) {
            spirit.move(closestEnemyToMe.position);
          }
        }
        if (spirit.energy == 0) {
          memory[spirit.id] = memory[spirit.id] || {};
          memory[spirit.id].status = "depleted";
        }
        if (memory[spirit.id] && memory[spirit.id].status == "depleted") {
          gatherClosestStar(spirit, [myStar]);
          if (spirit.energy == spirit.energy_capacity) {
            memory[spirit.id].status = "";
          }
        }
      } else if (memory[spirit.id] && memory[spirit.id].status) {
        memory[spirit.id].status = "";
      }
    };
    const fightAggressive = (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe > 200)
            spirit.move(closestEnemyToMe.position);
          if (closestDistanceToMe < 200)
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
        }
      }
    };
    const fightAggressive2 = (spirit) => {
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(enemyAliveSpirits, spirit);
      if (closestEnemyToMe) {
        const weBigger = spirit.energy / spirit.energy_capacity > closestEnemyToMe.energy / closestEnemyToMe.energy_capacity;
        if (weBigger && closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        } else if (true) {
          spirit.move(closestEnemyToMe.position);
        } else if (closestDistanceToMe < 200) {
          spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe.position));
        }
      }
    };
    const fightAggressive3 = (spiritArr) => {
      spiritArr.forEach((spirit, idx) => {
        const buddy = spiritArr[idx - 1];
        if (buddy && buddy.size < enemySize) {
          spirit.merge && spirit.merge(buddy);
        }
        if (spirit.size >= enemySize)
          spirit.move(enemy_base.position);
        if (spirit.sight.enemies) {
          const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
          const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesNearby, spirit);
          if (closestEnemyToMe) {
            const weBigger = closestEnemyToMe.energy / closestEnemyToMe.energy_capacity > spirit.energy / spirit.energy_capacity;
            if (weBigger && closestDistanceToMe > 200) {
              spirit.move(closestEnemyToMe.position);
            } else if (!weBigger && closestDistanceToMe < 225) {
              spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
            }
          }
        }
        if (spirit.energy == 0) {
          gatherClosestStar(spirit, [myStar, star_p89]);
        }
      });
    };
    const fightSmart = (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0)
        return;
      if (spirit.sight.enemies) {
        const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesNearby, spirit);
        if (closestEnemyToMe) {
          if (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity > spirit.energy / spirit.energy_capacity && geometry_default.calcDistance(closestEnemyToMe.position, base.position) > 400) {
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
          } else if (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity > spirit.energy / spirit.energy_capacity && closestDistanceToMe < 200) {
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
          } else {
            spirit.move(closestEnemyToMe.position);
          }
        }
      }
    };
    const fightToWin = (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0)
        return;
      const enemyStructs = spirit.sight.structures.filter((s) => s.indexOf("Carsair") < 0 && s.indexOf("base") >= 0);
      if (enemyStructs.length > 0) {
        spirit.energize(enemy_base);
      }
    };
    const mergeTogetherStrategy = (spirit) => {
      const maxCapac = 10 * enemyAliveSpirits[0].energy_capacity;
      if (spirit.sight.friends.length > 0) {
        const friendsNearby = spirit.sight.friends.map((s) => spirits[s]);
        const { closestSpirit: closestFriendToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(friendsNearby, spirit);
        if (closestFriendToMe) {
          if (closestDistanceToMe <= 10 && spirit.energy_capacity + closestFriendToMe.energy_capacity <= maxCapac) {
            spirit.shout(closestFriendToMe.id);
            if (spirit.merge)
              spirit.merge(closestFriendToMe);
          }
        }
      }
    };
    const main = () => {
      let potentialGatherSpiritsClose = [];
      let potentialGatherSpiritsFar = [];
      myAliveSpirits.forEach((s) => {
        if (geometry_default.calcDistance(myNexusPos, s.position) < 500)
          potentialGatherSpiritsClose.push(s);
        else
          potentialGatherSpiritsFar.push(s);
      });
      potentialGatherSpiritsFar.sort((spiritA, spiritB) => geometry_default.calcDistance(spiritB.position, myNexusPos) - geometry_default.calcDistance(spiritA.position, myNexusPos));
      const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar];
      const gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS);
      const leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS);
      const transitionTime = 2;
      if (tick >= transitionTime) {
        const indexLimit = Math.round(gatherSpirits.length * 0.27);
        const gatherBasers = gatherSpirits.slice(0, indexLimit);
        const gatherHaulers = gatherSpirits.slice(indexLimit);
        gatherBase(gatherBasers);
        gatherChainHauling(gatherHaulers, gatherBasers);
      }
      for (let idx = 0; idx < gatherSpirits.length; idx++) {
        const spirit = gatherSpirits[idx];
        if (tick < transitionTime)
          gatherDumpSimple(spirit);
        fightBaseEmergency(spirit);
        fightBasic(spirit);
      }
      const fightingSpirits = [...leftoverSpirits];
      fightAggressive3(fightingSpirits);
      for (let idx = 0; idx < fightingSpirits.length; idx++) {
        const spirit = fightingSpirits[idx];
        fightForTheBase(spirit);
        fightBasic(spirit);
        fightToWin(spirit);
      }
    };
    main();
  } catch (e) {
    console.log(e.message);
  }
})();
