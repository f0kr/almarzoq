import Image from 'next/image';

const Logo = () => {
    return (
        <div className='flex justify-around items-center border-b-2 pb-2'>
            <Image 
                src="/logo.png" 
                alt="logo" 
                width={70} 
                height={70} 
            />
            <p className='text-center font-bold w-full text-shadow-xs shadow-red-800'>Almrzoq Academy</p>
        </div>
    );
};

export default Logo;