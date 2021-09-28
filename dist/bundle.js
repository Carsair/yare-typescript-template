(() => {
  // src/consts.ts
  var myNameMatch = base.id.match(/base_(.+)/);
  var enemyNameMatch = enemy_base.id.match(/base_(.+)/);
  var myName = myNameMatch ? myNameMatch[1] : "unknown";
  var enemyName = enemyNameMatch ? enemyNameMatch[1] : "unknown";
  var isSouthSpawn = base.position[0] === 2600;
  var myStar = isSouthSpawn ? star_a1c : star_zxq;
  var enemyStar = isSouthSpawn ? star_zxq : star_a1c;
  var enemySpirits = Object.keys(spirits).map((s) => spirits[s]).filter((s) => s.id.indexOf(myName) < 0);
  var enemySize = enemySpirits[0].size;
  var mySize = my_spirits[0].size;
  var SHAPES = {
    CIRCLE: "circle",
    TRIANGLE: "triangle",
    SQUARE: "square"
  };
  var Consts = {
    SHAPES,
    myName,
    enemyName,
    myStar,
    enemyStar,
    middleStar: star_p89,
    myBase: base,
    enemyBase: enemy_base,
    mySpirits: my_spirits,
    enemySpirits,
    myAliveSpirits: my_spirits.filter((s) => s.hp),
    enemyAliveSpirits: enemySpirits.filter((s) => s.hp),
    mySize: my_spirits[0].size,
    enemySize: enemySpirits[0].size,
    myShape: mySize == 1 ? "circle" : enemySize == 3 ? "triangle" : "square",
    enemyShape: enemySize == 1 ? "circle" : enemySize == 3 ? "triangle" : "square",
    playerTotalEnergies: Object.keys(spirits).reduce((acc, id) => {
      const s = spirits[id];
      if (!s.hp)
        return acc;
      if (s.id.indexOf(myName) >= 0) {
        acc[0] += s.energy;
      } else {
        acc[1] += s.energy;
      }
      return acc;
    }, [0, 0]),
    NEW_SPAWN_POS: isSouthSpawn ? [2620, 1760] : [1580, 640]
  };
  var consts_default = Consts;

  // src/circles.ts
  var Circles = {
    main: () => {
    }
  };
  var circles_default = Circles;

  // src/squares.ts
  var Squares = {
    main: () => {
    }
  };
  var squares_default = Squares;

  // src/triangles.ts
  var Triangles = {
    main: () => {
    }
  };
  var triangles_default = Triangles;

  // src/main.ts
  try {
    console.log(`Battle: ${consts_default.myName} (${consts_default.myShape})  versus  ${consts_default.enemyName} (${consts_default.enemyShape})`);
    console.log(`${consts_default.myName}: ${consts_default.playerTotalEnergies[0]} energy, ${consts_default.myAliveSpirits.length} spirits alive, ${consts_default.mySpirits.length} total spirits created`);
    console.log(`${consts_default.enemyName}: ${consts_default.playerTotalEnergies[1]} energy, ${consts_default.enemyAliveSpirits.length} spirits alive, ${consts_default.enemySpirits.length} total spirits created`);
    if (consts_default.myShape === consts_default.SHAPES.SQUARE) {
      squares_default.main();
    } else if (consts_default.myShape === consts_default.SHAPES.TRIANGLE) {
      triangles_default.main();
    } else {
      circles_default.main();
    }
  } catch (e) {
    console.log(e.message);
  }
})();
