import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
}

export interface ReCaptchaRef {
  reset: () => void;
  execute: () => void;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal'
}, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      recaptchaRef.current?.reset();
    },
    execute: () => {
      recaptchaRef.current?.execute();
    }
  }));

  if (!siteKey) {
    console.warn('reCAPTCHA site key not configured');
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ CAPTCHA not configured. Please add VITE_RECAPTCHA_SITE_KEY to environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onVerify}
        onExpired={onExpire}
        onError={onError}
        theme={theme}
        size={size}
      />
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;