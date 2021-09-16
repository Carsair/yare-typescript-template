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
    },
    calcTangentWithIndex: (spirit, avoidEntity, radius, idx) => {
      if (idx % 2 == 1) {
        return Geometry.calcClockwiseTangentPointFromPoint(spirit, avoidEntity, radius);
      } else {
        return Geometry.calcTangentPointFromPoint(spirit, avoidEntity, radius);
      }
    }
  };
  var geometry_default = Geometry;

  // src/utils.ts
  var utils_default = {
    getMaxGather: () => {
      if (tick < 100)
        return 16;
      return Math.min(68, Math.round(0.06 * tick + 12));
    },
    shout: (spirit, message) => {
      spirit.shout(("" + message).substring(0, 20));
    },
    calcClosestSpirit: (spiritsArr, point) => {
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
    },
    calcClosestShootSpirit: (spiritsArr, point) => {
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
    },
    getSpiritsWithinRange: (spirit, spiritsArr, range) => {
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
    }
  };

  // src/consts.ts
  var isSouthSpawn = base.position[0] === 2600;
  var myStar = isSouthSpawn ? star_a1c : star_zxq;
  var enemyStar = isSouthSpawn ? star_zxq : star_a1c;
  var enemySpirits = Object.keys(spirits).map((s) => spirits[s]).filter((s) => s.id.indexOf("Carsair") < 0);
  var enemySize = enemySpirits[0].size;
  var mySize = my_spirits[0].size;
  var specialProximity = 199.999;
  var Consts = {
    isSouthSpawn,
    specialProximity,
    myStar,
    enemyStar,
    middleStar: star_p89,
    myNexusPos: geometry_default.calcAveragePos(myStar.position, base.position),
    myAliveSpirits: my_spirits.filter((s) => s.hp),
    enemySpirits: Object.keys(spirits).map((s) => spirits[s]).filter((s) => s.id.indexOf("Carsair") < 0),
    enemyAliveSpirits: enemySpirits.filter((s) => s.hp),
    enemySize: enemySpirits[0].size,
    mySize: my_spirits[0].size,
    enemyShape: enemySize == 1 ? "circle" : enemySize == 3 ? "triangle" : "square",
    myShape: mySize == 1 ? "circle" : enemySize == 3 ? "triangle" : "square",
    playerTotalEnergies: Object.keys(spirits).reduce((acc, id) => {
      const s = spirits[id];
      if (!s.hp)
        return acc;
      if (s.id.indexOf("Carsair") >= 0) {
        acc[0] += s.energy;
      } else {
        acc[1] += s.energy;
      }
      return acc;
    }, [0, 0]),
    MAX_GATHERERS: utils_default.getMaxGather(),
    plannedEnergyObj: {},
    desiredStarEnergy: Math.min(970, Math.pow(tick, 1.25)),
    desiredStarEnergyMap: {
      [myStar.id]: Math.min(970, Math.pow(tick, 1.25)),
      [star_p89.id]: Math.min(900, Math.pow(Math.max(0, tick - 130), 1.25)),
      [enemyStar.id]: 0
    },
    CLOSE_TO_STAR_POS: geometry_default.calcPointBetweenPoints(myStar.position, base.position, specialProximity),
    CLOSE_TO_BASE_POS: geometry_default.calcPointBetweenPoints(base.position, myStar.position, specialProximity),
    MIDDLE_POINT_POS: geometry_default.calcAveragePos(base.position, myStar.position),
    NEW_SPAWN_POS: isSouthSpawn ? [2620, 1760] : [1580, 640],
    OUTPOST_MAINT_POS: geometry_default.calcAveragePos(outpost.position, star_p89.position)
  };
  var consts_default = Consts;

  // src/gather.ts
  var Gather = {
    gatherDumpSimple: (spirit) => {
      const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0;
      if (!isBaseBeamable)
        spirit.move(base.position);
      spirit.energize(base);
    },
    gatherHaulingMyBase: (spirit, star) => {
      star = star || consts_default.myStar;
      const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0);
      const isStarBeamable = geometry_default.calcDistance(spirit.position, star.position) <= 200;
      if (baseStructs.length > 0 && base.energy < base.energy_capacity) {
        spirit.energize(base);
        spirit.energy -= spirit.size;
        spirit.move(consts_default.CLOSE_TO_BASE_POS);
      } else if (isStarBeamable && star.energy > consts_default.desiredStarEnergy) {
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
        spirit.move(star.position);
      }
    },
    gatherHauling: (spirit, star) => {
      star = star || consts_default.myStar;
      const desiredStarEnergy = consts_default.desiredStarEnergyMap[star.id];
      const baseStructs = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0);
      const isStarBeamable = geometry_default.calcDistance(spirit.position, star.position) <= consts_default.specialProximity;
      if (baseStructs.length > 0 && base.energy < base.energy_capacity && spirit.energy > 0) {
        spirit.energize(base);
        spirit.energy -= spirit.size;
      } else if (isStarBeamable && star.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit);
        spirit.energy += spirit.size;
      }
      if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("full");
      } else if (spirit.energy == 0) {
        spirit.set_mark("empty");
      }
      if (!(spirit.mark == "full" || spirit.mark == "empty")) {
        if (spirit.energy / spirit.energy_capacity > 0.5) {
          spirit.set_mark("full");
        } else {
          spirit.set_mark("empty");
        }
      }
      if (baseStructs.length == 0 && spirit.mark == "full") {
        spirit.move(base.position);
      } else if (!isStarBeamable && spirit.mark == "empty") {
        spirit.move(star.position);
      }
    },
    gatherBase: (spiritArr) => {
      const safeEnergy = 0;
      spiritArr.forEach((spirit) => {
        if (spirit.size > 1)
          consts_default.myShape == "circle" && spirit.divide && spirit.divide();
        const isBaseBeamable = spirit.sight.structures.filter((s) => s == base.id).length > 0;
        spirit.move(consts_default.CLOSE_TO_BASE_POS);
        spirit.hasConnection = false;
        if (isBaseBeamable && base.energy < base.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(base);
          spirit.energy -= spirit.size;
          base.energy += spirit.size;
        }
      });
    },
    gatherInfiniteChain: (spiritArr) => {
      spiritArr = spiritArr.sort((a, b) => a.energy - b.energy);
      spiritArr.forEach((spirit) => {
        const isStarBeamable = geometry_default.calcDistance(spirit.position, consts_default.myStar.position) <= 200;
        const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0);
        const connectionArr = spiritArr.slice(0).filter((s) => s.mark != "empty").filter((s) => spirit.sight.friends_beamable.find((s2) => s2 == s.id)).filter((s) => geometry_default.calcDistance(s.position, base.position) < geometry_default.calcDistance(spirit.position, base.position)).sort((s) => geometry_default.calcDistance(s.position, base.position) - geometry_default.calcDistance(spirit.position, base.position));
        const connection = connectionArr.sort((a, b) => a.energy - b.energy).find((s) => {
          if (s.energy < s.energy_capacity) {
            return true;
          }
        });
        if (spirit.energy > 0 && isBaseBeamable) {
          spirit.energize(base);
          spirit.energy -= spirit.size;
          base.energy += spirit.size;
        } else if (isStarBeamable && consts_default.myStar.energy > consts_default.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
          consts_default.myStar.energy -= spirit.size;
          spirit.energy += spirit.size;
        } else if (spirit.energy > 0 && connection && connection.energy < connection.energy_capacity) {
          spirit.energize(connection);
          spirit.energy -= spirit.size;
          connection.energy += spirit.size;
          spirit.connection = connection;
        }
      });
      spiritArr.forEach((spirit) => {
        const isStarBeamable = geometry_default.calcDistance(spirit.position, consts_default.myStar.position) <= 200;
        const isBaseBeamable = spirit.sight.structures.find((s) => s.indexOf(base.id) >= 0);
        if (spirit.energy == spirit.energy_capacity) {
          spirit.set_mark("full");
        } else if (spirit.energy == 0) {
          spirit.set_mark("empty");
        } else if (!spirit.mark) {
          spirit.set_mark("empty");
        }
        if (!isBaseBeamable && spirit.mark == "full") {
          spirit.move(consts_default.CLOSE_TO_BASE_POS);
        } else if (!isStarBeamable && spirit.mark == "empty") {
          spirit.move(consts_default.CLOSE_TO_STAR_POS);
        }
      });
    },
    gatherChainHauling: (spiritArr, connectionArr) => {
      const safeEnergy = 0;
      spiritArr = spiritArr.sort((a, b) => a.energy - b.energy);
      spiritArr.forEach((spirit) => {
        if (spirit.size > 1)
          consts_default.myShape == "circle" && spirit.divide && spirit.divide();
        const isStarBeamable = geometry_default.calcDistance(spirit.position, consts_default.myStar.position) <= consts_default.specialProximity;
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
        } else if (isStarBeamable && consts_default.myStar.energy > consts_default.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
          consts_default.myStar.energy -= spirit.size;
          spirit.energy += spirit.size;
        } else if (isStarBeamable && consts_default.myStar.energy <= consts_default.desiredStarEnergy && spirit.energy > 0) {
          spirit.energize(consts_default.myStar);
          spirit.energy -= spirit.size;
          consts_default.myStar.energy += spirit.size;
        } else if (connection) {
          spirit.energize(connection);
          spirit.energy -= spirit.size;
          connection.energy += spirit.size;
        }
        if (spirit.energy == spirit.energy_capacity) {
          spirit.set_mark("full");
        } else if (spirit.energy == 0) {
          spirit.set_mark("empty");
        } else if (!(spirit.mark == "full" || spirit.mark == "empty")) {
          if (spirit.energy / spirit.energy_capacity > 0.5) {
            spirit.set_mark("full");
          } else {
            spirit.set_mark("empty");
          }
        }
        if (!connection && spirit.mark == "full") {
          spirit.move(consts_default.CLOSE_TO_BASE_POS);
        } else if (!isStarBeamable && spirit.mark == "empty") {
          spirit.move(consts_default.myStar.position);
        }
      });
    },
    gatherStar: (spiritArr, connectionArr) => {
      spiritArr.forEach((spirit) => {
        spirit.move(consts_default.CLOSE_TO_STAR_POS);
        if (consts_default.myStar.energy > consts_default.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
      });
    },
    gatherChain: (spirit, idx) => {
      const DUMP_UNTIL = 111900;
      const safeEnergy = tick > DUMP_UNTIL ? 8 : 0;
      if (idx % 4 == 3) {
        spirit.move(consts_default.CLOSE_TO_STAR_POS);
        if (consts_default.myStar.energy > consts_default.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
        const connection = consts_default.myAliveSpirits[idx - 2];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else if (idx % 4 == 2) {
        spirit.move(consts_default.CLOSE_TO_BASE_POS);
        const connection = base;
        const isBeamable = spirit.sight.structures.filter((s) => s.indexOf(base.id) >= 0).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0 && spirit.energy >= safeEnergy) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else if (idx % 4 == 1) {
        spirit.move(consts_default.MIDDLE_POINT_POS);
        const connection = consts_default.myAliveSpirits[idx + 1];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      } else {
        spirit.move(consts_default.CLOSE_TO_STAR_POS);
        if (consts_default.myStar.energy > consts_default.desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
          spirit.energize(spirit);
        }
        const connection = consts_default.myAliveSpirits[idx + 1];
        const isBeamable = spirit.sight.friends_beamable.filter((s) => s == connection.id).length > 0;
        if (connection && isBeamable && connection.energy < connection.energy_capacity && spirit.energy > 0) {
          spirit.energize(connection);
          connection.energy += spirit.size;
        }
      }
    },
    gatherNew: (gatherSpirits) => {
      const firstSpirit = gatherSpirits[0];
      firstSpirit.energize(base);
      firstSpirit.move(consts_default.NEW_SPAWN_POS);
      const restOfSpirits = gatherSpirits.slice(1);
      restOfSpirits.forEach((s) => {
        s.move(consts_default.NEW_SPAWN_POS);
        s.merge && s.merge(firstSpirit);
      });
    },
    moveWithStrategy: (spirit) => {
      if (spirit.energy < spirit.energy_capacity) {
        Gather.gatherClosestStar(spirit);
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
    },
    curveToStarStrategy: (spirit) => {
      const enemyControlsOutpost = true;
      const outpostRange = 600;
      if (spirit.energy < spirit.energy_capacity) {
        Gather.gatherClosestStar(spirit, [consts_default.enemyStar, star_p89]);
        return;
      }
      let defendPoint;
      defendPoint = geometry_default.calcClockwiseTangentPointFromPoint(spirit, outpost, 950);
      if (Array.isArray(defendPoint)) {
        const seedX = 0;
        const seedY = 0;
        spirit.move([defendPoint[0] + seedX, defendPoint[1] + seedY]);
      }
    },
    gatherAlwaysNearStar: (spirit, starArr) => {
      let closestDist = null;
      starArr = starArr ? starArr : [consts_default.myStar, star_p89, consts_default.enemyStar];
      const availableStar = starArr.reduce((acc, star) => {
        const dist = geometry_default.calcDistance(spirit.position, star.position);
        const desiredStarEnergy2 = consts_default.desiredStarEnergyMap[star.id];
        if (star.id == consts_default.middleStar.id && tick < 100)
          return acc;
        if ((closestDist == null || dist < closestDist) && star.energy > desiredStarEnergy2) {
          closestDist = dist;
          acc = star;
        }
        return acc;
      }, null);
      const desiredStarEnergy = consts_default.desiredStarEnergyMap[availableStar.id];
      if (availableStar && availableStar.energy > desiredStarEnergy && spirit.energy < spirit.energy_capacity) {
        spirit.energize(spirit);
        availableStar.energy -= spirit.size;
        spirit.energy += spirit.size;
      }
    },
    gatherClosestStar: (spirit, starArr) => {
      if (spirit.energy == 0) {
        spirit.set_mark("empty");
      }
      let closestDist = null;
      starArr = starArr ? starArr : [consts_default.myStar, star_p89, consts_default.enemyStar];
      const availableStar = starArr.reduce((acc, star) => {
        const dist = geometry_default.calcDistance(spirit.position, star.position);
        const desiredStarEnergy = consts_default.desiredStarEnergyMap[star.id];
        if ((closestDist == null || dist < closestDist) && star.energy > desiredStarEnergy) {
          closestDist = dist;
          acc = star;
        }
        return acc;
      }, null);
      if (geometry_default.calcDistance(availableStar.position, spirit.position) > 200) {
        spirit.move(geometry_default.calcPointBetweenPoints(spirit.position, availableStar.position, consts_default.specialProximity));
      } else {
        const desiredStarEnergy = consts_default.desiredStarEnergyMap[availableStar.id];
        if (spirit.energy < spirit.energy_capacity && availableStar.energy > desiredStarEnergy) {
          spirit.energize(spirit);
          availableStar.energy -= spirit.size;
          spirit.energy += spirit.size;
        }
      }
      if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("ready");
      }
    }
  };
  var gather_default = Gather;

  // src/strategies.ts
  var Strategies = {
    spreadAttack: (spiritsArr) => {
    },
    chargeOutpostStrategy: (spirit, idx) => {
      const enemyControlsOutpost = outpost.control.indexOf("Carsair") < 0;
      const starArr = tick < 100 ? [consts_default.myStar, consts_default.enemyStar] : [consts_default.myStar, consts_default.enemyStar, consts_default.middleStar];
      const outpostStructs = spirit.sight.structures.filter((s) => s.indexOf("outpost") >= 0);
      const enemyBaseStructs = spirit.sight.structures.filter((s) => s.indexOf(enemy_base.id) >= 0);
      const canEnergizeOutpost = geometry_default.calcDistance(spirit.position, outpost.position) < 200;
      if (spirit.mark == "empty") {
        return gather_default.gatherClosestStar(spirit, starArr);
      }
      if (spirit.energy == 0) {
        return gather_default.gatherClosestStar(spirit, starArr);
      }
      if (enemyControlsOutpost || outpost.energy == 0) {
        if (canEnergizeOutpost) {
          spirit.energy -= spirit.size;
          outpost.energy += spirit.size;
          spirit.energize(outpost);
        } else if (spirit.energy <= 3) {
          spirit.set_mark("empty");
          return gather_default.gatherClosestStar(spirit, starArr);
        } else {
          spirit.move(consts_default.OUTPOST_MAINT_POS);
        }
        return;
      }
      if (outpost.energy < 200) {
        if (spirit.energy <= 1) {
          spirit.set_mark("empty");
          return gather_default.gatherClosestStar(spirit, starArr);
        } else {
          if (canEnergizeOutpost) {
            spirit.energy -= spirit.size;
            outpost.energy += spirit.size;
            spirit.energize(outpost);
          } else {
            spirit.move(consts_default.OUTPOST_MAINT_POS);
          }
        }
      } else if (outpost.energy < 725) {
        if (spirit.energy <= 5) {
          spirit.set_mark("empty");
          return gather_default.gatherClosestStar(spirit, starArr);
        } else {
          if (canEnergizeOutpost) {
            spirit.energy -= spirit.size;
            outpost.energy += spirit.size;
            spirit.energize(outpost);
          } else {
            spirit.move(consts_default.OUTPOST_MAINT_POS);
          }
        }
      } else if (spirit.energy <= 5) {
        spirit.set_mark("empty");
        return gather_default.gatherClosestStar(spirit, starArr);
      } else {
        spirit.move(consts_default.OUTPOST_MAINT_POS);
      }
    },
    avoidOutpostStrategy: (spirit, idx) => {
      const control = outpost.control;
      const enemyControlsOutpost = control.indexOf("Carsair") < 0 && control != "";
      const outpostRange = outpost.energy > 500 ? 600 : 400;
      const distToOutpost = geometry_default.calcDistance(spirit.position, outpost.position);
      const starArr = tick < 100 ? [consts_default.myStar, consts_default.enemyStar] : [consts_default.myStar, consts_default.enemyStar, consts_default.middleStar];
      if (spirit.mark == "empty") {
        return gather_default.gatherClosestStar(spirit, starArr);
      }
      if (spirit.energy <= 3) {
        spirit.set_mark("empty");
        return gather_default.gatherClosestStar(spirit, starArr);
      }
      if (enemyControlsOutpost) {
        if (distToOutpost < outpostRange + 200) {
          spirit.move(geometry_default.calcTangentWithIndex(spirit, outpost, outpostRange + 20, idx));
        }
      }
    },
    indexProngedAttack: (spirit, idx) => {
      if (spirit.mark == "empty")
        return;
      if (!idx) {
        spirit.move(consts_default.OUTPOST_MAINT_POS);
      } else if (idx % 2 == 0) {
        spirit.move(consts_default.enemyStar.position);
      } else if (idx % 2 == 1) {
        spirit.move(enemy_base.position);
      }
    },
    moveEnemy: (spirit) => {
      spirit.move(enemy_base.position);
    }
  };
  var strategies_default = Strategies;

  // src/fight.ts
  var Fight = {
    fightBasic: (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestShootSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          closestEnemyToMe.energy = closestEnemyToMe.energy - spirit.size * 2;
        }
      }
    },
    fightBaseEmergency: (spirit) => {
      const baseEnemies = base.sight.enemies.map((s) => spirits[s]).filter((s) => geometry_default.calcDistance(s.position, base.position) < 250);
      if (baseEnemies.length > 0) {
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(baseEnemies, spirit);
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
          gather_default.gatherClosestStar(spirit, [consts_default.myStar]);
          if (spirit.energy == spirit.energy_capacity) {
            memory[spirit.id].status = "";
          }
        }
      } else if (memory[spirit.id] && memory[spirit.id].status) {
        memory[spirit.id].status = "";
      }
    },
    fightForTheStar: (spirit) => {
      const starAttackers = consts_default.enemyAliveSpirits.filter((spirit2) => {
        geometry_default.calcDistance(spirit2.position, consts_default.myStar.position) < 400;
      });
      if (starAttackers.length > 0) {
        console.log("GOTS");
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(starAttackers, spirit);
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
          gather_default.gatherClosestStar(spirit, [consts_default.myStar]);
          if (spirit.energy == spirit.energy_capacity) {
            memory[spirit.id].status = "";
          }
        }
      } else if (memory[spirit.id] && memory[spirit.id].status) {
        memory[spirit.id].status = "";
      }
    },
    fightForTheBase: (spirit) => {
      if (base.sight.enemies.length > 0) {
        const baseEnemies = base.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(baseEnemies, spirit);
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
          gather_default.gatherClosestStar(spirit, [consts_default.myStar]);
          if (spirit.energy == spirit.energy_capacity) {
            memory[spirit.id].status = "";
          }
        }
      } else if (memory[spirit.id] && memory[spirit.id].status) {
        memory[spirit.id].status = "";
      }
    },
    fightAggressive: (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0) {
        const spiritEnemiesBeamable = spirit.sight.enemies_beamable.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(spiritEnemiesBeamable, spirit);
        if (closestEnemyToMe) {
          spirit.energize(closestEnemyToMe);
          if (closestDistanceToMe > 200)
            spirit.move(closestEnemyToMe.position);
          if (closestDistanceToMe < 200)
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
        }
      }
    },
    fightAggressive2: (spirit) => {
      const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(consts_default.enemyAliveSpirits, spirit);
      if (closestEnemyToMe) {
        const weBigger = spirit.energy / spirit.energy_capacity > closestEnemyToMe.energy / closestEnemyToMe.energy_capacity;
        if (weBigger && closestDistanceToMe > 200) {
          spirit.move(closestEnemyToMe.position);
        } else if (true) {
          spirit.move(closestEnemyToMe.position);
        } else if (closestDistanceToMe < 200) {
        }
      }
    },
    fightAggressive3: (spiritArr) => {
      spiritArr.forEach((spirit, idx) => {
        const sizeIdeal = 3;
        const buddy = spiritArr[idx - 1];
        if (spirit.size >= sizeIdeal && spirit.energy < spirit.energy_capacity) {
          consts_default.myShape == "circle" && spirit.divide && spirit.divide();
        } else if (buddy && buddy.size < sizeIdeal && spirit.energy == spirit.energy_capacity) {
          if (geometry_default.calcDistance(spirit.position, buddy.position) > 10)
            spirit.move(buddy.position);
          spirit.merge && spirit.merge(buddy);
        }
        if (spirit.size >= sizeIdeal)
          spirit.move(enemy_base.position);
        if (spirit.sight.enemies) {
          const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
          const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(spiritEnemiesNearby, spirit);
          if (closestEnemyToMe) {
            const weBigger = spirit.energy / spirit.energy_capacity >= closestEnemyToMe.energy / closestEnemyToMe.energy_capacity;
            if (!weBigger) {
              spirit.shout("Ahh!");
            }
            if (weBigger && closestDistanceToMe > 450) {
              spirit.move(closestEnemyToMe.position);
            } else if (!weBigger && closestDistanceToMe < 300) {
              spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
            }
          }
        }
        if (spirit.energy == 0) {
          gather_default.gatherClosestStar(spirit, [consts_default.myStar, consts_default.middleStar]);
        }
      });
    },
    fightSmart: (spirit, idx) => {
      if (spirit.sight.enemies.length > 0) {
        const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(spiritEnemiesNearby, spirit);
        if (closestEnemyToMe && spirit.energy > 0) {
          const weFuller = spirit.energy / spirit.energy_capacity > closestEnemyToMe.energy / closestEnemyToMe.energy_capacity;
          const weBigger = spirit.energy >= closestEnemyToMe.energy;
          const shouldAggress = consts_default.enemyShape == "circle" ? weFuller : weBigger;
          const isEnemyCloseToBase = geometry_default.calcDistance(closestEnemyToMe.position, base.position) < 400;
          if (!weBigger) {
            if (closestDistanceToMe < 200) {
              spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
            } else if (closestDistanceToMe < 300) {
              spirit.move(geometry_default.calcTangentWithIndex(spirit, closestEnemyToMe, 240, idx));
            }
          } else {
            if (closestDistanceToMe > 200) {
              spirit.move(geometry_default.calcPointBetweenPoints(closestEnemyToMe.position, spirit.position, consts_default.specialProximity));
            }
          }
        }
      }
    },
    fightRunaway: (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0)
        return;
      if (spirit.sight.enemies) {
        const spiritEnemiesNearby = spirit.sight.enemies.map((s) => spirits[s]);
        const { closestSpirit: closestEnemyToMe, closestDistance: closestDistanceToMe } = utils_default.calcClosestSpirit(spiritEnemiesNearby, spirit);
        if (closestEnemyToMe) {
          if (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity > spirit.energy / spirit.energy_capacity && !(geometry_default.calcDistance(closestEnemyToMe.position, base.position) > 250)) {
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
          } else if (closestEnemyToMe.energy / closestEnemyToMe.energy_capacity > spirit.energy / spirit.energy_capacity && closestDistanceToMe < 200) {
            spirit.move(geometry_default.calcRunAwayPoint(spirit, closestEnemyToMe));
          } else {
            spirit.move(closestEnemyToMe.position);
          }
        }
      }
    },
    fightToWin: (spirit) => {
      if (spirit.sight.enemies_beamable.length > 0)
        return;
      const enemyStructs = spirit.sight.structures.filter((s) => s.indexOf("Carsair") < 0 && s.indexOf("base") >= 0);
      if (enemyStructs.length > 0) {
        spirit.energize(enemy_base);
      }
    }
  };
  var fight_default = Fight;

  // src/main.ts
  try {
    console.log("Enemy Shape: ", consts_default.enemyShape, consts_default.enemySize);
    console.log("We have", my_spirits.length, consts_default.myAliveSpirits.length, "(alive)", consts_default.MAX_GATHERERS, "(gather)");
    console.log("Enemy has", Object.keys(spirits).length - my_spirits.length, consts_default.enemyAliveSpirits.length, "(alive)");
    console.log("Planning for tick, star: ", tick, consts_default.desiredStarEnergy);
    console.log("Planning for energies: us:", consts_default.playerTotalEnergies[0], " them: ", consts_default.playerTotalEnergies[1]);
    const main = () => {
      let potentialGatherSpiritsClose = [];
      let potentialGatherSpiritsFar = [];
      consts_default.myAliveSpirits.forEach((s) => {
        if (geometry_default.calcDistance(consts_default.myNexusPos, s.position) < 500)
          potentialGatherSpiritsClose.push(s);
        else
          potentialGatherSpiritsFar.push(s);
      });
      const potentialGatherSpiritsFarSorted = potentialGatherSpiritsFar.sort((spiritA, spiritB) => geometry_default.calcDistance(spiritB.position, consts_default.myNexusPos) - geometry_default.calcDistance(spiritA.position, consts_default.myNexusPos));
      const potentialGatherSpirits = [...potentialGatherSpiritsClose, ...potentialGatherSpiritsFar];
      const extraNeeded = 200;
      const amountToMidGather = 1;
      const haveEnoughExtra = tick > 100 && potentialGatherSpirits.length - consts_default.MAX_GATHERERS > extraNeeded;
      const totalGatherersNeeded = haveEnoughExtra ? consts_default.MAX_GATHERERS + amountToMidGather : consts_default.MAX_GATHERERS;
      const gatherSpirits = potentialGatherSpirits.slice(0, consts_default.MAX_GATHERERS);
      const midGatherers = potentialGatherSpirits.slice(consts_default.MAX_GATHERERS, consts_default.MAX_GATHERERS + amountToMidGather);
      const leftoverSpirits = potentialGatherSpirits.slice(totalGatherersNeeded);
      const transitionTime = 35;
      if (tick >= transitionTime) {
        const indexLimit = Math.round(gatherSpirits.length * 0.27);
        const gatherBasers = gatherSpirits.slice(0, indexLimit);
        const gatherHaulers = gatherSpirits.slice(indexLimit);
        gather_default.gatherBase(gatherBasers);
        gather_default.gatherChainHauling(gatherHaulers, gatherBasers);
      }
      for (let idx = 0; idx < gatherSpirits.length; idx++) {
        const spirit = gatherSpirits[idx];
        if (tick < transitionTime)
          gather_default.gatherHaulingMyBase(spirit, consts_default.myStar);
        fight_default.fightForTheStar(spirit);
        fight_default.fightBasic(spirit);
      }
      const fightingSpirits = [...leftoverSpirits];
      console.log("haveEnoughExtra: ", haveEnoughExtra, midGatherers.length, fightingSpirits.length);
      for (let i = 0; i < midGatherers.length; i++) {
        const spirit = midGatherers[i];
        utils_default.shout(spirit, "gather" + spirit.id);
        gather_default.gatherHauling(spirit, consts_default.middleStar);
      }
      for (let idx = 0; idx < fightingSpirits.length; idx++) {
        const spirit = fightingSpirits[idx];
        const match = spirit.id.match(/Carsair_(\d+)/);
        const permIdx = match ? parseInt(match[1]) : 1;
        gather_default.gatherAlwaysNearStar(spirit);
        strategies_default.chargeOutpostStrategy(spirit, permIdx);
        strategies_default.avoidOutpostStrategy(spirit, permIdx);
        fight_default.fightSmart(spirit, permIdx);
        fight_default.fightForTheStar(spirit);
        fight_default.fightForTheBase(spirit);
        fight_default.fightBasic(spirit);
        fight_default.fightToWin(spirit);
      }
    };
    main();
  } catch (e) {
    console.log(e.message);
  }
})();
