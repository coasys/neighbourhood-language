import type { Address, Agent, Language, LanguageContext, ExpressionUI, Interaction } from "@perspect3vism/ad4m";
import Adapter from "./adapter";

function interactions(a: Agent, expression: Address): Interaction[] {
  return [];
}

export class UI implements ExpressionUI {
  icon(): string {
    return "";
  }

  constructorIcon(): string {
    return "";
  }
}

export const name = "neighbourhood-store";

export default function create(context: LanguageContext): Language {
  const expressionAdapter = new Adapter(context);
  const expressionUI = new UI();

  return {
    name,
    expressionAdapter,
    expressionUI,
    interactions,
  } as Language;
}
