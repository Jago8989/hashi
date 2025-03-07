import axios from "axios"
import { Chain } from "viem"
import { parse } from "yaml"

const normalizedValue = (key: string, obj: any) => {
  key = key.toLowerCase().replace(/\s+/g, "") // Normalize key
  for (const originalKey of Object.keys(obj)) {
    const normalizedKey = originalKey.toLowerCase().replace(/_/g, "").replace(/\s+/g, "") // Normalize existing keys
    if (normalizedKey === key) {
      return obj[originalKey] // Return corresponding value
    }
  }
  return null // Return null if key is not found
}

const filterUnmatchChainName = (chainName: string) => {
  if (chainName == "OP Mainnet") {
    return "optimism"
  } else if (chainName == "OP Sepolia") {
    return "optimismSepolia"
  } else if (chainName == "BNB Smart Chain") {
    return "bnb"
  } else return chainName
}

const concatOracleName = (oracleName: string) => {
  if (oracleName == "layerzero") {
    return "lz"
  } else {
    return oracleName.toLowerCase()
  }
}
async function getOracleAddress(oracle: string, type: string, sourceChain: Chain, destinationChains: Chain[]) {
  const url = `https://raw.githubusercontent.com/crosschain-alliance/hashi-registry/refs/heads/main/oracles/${oracle}/address.yaml`

  let data: any
  try {
    const response = await axios.get(url)
    data = parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(`File not found at ${url}, returning empty oracleAddress.`)
      return {} // Return empty object if file not found
    } else {
      console.error(`Error fetching ${url}:`, error)
      throw error // Rethrow other errors
    }
  }

  const oracleAddress: { [chainName: string]: `0x${string}` } = {}
  if (type == "reporter") {
    if (oracle == "wormhole") {
      return normalizedValue(
        `${filterUnmatchChainName(sourceChain.name)}` + `${concatOracleName(oracle)}` + `${type}`,
        data,
      )
    }
    destinationChains.forEach((chains) => {
      oracleAddress[chains.name] = normalizedValue(
        `${filterUnmatchChainName(sourceChain.name)}` + `${concatOracleName(oracle)}` + `${type}`,
        data,
      )
    })
  } else if (type == "adapter") {
    destinationChains.forEach((chains) => {
      console.log("chain ", chains.name)
      oracleAddress[chains.name] = normalizedValue(
        `${filterUnmatchChainName(chains.name)}` + `${concatOracleName(oracle)}` + `${type}`,
        data,
      )
    })
  }

  return oracleAddress
}

export default getOracleAddress
