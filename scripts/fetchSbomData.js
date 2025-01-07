import fs from "fs";
import fetch from "node-fetch";

const fetchSBOMData = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`Error fetching SBOM data from ${url}`);
  }
  return await response.json();
};

const fetchData = async () => {
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
      "./src/components/Licenses/feBomData.json",
      JSON.stringify(frontendData, null, 2),
    );

    // Write backend SBOM data
    fs.writeFileSync(
      "./src/components/Licenses/beBomData.json",
      JSON.stringify(backendData, null, 2),
    );

    console.log(
      "SBOM data successfully saved as feBomData.json and beBomData.json",
    );
  } catch (error) {
    console.error("Error fetching SBOM data:", error.message);
  }
};

fetchData();
