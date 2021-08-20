(() => {
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
      if (tick < 50)
        return 8;
      if (tick < 100)
        return 12;
      if (tick < 200)
        return 16;
      if (tick < 250)
        return 20;
      if (tick < 300)
        return 24;
      if (tick < 350)
        return 28;
      if (tick < 400)
        return 32;
      if (tick < 450)
        return 36;
      if (tick < 500)
        return 40;
      if (tick < 600)
        return 44;
      return 52;
    };
    const myStar = base.position[0] === 2600 ? star_a1c : star_zxq;
    const enemyStar = base.position[0] === 2600 ? star_zxq : star_a1c;
    const myAliveSpirits = my_spirits.filter((s) => s.hp);
    const enemyAliveSpirits = Object.keys(spirits).reduce((acc, id) => {
      const s = spirits[id];
      if (s.hp && s.id.indexOf("Carsair") < 0)
        acc.push(s);
      return acc;
    }, []);
    const MAX_GATHERERS = Math.min(getGatherMax(), 4 * Math.round(myStar.energy * 0.01 + 3));
    const plannedEnergyObj = {};
    const desiredStarEnergy = Math.min(974, Math.pow(tick, 1.35));
    console.log("Base: ", base.position);
    console.log("myStar: ", myStar.position);
    console.log("enemyStar: ", enemyStar.position);
    console.log("We have", my_spirits.length, myAliveSpirits.length, "(alive)", MAX_GATHERERS, "(gather)");
    console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, enemyAliveSpirits.length, "(alive)");
    console.log("Planning for tick, star: ", tick, desiredStarEnergy);
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
      const defendPoint = outpost.position;
      const seedX = Math.floor(Math.random() * 100) - 100;
      const seedY = Math.floor(Math.random() * 100) - 100;
      spirit.move([defendPoint[0] + seedX, defendPoint[1] + seedY]);
    };
    const fightBasic = (spirit) => {
      let isFighting = false;
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe < 200)
            spirit.move(calcRunAwayPoint(spirit, closestEnemyToMe));
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
    const main = () => {
      const potentialGatherSpirits = myAliveSpirits.filter((s) => s.energy_capacity == 10);
      const gatherSpirits = potentialGatherSpirits.slice(0, MAX_GATHERERS);
      const leftoverSpirits = potentialGatherSpirits.slice(MAX_GATHERERS);
      var potenialBigSpirits = myAliveSpirits.filter((s) => s.energy_capacity > 10);
      for (let idx = 0; idx < gatherSpirits.length; idx++) {
        var spirit = gatherSpirits[idx];
        gather2(spirit, idx);
        fightBasic(spirit);
      }
      var fightingSpirits = [...potenialBigSpirits, ...leftoverSpirits];
      for (let idx = 0; idx < fightingSpirits.length; idx++) {
        var spirit = fightingSpirits[idx];
        moveWithStrategy(spirit);
        fightAggressive(spirit);
      }
    };
    main();
  } catch (e) {
    console.log(e.message);
  }
  var gather2;
})();
