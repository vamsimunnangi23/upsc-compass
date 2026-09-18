"use client";

import { useState } from "react";

export default function SignInButton() {
  const [showToast, setShowToast] = useState(false);

  function handleClick() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  return (
    <>
      <button className="sign-in-btn" onClick={handleClick}>
        Sign In
      </button>
      {showToast && (
        <div className="sign-in-toast">Accounts are coming soon.</div>
      )}
    </>
  );
}
