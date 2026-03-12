import { tileCount } from './gridUtils';

export const bfs = (start, target, obstacles, initialHeading) => {
  let q = [{ x: start.x, y: start.y, path: [], heading: initialHeading }];
  let visited = new Set();
  visited.add(`${start.x},${start.y}`);
  let dirs = [[0,-1], [0,1],[-1,0],[1,0]];

  while(q.length > 0) {
    let curr = q.shift();
    if (curr.x === target.x && curr.y === target.y) return curr.path;
    
    let sortedDirs = [...dirs].sort((a, b) => {
      let aAlign = (a[0] === curr.heading.x && a[1] === curr.heading.y) ? 1 : 0;
      let bAlign = (b[0] === curr.heading.x && b[1] === curr.heading.y) ? 1 : 0;
      return bAlign - aAlign;
    });
    
    for (let d of sortedDirs) {
      let nx = curr.x + d[0];
      let ny = curr.y + d[1];
      let key = `${nx},${ny}`;
      
      if (nx >= 0 && nx < tileCount && ny >= 0 && ny < tileCount && !obstacles.has(key) && !visited.has(key)) {
        visited.add(key);
        q.push({ x: nx, y: ny, path: [...curr.path, {x: nx, y: ny}], heading: {x: d[0], y: d[1]} });
      }
    }
  }
  return null;
};

export const floodFill = (start, obstacles) => {
  let q = [start];
  let visited = new Set();
  visited.add(`${start.x},${start.y}`);
  let count = 0;
  let dirs = [[0,-1],[0,1],[-1,0], [1,0]];

  while(q.length > 0) {
    let curr = q.shift();
    count++;
    for (let d of dirs) {
      let nx = curr.x + d[0];
      let ny = curr.y + d[1];
      let key = `${nx},${ny}`;
      if (nx >= 0 && nx < tileCount && ny >= 0 && ny < tileCount && !obstacles.has(key) && !visited.has(key)) {
        visited.add(key);
        q.push({x: nx, y: ny});
      }
    }
  }
  return count;
};
