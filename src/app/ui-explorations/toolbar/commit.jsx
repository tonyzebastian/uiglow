import { useState } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { IoGitCommitOutline } from "react-icons/io5";


export default function Commit() { 

    const [isSelected, setIsSelected] = useState(false);
    const toggleSelect = () => setIsSelected(!isSelected);

    return (
        <motion.div
        className='inline-flex flex-row items-center gap-6 cursor-pointer px-3 py-3'
        onClick={toggleSelect}
        >
            <div className='flex flex-row gap-2'>
                <IoGitCommitOutline 
                size={24}
                color='#ef4444'
                />

                <h1 className='font-light text-slate-500'>2e813de</h1>
            </div>

            <AnimatePresence>
            {isSelected && (
                <motion.div
                initial={{ opacity: 0, maxWidth: 0 }}
                animate={{ opacity: 1, maxWidth: '200px' }} // Adjust maxWidth as needed
                exit={{ opacity: 0, maxWidth: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
                <h1 className='text-slate-950 dark:text-slate-200'>Failed to Compile</h1>
            </motion.div>
            )}
            </AnimatePresence>


            <div className={`px-2 rounded-lg ${isSelected ? 'bg-blue-500' : 'bg-red-400'}`}>
                <h1 className='text-slate-100'>{isSelected ? 'Redeploy' : 'Failed'}</h1>
            </div>

        </motion.div>
    )
}
