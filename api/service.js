"use strict";

/*
 * LPB Service API
 * Endpoint:
 *   GET  /api/service
 *   POST /api/service
 *   HEAD /api/service
 *
 * Designed for Vercel Serverless Functions.
 */

const SERVICE = {
  name: "LPB Service",
  id: "lpb-service",
  version: "1.0.0",
  description:
    "Backend service endpoint for Landing Page Builder",
  status: "online",
  environment:
    process.env.VERCEL_ENV || "development"
};

const startedAt = Date.now();


/* =========================================================
   HELPERS
========================================================= */

function now() {
  return new Date().toISOString();
}


function uptime() {
  return Math.floor(
    (Date.now() - startedAt) / 1000
  );
}


function getMethod(req) {
  return String(
    req.method || "GET"
  ).toUpperCase();
}


function getUserAgent(req) {
  return (
    req.headers?.["user-agent"] ||
    "unknown"
  );
}


function getRequestId(req) {
  return (
    req.headers?.["x-request-id"] ||
    req.headers?.["x-vercel-id"] ||
    "unknown"
  );
}


function getVercelRegion(req) {
  return (
    req.headers?.["x-vercel-ip-country-region"] ||
    "unknown"
  );
}


function getCountry(req) {
  return (
    req.headers?.["x-vercel-ip-country"] ||
    "unknown"
  );
}


function getQuery(req) {
  return req.query || {};
}


function safeJson(value) {
  try {
    return JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    return "{}";
  }
}


/* =========================================================
   RESPONSE HELPERS
========================================================= */

function sendJSON(
  res,
  statusCode,
  data
) {

  res.status(statusCode);

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  res.setHeader(
    "X-LPB-Service",
    SERVICE.id
  );

  res.setHeader(
    "X-LPB-Version",
    SERVICE.version
  );

  return res.json(data);
}


/* =========================================================
   SERVICE INFORMATION
========================================================= */

function getServiceInfo(req) {

  return {

    service: SERVICE.name,

    id: SERVICE.id,

    version: SERVICE.version,

    status: SERVICE.status,

    description:
      SERVICE.description,

    environment:
      SERVICE.environment,

    runtime:
      "Node.js",

    platform:
      "Vercel",

    uptime:
      uptime(),

    timestamp:
      now(),

    request: {

      method:
        getMethod(req),

      requestId:
        getRequestId(req),

      userAgent:
        getUserAgent(req),

      country:
        getCountry(req),

      region:
        getVercelRegion(req)

    }

  };
}


/* =========================================================
   HEALTH
========================================================= */

function healthCheck() {

  return {

    status: "healthy",

    service:
      SERVICE.id,

    checks: {

      service: {
        status: "pass"
      },

      runtime: {
        status: "pass"
      },

      api: {
        status: "pass"
      }

    },

    timestamp:
      now()

  };
}


/* =========================================================
   CAPABILITIES
========================================================= */

function getCapabilities() {

  return {

    htmlExport: true,

    jsonExport: true,

    zipExport: true,

    projectImport: true,

    preview: true,

    projectStorage: true,

    healthCheck: true,

    serviceInfo: true,

    apiVersion: "v1"

  };
}


/* =========================================================
   API INFORMATION
========================================================= */

function getApiInfo() {

  return {

    name:
      "LPB API",

    version:
      "v1",

    endpoints: {

      service:
        "/api/service",

      health:
        "/api/service?check=health",

      info:
        "/api/service?check=info",

      capabilities:
        "/api/service?check=capabilities"

    },

    methods: [

      "GET",
      "POST",
      "HEAD"

    ]

  };
}


/* =========================================================
   GET HANDLER
========================================================= */

function handleGET(
  req,
  res
) {

  const query =
    getQuery(req);


  const check =
    String(
      query.check || ""
    ).toLowerCase();


  /*
   * Health check
   */

  if (
    check === "health"
  ) {

    return sendJSON(
      res,
      200,
      healthCheck()
    );

  }


  /*
   * Service information
   */

  if (
    check === "info"
  ) {

    return sendJSON(
      res,
      200,
      getServiceInfo(req)
    );

  }


  /*
   * Capabilities
   */

  if (
    check === "capabilities"
  ) {

    return sendJSON(
      res,
      200,
      {
        success: true,

        capabilities:
          getCapabilities(),

        timestamp:
          now()
      }
    );

  }


  /*
   * API information
   */

  if (
    check === "api"
  ) {

    return sendJSON(
      res,
      200,
      {
        success: true,

        api:
          getApiInfo(),

        timestamp:
          now()
      }
    );

  }


  /*
   * Default service response
   */

  return sendJSON(
    res,
    200,
    {

      success: true,

      message:
        "LPB Service is online.",

      service:
        getServiceInfo(req),

      capabilities:
        getCapabilities(),

      api:
        getApiInfo(),

      timestamp:
        now()

    }
  );
}


/* =========================================================
   POST HANDLER
========================================================= */

function handlePOST(
  req,
  res
) {

  const body =
    req.body || {};


  return sendJSON(
    res,
    200,
    {

      success: true,

      message:
        "POST request received.",

      service:
        SERVICE.id,

      received: {

        body,

        method:
          getMethod(req),

        timestamp:
          now()

      }

    }
  );
}


/* =========================================================
   HEAD HANDLER
========================================================= */

function handleHEAD(
  req,
  res
) {

  res.status(200);

  res.setHeader(
    "X-LPB-Service",
    SERVICE.id
  );

  res.setHeader(
    "X-LPB-Version",
    SERVICE.version
  );

  res.setHeader(
    "X-LPB-Status",
    "online"
  );

  return res.end();
}


/* =========================================================
   METHOD HANDLER
========================================================= */

function handleRequest(
  req,
  res
) {

  const method =
    getMethod(req);


  switch (method) {

    case "GET":

      return handleGET(
        req,
        res
      );


    case "POST":

      return handlePOST(
        req,
        res
      );


    case "HEAD":

      return handleHEAD(
        req,
        res
      );


    default:

      res.setHeader(
        "Allow",
        "GET, POST, HEAD"
      );


      return sendJSON(
        res,
        405,
        {

          success: false,

          error:
            "Method Not Allowed",

          allowedMethods: [
            "GET",
            "POST",
            "HEAD"
          ],

          timestamp:
            now()

        }
      );

  }
}


/* =========================================================
   MAIN VERCEL HANDLER
========================================================= */

export default function handler(
  req,
  res
) {

  try {

    return handleRequest(
      req,
      res
    );

  } catch (error) {

    console.error(
      "LPB Service Error:",
      error
    );


    return sendJSON(
      res,
      500,
      {

        success: false,

        error:
          "Internal Server Error",

        service:
          SERVICE.id,

        timestamp:
          now()

      }
    );

  }

}
