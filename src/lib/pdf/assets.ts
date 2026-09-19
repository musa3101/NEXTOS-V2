import fs from "fs";
import path from "path";

function loadBuffer(relativePath: string): any {
  const fullPath = path.join(process.cwd(), relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      return { data: fs.readFileSync(fullPath), format: "png" as const };
    }
  } catch (_) {}
  return fullPath;
}

export function getLogoBlackSource(): any {
  return loadBuffer("public/mn-logo-black.png");
}

export function getLogoDarkSource(): any {
  return loadBuffer("public/mn-logo-dark.png");
}

export function getLogoGoldSource(): any {
  return loadBuffer("public/mn-logo-gold.png");
}

export const getLogoBlackSrc = getLogoBlackSource;
export const getLogoDarkSrc = getLogoDarkSource;
export const getLogoGoldSrc = getLogoGoldSource;
