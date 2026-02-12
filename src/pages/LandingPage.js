import React from 'react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="container">
        <h1>Welcome to WalkFit</h1>
        <p>Your Walking Companion</p>
        <a href="/login" className="btn btn-primary">Get Started</a>
      </div>
    </div>
  );
}
