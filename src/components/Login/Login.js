import React, { useState, useEffect } from "react";
import "./Login.css";
import Footer from "../Footer/Footer";
import Endpoints from "../endpoints";
import telspielLogo from "../../images/logo-icon.png";
// import loginImage from "../../images/login-image.png"; 
import leftSideImage from "../../images/product-login.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom"; 

function Login({ onLogin }) {
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiryTime, setOtpExpiryTime] = useState(0);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  // const handleOtpChange = (e) => {
  //   const value = e.target.value.replace(/\D/g, "");
  //   setOtp(value.slice(0, 4)); // Limit to 4 characters
  // };
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const trimmedValue = value.slice(0, 4);
    setOtp(trimmedValue);
  
    if (trimmedValue.length === 4) {
      e.target.blur();
    }
  };

  // const [failedAttempts, setFailedAttempts] = useState([]);
  // const [isLocked, setIsLocked] = useState(false);
  // const [lockTimer, setLockTimer] = useState(0);

  // const handleFailedAttempt = () => {
  //   const now = Date.now();
  //   const updatedAttempts = [...failedAttempts, now].filter(
  //     (time) => now - time <= 60 * 1000 // keep only last 1 min
  //   );
  
  //   setFailedAttempts(updatedAttempts);
  
  //   if (updatedAttempts.length >= 5) {
  //     // Lock for 2 minutes
  //     const unlockTime = Date.now() + 120 * 1000; 
  //     setIsLocked(true);
  //     setLockTimer(120);
  
  //     // Save lock info in localStorage
  //     localStorage.setItem("lockUntil", unlockTime);
  //   }
  // };

  // On component mount → restore lock state if exists
//  useEffect(() => {
//   const storedLockUntil = localStorage.getItem("lockUntil");
//   if (storedLockUntil) {
//     const remaining = Math.floor((storedLockUntil - Date.now()) / 1000);
//     if (remaining > 0) {
//       setIsLocked(true);
//       setLockTimer(remaining);
//     } else {
//       localStorage.removeItem("lockUntil");
//     }
//   }
//  }, []);

//  useEffect(() => {
//   let timer;
//   if (isLocked && lockTimer > 0) {
//     timer = setInterval(() => {
//       setLockTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           setIsLocked(false);
//           setFailedAttempts([]);
//           localStorage.removeItem("lockUntil");
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   }
//   return () => clearInterval(timer);
//  }, [isLocked, lockTimer]);
  
  

  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();

    // if (isLocked) return; 

    setIsLoading(true);

    const payload = {
      username: credentials.username,
      password: credentials.password,
    };

    try {
      const response = await fetch(Endpoints.get("login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const validatedResponse = Endpoints.validateResponse(data);

      if (validatedResponse && validatedResponse.code === 1000) {
        // ✅ Successful login → reset failures
      // setFailedAttempts([]);
        setOtp("");
        if (validatedResponse.otpRequired) {
          setIsOtpRequired(true);
          setOtpExpiryTime(validatedResponse.otpExpiryTime);
        } else {
          const userData = {
            username: validatedResponse.data.username,
            lastLoginTime: validatedResponse.data.lastLoginTime,
            lastLoginIp: validatedResponse.data.lastLoginIp,
            authJwtToken: validatedResponse.authJwtToken,
            isVisualizeAllowed: validatedResponse.data.isVisualizeAllowed,
            userId: validatedResponse.data.userId,
            dlrType: validatedResponse.data.dlrType,
            userPrivileges: validatedResponse.data.userPrivileges,
          };
          onLogin(userData);
          navigate("/dashboard");
        }
      } else {
        // ❌ Invalid credentials
        // handleFailedAttempt();
      }
    } catch (error) {
      console.error("Error during login:", error);
      // handleFailedAttempt();
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false); // Hide the spinner after API response
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: credentials.username,
      password: credentials.password,
      userOtp: otp,
    };

    try {
      const response = await fetch(Endpoints.get("verifyOtp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const validatedResponse = Endpoints.validateResponse(data);

      if (validatedResponse && validatedResponse.code === 1000) {
        console.log("Login response:", validatedResponse); 
        const userData = {
          username: validatedResponse.data.username,
          lastLoginTime: validatedResponse.data.lastLoginTime,
          lastLoginIp: validatedResponse.data.lastLoginIp,
          authJwtToken: validatedResponse.authJwtToken, 
          isVisualizeAllowed: validatedResponse.data.isVisualizeAllowed,
          userId: validatedResponse.data.userId,
          dlrType: validatedResponse.data.dlrType,
          userPrivileges: validatedResponse.data.userPrivileges,
        };
        onLogin(userData);
        navigate("/dashboard");
      } else {
        // alert("Invalid OTP. Please try again.");
        setOtp("");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
    {/* <div className="login-container">
      {!isOtpRequired ? (
        <div className="login-box">
           <img
            src={telspielLogo}
            alt="TelSpiel Logo"
            className="login-logo"
          />
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className="otp-box">
          <h1 className="otp-title">Enter OTP</h1>
          <p>Please enter the OTP you have received on your registered number. The OTP will expire in {otpExpiryTime} seconds.</p>
          <form onSubmit={handleOtpSubmit}>
          <div className="otp-form-group">
            <input
              type="text"
              id="otp"
              placeholder="____"
              value={otp}
              onChange={handleOtpChange}
              maxLength="4" 
              required
              pattern="\d*" 
              inputMode="numeric"
            />
          </div>
            <button type="submit" className="otp-button">
              Verify OTP
            </button>
          </form>
        </div>
      )}
    </div> */}
    <div className="login-page-wrapper">
    <div className="background-icons">
    {[...Array(12)].map((_, i) => (
      <img
        key={i}
        src={telspielLogo}
        alt="Logo"
        className="floating-logo"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${20 + Math.random() * 40}px`,
          animationDuration: `${15 + Math.random() * 10}s`, // updated speed
          animationDelay: `${Math.random() * 10}s`
        }}
      />
    ))}
  </div>

    <div className="login-container">
      {/* <div className="left-section"> */}
        <p className="headline-text">
          Delivering smart automated cPass solutions to Fortune 500, mid-size and startup companies
        </p>
        <div className="services">
          {/* <a href="https://habitic.io/login" className="service-box" target="_blank" rel="noopener noreferrer">Sms Solutions</a> */}
          <a href="https://tellix.io/login" className="service-box" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://web.rcssms.in/login" className="service-box" target="_blank" rel="noopener noreferrer">Rich Communication Services</a>
          <a href="https://app.habitic.in/login" className="service-box" target="_blank" rel="noopener noreferrer">Voice Solutions</a>
        </div>

      {/* {isLocked && (
        <p style={{ color: "red" }}>
          Too many failed attempts. Try again in {lockTimer}s.
        </p>
      )} */}

      {/* <div className="right-section"> */}
        <div className="login-box">
          {/* <h2>Login</h2> */}
          <img src={telspielLogo} alt="TelSpiel Logo" className="login-logo" />
          {!isOtpRequired ? (
            <form onSubmit={handleLogin} autoComplete="off" className="login-form">
              {isLoading && (
                  <FontAwesomeIcon icon={faSpinner} spin className="icon-container" />
              )}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="username-wrapper">
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  // disabled={isLocked}
                />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    // disabled={isLocked}
                  />
                  <span className="eye-icon" onClick={togglePasswordVisibility}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
              </div>
              <button 
                type="submit" 
                className="login-button"
                // disabled={isLocked}
              >
                Login
              </button>
            </form>
          ) : (
            <div className="otp-box">
            <h1 className="otp-title">Enter OTP</h1>
            <p>Please enter the OTP you have received on your registered number. The OTP will expire in {otpExpiryTime} minutes.</p>
            <form onSubmit={handleOtpSubmit}>
            <div className="otp-form-group">
              <input
                type="text"
                id="otp"
                placeholder="____"
                value={otp}
                onChange={handleOtpChange}
                maxLength="4" 
                required
                pattern="\d*" 
                inputMode="numeric"
              />
            </div>
              <button type="submit" className="otp-button">
                Verify OTP
              </button>
              <p className="no-otp-text" onClick={handleLogin}>Not Received Yet ? Resend OTP</p>
            </form>
          </div>
          )}
        </div>
      {/* </div> */}
    </div>
    </div>

    <Footer/>
    </>
  );
}

export default Login;
