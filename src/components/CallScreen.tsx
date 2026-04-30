import React from 'react';
import { CallSession } from '../types';

interface Props {
  call: CallSession;
  isCaller: boolean;
  onEndCall: () => void;
}

export const CallScreen: React.FC<Props> = ({ onEndCall }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={onEndCall}
        className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black"
      >
        إنهاء المكالمة
      </button>
    </div>
  );
};

export default CallScreen;
