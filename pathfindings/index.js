
const SETTINGS = {}

let currentCommand = 'setTilesCount'

const commands = {
  'setTilesCount': (line) => {
    SETTINGS.tilesCount = parseInt(line, 10)
    currentCommand = 'setTiles'
  },
  'setTiles': (line) => {
    SETTINGS.tiles = SETTINGS.tiles || {}
    const [name, cost] = line.split(" ") 
    SETTINGS.tiles[name] = parseInt(cost, 10)
    if(Object.keys(SETTINGS.tiles).length >= SETTINGS.tilesCount) {
      currentCommand = 'setFieldDiagram'
    }
  },
  'setFieldDiagram': (line) => {
    const [row, col] = line.split(" ")
    SETTINGS.rows = parseInt(row, 10)
    SETTINGS.cols = parseInt(col, 10)
    currentCommand = 'setFieldRow'
  },
  'setFieldRow': (line) => {
    SETTINGS.field = SETTINGS.field || []
    SETTINGS.graph = SETTINGS.graph || {}

    const cols = line.split(" ")
    SETTINGS.field.push(cols)

    if (SETTINGS.field.length >= SETTINGS.rows) {
      currentCommand = 'setInitialPosition'
    }
  },
  'setInitialPosition': (line) => {
    const [row, col] = line.split(" ")
    SETTINGS.init = [parseInt(col, 10), parseInt(row, 10)]
    currentCommand = 'setEndPosition'
  },
  'setEndPosition': (line) => {
    const [row, col] = line.split(" ")
    SETTINGS.end = [parseInt(col, 10), parseInt(row, 10)]
    currentCommand = undefined
  },
}

function main() {
  let buffer = ''
  process.stdin.on('data', (chunk) => {
    buffer += chunk.toString('utf8')
    const lines = buffer.split("\n")
    buffer = lines.pop()

    lines.forEach((line)=>{
      if (line === '') return
      if (commands[currentCommand] === undefined) return
      commands[currentCommand](line)
    })
  })

  process.stdin.on('end', () => {
    buffer.split("\n").forEach((line)=>{
      if (line === '') return
      if (commands[currentCommand] === undefined) return
      commands[currentCommand](line)
    })

    startProcess()
  })
}

function createGraph(field, tiles) {
  const graph = {}
  for(let i=0; i<field.length; i++) {
    for(let j=0; j<field[i].length; j++) {
      graph[[j, i]] = {}
    }
  }

  return graph
}

function createEdges(graph) {
  for(let node in graph) {
    const [x, y] = node.split(',').map((v) => parseInt(v))

    if (x < SETTINGS.cols - 1) {
      graph[node][[x + 1, y]] = SETTINGS.tiles[SETTINGS.field[y][x + 1]]

      if (graph[[x + 1, y]] != undefined) {
        graph[[x + 1, y]][node] = SETTINGS.tiles[SETTINGS.field[y][x]]
      }
    }

    if (y < SETTINGS.rows - 1) {
      graph[node][[x, y + 1]] = SETTINGS.tiles[SETTINGS.field[y + 1][x]]

      if (graph[[x, y + 1]] != undefined) {
        graph[[x, y + 1]][node] = SETTINGS.tiles[SETTINGS.field[y][x]]
      }
    }
  }
}

function startProcess() {
  const graph = createGraph(SETTINGS.field, SETTINGS.tiles) 
  createEdges(graph)
  const visitedNodes = Object.keys(graph).reduce((aggr, value) => {
    aggr[value] = 0
    return aggr
  }, {})

  let unVisitedNodesList = Object.keys(visitedNodes).filter((key) => visitedNodes[key] == 0)

  const shortestPath = {}
  const previousNodes = {}
  const maxValue = Number.MAX_SAFE_INTEGER
  const startNode = SETTINGS.init

  for(node of unVisitedNodesList) {
    shortestPath[node] = maxValue
  }

  shortestPath[startNode] = 0

  while(unVisitedNodesList.length) {
    let currentMinNode = undefined

    for(node of unVisitedNodesList) {
     if (currentMinNode == undefined) {
      currentMinNode = node
     }
     else if (shortestPath[node] < shortestPath[currentMinNode]) {
      currentMinNode = node
     }
    }

    const neighbors = Object.keys(graph[currentMinNode])

    for(neighbor of neighbors) {
      const tentativeValue = shortestPath[currentMinNode] + graph[currentMinNode][neighbor]

      if (tentativeValue < shortestPath[neighbor]) {
        shortestPath[neighbor] = tentativeValue
        previousNodes[neighbor] = currentMinNode
      }
    }

    visitedNodes[currentMinNode] = 1
    unVisitedNodesList = Object.keys(visitedNodes).filter((key) => visitedNodes[key] == 0)
  }

  const reversedPath = []
  const targetNode = SETTINGS.end.join(',')
  let tempNode = targetNode
  const strStartNode = startNode.join(',')

  while (tempNode != startNode) {
    reversedPath.push(tempNode)
    tempNode = previousNodes[tempNode]
  }

  reversedPath.push(strStartNode)

  const path = reversedPath.reverse();
  const cost = calculateCost(path)

  console.log('reversedPath:', path, 'cost:', cost)
}

function calculateCost(path) {
  let cost = 0
  const [endX, endY] = SETTINGS.end
  path.forEach(node => {
    const [x, y] = node.split(',').map((v)=> parseInt(v))
    if (endX == x && endY == y) return
    cost += SETTINGS.tiles[SETTINGS.field[y][x]]
  })
  return cost
}

main()