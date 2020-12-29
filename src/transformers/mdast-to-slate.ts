import * as slateLib from "slate";
import * as mdast from "../models/mdast";
import { defaults } from "./defaults";
import { setDefaults } from "./setDefaults";

export type Decoration = {
  [key in (
    | mdast.Emphasis
    | mdast.Strong
    | mdast.Delete
    | mdast.InlineCode
  )["type"]]?: true;
};

export type ASTNode = {
  type: string;
};

export interface ASTMap {
  // Note these names aren't 100% consistent, but attempting to
  // stay consistent with remark-slate project

  /* block */
  block_quote?: ASTNode;
  code_block?: ASTNode;
  heading?: {
    1?: ASTNode;
    2?: ASTNode;
    3?: ASTNode;
    4?: ASTNode;
    5?: ASTNode;
    6?: ASTNode;
  };
  paragraph?: ASTNode;

  /* inline */
  delete_mark?: ASTNode;
  emphasis_mark?: ASTNode;
  inlineCode?: ASTNode;
  link?: ASTNode;
  link_url?: ASTNode; // alternate name for url property on link in ast
  strong_mark?: ASTNode;

  /* lists */
  listItem?: ASTNode;
  ol_list?: ASTNode;
  ul_list?: ASTNode;

  /* tables */
  table?: ASTNode;
  tableHeading?: ASTNode;
  tableRow?: ASTNode;
  tableCell?: ASTNode;
}

export function mdastToSlate(
  node: mdast.Root,
  options: ASTMap
): slateLib.Node[] {
  const astNodeTypes = setDefaults(options, defaults);
  return createSlateRoot(node, astNodeTypes);
}

function createSlateRoot(
  root: mdast.Root,
  astNodeTypes: ASTMap
): slateLib.Node[] {
  return convertNodes(root.children, astNodeTypes, {});
}

function convertNodes(
  nodes: mdast.Content[],
  astNodeTypes: ASTMap,
  deco: Decoration
): slateLib.Node[] {
  return nodes.reduce<slateLib.Node[]>((acc, node) => {
    acc.push(...createSlateNode(node, astNodeTypes, deco));
    return acc;
  }, []);
}

function createSlateNode(
  node: mdast.Content,
  astNodeTypes: ASTMap,
  deco: Decoration
): SlateNode[] {
  switch (node.type) {
    case "paragraph":
      return [createParagraph(node, astNodeTypes, deco)];
    case "heading":
      return [createHeading(node, astNodeTypes, deco)];
    case "thematicBreak":
      return [createThematicBreak(node)];
    case "blockquote":
      return [createBlockquote(node, astNodeTypes, deco)];
    case "list":
      return [createList(node, astNodeTypes, deco)];
    case "listItem":
      return [createListItem(node, astNodeTypes, deco)];
    case "table":
      return [createTable(node, astNodeTypes, deco)];
    case "tableRow":
      return [createTableRow(node, astNodeTypes, deco)];
    case "tableCell":
      return [createTableCell(node, astNodeTypes, deco)];
    case "html":
      return [createHtml(node)];
    case "code":
      return [createCode(node)];
    case "yaml":
      return [createYaml(node)];
    case "toml":
      return [createToml(node)];
    case "definition":
      return [createDefinition(node)];
    case "footnoteDefinition":
      return [createFootnoteDefinition(node, astNodeTypes, deco)];
    case "text":
      return [createText(node.value, astNodeTypes, deco)];
    case "emphasis":
    case "strong":
    case "delete": {
      const { type, children } = node;
      return children.reduce<SlateNode[]>((acc, n) => {
        acc.push(
          ...createSlateNode(n, astNodeTypes, { ...deco, [type]: true })
        );
        return acc;
      }, []);
    }
    case "inlineCode": {
      const { type, value } = node;
      return [createText(value, astNodeTypes, { ...deco, [type]: true })];
    }
    case "break":
      return [createBreak(node)];
    case "link":
      return [createLink(node, astNodeTypes, deco)];
    case "image":
      return [createImage(node)];
    case "linkReference":
      return [createLinkReference(node, astNodeTypes, deco)];
    case "imageReference":
      return [createImageReference(node)];
    case "footnote":
      return [createFootnote(node, astNodeTypes, deco)];
    case "footnoteReference":
      return [createFootnoteReference(node, astNodeTypes)];
    case "math":
      return [createMath(node)];
    case "inlineMath":
      return [createInlineMath(node)];
    default:
      break;
  }
  return [];
}

export type Paragraph = ReturnType<typeof createParagraph>;

function createParagraph(
  node: mdast.Paragraph,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
  };
}

export type Heading = ReturnType<typeof createHeading>;

function createHeading(
  node: mdast.Heading,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children, depth } = node;
  return {
    type,
    depth,
    children: convertNodes(children, astNodeTypes, deco),
  };
}

export type ThematicBreak = ReturnType<typeof createThematicBreak>;

function createThematicBreak(node: mdast.ThematicBreak) {
  return {
    type: node.type,
    children: [{ text: "" }],
  };
}

export type Blockquote = ReturnType<typeof createBlockquote>;

function createBlockquote(
  node: mdast.Blockquote,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  return {
    type: node.type,
    children: convertNodes(node.children, astNodeTypes, deco),
  };
}

export type List = ReturnType<typeof createList>;

function createList(node: mdast.List, astNodeTypes: ASTMap, deco: Decoration) {
  const { type, children, ordered, start, spread } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    ordered,
    start,
    spread,
  };
}

export type ListItem = ReturnType<typeof createListItem>;

function createListItem(
  node: mdast.ListItem,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children, checked, spread } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    checked,
    spread,
  };
}

export type Table = ReturnType<typeof createTable>;

function createTable(
  node: mdast.Table,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children, align } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    align,
  };
}

export type TableRow = ReturnType<typeof createTableRow>;

function createTableRow(
  node: mdast.TableRow,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
  };
}

export type TableCell = ReturnType<typeof createTableCell>;

function createTableCell(
  node: mdast.TableCell,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
  };
}

export type Html = ReturnType<typeof createHtml>;

function createHtml(node: mdast.HTML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Code = ReturnType<typeof createCode>;

function createCode(node: mdast.Code) {
  const { type, value, lang, meta } = node;
  return {
    type,
    lang,
    meta,
    children: [{ text: value }],
  };
}

export type Yaml = ReturnType<typeof createYaml>;

function createYaml(node: mdast.YAML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Toml = ReturnType<typeof createToml>;

function createToml(node: mdast.TOML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Math = ReturnType<typeof createMath>;

function createMath(node: mdast.Math) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type InlineMath = ReturnType<typeof createInlineMath>;

function createInlineMath(node: mdast.InlineMath) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Definition = ReturnType<typeof createDefinition>;

function createDefinition(node: mdast.Definition) {
  const { type, identifier, label, url, title } = node;
  return {
    type,
    identifier,
    label,
    url,
    title,
    children: [{ text: "" }],
  };
}

export type FootnoteDefinition = ReturnType<typeof createFootnoteDefinition>;

function createFootnoteDefinition(
  node: mdast.FootnoteDefinition,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children, identifier, label } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    identifier,
    label,
  };
}

export type Text = ReturnType<typeof createText>;

function createText(text: string, astNodeTypes: ASTMap, deco: Decoration) {
  return {
    ...deco,
    text,
  };
}

export type Break = ReturnType<typeof createBreak>;

function createBreak(node: mdast.Break) {
  return {
    type: node.type,
    children: [{ text: "" }],
  };
}

export type Link = ReturnType<typeof createLink>;

function createLink(node: mdast.Link, astNodeTypes: ASTMap, deco: Decoration) {
  const { type, children, url, title } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    url,
    title,
  };
}

export type Image = ReturnType<typeof createImage>;

function createImage(node: mdast.Image) {
  const { type, url, title, alt } = node;
  return {
    type,
    url,
    title,
    alt,
    children: [{ text: "" }],
  };
}

export type LinkReference = ReturnType<typeof createLinkReference>;

function createLinkReference(
  node: mdast.LinkReference,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children, referenceType, identifier, label } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
    referenceType,
    identifier,
    label,
  };
}

export type ImageReference = ReturnType<typeof createImageReference>;

function createImageReference(node: mdast.ImageReference) {
  const { type, alt, referenceType, identifier, label } = node;
  return {
    type,
    alt,
    referenceType,
    identifier,
    label,
    children: [{ text: "" }],
  };
}

export type Footnote = ReturnType<typeof createFootnote>;

function createFootnote(
  node: mdast.Footnote,
  astNodeTypes: ASTMap,
  deco: Decoration
) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, astNodeTypes, deco),
  };
}

export type FootnoteReference = ReturnType<typeof createFootnoteReference>;

function createFootnoteReference(
  node: mdast.FootnoteReference,
  astNodeTypes: ASTMap
) {
  const { type, identifier, label } = node;
  return {
    type,
    identifier,
    label,
    children: [{ text: "" }],
  };
}

export type SlateNode =
  | Paragraph
  | Heading
  | ThematicBreak
  | Blockquote
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | Html
  | Code
  | Yaml
  | Toml
  | Definition
  | FootnoteDefinition
  | Text
  | Break
  | Link
  | Image
  | LinkReference
  | ImageReference
  | Footnote
  | FootnoteReference
  | Math
  | InlineMath;
