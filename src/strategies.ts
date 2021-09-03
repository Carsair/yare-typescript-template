const Strategies = {
  chargeOutpostStrategy: (spirit: Spirit) => {
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
      Gather.gatherClosestStar(spirit)
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
}

export default Strategies
