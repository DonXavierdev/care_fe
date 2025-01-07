import dayjs from "dayjs";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

import Card from "@/CAREUI/display/Card";
import CareIcon from "@/CAREUI/icons/CareIcon";

import licenseUrls from "@/components/Licenses/licenseUrls.json";

import beBomData from "./beBomData.json";
import feBomData from "./feBomData.json";

const getLicenseUrl = (licenseId: string | undefined): string | null => {
  if (!licenseId) return null;
  return licenseUrls[licenseId as keyof typeof licenseUrls] || null;
};

const BOMDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState(false);
  const [showExternalRefs, setShowExternalRefs] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bom");

  const bomData = activeTab === "bom" ? feBomData : beBomData;

  const handleCopy = () => {
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

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
          {t("Care Frontend")}
        </button>
        <button
          className={`text-md w-full rounded-md px-4 py-2 transition-all duration-300 md:w-auto ${
            activeTab === "beBom" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("beBom")}
        >
          {t("Care Backend")}
        </button>
      </div>
      <Card className="rounded-lg bg-white p-4 shadow-md transition-all duration-300">
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold text-primary md:text-2xl">
            {t("SPDX SBOM (Version: {{version}})", {
              version: bomData?.sbom?.spdxVersion || t("N/A"),
            })}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Created on: {{date}}", {
              date: bomData?.sbom?.creationInfo?.created
                ? dayjs(bomData.sbom.creationInfo.created).format(
                    "MMMM D, YYYY",
                  )
                : t("N/A"),
            })}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <h3 className="col-span-full text-lg font-semibold text-primary">
            {t("Packages:")}
          </h3>
          {packages.map((pkg, index) => (
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
                  {t("{{name}} v{{version}}", {
                    name: pkg.name || t("N/A"),
                    version: pkg.versionInfo || t("N/A"),
                  })}
                </strong>
              </a>
              {pkg.licenseConcluded && (
                <p className="text-base">
                  {t("License:")}{" "}
                  <a
                    href={getLicenseUrl(pkg.licenseConcluded) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-dark text-primary"
                  >
                    {pkg.licenseConcluded || t("N/A")}
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
                    {pkg.externalRefs?.map((ref, idx) => (
                      <li key={idx}>
                        <a
                          href={ref.referenceLocator || "#"}
                          className="hover:text-primary-dark block break-words text-primary"
                        >
                          {ref.referenceLocator || t("N/A")}
                        </a>
                        {ref.referenceCategory && (
                          <p>
                            {t("Category: {{category}}", {
                              category: ref.referenceCategory,
                            })}
                          </p>
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
              {t("Copy BOM JSON")}
            </button>
          </CopyToClipboard>
          {copyStatus && (
            <span className="mt-2 block text-sm text-gray-600">
              {t("Copied to clipboard!")}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BOMDisplay;
