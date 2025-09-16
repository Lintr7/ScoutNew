import CyanSpotlight from "../cyanBlob"
import React, { useEffect } from 'react'

function Loader() {
    useEffect(() => {
            const img = new Image();
            img.src = "./logoScout.png";
        }, []);

    return(


        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-zinc-950">

            <img 
                style={{
                    width: '10em', 
                    marginTop: '-10em', 
                    filter: 'drop-shadow(0 0 0px #9D4EDD)'
                }}
                src="./logoScout.png"
            />
            <div style={{position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8em' }} className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    );
}

export default Loader