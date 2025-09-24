import { useState } from 'react'; 
import { motion} from "motion/react";
import { BiDollarCircle } from "react-icons/bi";


export default function Upgrade() { 

    const [isSelected, setIsSelected] = useState(false);
    const toggleSelect = () => setIsSelected(!isSelected);

    return (
        <motion.div
        className='inline-flex flex-row items-center gap-4 cursor-pointer px-3 py-3 upgrade-click'
        onClick={toggleSelect}
        >
            <BiDollarCircle
            size={24}
            color='#16a34a'
            />

            <h1 className='font-light text-slate-500 transition ease-in'>
                    {isSelected ? 'Upgrade to pro and save $12' : '2 days left in your trial'}
            </h1>

            <div className='px-2  bg-green-600 rounded-md'>
                <h1 className='text-slate-100'>{isSelected ? 'See Pro' : 'Billing'}</h1>
            </div>

        </motion.div>
    )
}

