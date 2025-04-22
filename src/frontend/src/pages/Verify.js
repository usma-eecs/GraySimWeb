import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    // If someone navigates to /verify with no email in state, go back
    if (!email) navigate('/register');

    // Countdown timer for 5 minutes
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

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://localhost:5000/verify-code', { email, code });
      setMessage(res.data.msg || 'Account verified!');
      setError('');
      // After success, redirect to login in 2s
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Verification failed');
      setMessage('');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const res = await axios.post('http://localhost:5000/send-verify', { email });
      setMessage(res.data.msg || 'A new code was sent to your email.');
      setError('');
      setTimeLeft(300);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to resend code.');
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-3">Verify Your Account</h3>
      <p>We’ve sent a code to <strong>{email}</strong>. Enter it below.</p>
      {state?.devCode && (
        <div className="alert alert-warning">
          <strong>Development Only (Use this code):</strong> <code>{state.devCode}</code>
        </div>
      )}
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
          ⏳ Resend available in {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </p>
      )}
  
      {message && <p className="text-success mt-4">{message}</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default Verify;
