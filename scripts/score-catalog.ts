/**
 * Ranks the catalogue so the most attractive products come first, and hides the weakest.
 * The rules live in scripts/lib/scoring.ts.
 *
 *   npm run score                    # rank and save
 *   npm run score -- --dry-run       # print the ranking without saving
 *   npm run score -- --keep 400      # most products kept visible per price tier (default 400)
 *   npm run score -- --show-hidden "Home Décor"   # list hidden products in a category
 *   tsx scripts/score-catalog.ts --build          # used by `npm run build` (see below)
 *
 * --build runs on every deploy: it is quiet, skips when there is no database configured,
 * and never fails the build (a ranking problem shouldn't stop the site from deploying).
 */
import mongoose from "mongoose";
import { scoreCatalog } from "./lib/scoring";

const args = process.argv.slice(2);
const build = args.includes("--build");
const keepArg = args.indexOf("--keep");
const showArg = args.indexOf("--show-hidden");

// Locally the database URL is in .env.local; on Vercel it comes from the project settings.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local (e.g. on Vercel)
}

(async () => {
  if (!process.env.MONGODB_URI) {
    if (build) return console.log("Product ranking skipped: MONGODB_URI is not set.");
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15_000 });
  try {
    await scoreCatalog({
      dryRun: args.includes("--dry-run"),
      keep: keepArg >= 0 ? Number(args[keepArg + 1]) : undefined,
      verbose: !build,
      showHidden: showArg >= 0 ? args[showArg + 1] : undefined,
    });
  } finally {
    await mongoose.disconnect();
  }
})().catch((e) => {
  if (build) {
    console.warn("Product ranking skipped (the deploy continues):", e instanceof Error ? e.message : e);
    process.exit(0);
  }
  console.error(e);
  process.exit(1);
});
