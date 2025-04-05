"use client"

import { motion } from 'framer-motion';
import { FaCircleCheck } from 'react-icons/fa6';
import { useState } from 'react';

export default function JellyTags({ title = 'JellyTag' }) {
    const [isSelected, setIsSelected] = useState(false);
    const toggleSelect = () => setIsSelected(!isSelected);

    return (
        <motion.div
            className={`flex flex-row items-center px-4 py-2 gap-3 border rounded-full cursor-pointer `}
            onClick={toggleSelect}
            initial={{  // Add this block
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))'
            }}
            animate={{
                borderColor: isSelected ? '#6FCF97' : 'hsl(var(--border))',
                backgroundColor: isSelected ? 'hsl(var(--background))' : 'hsl(var(--background))',
                transition: { duration: 0.3 }
            }}
            whileHover={{
                scale: 1.05,
                borderColor: '#6FCF97', 
                backgroundColor: 'hsl(var(--custom-bg))', 
                transition: { duration: 0.3 }
            }}
        >
            <motion.h1
                className={`text-base font-JetBrains`}
                initial={{ color: '#6B6B6B' }} 
                animate={{
                    color: isSelected ? 'var(--green_selected)' : 'hsl(var(--primary))',
                    transition: { duration: 0.3 }
                }}
                whileHover={{
                        color: 'var(--green_selected)',
                        transition: { duration: 0.3 }
                }}
            >
                {title}
            </motion.h1>

            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                >
                    <FaCircleCheck 
                        className={`fill-green-600`} 
                    />
                </motion.div>
            )}
        </motion.div>
    );
}