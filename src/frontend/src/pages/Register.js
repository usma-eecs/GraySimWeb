import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerify } from '../api/auth'; // new function we'll define


const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send email & password to the server to generate + email the code
      const res = await sendVerify({ email, password });
      // Redirect user to the verify page, pass them the email via route state
      navigate('/verify', { state: { email, devCode: res.data.devCode } });
    } catch (err) {
      setErrorMessage('Registration failed: ' + (err));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Register</h3>
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Register
                </button>
              </form>
            </div>
          </div>
          {errorMessage && <p className="error-message mt-3">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Register;

