import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import nodemailer from "nodemailer";
import { PendingVerification, Test, User } from "./schemas";
import {
  evaluateCpuAnswer,
  generateCpuProblem,
  getCpuPolicyDescription,
  runCpuPolicy,
} from "./core/cpuScheduling";
import {
  evaluatePageAnswer,
  generatePageProblem,
  getPagePolicyDescription,
  runPagePolicy,
} from "./core/pageReplacement";
import { CpuPolicy, CpuProblem, PagePolicy, PageProblem } from "./types";

const app = express();
app.use(express.json());
app.use(cors());

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cadets";
const EMAIL_FROM = getRequiredEnv("EMAIL_FROM");
const SMTP_HOST = getRequiredEnv("SMTP_HOST");
const SMTP_PORT = Number(getRequiredEnv("SMTP_PORT"));
const SMTP_USER = getRequiredEnv("SMTP_USER");
const SMTP_PASS = getRequiredEnv("SMTP_PASS");

const emailValidate = /^[a-zA-Z0-9._%+\-]+@westpoint\.edu$/;

const mailTransport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const cpuSessions = new Map<string, CpuProblem>();
const pageSessions = new Map<string, PageProblem>();

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const parseCpuPolicy = (raw: unknown): CpuPolicy | null => {
  if (typeof raw !== "string") return null;
  const upper = raw.toUpperCase();
  if (["FIFO", "SJF", "STCF", "RR", "MLFQ"].includes(upper)) {
    return upper as CpuPolicy;
  }
  return null;
};

const parsePagePolicy = (raw: unknown): PagePolicy | null => {
  if (typeof raw !== "string") return null;
  const upper = raw.toUpperCase();
  if (["FIFO", "LRU", "OPT", "CLOCK"].includes(upper)) {
    return upper as PagePolicy;
  }
  return null;
};

const getAuthedUserKey = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId?: string };
      if (payload.userId) return payload.userId.toString();
    } catch {
      // Checked in auth middleware.
    }
  }
  return null;
};

const requireAuth = (
  req: Request,
  res: Response,
  next: () => void
): Response | void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Missing bearer token." });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid or expired token." });
  }
};

const hashVerificationCode = (code: string): string => {
  return createHash("sha256").update(code).digest("hex");
};

const getOrCreateCpuProblem = (userKey: string): CpuProblem => {
  const existing = cpuSessions.get(userKey);
  if (existing) return existing;
  const created = generateCpuProblem();
  cpuSessions.set(userKey, created);
  return created;
};

const getOrCreatePageProblem = (userKey: string): PageProblem => {
  const existing = pageSessions.get(userKey);
  if (existing) return existing;
  const created = generatePageProblem();
  pageSessions.set(userKey, created);
  return created;
};

app.post("/send-verify", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !emailValidate.test(email)) {
      return res
        .status(400)
        .json({ msg: "Please use a valid @westpoint.edu email address." });
    }

    const existingUser = (await User.findOne({ email })) as { password: string; _id: string } | null;
    if (existingUser) {
      return res.status(400).json({ msg: "Account already exists!" });
    }

    const existingPending = (await PendingVerification.findOne({ email })) as {
      email: string;
      passwordHash: string;
      codeHash: string;
      expiresAt: Date;
    } | null;

    if (existingPending && existingPending.expiresAt.getTime() > Date.now()) {
      return res
        .status(200)
        .json({ msg: "A valid code already exists. Check your email!" });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const passwordHash =
      password && password.trim().length > 0
        ? await bcrypt.hash(password, 10)
        : existingPending?.passwordHash;

    if (!passwordHash) {
      return res.status(400).json({ msg: "Password is required to register." });
    }
    const codeHash = hashVerificationCode(code);

    await PendingVerification.findOneAndUpdate(
      { email },
      { email, passwordHash, codeHash, expiresAt },
      { upsert: true, new: true }
    );

    await mailTransport.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "GraySim Verification Code",
      text: `Your GraySim verification code is ${code}. It expires in 5 minutes.`,
    });

    // Intentionally do not return the code to the client.
    return res.json({ msg: `Verification code sent to ${email}.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error in /send-verify" });
  }
});

app.post("/verify-code", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      return res.status(400).json({ msg: "Email and code are required." });
    }

    const pending = (await PendingVerification.findOne({ email })) as {
      email: string;
      passwordHash: string;
      codeHash: string;
      expiresAt: Date;
    } | null;
    if (!pending) {
      return res
        .status(400)
        .json({ msg: "No verification found. Please register again." });
    }

    if (Date.now() > pending.expiresAt.getTime()) {
      await PendingVerification.deleteOne({ email });
      return res.status(400).json({ msg: "Code has expired. Please request a new code." });
    }

    if (hashVerificationCode(code) !== pending.codeHash) {
      return res.status(400).json({ msg: "Invalid code." });
    }

    const user = new User({
      email,
      password: pending.passwordHash,
      acc_type: "cadet",
    });
    await user.save();

    await PendingVerification.deleteOne({ email });
    return res.json({ msg: "Account verified and created successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error in /verify-code" });
  }
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, acc_type } = req.body as {
      email?: string;
      password?: string;
      acc_type?: string;
    };

    if (!email || !password || !emailValidate.test(email)) {
      return res
        .status(400)
        .json({ msg: "Please use a valid @westpoint.edu email address." });
    }

    const existingUser = (await User.findOne({ email })) as { password: string; _id: string } | null;
    if (existingUser) {
      return res.status(400).json({ msg: "Account already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, acc_type: acc_type || "cadet" });
    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password || !emailValidate.test(email)) {
      return res.status(400).json({ msg: "Email not valid" });
    }

    const user = (await User.findOne({ email })) as { password: string; _id: string } | null;
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials!" });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.post("/test", async (req: Request, res: Response) => {
  try {
    const { rawString } = req.body as { rawString?: string };
    if (!rawString) {
      return res.status(400).json({ msg: "rawString is required" });
    }

    const existingString = await Test.findOne({ rawString });
    if (existingString) {
      return res.status(400).json({ msg: "String already saved!" });
    }

    await new Test({ rawString, timestamp: Date.now() }).save();
    return res.status(200).json({ msg: "Successfully saved!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/cpu_scheduling/get_problem", requireAuth, (req: Request, res: Response) => {
  try {
    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreateCpuProblem(userKey);
    const horizon = runCpuPolicy(problem, "FIFO").timeline.length;
    return res.json({ problem: { ...problem, horizon } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/cpu_scheduling/reset", requireAuth, (req: Request, res: Response) => {
  try {
    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = generateCpuProblem();
    cpuSessions.set(userKey, problem);
    const horizon = runCpuPolicy(problem, "FIFO").timeline.length;
    return res.json({ msg: "CPU scheduling problem reset.", problem: { ...problem, horizon } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/cpu_scheduling/get_policy", requireAuth, (req: Request, res: Response) => {
  try {
    const policy = parseCpuPolicy((req.body as { policyName?: string }).policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy. Use FIFO, SJF, STCF, RR, or MLFQ." });
    }

    return res.json({ msg: getCpuPolicyDescription(policy), policy });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/cpu_scheduling/get_solution", requireAuth, (req: Request, res: Response) => {
  try {
    const policy = parseCpuPolicy((req.body as { policyName?: string }).policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy." });
    }

    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreateCpuProblem(userKey);
    const result = runCpuPolicy(problem, policy);

    return res.json({
      msg: "Solution generated.",
      policy,
      solution: result,
      problem: { ...problem, horizon: result.timeline.length },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/cpu_scheduling/get_feedback", requireAuth, (req: Request, res: Response) => {
  try {
    const body = req.body as { policyName?: string; studentAnswer?: string[][] };
    const policy = parseCpuPolicy(body.policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy." });
    }

    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreateCpuProblem(userKey);
    const feedback = evaluateCpuAnswer(problem, policy, body.studentAnswer || []);

    return res.json({ msg: feedback.feedback, ...feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/page_replacement/get_problem", requireAuth, (req: Request, res: Response) => {
  try {
    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreatePageProblem(userKey);
    return res.json({ problem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/page_replacement/reset", requireAuth, (req: Request, res: Response) => {
  try {
    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = generatePageProblem();
    pageSessions.set(userKey, problem);
    return res.json({ msg: "Page replacement problem reset.", problem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/page_replacement/get_policy", requireAuth, (req: Request, res: Response) => {
  try {
    const policy = parsePagePolicy((req.body as { policyName?: string }).policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy. Use FIFO, LRU, OPT, or CLOCK." });
    }

    return res.json({ msg: getPagePolicyDescription(policy), policy });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/page_replacement/get_solution", requireAuth, (req: Request, res: Response) => {
  try {
    const policy = parsePagePolicy((req.body as { policyName?: string }).policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy." });
    }

    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreatePageProblem(userKey);
    const result = runPagePolicy(problem, policy);

    return res.json({
      msg: "Solution generated.",
      policy,
      solution: result,
      problem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

app.post("/page_replacement/get_feedback", requireAuth, (req: Request, res: Response) => {
  try {
    const body = req.body as { policyName?: string; studentAnswer?: string[][] };
    const policy = parsePagePolicy(body.policyName);
    if (!policy) {
      return res.status(400).json({ msg: "Unknown policy." });
    }

    const userKey = getAuthedUserKey(req);
    if (!userKey) return res.status(401).json({ msg: "Unauthorized user token." });
    const problem = getOrCreatePageProblem(userKey);
    const feedback = evaluatePageAnswer(problem, policy, body.studentAnswer || []);

    return res.json({ msg: feedback.feedback, ...feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
