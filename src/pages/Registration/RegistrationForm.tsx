import { useState } from "react";
import { Palette } from "lucide-react";
import { Input } from "../../components/ui/Input";
// import PhoneInput from "react-phone-number-input";
// import "react-phone-number-input/style.css";
import "react-phone-input-2/lib/style.css";
import PhoneInput2 from "../../components/shared/PhoneInput2";

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "prefer-not-to-say",
  });

  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full grid grid-cols-2 min-h-[700px]">
        {/* Left Section - Branding */}
        <div className="bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700 p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

          {/* Logo */}
          <div className="z-10">
            <h1 className="text-white text-2xl font-bold tracking-wide">
              Logo.
            </h1>
          </div>

          {/* Main Heading */}
          <div className="z-10 text-center">
            <h2 className="text-white text-6xl font-bold leading-tight mb-8">
              Join!
              <br />
              Now.
            </h2>

            {/* Artist Illustration */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="text-center">
                  {/* Simple Artist Figure */}
                  <div className="w-24 h-24 bg-white rounded-full mb-4 mx-auto flex items-center justify-center">
                    <Palette className="w-12 h-12 text-primary-500" />
                  </div>
                  <div className="w-6 h-16 bg-white rounded-full mx-auto opacity-90"></div>
                  <div className="w-20 h-6 bg-white rounded-full mt-2 mx-auto opacity-80"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty space for better balance */}
          <div></div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-gray-50 p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Registration
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />

            {/* Username */}
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />

            {/* Email */}
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />

            {/* Phone Number */}
            <div className="w-full">
              <PhoneInput2
                value={phoneNumber}
                onChange={(phoneValue) => {
                  setPhoneNumber(phoneValue);
                  setFormData(prev => ({ ...prev, phone: phoneValue || '' }));
                }}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>

            {/* Password */}
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />

            {/* Confirm Password */}
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-4 mt-8 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Register
            </button>

            {/* Footer Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
