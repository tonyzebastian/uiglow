"use client"

import { useState } from 'react'; 
import { motion } from "motion/react";
import Commit from './Commits';
import Analytics from './Analyticss';
import Upgrade from './Upgrades';


export default function Toolbar() {
    
    const [selectedMenu, setSelectedMenu] = useState('Commit');

    return (
        <div className="flex justify-center items-center">

            <motion.div className='absolute bottom-100 inline-flex flex-col gap-8 justify-center items-center'>

                <motion.div className='flex flex-grow justify-between items-center fill-slate-100 dark:fill-slate-950  border dark:border-slate-700  border-slate-200 rounded-xl shadow-lg'
                    key={selectedMenu}
                    layout
                    transition={{ duration: 0.3 }}
                >
                    {selectedMenu === 'Commit' && <Commit />}
                    {selectedMenu === 'Analytics' && <Analytics />}
                    {selectedMenu === 'Upgrade' && <Upgrade />}
                </motion.div>

                <div className='flex flex-row gap-6 '>
                    <h1
                        className={`cursor-pointer px-2 py-1 rounded ${selectedMenu === 'Commit' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                        onClick={() => setSelectedMenu('Commit')}
                        >
                        Commit
                    </h1>

                    <h1
                        className={`cursor-pointer px-2 py-1 rounded ${selectedMenu === 'Analytics' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                        onClick={() => setSelectedMenu('Analytics')}
                        >
                        Analytics
                    </h1>

                    <h1
                        className={`cursor-pointer px-2 py-1 rounded ${selectedMenu === 'Upgrade' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                        onClick={() => setSelectedMenu('Upgrade')}
                        >
                        Upgrade
                    </h1>

                </div>
                
            </motion.div>
        </div>
    );
}