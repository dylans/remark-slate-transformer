import { ASTMap } from "./mdast-to-slate";

export const defaults: ASTMap = {
  // Note these names aren't 100% consistent, but attempting to
  // stay consistent with remark-slate and slate-plugins projects

  /* block */
  block_quote: { type: "blockquote" },
  code_block: { type: "code_block" },
  heading: {
    1: { type: "h1" },
    2: { type: "h2" },
    3: { type: "h3" },
    4: { type: "h4" },
    5: { type: "h5" },
    6: { type: "h6" },
  },
  paragraph: { type: "p" },

  /* inline */
  delete_mark: { type: "strikethrough" },
  emphasis_mark: { type: "italic" },
  inlineCode: { type: "inlineCode" },
  link: { type: "link" },
  link_url: { type: "url" }, // alternate name for url property on link in ast
  strong_mark: { type: "bold" },

  /* lists */
  listItem: { type: "li" },
  ol_list: { type: "ol" },
  ul_list: { type: "ul" },

  /* tables */
  table: { type: "table" },
  tableHeading: { type: "th" },
  tableRow: { type: "tr" },
  tableCell: { type: "td" },
};
