import Image from 'next/image';

const Logo = () => {
    return (
        <div className="flex justify-center items-center border-b-2 pb-3">
            {/* The full logo already carries the "Almrzoq Academy" wordmark,
                so the separate text label is dropped to avoid duplicating it. */}
            <Image
                src="/logo-full.png"
                alt="Almrzoq Academy"
                width={120}
                height={163}
                className="h-auto w-[120px]"
                priority
            />
        </div>
    );
};

export default Logo;