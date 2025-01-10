import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

import Card from "@/CAREUI/display/Card";
import CareIcon from "@/CAREUI/icons/CareIcon";

import licenseUrls from "@/components/Licenses/licenseUrls.json";

const getLicenseUrl = (licenseId: string | undefined): string | null => {
  if (!licenseId) return null;
  return licenseUrls[licenseId as keyof typeof licenseUrls] || null;
};

const fetchJsonData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch data");
  return response.json();
};

const BOMDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState(false);
  const [showExternalRefs, setShowExternalRefs] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bom");

  const {
    data: feBomData,
    isLoading: feBomLoading,
    error: feBomError,
  } = useQuery({
    queryKey: ["feBomData"],
    queryFn: () => fetchJsonData("/licenses/feBomData.json"),
  });

  const {
    data: beBomData,
    isLoading: beBomLoading,
    error: beBomError,
  } = useQuery({
    queryKey: ["beBomData"],
    queryFn: () => fetchJsonData("/licenses/beBomData.json"),
  });

  const bomData = activeTab === "bom" ? feBomData : beBomData;

  const handleCopy = () => {
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  if (feBomLoading || beBomLoading) {
    return <div>{t("loading")}</div>;
  }

  if (feBomError || beBomError) {
    return <div>{t("error_404")}</div>;
  }

  const packages = bomData?.sbom?.packages || [];

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <button
          className={`text-md w-full rounded-md px-4 py-2 transition-all duration-300 md:w-auto ${
            activeTab === "bom" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("bom")}
        >
          {t("care_frontend")}
        </button>
        <button
          className={`text-md w-full rounded-md px-4 py-2 transition-all duration-300 md:w-auto ${
            activeTab === "beBom" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("beBom")}
        >
          {t("care_backend")}
        </button>
      </div>
      <Card className="rounded-lg bg-white p-4 shadow-md transition-all duration-300">
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold text-primary md:text-2xl">
            {t("spdx_sbom_version") + ": " + bomData?.sbom?.spdxVersion ||
              t("n_a")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("created_on")}{" "}
            {bomData?.sbom?.creationInfo?.created
              ? dayjs(bomData.sbom.creationInfo.created).format("MMMM D, YYYY")
              : t("n_a")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <h3 className="col-span-full text-lg font-semibold text-primary">
            {t("packages")}
            {":"}
          </h3>
          {packages.map((pkg: any, index: number) => (
            <div
              key={index}
              className="block rounded-md border p-2 transition-all duration-300 hover:shadow-lg"
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-dark block text-primary"
              >
                <strong className="text-lg">
                  {`${pkg.name || t("n_a")} v${pkg.versionInfo || t("n_a")}`}
                </strong>
              </a>
              {pkg.licenseConcluded && (
                <p className="text-base">
                  {t("license")}
                  {": "}
                  <a
                    href={getLicenseUrl(pkg.licenseConcluded) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-dark text-primary"
                  >
                    {pkg.licenseConcluded || t("n_a")}
                  </a>
                </p>
              )}
              <div>
                <h4
                  className="block cursor-pointer font-semibold text-primary"
                  onClick={() =>
                    setShowExternalRefs(
                      showExternalRefs === index ? null : index,
                    )
                  }
                >
                  <CareIcon icon="l-info-circle" />
                </h4>
                {showExternalRefs === index && (
                  <ul className="list-inside list-disc pl-4 text-xs">
                    {pkg.externalRefs?.map((ref: any, idx: any) => (
                      <li key={idx}>
                        <a
                          href={ref.referenceLocator || "#"}
                          className="hover:text-primary-dark block break-words text-primary"
                        >
                          {ref.referenceLocator || t("n_a")}
                        </a>
                        {ref.referenceCategory && (
                          <p>{t("category") + ": " + ref.referenceCategory}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <CopyToClipboard
            text={JSON.stringify(bomData, null, 2)}
            onCopy={handleCopy}
          >
            <button className="text-md hover:bg-primary-dark w-full rounded-md bg-primary px-4 py-2 text-white transition-all duration-300 focus:outline-none md:w-auto">
              {t("copy_bom_json")}
            </button>
          </CopyToClipboard>
          {copyStatus && (
            <span className="mt-2 block text-sm text-gray-600">
              {t("copied_to_clipboard")}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BOMDisplay;
