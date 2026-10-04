import { co2 } from "@tgwf/co2";

// Initialize CO2.js with the Sustainable Web Design model
const co2Emission = new co2({ model: "swd" });

// Set to true if the server is hosted on a green host
const greenHost = false;

const byteLength = (chunk) =>
  chunk && typeof chunk !== "function" ? Buffer.byteLength(chunk, "utf8") : 0;

// Middleware to calculate data transfer size and estimated CO2 per request
const carbon = (req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // Calculate request size
  if (req.body) {
    requestBytes = Buffer.byteLength(JSON.stringify(req.body), "utf8");
  }
  if (req.query) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), "utf8");
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), "utf8");
  }

  // Override res.write and res.end to calculate response size
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    responseBytes += byteLength(chunk);
    return originalWrite.call(res, chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    responseBytes += byteLength(chunk);

    // Store total bytes
    res.locals.totalBytes = requestBytes + responseBytes;

    // Calculate carbon emissions
    const emissions = co2Emission.perByte(res.locals.totalBytes, greenHost);
    console.log(`Data transferred: ${res.locals.totalBytes} bytes`);
    console.log(`Estimated CO2 emissions: ${emissions.toFixed(3)} grams`);

    return originalEnd.call(res, chunk, ...args);
  };

  next();
};

export default carbon;
