import { useState } from 'react';
import Sentiment from '../components/sentiment';
import StockReels from '../components/stockReels';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { IconPlayerPlay, IconDeviceMobile, IconSearch, IconStar, IconStarFilled, IconHome, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';

function Stocks() {
  const [open, setOpen] = useState(false);
  
  const links = [
    {
      label: "Reels",
      href: "/stocks",
      icon: <IconDeviceMobile className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Search",
      href: "/searchStock",
      icon: <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Favorites",
      href: "/favorites",
      icon: <IconStar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
  ];

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-gray-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
              <img
                src="/logoScout.png"
                className="h-7 w-7 flex-shrink-0 rounded-full"
                alt="Avatar"
              />
              <span style={{ fontFamily: "'SF Mono', Monaco, monospace", fontSize: '1.5em'}} className="font-black dark:text-[#9167fb]">Scout</span>
            </div>
            
            {/* Links */}
            <div className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-0">
        <div className="rounded-tl-2xl dark:border-neutral-700 bg-white dark:bg-neutral-900 h-full overflow-auto">
          <StockReels/>
        </div>
      </div>
    </div>
  );
}

export default Stocks;