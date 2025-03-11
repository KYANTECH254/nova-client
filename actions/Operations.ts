"use server";

import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "public", "packages.json");

export async function SavePackagesToJson(packages: any) {
  try {
    const sanitizedPackages = packages.map(({ id, adminID, createdAt, updatedAt, platformID, ...rest }: any) => rest);

    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

    if (fileExists) {
      const existingData = await fs.readFile(filePath, "utf-8");

      if (existingData.trim()) {
        const parsedData = JSON.parse(existingData);
        if (JSON.stringify(parsedData) === JSON.stringify(sanitizedPackages)) {
          return true;
        }
      }
    }

    await fs.writeFile(filePath, JSON.stringify(sanitizedPackages, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to packages.json:", error);
    return false;
  }
}
