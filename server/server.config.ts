let existingConf: Record<string, string>;
try {
  existingConf = require("./local.server.config.ts");
} catch (err: any) {
  existingConf = {};
}

function e(param: string) {
  return process.env[param] || existingConf[param] || "";
}
export default {
  SESSION_SECRET: e("SESSION_SECRET"),
  postgres: {
    user: e("POSTGRES_USER"),
    host: e("POSTGRES_HOST"),
    database: e("POSTGRES_DB"),
    password: e("POSTGRES_PASSWORD"),
  },
};
