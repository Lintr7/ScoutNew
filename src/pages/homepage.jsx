import '../css sheets/global2.css';
import { Link } from 'react-router-dom';
import CyanSpotlight from '../components/cyanBlob.jsx';
import React, { useState } from 'react';
import { Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton } from "../components/ui/navbar";
import { ContainerScroll } from '../components/ui/device.jsx';
import LogoCarousel2 from '../components/carousel.jsx';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  // Navigation items
  const navItems = [
    { name: 'Home', link: '#home' },
    { name: 'Features', link: '#features' },
    { name: 'Contact', link: '#contact' }
  ];

  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileItemClick = () => {
    setIsMobileMenuOpen(false); 
  };

  return (
    <div className='wrapper'>
      <div style={{position: 'fixed', top: '1.3em', width:'100%', zIndex: '1000'}}>
        <Navbar className="block"> 
          <NavBody visible={true} className="!hidden min-[900px]:!flex"> 
            <NavbarLogo />
            <NavItems
              items={navItems}
              onItemClick={() => {}}
              className="flex" />
            <div className="flex items-center space-x-2">
              <NavbarButton variant="secondary" onClick={() => navigate('/login')}>
                Login
              </NavbarButton>
              <NavbarButton variant="primary" onClick={() => navigate('/signup')}>
                Get Started
              </NavbarButton>
            </div>
          </NavBody>

          <MobileNav className="!block min-[900px]:!hidden">
         <MobileNavHeader>
           <NavbarLogo />
           <div className="flex items-center space-x-2">
             <NavbarButton variant="secondary" className="text-xs px-2 py-1" onClick={() => navigate('/login')}>
               Login
             </NavbarButton>
             <NavbarButton variant="primary" className="text-xs px-2 py-1" onClick={() => navigate('/signup')}>
               Get Started
             </NavbarButton>
             <MobileNavToggle
               isOpen={isMobileMenuOpen}
               onClick={handleMobileToggle}
             />
           </div>
         </MobileNavHeader>


         <MobileNavMenu
           isOpen={isMobileMenuOpen}
           onClose={() => setIsMobileMenuOpen(false)}>
           {navItems.map((item, idx) => (
             <a
               key={idx}
               href={item.link}
               onClick={handleMobileItemClick}
               className="w-full text-left font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors py-2"
             >
               {item.name}
             </a>
           ))}
         </MobileNavMenu>
       </MobileNav>          
      </Navbar>
      </div>

        <div style={{marginTop: '-16em', marginLeft:'-68em'}}>
          <CyanSpotlight style={{position: 'absolute'}}/>
        </div>
        
        <div style={{position: 'absolute', zIndex: '4', marginTop:'11em'}} className="p-4 max-w-7xl mx-auto absolute z-10 w-full pt-20 md:pt-0">
          <h1 className="fadeUpText text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300 bg-opacity-50">
            Swipe Into <br/> Your Portfolio
          </h1>
          <p style={{ fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace", fontWeight: 'bold', fontSize: '1.1rem', opacity: '0.6'}} className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            A new way to view stocks
          </p>
        </div>
        <div style={{position: 'absolute', marginTop: '35em', width: '50%'}}>
          <LogoCarousel2/>
        </div>
        
        <div style={{position: 'absolute', marginTop: '30em'}} className="flex flex-col overflow-hidden">
          <div>
            <ContainerScroll
            >
              <img
                alt="Not finished implementing yet"
                height={720}
                width={1400}
                className="mx-auto rounded-2xl object-cover h-full object-left-top"
                draggable={false}
              />
            </ContainerScroll>
          </div>
        </div>
        
        <div style={{ position: 'absolute', marginTop: '27em'}}>
          <button onClick={() => navigate('/signup')} className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer font-bold items-center justify-center rounded-full bg-slate-950 px-5 py-4 text-sm text-white backdrop-blur-3xl">
              Get Started
            </span>
          </button>
        </div>  
    </div>
  );
}

export default Homepage;