const Geometry = {
  calcDistance: (a: Position, b: Position) => {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  },
  calcPointBetweenPoints: (a: Position, b: Position, distFromA: number) => {
    const totalDist = Geometry.calcDistance(a, b)
    const percentAlong = distFromA / totalDist
    const [x1, y1] = a
    const [x2, y2] = b
    return [x1 + percentAlong*(x2 - x1), y1 + percentAlong*(y2 - y1)] as Position
  },
  calcRunAwayPoint: (a: Entity, entityToRunFrom: Entity) => {
    return [a.position[0] + a.position[0] - entityToRunFrom.position[0], a.position[1] + a.position[1] - entityToRunFrom.position[1]] as Position
  },
  calcAveragePos: (...posArr: Position[]) => {
    let x = 0, y = 0;
    for (const pos in posArr) {
      x = x + posArr[pos][0]
      y = y + posArr[pos][1]
    }
    return [x / posArr.length, y / posArr.length] as Position
  },
  // Move counterclockwise around the avoidEntity
  calcTangentPointFromPoint: (spirit: Entity, avoidEntity: Entity, radius: number) => {
    const d = Geometry.calcDistance(spirit.position, avoidEntity.position)
    if (d < radius) return Geometry.calcRunAwayPoint(spirit, avoidEntity); // Too close to calculate tangent (run away!)
    const [x1, y1] = spirit.position
    const [x2, y2] = avoidEntity.position
    let orientation = 'upright' // (x2 > x1 and y2 < y1 y is reversed)
    if (x2 < x1 && y2 < y1) orientation = 'upleft'
    if (x2 > x1 && y2 > y1) orientation = 'downright'
    if (x2 < x1 && y2 > y1) orientation = 'downleft'
    const flipperX = (orientation.indexOf("upleft") >= 0 || orientation.indexOf("upright") >= 0) ? -1 : 1;
    const flipperY = (orientation.indexOf("upleft") >= 0 || orientation.indexOf("upright") >= 0) ? -1 : 1;
    const r = radius
    const alpha = Math.sqrt(Math.pow(d, 2) + Math.pow(r, 2))
    const delX = x2 - x1
    const delY = y2 - y1
    const angle1 = Math.asin(r/d)
    const angle2 = Math.atan(delX/delY)  // I think to make it clockwise we would make this atan(delY/delX)
    const angle3 = angle2 - angle1
    const tanDelX = flipperX * alpha * Math.sin(angle3)
    const tanDelY = flipperY * alpha * Math.cos(angle3)
    const tangentPoint = [x1 + tanDelX, y1 + tanDelY].map(Math.round)
    return tangentPoint as Position
  },
  calcClockwiseTangentPointFromPoint: (spirit: Entity, avoidEntity: Entity, radius: number) => {
    const d = Geometry.calcDistance(spirit.position, avoidEntity.position)
    if (d < radius) return Geometry.calcRunAwayPoint(spirit, avoidEntity); // Too close to calculate tangent (run away!)
    const [x1, y1] = spirit.position
    const [x2, y2] = avoidEntity.position
    let orientation = 'upright'
    if (x2 < x1 && y2 < y1) orientation = 'upleft'
    if (x2 > x1 && y2 > y1) orientation = 'downright'
    if (x2 < x1 && y2 > y1) orientation = 'downleft'
    const flipperX = orientation.indexOf("upleft") >= 0 || orientation.indexOf("downleft") >= 0 ? -1 : 1;
    const flipperY = orientation.indexOf("upleft") >= 0 || orientation.indexOf("downleft") >= 0 ? -1 : 1;
    const r = radius
    const alpha = Math.sqrt(Math.pow(d, 2) + Math.pow(r, 2))
    const delX = x2 - x1
    const delY = y2 - y1
    const angle1 = Math.asin(r/d)
    const angle2 = Math.atan(delY/delX)
    const angle3 = angle2 - angle1
    const tanDelX = flipperY * alpha * Math.cos(angle3)
    const tanDelY = flipperX * alpha * Math.sin(angle3)
    const tangentPoint = [x1 + tanDelX, y1 + tanDelY].map(Math.round)
    return tangentPoint as Position
  },
  calcTangentWithIndex: (spirit: Entity, avoidEntity: Entity, radius: number, idx: number) => {
    if (idx && idx % 2 == 1) {
      return Geometry.calcClockwiseTangentPointFromPoint(spirit, avoidEntity, radius)
    } else {
      return Geometry.calcTangentPointFromPoint(spirit, avoidEntity, radius)
    }
  }
}

export default Geometry
