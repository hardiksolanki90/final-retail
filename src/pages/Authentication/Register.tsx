import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  password_confirmation: string;
  mobile?: string;
  usertype: number;
  org_name?: string;
}

const initialFormData: RegisterFormData = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
  mobile: '',
  usertype: 1,
  org_name: ''
};

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch
  } = useForm<RegisterFormData>({
    defaultValues: initialFormData
  });
  
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const watchedUsertype = watch('usertype');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFormSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser(data);

      if (result.success) {
        // Reset form
        reset(initialFormData);
        
        // Redirect to organisation setup after brief delay
        setTimeout(() => {
          navigate('/organisation/add');
        }, 1000);
      } else {
        setError('root', { 
          message: result.message || 'Registration failed'
        });
        
        // Set field-specific validation errors if available
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof RegisterFormData, {
                message: messages[0]
              });
            }
          });
        }
      }
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'An unexpected error occurred. Please try again.'
      });
      
      // Set field-specific validation errors if available
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof RegisterFormData, {
              message: messages[0]
            });
          }
        });
      }
    }
  };

  const userTypeOptions = [
    { value: 1, label: 'Admin' },
    { value: 2, label: 'Salesman' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Join the retail management system. Fill out the form below to get started.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Registration Failed:</strong>
                <span className="block sm:inline"> {errors.root.message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register('firstname', {
                    required: 'First Name is required',
                    validate: value => value.trim() !== '' || 'First Name cannot be empty'
                  })}
                  id="firstname"
                  type="text"
                  autoComplete="given-name"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First name"
                />
                {errors.firstname && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstname.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register('lastname', {
                    required: 'Last Name is required',
                    validate: value => value.trim() !== '' || 'Last Name cannot be empty'
                  })}
                  id="lastname"
                  type="text"
                  autoComplete="family-name"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last name"
                />
                {errors.lastname && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastname.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email Address is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                {...register('mobile', {
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Mobile number must be exactly 10 digits'
                  }
                })}
                id="mobile"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your mobile number"
              />
              {errors.mobile && (
                <p className="text-red-600 text-xs mt-1">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="usertype" className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                {...register('usertype', {
                  required: 'User Type is required',
                  valueAsNumber: true
                })}
                id="usertype"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {userTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.usertype && (
                <p className="text-red-600 text-xs mt-1">{errors.usertype.message}</p>
              )}
            </div>

            {watchedUsertype === 1 && (
              <div>
                <label htmlFor="org_name" className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  {...register('org_name', {
                    required: watchedUsertype === 1 ? 'Organization Name is required' : false,
                    validate: value => {
                      if (watchedUsertype === 1 && (!value || value.trim() === '')) {
                        return 'Organization Name cannot be empty';
                      }
                      return true;
                    }
                  })}
                  id="org_name"
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                />
                {errors.org_name && (
                  <p className="text-red-600 text-xs mt-1">{errors.org_name.message}</p>
                )}
              </div>
            )}

            <hr className="border-gray-200" />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('password_confirmation', {
                  required: 'Password confirmation is required',
                  validate: (value) => {
                    const password = watch('password');
                    return value === password || 'Passwords do not match';
                  }
                })}
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
              {errors.password_confirmation && (
                <p className="text-red-600 text-xs mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;