import { ArrowDown } from 'lucide-react';
import "./downloadbtn.css";  

export default function DownloadBtn() {

    return (
        <div className="wrapper">
            <h1 className='font-sans text-lg tracking-wider'>Download</h1>
            <div className='downicon'>
                <ArrowDown className='arrow' strokeWidth={1.5}/>
                <ArrowDown className='arrow' strokeWidth={1.5}/>
            </div>

        </div>
    );
}