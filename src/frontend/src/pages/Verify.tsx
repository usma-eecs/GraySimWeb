import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendVerify, verifyCode } from "../api/auth";

type VerifyLocationState = {
  email?: string;
};

const Verify = (): JSX.Element => {
  const { state } = useLocation();
  const locationState = (state || {}) as VerifyLocationState;
  const navigate = useNavigate();
  const email = locationState.email;

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!email) navigate("/register");

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleVerify = async (): Promise<void> => {
    if (!email) return;
    try {
      const res = await verifyCode({ email, code });
      setMessage(res.data.msg || "Account verified!");
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      setError(String(err) || "Verification failed");
      setMessage("");
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!canResend || !email) return;
    try {
      const res = await sendVerify({ email });
      setMessage(res.data.msg || "A new code was sent to your email.");
      setError("");
      setTimeLeft(300);
      setCanResend(false);
    } catch (err: unknown) {
      setError(String(err) || "Failed to resend code.");
      setMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-3">Verify Your Account</h3>
      <p>We sent a code to <strong>{email}</strong>. Enter it below.</p>

      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
        className="form-control my-3"
      />

      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-success" onClick={handleVerify}>
          Verify Code
        </button>

        {canResend && (
          <button className="btn btn-warning" onClick={handleResend}>
            Resend Code
          </button>
        )}
      </div>

      {!canResend && (
        <p className="text-muted mt-2">
          Resend available in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      )}

      {message && <p className="text-success mt-4">{message}</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default Verify;
