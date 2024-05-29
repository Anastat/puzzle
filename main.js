const events = require("events")
const fs = require("fs")
const readline = require("readline")

async function main() {
  /**
   * Reads a file with a space map line by line and
   * returns an array of space objects.
   *
   * @returns space map representation as array
   */
  async function convertDataToArray() {
    let mapArr = []
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream("map_data.txt"),
        crlfDelay: Infinity,
      })

      rl.on("line", (line) => {
        mapArr.push(convertLineToObject(line))
      })

      await events.once(rl, "close")

      return mapArr
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Decodes the orbit map relationship string.
   * Creates an object with the name of the space object
   * and its parent (the space object is in orbit).
   *
   * @param {String} line orbital relationship in format AAA)BBB
   * @returns Object { parent: parentSpaceObject, name: spaceObject }
   */
  function convertLineToObject(line) {
    let [parent, name] = line.split(")")
    return { parent: parent, name: name }
  }

  /**
   * Creates the tree representation of the space map array.
   *
   * The root is the universal Center of Mass (COM)
   *
   * @param {Array} data
   * @param {String} parent
   *
   * @returns space map as tree
   */
  function buildTree(data, parent = "COM") {
    let tree = []
    data.forEach((item) => {
      // Check if the item belongs to the current parent
      if (item.parent === parent) {
        let children = buildTree(data, item.name)

        if (children.length) {
          item.children = children
        }

        tree.push(item)
      }
    })
    return tree
  }

  /**
   * Count total number of orbits of each space object to root.
   *
   * @param {Object} node relationship in the space map
   * @param {number} depth
   *
   * @returns total number of orbits of one relationship
   */
  function countOrbitsToRoot(node, depth = 1) {
    let totalSteps = depth

    if (node.children) {
      for (const child of node.children) {
        totalSteps += countOrbitsToRoot(child, depth + 1)
      }
    }

    return totalSteps
  }

  /**
   * Calculates total number of number of direct and
   * indirect orbits in map
   *
   * @param {*} tree tree representation of the map
   *
   * @returns total number of map orbits
   */
  function countTotalOrbits(tree) {
    let totalSteps = 0

    for (const root of tree) {
      totalSteps += countOrbitsToRoot(root)
    }

    return totalSteps
  }

  let spaceMapArray = await convertDataToArray()

  let spaceMapTree = buildTree(spaceMapArray)

  let totalOrbits = countTotalOrbits(spaceMapTree)

  console.log(
    `The total number of direct and indirect orbits is ${totalOrbits}`
  )
}

main()
