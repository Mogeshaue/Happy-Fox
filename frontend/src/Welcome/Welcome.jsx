import React, { useRef } from 'react';
import GoogleOauth from '../GoogleAuth/GoogleOauth';

const Welcome = () => {
  const googleOauthRef = useRef();
  const [authError, setAuthError] = React.useState(null);
  const [authSuccess, setAuthSuccess] = React.useState(null);

  const handleGoogleSignIn = () => {
    if (googleOauthRef.current && googleOauthRef.current.handleGoogleLogin) {
      googleOauthRef.current.handleGoogleLogin();
    }
  };

  const handleLoginSuccess = (data) => {
    setAuthSuccess('Login successful!');
    setAuthError(null);
    // You can add navigation or state update here
  };

  const handleLoginError = (error) => {
    setAuthError(error);
    setAuthSuccess(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-5xl w-full flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* Left content */}
        <div className="text-center lg:text-left space-y-6">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Learn. Grow. Succeed.
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to <span className="text-indigo-600 font-semibold">LearnFlow</span> — your personalized platform to master new skills, track progress, and achieve your learning goals at your own pace.
          </p>

          {/* Google Signup Button */}
          <div className="flex flex-col items-center lg:items-start gap-2">
           <GoogleOauth/>
            {/* Show error or success */}
            {authError && <div className="text-red-500 text-sm mt-2">{authError}</div>}
            {authSuccess && <div className="text-green-600 text-sm mt-2">{authSuccess}</div>}
            {/* Hidden GoogleOauth component for logic */}
            <div style={{ display: 'none' }}>
              <GoogleOauth
                ref={googleOauthRef}
                onLoginSuccess={handleLoginSuccess}
                onLoginError={handleLoginError}
              />
            </div>
          </div>
        </div>

        {/* Right side illustration */}
        <div className="w-full max-w-md">
          {/* <img
            src="https://cdn-icons-png.flaticon.com/512/3011/3011270.png"
            alt="Learning illustration"
            className="w-full h-auto"
          /> */}
           <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
            alt="Chat illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
  