"use client"

import  { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPlay } from "react-icons/fa";
import './music.css';


export default function MusicPlay() {

    const [isSelected, setIsSelected] = useState(false);
    const toggleSelect = () => setIsSelected(!isSelected);
    const circleVariants = {
        inactive: { x: 0 }, 
        active: { x: 274 } 
      };

    return (
        <motion.div
            className={`inline-flex ${isSelected ? 'flex-col' : 'flex-row'} flex-wrap p-4 gap-3 shadow-md shadow-slate-100 border border-slate-200 rounded-2xl cursor-pointer w-full min-w-80 max-w-80 music`}
            onClick={toggleSelect}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
        >
            <motion.div
                animate={{ width: isSelected ? 'auto' : 64 }} 
                transition={{ duration: 0.2 }}
            >
                <Image 
                    src="/music_cover.jpg" 
                    alt="Music Note" 
                    width={64} 
                    height={64} 
                    className="rounded-lg musicimage"
                />
            </motion.div>

            {isSelected && (
                <div className='parent mt-2 mb-2'>
                    <div className='line'> </div>
                    <motion.div 
                        className="circle"
                        variants={circleVariants}
                        animate={isSelected ? 'active' : 'inactive'}
                        transition={{ duration: 40 }}
                        > 
                     </motion.div>
                </div>
             )}

            <div className='flex flex-row items-center justify-between mx-1 mb-2 flex-grow'>

                <div>
                    <h1 className={`text-lg font-sans font-semibold leading-relaxed`}>
                        Espresso
                    </h1>

                    <h2 className={`text-xs font-sans font-light text-slate-500`}>
                        Sabrina Carpenter
                    </h2>
                </div>

                <div className='inline-flex flex-row items-center gap-2 bg-slate-900 px-3 py-2 min-h-10 min-w-8 rounded-full mt-1'>
                    <FaPlay className='fill-slate-50'/>
                    <h2 className='text-slate-200 text-base font-sans font-light play'>Play</h2>
                </div>

            </div>

        </motion.div>
    );
}
