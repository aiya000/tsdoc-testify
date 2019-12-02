import * as ts from "typescript";
import { extractComments, parseTSDoc, collectExampleCodes } from "../parser";
import { strict as assert } from "assert";
import * as tsdoc from "@microsoft/tsdoc";

function createVirtualSource({
  src,
  fileName
}: {
  src: string;
  fileName: string;
}) {
  return ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2015);
}

describe("extractComments", () => {
  it("parse example", () => {
    const source = createVirtualSource({
      src: `
    /**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}
    `,
      fileName: "virtual.ts"
    });

    const foundComments = extractComments(source);
    assert(ts.isFunctionDeclaration(foundComments[0].compilerNode));
  });
});

describe("parseTSDoc", () => {
  it("extract DocComment", () => {
    const source = createVirtualSource({
      src: `
    /**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * test()
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}
    `,
      fileName: "virtual.ts"
    });

    const foundComments = extractComments(source);
    const docNode = parseTSDoc(foundComments[0]);
    const paragraph = docNode.summarySection.getChildNodes()[0] as tsdoc.DocParamCollection;
    assert.equal(
      (paragraph.getChildNodes()[0] as tsdoc.DocPlainText).text,
      "Test function"
    );
  });
});

describe("collectExampleCodes", () => {
  const source = createVirtualSource({
    src: `/**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * import { test1 } from "test-mod"
 * test()
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}

/**
 * Test function2
 *
 * @example
 *
 * \`\`\` 
 * import { test2 } from "test-mod"
 * test2()
 * test2()
 * \`\`\`
 */
export function test2() {
  // test
  console.log("hello");
}

    `,
    fileName: "virtual.ts"
  });

  const foundComments = extractComments(source);
  const docNode = parseTSDoc(foundComments[0]);
  const examples = collectExampleCodes(
    foundComments[0].compilerNode,
    source,
    docNode
  );
  console.log(examples);
});
