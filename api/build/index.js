"use strict";

const BUILD = Object.freeze({
  product: "local-records-continuity",
  artifact: "managed-protected-download-api",
  version: "0.1.0",
  release: "local-records-continuity-polish-4",
  license_header: "x-continuity-license"
});

module.exports = async function buildIdentity(context) {
  context.res = {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Continuity-API-Build": BUILD.release
    },
    body: BUILD
  };
};

module.exports.BUILD = BUILD;
