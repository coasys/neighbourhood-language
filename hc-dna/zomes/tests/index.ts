import { Orchestrator, Config, InstallAgentsHapps } from '@holochain/tryorama'
import path from 'path'

const conductorConfig = Config.gen();


const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [path.join("../../workdir/neighbourhood-store.dna")]
  ]
]

const orchestrator = new Orchestrator()

orchestrator.registerScenario("create and get neighbourhood", async (s, t) => {
  const [alice] = await s.players([conductorConfig])
  const [[alice_happ]] = await alice.installAgentsHapps(installation)

  await alice_happ.cells[0].call("neighbourhood_store", "index_neighbourhood",  
    {
      neighbourhood: {
        author: "did:key:zQ3shc5AcaZyRo6qP3wuXvYT8xtiyFFL25RjMEuT81WMHEibC",
        timestamp: new Date().toISOString(),
        data: {
          linkLanguage: "linkLang",
          meta: {
            links: [
              {
                author: "did:key:zQ3shc5AcaZyRo6qP3wuXvYT8xtiyFFL25RjMEuT81WMHEibC",
                timestamp: new Date().toISOString(),    
                data: {
                  source: "language://src",
                  target: "language://target",
                  predicate: "language://pred"
                },
                proof: {
                  signature: "sig",
                  key: "key",
                  valid: true,
                  invalid: false,
                },
              }
            ]
          }
        },
        proof: {
          signature: "sig",
          key: "key",
          valid: true,
          invalid: false,
        },
      },
      key: "test"
    }
  )

  let getResp = await alice_happ.cells[0].call("neighbourhood_store", "get_neighbourhood", "test");
  t.ok(getResp);
})

// Run all registered scenarios as a final step, and gather the report,
// if you set up a reporter
const report = orchestrator.run()

// Note: by default, there will be no report
console.log(report)