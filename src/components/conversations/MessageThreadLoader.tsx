
import React from 'react';

const MessageThreadLoader = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary mx-auto mb-4"></div>
        <p className="text-quikle-neutral">Loading conversation...</p>
      </div>
    </div>
  );
};

export default MessageThreadLoader;
