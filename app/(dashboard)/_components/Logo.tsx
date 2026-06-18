import Image from 'next/image';
import localFont from 'next/font/local'

const snellFont = localFont({
  src: [
    {
      path: '../../../public/fonts/snellroundhand_black.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/snellroundhand_bold.otf',
      weight: '700',
      style: 'bold',
    },
  ],
})

const Logo = () => {
    return (
        <div className={`flex justify-evenly gap-2 items-center border-b-2 pb-2 ${snellFont.className}`}>
            <Image 
                src="/logo.png" 
                alt="logo" 
                width={70} 
                height={70} 
            />
            <div className='flex flex-col text-lg'>
            <div className='text-center flex  w-full'>Al<div className='text-yellow-500'>mrzoq </div></div>
            <p>Academy</p>
            </div>
        </div>
    );
};

export default Logo;