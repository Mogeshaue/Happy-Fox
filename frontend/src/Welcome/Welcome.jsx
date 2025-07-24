const Welcome = () => {
    const handleGoogleSignIn = () => {
      // Call your Google OAuth function here
      // Example: window.location.href = "/api/auth/google";
      console.log("Google Sign-In clicked");
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
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-2 border-transparent bg-white hover:scale-105 transition shadow-md"
                style={{
                  borderImage: "linear-gradient(to right, #6366f1, #a855f7, #ec4899) 1",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google icon"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>
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
  