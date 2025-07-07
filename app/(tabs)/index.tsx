// App.tsx
import React, { useState } from 'react';
import AttendanceKiosk from '../../components/AttendanceKiosk';
import { LoginScreen } from '../../components/AttendanceKiosk/otros/LoginScreen';

export default function App() {
  const [session, setSession] = useState<{ uid: number; pass: string } | null>(null);

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return <LoginScreen
      onLogin={(uid, isAdmin, pass) => {
        setSession({ uid, pass });
      }}
    />;
  }

  return <AttendanceKiosk uid={session.uid} pass={session.pass} onLogout={handleLogout} />;
}
