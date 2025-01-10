import fs from "fs";
import fetch from "node-fetch";

interface SBOMData {
  dependencies?: Record<string, unknown>;
  [key: string]: unknown; // Add more specific fields if known
}

interface FetchError extends Error {
  response?: Response;
}

const fetchSBOMData = async (url: string): Promise<SBOMData> => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const error: FetchError = new Error(`Error fetching SBOM data from ${url}`);
    error.response = response;
    throw error;
  }

  return (await response.json()) as SBOMData;
};

const fetchData = async (): Promise<void> => {
  const feUrl =
    "https://api.github.com/repos/ohcnetwork/care_fe/dependency-graph/sbom";
  const beUrl =
    "https://api.github.com/repos/ohcnetwork/care/dependency-graph/sbom";

  try {
    const [frontendData, backendData] = await Promise.all([
      fetchSBOMData(feUrl),
      fetchSBOMData(beUrl),
    ]);

    // Write frontend SBOM data
    fs.writeFileSync(
      "./public/licenses/feBomData.json",
      JSON.stringify(frontendData, null, 2),
    );

    // Write backend SBOM data
    fs.writeFileSync(
      "./public/licenses/beBomData.json",
      JSON.stringify(backendData, null, 2),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching SBOM data:", error.message);
    } else {
      console.error("Unknown error occurred while fetching SBOM data");
    }
  }
};

fetchData();
