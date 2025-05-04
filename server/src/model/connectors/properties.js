import yaml from "js-yaml";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();
export let properties;

try {
  properties = yaml.load(
    fs.readFileSync(path.join(__dirname, "src/resources/properties.yml"), "utf8")
  );
} catch (e) {
  console.error(e);
}

export function getMongoUrl() {
  return `mongodb://${properties.db.hostname}:${properties.db.port}/${properties.db.schema}`;
}

export function getMongoTestUrl() {
    return `mongodb://${properties.db.hostname}:${properties.db.port}/${properties.db.schemaTest}`;
  }

export function getAdminUser() {
    return properties.admin;
}
