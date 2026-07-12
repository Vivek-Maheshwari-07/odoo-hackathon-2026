import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormContainer from '../components/layout/FormContainer';
import Logo from '../components/layout/Logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingButton from '../components/common/LoadingButton';
import { validateEmail } from '../utils/validation';

/**
 * ForgotPassword Page.
 * Authenticates email, validates requirements, and shows success feedback.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');

    // Field validation
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    // Process submission simulation
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <AuthLayout>
      <FormContainer>
        {/* Mobile branding */}
        <div className="flex lg:hidden justify-center mb-2">
          <Logo size="lg" />
        </div>

        {isSuccess ? (
          /* Premium Success State Page */
          <Card className="animate-fade-in">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-success mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Reset Link Sent</CardTitle>
              <CardDescription className="text-sm">
                We've sent a recovery link to the email address below:
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 text-center">
              <div className="bg-slate-50 border border-border px-4 py-3 rounded-lg text-sm font-medium text-text-primary select-all break-all">
                {email}
              </div>
              <p className="text-xs text-text-secondary">
                Please check your inbox (and spam folder) for instruction emails to change your password.
              </p>
              
              <Link 
                to="/login"
                className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm focus-ring transition-colors"
              >
                Return to Login
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Form Input Card */
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your administrative email to receive a secure recovery link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  id="email-forgot"
                  label="Email Address"
                  type="text"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  error={emailError}
                  required
                />

                <LoadingButton
                  type="submit"
                  isLoading={isLoading}
                  className="w-full mt-2"
                >
                  Send Reset Link
                </LoadingButton>

                <div className="text-center mt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline hover:text-primary-hover focus:outline-none"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </FormContainer>
    </AuthLayout>
  );
};

export default ForgotPassword;
