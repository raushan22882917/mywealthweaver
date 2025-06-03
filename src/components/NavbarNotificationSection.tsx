
import React, { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

const NavbarNotificationSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NotificationDropdown 
      open={isOpen} 
      onClose={() => setIsOpen(false)} 
    />
  );
};

export default NavbarNotificationSection;
