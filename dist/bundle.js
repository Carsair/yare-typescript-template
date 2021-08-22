(() => {
  // src/geometry.ts
  var Geometry = {
    calcDistance: (a, b) => {
      return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    },
    calcRunAwayPoint: (a, entityToRunFrom) => {
      return [a.position[0] + a.position[0] - entityToRunFrom.position[0], a.position[1] + a.position[1] - entityToRunFrom.position[1]];
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
      if (spirit.shout && spirit.id == "Carsair_13") {
        spirit.shout(orientation, tanDelX, tanDelY);
        console.log("Regular: ", tanDelX, tanDelY);
      }
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
      console.log("Clockwise: ", tanDelX, tanDelY);
      const tangentPoint = [x1 + tanDelX, y1 + tanDelY].map(Math.round);
      return tangentPoint;
    }
  };
  var geometry_default = Geometry;

  // src/main.ts
  try {
    const shout = (spirit, message) => {
      spirit.shout(("" + message).substring(0, 20));
    };
    const calcAveragePos = (...posArr) => {
      let x = 0, y = 0;
      for (const pos in posArr) {
        x = x + posArr[pos][0];
        y = y + posArr[pos][1];
      }
      return [x / posArr.length, y / posArr.length];
    };
    const calcDistance = (a, b) => {
      return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    };
    const calcRunAwayPoint = (a, entityToRunFrom) => {
      return [a.position[0] + a.position[0] - entityToRunFrom.position[0], a.position[1] + a.position[1] - entityToRunFrom.position[1]];
    };
    const calcClosestSpirit = (spiritsArr, point) => {
      let closestSpirit = null;
      let closestDistance = Infinity;
      for (let j = 0; j < spiritsArr.length; j++) {
        const enemy = spiritsArr[j];
        const distance = calcDistance(point.position, enemy.position);
        if (distance < closestDistance) {
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
        const distance = calcDistance(spirit.position, enemy.position);
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
    const getGatherMax = () => {
      return 4;
      if (tick < 50)
        return 12;
      if (tick < 100)
        return 12;
      if (tick < 150)
        return 12;
      if (tick < 200)
        return 12;
      if (tick < 250)
        return 12;
      if (tick < 300)
        return 12;
      if (tick < 350)
        return 12;
      if (tick < 400)
        return 12;
      if (tick < 450)
        return 40;
      if (tick < 500)
        return 48;
      return 52;
    };
    const myStar = base.position[0] === 2600 ? star_a1c : star_zxq;
    const enemyStar = base.position[0] === 2600 ? star_zxq : star_a1c;
    const myNexusPos = calcAveragePos(myStar.position, base.position);
    const myAliveSpirits = my_spirits.filter((s) => s.hp);
    const enemyAliveSpirits = Object.keys(spirits).reduce((acc, id) => {
      const s = spirits[id];
      if (s.hp && s.id.indexOf("Carsair") < 0)
        acc.push(s);
      return acc;
    }, []);
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
    const MAX_GATHERERS = Math.min(getGatherMax(), 4 * Math.round(myStar.energy * 0.01 + 3));
    const plannedEnergyObj = {};
    const desiredStarEnergy = Math.min(974, Math.pow(tick, 1.35));
    console.log("Base: ", base.position);
    console.log("myStar: ", myStar.position);
    console.log("enemyStar: ", enemyStar.position);
    console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)");
    console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)");
    console.log("Planning for tick, star: ", tick, desiredStarEnergy);
    console.log("Planning for energies: us:", playerTotalEnergies[0], " them: ", playerTotalEnergies[1]);
    gather2 = (spirit, idx) => {
      if (idx % 4 == 3) {
        const closeToStar = calcAveragePos(myStar.position, myStar.position, myStar.position, base.position);
        spirit.move(closeToStar);
        if (myStar.energy > desiredStarEnergy)
          spirit.energize(spirit);
        const connection = myAliveSpirits[idx - 2];
        if (connection && connection.energy <= connection.energy_capacity - 1 && spirit.energy == spirit.energy_capacity) {
          spirit.energize(connection);
        }
      } else if (idx % 4 == 2) {
        const closeToBase = calcAveragePos(base.position, base.position, base.position, myStar.position);
        spirit.move(closeToBase);
        if (base.energy < base.energy_capacity && spirit.energy >= spirit.energy_capacity - 1 && true) {
          spirit.energize(base);
        }
      } else if (idx % 4 == 1) {
        const middlePoint = calcAveragePos(base.position, myStar.position);
        spirit.move(middlePoint);
        const connection = myAliveSpirits[idx + 1];
        if (connection && connection.energy < connection.energy_capacity && spirit.energy >= spirit.energy_capacity - 1) {
          spirit.energize(myAliveSpirits[idx + 1]);
        }
      } else {
        const closeToStar = calcAveragePos(myStar.position, myStar.position, myStar.position, base.position);
        spirit.move(closeToStar);
        if (myStar.energy > desiredStarEnergy)
          spirit.energize(spirit);
        const connection = myAliveSpirits[idx + 1];
        if (connection && connection.energy <= connection.energy_capacity && spirit.energy == spirit.energy_capacity) {
          spirit.energize(connection);
        }
      }
    };
    const moveWithStrategy = (spirit) => {
      if (spirit.energy < spirit.energy_capacity) {
        gatherClosestStar(spirit);
        return;
      }
      let defendPoint;
      defendPoint = geometry_default.calcTangentPointFromPoint(spirit, outpost, 200);
      if (parseInt(spirit.id.split("_")[1]) % 2 == 1)
        defendPoint = geometry_default.calcClockwiseTangentPointFromPoint(spirit, outpost, 200);
      if (Array.isArray(defendPoint)) {
        const seedX = 0;
        const seedY = 0;
        spirit.move([defendPoint[0] + seedX, defendPoint[1] + seedY]);
      }
    };
    const gatherClosestStar = (spirit) => {
      let closestDist = null;
      const availableStar = [myStar, enemyStar].reduce((acc, star) => {
        const dist = calcDistance(spirit.position, star.position);
        if (closestDist == null || dist < closestDist) {
          closestDist = dist;
          acc = star;
        }
        return acc;
      }, null);
      if (calcDistance(availableStar.position, spirit.position) > 200) {
        spirit.move(availableStar.position);
      } else {
        if (availableStar.energy > desiredStarEnergy / 2)
          spirit.energize(spirit);
      }
    };
    const fightBasic = (spirit) => {
      let isFighting = false;
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          isFighting = true;
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe < 200) {
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
          }
        }
      }
      return isFighting;
    };
    const fightAggressive = (spirit) => {
      let isFighting = false;
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe > 200)
            spirit.move(closestEnemyToMe.position);
          if (closestDistanceToMe < 200)
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
        }
      }
      return isFighting;
    };
    const fightSmart = (spirit) => {
      let isFighting;
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe < 200)
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
        }
      } else if (spirit.sight.enemies) {
        const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesNearby, spirit);
        if (closestEnemyToMe) {
          if (closestEnemyToMe.energy > spirit.energy && calcDistance(closestEnemyToMe.position, base.position) > 400) {
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
          } else if (closestDistanceToMe < 200) {
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
          } else {
            spirit.move(closestEnemyToMe.position);
          }
        }
      }
      return isFighting;
    };
    const fightToWin = (spirit) => {
      if (false) {
        spirit.move(enemy_base.position);
        spirit.energize(enemy_base);
      }
    };
    const main = () => {
      let potentialGatherSpiritsClose = [];
      let potentialGatherSpiritsFar = [];
      myAliveSpirits.forEach((s) => {
        if (calcDistance(myNexusPos, s.position) < 500)
          potentialGatherSpiritsClose.push(s);
        else
          potentialGatherSpiritsFar.push(s);
      });
      potentialGatherSpiritsFar.sort((spiritA, spiritB) => calcDistance(spiritB.position, myNexusPos) - calcDistance(spiritA.position, myNexusPos));
      const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar];
      const gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS);
      const leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS);
      for (let idx = 0; idx < gatherSpirits.length; idx++) {
        const spirit = gatherSpirits[idx];
        gather2(spirit, idx);
        fightBasic(spirit);
      }
      const fightingSpirits = [...leftoverSpirits];
      for (let idx = 0; idx < fightingSpirits.length; idx++) {
        const spirit = fightingSpirits[idx];
        moveWithStrategy(spirit);
      }
    };
    main();
  } catch (e) {
    console.log(e.message);
  }
  var gather2;
})();
