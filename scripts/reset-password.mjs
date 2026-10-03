#!/usr/bin/env node
/**
 * Set or reset a user's password from the command line.
 *
 * There is no password-reset flow in the app (no token model, no mail provider),
 * so this is currently the only non-destructive way to regain access.
 *
 * Usage:
 *   npm run reset-password -- --email you@example.com
 *   npm run reset-password -- --email you@example.com --password "secret" --yes
 *   npm run reset-password -- --email you@example.com --dry-run
 *   npm run reset-password -- --generate "secret"      # just print a hash
 *
 * The password is never written to a file, logged, or included in output. When a
 * TTY is available it is read from a masked prompt so it stays out of shell
 * history and out of `ps` output.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import process from "node:process";

const BCRYPT_ROUNDS = 12;
const MIN_LENGTH = 10;

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Real environment variables win, so CI/one-off overrides keep working.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const eq = token.indexOf("=");
    if (eq > 0) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args[token.slice(2)] = "true";
      } else {
        args[token.slice(2)] = next;
        i += 1;
      }
    }
  }
  return args;
}

/** Reads a secret without echoing it, so it never reaches shell history or `ps`. */
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          "No interactive terminal detected. Re-run with --password \"...\" or set NEW_PASSWORD."
        )
      );
      return;
    }
    process.stdout.write(question);
    // A no-op output sink suppresses readline's echo without touching the real
    // stdout, so the prompt stays visible but the typed characters do not.
    const rl = readline.createInterface({
      input: process.stdin,
      output: { write: () => true },
      terminal: true
    });
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl.on("SIGINT", () => {
      rl.close();
      process.stdout.write("\n");
      reject(new Error("Cancelled."));
    });
  });
}

function promptYesNo(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      resolve(false);
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function describeProblems(password) {
  const problems = [];
  if (password.length < MIN_LENGTH) problems.push(`must be at least ${MIN_LENGTH} characters`);
  if (!/[a-z]/.test(password)) problems.push("must contain a lowercase letter");
  if (!/[A-Z]/.test(password)) problems.push("must contain an uppercase letter");
  if (!/\d/.test(password)) problems.push("must contain a digit");
  return problems;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.generate) {
    const password = String(args.generate);
    const problems = describeProblems(password);
    if (problems.length) {
      console.error("Refusing to generate a weak hash:");
      for (const p of problems) console.error(`  - ${p}`);
      process.exit(1);
    }
    console.log(await bcrypt.hash(password, BCRYPT_ROUNDS));
    console.error("\nUse it with:\n  UPDATE \"User\" SET \"passwordHash\" = '<paste>' WHERE email = 'you@example.com';");
    return;
  }

  if (!args.email) {
    console.error("Missing --email.\n\nUsage: npm run reset-password -- --email you@example.com [--password \"secret\"] [--yes] [--dry-run]");
    process.exit(1);
  }

  const email = String(args.email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`"${email}" is not a valid email address.`);
    process.exit(1);
  }

  let password = args.password ?? process.env.NEW_PASSWORD;
  if (password === undefined) {
    password = await promptHidden(`New password for ${email}: `);
  } else {
    password = String(password);
  }

  const problems = describeProblems(password);
  if (problems.length) {
    console.error("Refusing to set a weak password:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  if (!args.yes) {
    const ok = await promptYesNo(`Set a new password for ${email}? [y/N] `);
    if (!ok) {
      console.log("Aborted. Nothing was changed.");
      process.exit(0);
    }
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env before running this script.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isActive: true, provider: true, passwordHash: true },
    });

    if (!user) {
      console.error(`No user found for ${email}.`);
      console.error("Check the address, or register the account first. Nothing was changed.");
      process.exit(1);
    }

    const action = user.passwordHash ? "RESET" : "SET";

    if (args["dry-run"]) {
      console.log(`Dry run - nothing was written.`);
      console.log(`  user    : ${user.email}`);
      console.log(`  role    : ${user.role}`);
      console.log(`  active  : ${user.isActive}`);
      console.log(`  provider: ${user.provider}`);
      console.log(`  action  : ${action} passwordHash`);
      return;
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

    console.log(`Password ${action.toLowerCase()} for ${user.email} (${user.role}).`);
    if (!user.isActive) {
      console.log("Note: this account is deactivated, so sign-in will still be refused.");
    }
    if (user.provider === "google") {
      console.log("Note: this account also signs in via Google with a different password.");
    }
    console.log("Run the test suite if you need to confirm nothing else broke.");
  } finally {
    await prisma.$disconnect();
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
