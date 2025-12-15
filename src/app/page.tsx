export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorative Blob - Adds depth */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-karak-sage/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-karak-orange/15 rounded-full blur-[80px] -z-10" />

      {/* Hero Content */}
      <div className="text-center space-y-6 max-w-2xl">
        <span className="inline-block py-1 px-3 border border-karak-black/20 rounded-full text-sm font-sans tracking-wide uppercase">
          Nairobi's Aesthetic Sip
        </span>
        
        <h1 className="font-serif text-6xl md:text-8xl text-karak-black leading-tight">
          Karak <span className="text-karak-orange">&</span> Go
        </h1>
        
        <p className="font-sans text-xl text-karak-black/70 max-w-lg mx-auto">
          More than just tea. It’s an emotional support beverage designed for your feed.
        </p>

        {/* Premium Button Component */}
        <button className="mt-8 px-8 py-4 bg-karak-black text-karak-cream rounded-full font-sans font-medium text-lg hover:bg-karak-orange transition-colors duration-300 shadow-lg hover:shadow-karak-orange/25">
          Order Now
        </button>
      </div>
    </main>
  );
}