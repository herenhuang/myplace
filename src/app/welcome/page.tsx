import Image from 'next/image';

export default function Welcome() {
  return (
    <div className='min-h-screen bg-gradient-to-t to-[#1a1919] from-[#06060e] text-white flex flex-col'>
      {/* Background grid pattern */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>
      
      {/* Logo in top-left corner */}
      <div className='absolute top-6 left-6 z-10'>
        <a href="/" className="block hover:scale-105 transition-transform duration-200">
          <Image 
            src='/MyplaceWhite.png' 
            alt='MyPlace Logo' 
            width={500}
            height={300}
            className='w-40 h-auto object-contain'
          />
        </a>
      </div>

      {/* Main content */}
      <div className='flex-1 container mx-auto relative z-10 px-4 md:px-6 lg:px-8 pt-48 pb-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-white text-2xl md:text-4xl font-medium leading-relaxed space-y-12'>
            <p>We were built for 🎲 play. It's how kids learn, how friends bond, how we reveal ourselves without even trying.</p>
            
            <p>Somewhere along the way, many of us were told to grow up: fill out forms, take tests, polish résumés 📝.</p>
            <p>But that doesn't capture who we are. Interviews, personality tests, even social media reflect what we say, not how we act. None of them hold the living record of how we actually show up: in the small choices, under real pressure, over ⏳ time.</p>
            
            <p>Now that AI can mimic our words and even fake our work, the one thing it can't copy is our judgment, our character, the way we move through the world. That's ours 🧩 to keep. And it's worth sharing with each other, and with the tools we rely on.</p>
            <p>A living record of our human edge.</p>
            
            <p>If any of that resonates, there's a place for you here.</p>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className='relative z-10 text-center border-t border-gray-700 pt-12 pb-12 mt-24'>
        <div className='container mx-auto px-4 md:px-6 lg:px-8'>
          <p className='text-white text-base mb-8'>
            <a href="https://tally.so/r/mR91yP" target="_blank" rel="noopener noreferrer" className="hover:underline">
              contact here
            </a>
          </p>
          <div className='mt-12 mb-8'>
            <a href="/" className="block hover:scale-105 transition-transform duration-200">
              <Image 
                src='/MyplaceWhite.png' 
                alt='MyPlace Logo' 
                width={500}
                height={300}
                className='mx-auto w-40 h-auto object-contain'
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}