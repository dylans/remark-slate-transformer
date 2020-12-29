import { mdastToSlate, ASTMap } from "../transformers/mdast-to-slate";

export default function plugin() {
  // @ts-ignore
  this.Compiler = function (node: any, options: ASTMap) {
    return mdastToSlate(node, options);
  };
}
