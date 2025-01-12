import fs from "fs";
import fetch from "node-fetch";

const FE_SBOM_URL =
  "https://api.github.com/repos/ohcnetwork/care_fe/dependency-graph/sbom";
const BE_SBOM_URL =
  "https://api.github.com/repos/ohcnetwork/care/dependency-graph/sbom";

interface GitHubSbomApiResponse {
  sbom: {
    spdxVersion: string;
    dataLicense: string;
    SPDXID: string;
    name: string;
    documentNamespace: string;
    creationInfo: {
      creators: string[];
      created: string;
    };
    packages: {
      name: string;
      SPDXID: string;
      versionInfo: string;
      downloadLocation: string;
      filesAnalyzed: boolean;
      licenseConcluded?: string;
      copyrightText?: string;
      externalRefs: {
        referenceCategory: string;
        referenceType: string;
        referenceLocator: string;
      }[];
      licenseDeclared?: string;
    }[];
    relationships: {
      spdxElementId: string;
      relatedSpdxElement: string;
      relationshipType: string;
    }[];
  };
}

const fetchSBOMData = async (url: string): Promise<GitHubSbomApiResponse> => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching SBOM data from ${url}: ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubSbomApiResponse;
};

const fetchData = async (): Promise<void> => {
  const [frontendData, backendData] = await Promise.all([
    fetchSBOMData(FE_SBOM_URL),
    fetchSBOMData(BE_SBOM_URL),
  ]);

  fs.writeFileSync(
    "./public/licenses/feBomData.json",
    JSON.stringify(frontendData, null, 2),
  );

  fs.writeFileSync(
    "./public/licenses/beBomData.json",
    JSON.stringify(backendData, null, 2),
  );
};

fetchData();
