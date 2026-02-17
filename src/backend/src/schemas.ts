import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  acc_type: { type: String, default: "cadet", required: true },
});

const saveSchema = new mongoose.Schema({
  simulation: { type: String, required: true },
  rawAnswer: { type: String, required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemID: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  feedback: { type: String, default: "None", required: true },
  isCorrect: { type: Boolean, required: true },
});

const problemSchema = new mongoose.Schema({
  simulation: { type: String, required: true },
  answer: { type: String, required: true },
});

const testSchema = new mongoose.Schema({
  rawString: { type: String, required: true, unique: true },
  timestamp: { type: Date, required: true },
});

const pendingVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
});

pendingVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model("User", userSchema);
export const Save = mongoose.model("Save", saveSchema);
export const Problem = mongoose.model("Problem", problemSchema);
export const Test = mongoose.model("Test", testSchema);
export const PendingVerification = mongoose.model(
  "PendingVerification",
  pendingVerificationSchema
);
