const fs = require("node:fs/promises");
const path = require("node:path");
const discover = require("./discover-pages");

const origin = "https://chengchuu.github.io";
const mount = "/pages/";

function decodeEntities(value) {
  const named = { amp: "&", quot: "\"", apos: "'", lt: "<", gt: ">", sol: "/", colon: ":" };
  return value.replace(/&(#x[\da-f]+;?|#\d+;?|[a-z][\da-z]*;)/gi, (entity, reference) => {
    const name = reference.replace(/;$/, "");
    if (name.startsWith("#")) {
      const hex = name[1].toLowerCase() === "x";
      return String.fromCodePoint(parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    if (!Object.hasOwn(named, name)) throw new Error(`Unsupported HTML entity ${entity} in reference`);
    return named[name];
  });
}

// Bounded HTML inspection: skip comments and raw-text contents, not their opening tags.
function tags(html) {
  const pattern = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b((?:"[^"]*"|'[^']*'|[^'">])*)>[\s\S]*?<\/\1\s*>|<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  return [ ...html.matchAll(pattern) ].filter((match) => match[1] || match[3]).map((match) => {
    const attributes = Object.create(null);
    const source = match[2] ?? match[4];
    for (const attribute of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const name = attribute[1].toLowerCase();
      if (!Object.hasOwn(attributes, name)) attributes[name] = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    }
    return { name: (match[1] ?? match[3]).toLowerCase(), attributes };
  });
}

function reference(tag) {
  if (tag.name === "a") return tag.attributes.href;
  if (tag.name === "script" || tag.name === "img") return tag.attributes.src;
  if (tag.name === "link" && tag.attributes.rel !== undefined &&
      /(?:^|\s)stylesheet(?:\s|$)/i.test(decodeEntities(tag.attributes.rel))) return tag.attributes.href;
}

function inside(root, file) {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function resolveReference(dist, document, value) {
  const decoded = decodeEntities(value).trim();
  if (decoded.startsWith("#")) return null;
  const url = new URL(decoded, `${origin}${mount}${document.split("/").map(encodeURIComponent).join("/")}`);
  if (![ "http:", "https:" ].includes(url.protocol) || url.origin !== origin) return null;
  if (!url.pathname.startsWith(mount)) throw new Error("Local URL escapes /pages/");
  const relative = decodeURIComponent(url.pathname.slice(mount.length));
  if (relative.includes("\\") || relative.includes("\0")) throw new Error("Invalid local path");
  let file = path.resolve(dist, relative);
  if (!inside(dist, file)) throw new Error("Local path escapes artifact");
  if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
  if (!inside(dist, await fs.realpath(file))) throw new Error("Symlink escapes artifact");
  if (!(await fs.stat(file)).isFile()) throw new Error("Reference is not a file");
  return file;
}

async function validatePages(root) {
  const pages = discover(path.join(root, "src/pages"));
  const dist = await fs.realpath(path.join(root, "dist"));
  const documents = [ "index.html", ...pages.map(({ name }) => `${name}/index.html`) ];
  for (const document of documents) {
    const file = path.join(dist, document);
    if (!inside(dist, await fs.realpath(file))) throw new Error(`${document}: symlink escapes artifact`);
    const elements = tags(await fs.readFile(file, "utf8"));
    const destinations = [];
    for (const tag of elements) {
      if (tag.name === "base") throw new Error(`${document}: base elements are not supported`);
      let value;
      try {
        value = reference(tag);
        if (value === undefined) continue;
        const destination = await resolveReference(dist, document, value);
        if (document === "index.html" && tag.name === "a") destinations.push(destination);
        if (tag.name === "script" && destination && /^dev-client(?:\.[\da-f]+)?\.js$/.test(path.basename(destination))) {
          throw new Error("Development client in Pages artifact");
        }
      } catch (error) {
        throw new Error(`${document}: ${JSON.stringify(value)}: ${error.message}`);
      }
    }
    if (document === "index.html") {
      const expected = pages.map(({ name }) => path.join(dist, name, "index.html")).sort();
      if (destinations.length !== expected.length || destinations.includes(null) ||
          destinations.sort().some((destination, index) => destination !== expected[index])) {
        throw new Error("index.html: demo directory has missing, duplicate, or stale entries");
      }
      if (elements.some((tag) => tag.name === "script")) throw new Error("index.html: landing page must not contain scripts");
    }
  }
  for (const page of pages) {
    for (const name of await fs.readdir(path.join(dist, page.name))) {
      if (/^dev-client(?:\.[\da-f]+)?\.js$/.test(name)) throw new Error(`${page.name}/${name}: development client in Pages artifact`);
      if (!page.entry && /^index(?:\.[\da-f]+)?\.js$/.test(name)) throw new Error(`${page.name}/${name}: unexpected HTML-only page bundle`);
    }
  }
}

module.exports = validatePages;
if (require.main === module) {
  validatePages(path.join(__dirname, "..")).then(() => {
    console.log("Pages artifact validated.");
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
