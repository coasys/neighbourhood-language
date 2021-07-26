import type { Address, Expression, ExpressionAdapter, PublicSharing, IPFSNode, LanguageContext, AgentService, HolochainLanguageDelegate } from "@perspect3vism/ad4m";
//import { DNA_NICK } from "./dna";

const _appendBuffer = (buffer1, buffer2) => {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

const uint8ArrayConcat = (chunks) => {
  return chunks.reduce(_appendBuffer);
};

class SharedPerspectivePutAdapter implements PublicSharing {
  #agent: AgentService;
  //#hcDna: HolochainLanguageDelegate;
  #IPFS: IPFSNode

  constructor(context: LanguageContext) {
    this.#agent = context.agent;
    //this.#hcDna = context.Holochain as HolochainLanguageDelegate;
    this.#IPFS = context.IPFS;
  }

  async createPublic(neighbourhood: object): Promise<Address> {
    // const expression = this.#agent.createSignedExpression(neighbourhood);
    
    // let resp = await this.#hcDna.call(
    //   DNA_NICK,
    //   "neighbourhood_store",
    //   "index_neighbourhood",
    //   expression
    // );
    // return resp.toString("hex");
    const agent = this.#agent;
    const expression = agent.createSignedExpression(neighbourhood);
    const content = JSON.stringify(expression);
    const result = await this.#IPFS.add({ content });
    // @ts-ignore
    return result.cid.toString() as Address;
  }
}

export default class Adapter implements ExpressionAdapter {
  //#hcDna: HolochainLanguageDelegate;
  #IPFS: IPFSNode

  putAdapter: PublicSharing;

  constructor(context: LanguageContext) {
    //this.#hcDna = context.Holochain as HolochainLanguageDelegate;
    this.#IPFS = context.IPFS;
    this.putAdapter = new SharedPerspectivePutAdapter(context);
  }

  async get(address: Address): Promise<Expression> {
    const cid = address.toString();

    const chunks = [];
    // @ts-ignore
    for await (const chunk of this.#IPFS.cat(cid)) {
      chunks.push(chunk);
    }

    const fileString = uint8ArrayConcat(chunks).toString();
    const fileJson = JSON.parse(fileString);
    return fileJson;
    // const hash = Buffer.from(address, "hex");
    // const res = await this.#hcDna.call(
    //   DNA_NICK,
    //   "neighbourhood_store",
    //   "get_neighbourhood",
    //   hash
    // );
    // return res;
  }
}
