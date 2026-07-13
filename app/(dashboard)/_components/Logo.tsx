import Image from 'next/image';

const Logo = () => {
    return (
        <div className={`flex justify-evenly gap-2 items-center border-b-2 pb-2 font-serif`}>
            <Image 
                src="/logo.png" 
                alt="logo" 
                width={70} 
                height={70} 
            />
            <div className='flex flex-col text-lg'>
            <div className='text-center flex  w-full'>Al<div className='italic text-primary'>mrzoq </div></div>
            <p>Academy</p>
            </div>
        </div>
    );
};

export default Logo;