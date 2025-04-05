
import Link from 'next/link';
import { ArrowLeft } from 'react-feather';

export default function UIExplorationsLayout({ children }) {
  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto">
      <div className="p-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-row w-full p-4">
        {children}
      </div>
    </div>
  );
}