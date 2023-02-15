
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
    const cols = line.split(" ")
    SETTINGS.field.push(cols)
    if (SETTINGS.field.length >= SETTINGS.rows) {
      currentCommand = 'setInitialPosition'
    }
  },
  'setInitialPosition': (line) => {
    const [row, col] = line.split(" ")
    SETTINGS.init = {row: parseInt(row, 10), col: parseInt(col, 10)}
    currentCommand = 'setEndPosition'
  },
  'setEndPosition': (line) => {
    const [row, col] = line.split(" ")
    SETTINGS.end = {row: parseInt(row, 10), col: parseInt(col, 10)}
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

function startProcess() {
  console.log(SETTINGS)
}

main()