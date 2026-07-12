import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormContainer from '../components/layout/FormContainer';
import Logo from '../components/layout/Logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import LoadingButton from '../components/common/LoadingButton';
import Alert, { AlertTitle, AlertDescription } from '../components/common/Alert';
import { 
  validateRequired, 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch 
} from '../utils/validation';

/**
 * Signup Page.
 * Validates fields (empty, format, match) and alerts new registrants that accounts default to the Employee role.
 */
const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success'|'danger', message: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setAlertFeedback(null);

    const validationErrors = {};

    // Validate inputs
    const fullNameErr = validateRequired(formData.fullName, 'Full Name');
    if (fullNameErr) validationErrors.fullName = fullNameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) validationErrors.email = emailErr;

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) validationErrors.password = passwordErr;

    const confirmErr = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (confirmErr) validationErrors.confirmPassword = confirmErr;

    // Check if any error exists
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlertFeedback({
        type: 'danger',
        message: 'Please resolve the field errors below before creating your account.'
      });
      return;
    }

    // Simulate account registration
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAlertFeedback({
        type: 'success',
        message: 'Account registered successfully! Redirecting you to login...'
      });
      
      // Auto redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  return (
    <AuthLayout>
      <FormContainer>
        {/* Mobile branding */}
        <div className="flex lg:hidden justify-center mb-2">
          <Logo size="lg" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
            <CardDescription>
              Register your workspace profile on the AssetFlow network.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col gap-5">
            {/* Global Alert Notification */}
            {alertFeedback && (
              <Alert variant={alertFeedback.type}>
                <AlertTitle>{alertFeedback.type === 'success' ? 'Success' : 'Validation Error'}</AlertTitle>
                <AlertDescription>{alertFeedback.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="fullName"
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

              <Input
                id="email"
                name="email"
                label="Email Address"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

              {/* Information Card - Role Assignment */}
              <div className="flex gap-2.5 p-3 rounded-lg border border-blue-100 bg-blue-50/50 text-slate-700 mt-2 select-none">
                <Info className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-text-secondary">
                  <span className="font-semibold text-text-primary">Important Notice:</span> Every new account is registered as an <span className="font-medium text-primary">Employee</span>. Administrative roles are assigned only by the System Administrator.
                </div>
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                className="w-full mt-3"
              >
                Create Account
              </LoadingButton>

              <div className="text-center mt-2">
                <span className="text-xs text-text-secondary">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-primary hover:underline hover:text-primary-hover focus:outline-none"
                  >
                    Login
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormContainer>
    </AuthLayout>
  );
};

export default Signup;
