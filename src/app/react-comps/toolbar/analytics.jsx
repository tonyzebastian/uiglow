import { useState } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { TbBrandGoogleAnalytics } from "react-icons/tb";


export default function Analytics() {

    const [isSelected, setIsSelected] = useState(false);
    const toggleSelect = () => setIsSelected(!isSelected);

    return (
        <motion.div
        className='inline-flex flex-col justify-center items-center gap-4 cursor-pointer px-3 py-3'
        onClick={toggleSelect}
        >
            <AnimatePresence>
                {isSelected && (
                    <motion.div className='inline-flex flex-col gap-2 mx-2 mt-2 mb-1'
                    initial={{ opacity: 0, maxHeight: 0, maxWidth: 0 }}
                    animate={{ opacity: 1, maxHeight: '300px', maxWidth: '400px' }} // Adjust maxWidth as needed
                    exit={{ opacity: 0, maxHeight: 0, maxWidth: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                    >

                        <div className='inline-flex flex-row gap-32'>

                            <div className='flex flex-row gap-2 justify-center items-center mb-1'>
                                <h1 className='text-slate-900 text-base font-medium'>Traffic</h1>
                                <h1 className='text-slate-500 text-sm'>Last 3 days</h1>
                            </div>
                            <h1 className='text-blue-500 text-base'>See all</h1>

                        </div>

                        <div className='flex flex-row flex-grow justify-between'>
                            <h1 className='text-slate-500 text-sm'>/projects</h1>
                            <h1 className='text-slate-500 text-sm'>2543 visits</h1>
                        </div>

                        <div className='flex flex-row flex-grow justify-between'>
                            <h1 className='text-slate-500 text-sm'>/groups</h1>
                            <h1 className='text-slate-500 text-sm'>432 visits</h1>
                        </div>

                        <div className='flex flex-row flex-grow justify-between'>
                            <h1 className='text-slate-500 text-sm'>/orders</h1>
                            <h1 className='text-slate-500 text-sm'>2432 visits</h1>
                        </div>

                        <div className='flex flex-row flex-grow justify-between'>
                            <h1 className='text-slate-500 text-sm'>/templates</h1>
                            <h1 className='text-slate-500 text-sm'>1023 visits</h1>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`flex flex-row gap-4 justify-between  ${isSelected ? 'w-full' : ''}`}
            style={{ transition: 'w-full 0.3 ease-in-out' }}
            >
                <TbBrandGoogleAnalytics
                size={24}
                color='#3b82f6'
                />
                <h1 className='font-light text-slate-500'>32 Online Now</h1>

                <div className={`px-2 rounded-md ${isSelected ? 'bg-slate-900' : 'bg-blue-400'}`}>
                    <h1 className='text-slate-100'>{isSelected ? 'Close' : 'Analytics'}</h1>
                </div>

            </div>

        </motion.div>
    )
}
