import * as chains from "viem/chains"
import { gnosis, gnosisChiado } from "viem/chains"
import { Chain } from "viem"
import { logger } from "@gnosis/hashi-common"

import Multiclient from "./MultiClient"
import StandardReporterController from "./controllers/StandardReporterController"
import WormholeReporterController from "./controllers/WormholeReporterController"

import Coordinator from "./Coordinator"
import { settings } from "./settings/index"
import getOracleAddress from "./utils/readAddress"
;(async () => {
  const controllersEnabled = process.env.REPORTERS_ENABLED?.split(",")

  const sourceChainId = Number(process.env.SOURCE_CHAIN_ID)
  const destinationChainIds = process.env.DESTINATION_CHAIN_IDS?.split(",").map((_chainId) => Number(_chainId))

  const sourceChain: Chain = Object.values(chains).find((_chain) => _chain.id === sourceChainId) as Chain
  const destinationChains: Chain[] = Object.values(chains).filter((_chain) => destinationChainIds?.includes(_chain.id))

  const lightClientAddresses = settings.contractAddresses.lightClientAddresses as any

  const multiClient = new Multiclient({
    chains: [sourceChain, ...destinationChains],
    privateKey: process.env.PRIVATE_KEY as `0x${string}`,
    rpcUrls: settings.rpcUrls,
  })

  const ambReporterController = new StandardReporterController({
    name: "AMBReporterController",
    type: "classic",
    sourceChain,
    destinationChains: destinationChains.filter(({ name }) => name === gnosis.name || name === gnosisChiado.name),
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("amb", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("amb", "adapter", sourceChain, destinationChains),
  })

  const sygmaReporterController = new StandardReporterController({
    name: "SygmaReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("sygma", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("sygma", "adapter", sourceChain, destinationChains),
  })

  const wormholeReporterController = new WormholeReporterController({
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddress: await getOracleAddress("wormhole", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("wormhole", "adapter", sourceChain, destinationChains),
    wormholeScanBaseUrl: settings.reporterControllers.WormholeReporterController.wormholeScanBaseUrl,
    wormholeAddress: (settings.contractAddresses as any)[sourceChain.name]?.Wormhole,
    wormholeChainIds: settings.reporterControllers.WormholeReporterController.wormholeChainIds,
  })

  const axelarReporterController = new StandardReporterController({
    name: "AxelarReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("axelar", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("axelar", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.AxelarReporterController.reportHeadersValue,
  })

  const connextReporterController = new StandardReporterController({
    name: "ConnextReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("connext", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("connext", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.ConnextReporterController.reportHeadersValue,
  })

  const celerReporterController = new StandardReporterController({
    name: "CelerReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("celer", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("celer", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.CelerReporterController.reportHeadersValue,
  })

  const layerZeroReporterController = new StandardReporterController({
    name: "LayerZeroReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("layerzero", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("layerzero", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.LayerZeroReporterController.reportHeadersValue,
  })

  const hyperlaneReporterController = new StandardReporterController({
    name: "HyperlaneReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("hyperlane", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("hyperlane", "adapter", sourceChain, destinationChains),
  })

  const ccipReporterController = new StandardReporterController({
    name: "CCIPReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("ccip", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("ccip", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.CCIPReporterController.reportHeadersValue,
  })

  const zetaReporterController = new StandardReporterController({
    name: "ZetaReporterController",
    type: "classic",
    sourceChain,
    destinationChains,
    logger,
    multiClient,
    reporterAddresses: await getOracleAddress("zeta", "reporter", sourceChain, destinationChains),
    adapterAddresses: await getOracleAddress("zeta", "adapter", sourceChain, destinationChains),
    reportHeadersValue: settings.reporterControllers.ZetaReporterController.reportHeadersValue,
  })

  const coordinator = new Coordinator({
    controllers: [
      ambReporterController,
      ccipReporterController,
      sygmaReporterController,
      wormholeReporterController,
      axelarReporterController,
      connextReporterController,
      celerReporterController,
      layerZeroReporterController,
      hyperlaneReporterController,
      zetaReporterController,
    ].filter((_controller) => controllersEnabled?.includes(_controller.name)),
    intervalFetchBlocksMs: settings.Coordinator.intervalFetchBlocksMs,
    logger,
    multiclient: multiClient,
    sourceChain,
    queryBlockLength: settings.Coordinator.queryBlockLength,
    blockBuffer: settings.Coordinator.blockBuffer,
    intervalsUpdateLightClients: settings.Coordinator.intervalsUpdateLightClients,
  })

  coordinator.start()
})()
