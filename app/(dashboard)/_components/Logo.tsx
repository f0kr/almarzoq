import Image from 'next/image';

const Logo = () => {
    return (
        <Image 
            src="/logo.png" 
            alt="logo" 
            width={70} 
            height={70} 
        />
    );
};

export default Logo;