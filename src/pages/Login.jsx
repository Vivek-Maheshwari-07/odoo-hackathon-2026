import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import FormContainer from '../components/layout/FormContainer';
import Logo from '../components/layout/Logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import LoadingButton from '../components/common/LoadingButton';
import Alert, { AlertTitle, AlertDescription } from '../components/common/Alert';
import { validateEmail, validatePassword } from '../utils/validation';
import { apiFetch, setAuth } from '../utils/api';

/**
 * Login Page.
 * Authenticates user credentials, showcases visual warnings and success alerts with remember me storage.
 */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success'|'danger', message: string }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setAlertFeedback(null);

    const validationErrors = {};

    // Validate email
    const emailErr = validateEmail(email);
    if (emailErr) validationErrors.email = emailErr;

    // Validate password
    const passwordErr = validatePassword(password);
    if (passwordErr) validationErrors.password = passwordErr;

    // If validation fails
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlertFeedback({
        type: 'danger',
        message: 'Invalid credentials or malformed inputs. Please review highlighted fields.'
      });
      return;
    }

    setIsLoading(true);
    apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
      .then((data) => {
        setIsLoading(false);
        setAuth(data.token, data.user);
        setAlertFeedback({
          type: 'success',
          message: 'Authentication successful! Welcome to AssetFlow ERP portal.'
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      })
      .catch((error) => {
        setIsLoading(false);
        setAlertFeedback({
          type: 'danger',
          message: error.message || 'Authentication failed. Please check your credentials.'
        });
      });
  };

  return (
    <AuthLayout>
      <FormContainer>
        {/* Mobile branding: shown only on small viewports */}
        <div className="flex lg:hidden justify-center mb-2 animate-fade-in">
          <Logo size="lg" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage enterprise assets and resource pipelines.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col gap-5">
            {/* Success and Error Alert UIs */}
            {alertFeedback && (
              <Alert variant={alertFeedback.type}>
                <AlertTitle>
                  {alertFeedback.type === 'success' ? 'Authorized' : 'Authentication Error'}
                </AlertTitle>
                <AlertDescription>{alertFeedback.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email Address"
                placeholder="name@company.com"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="password" 
                    className="text-xs font-semibold text-text-primary flex items-center gap-0.5"
                  >
                    Password
                    <span className="text-danger">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover focus:outline-none"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  error={errors.password}
                  required
                />
              </div>

              <div className="flex items-center justify-between mt-1 select-none">
                <label className="relative flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none cursor-pointer"
                  />
                  <span className="text-xs font-medium text-text-secondary">
                    Remember my terminal
                  </span>
                </label>
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                className="w-full mt-3"
              >
                Sign In
              </LoadingButton>

              <div className="text-center mt-2">
                <span className="text-xs text-text-secondary">
                  New to AssetFlow?{' '}
                  <Link
                    to="/signup"
                    className="font-bold text-primary hover:underline hover:text-primary-hover focus:outline-none"
                  >
                    Request Account
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

export default Login;
export { Login };
