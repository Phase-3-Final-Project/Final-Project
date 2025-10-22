import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9F5EB] flex flex-col pt-32 pb-16">
      <div
        className="flex-grow flex flex-col items-center justify-center px-4"
        id="about"
      >
        <div className="flex flex-col items-center max-w-4xl mb-8 animate-in fade-in slide-in-from-top duration-1000">
          <h2 className="text-3xl font-bold text-black mb-4 hover:text-[#5C4033] transition-colors duration-300">
            About Rasantara
          </h2>
          <p className="text-gray-700 mb-4 text-center hover:text-gray-900 transition-colors duration-300">
            Rasantara is a modern digital platform that celebrates Indonesia’s
            culinary heritage through technology and design. From Sabang to
            Merauke, we bring thousands of local dishes and beverages to your
            screen — each representing the unique flavors and stories of the
            archipelago. Explore the nation’s diverse cuisine through our
            Interactive Map Explorer, where every region reveals its culinary
            treasures. Enjoy stunning visuals enhanced by AI Image Enhancement,
            and experience dishes in lifelike detail with our AI 3D Food
            Overview. More than just a food discovery app, Rasantara connects
            people, culture, and flavor — celebrating the taste of Indonesia,
            one island at a time.
          </p>
        </div>
        <div className="flex flex-col items-center max-w-4xl animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <h2 className="text-3xl font-bold text-black mb-4 hover:text-[#5C4033] transition-colors duration-300">
            The Founder
          </h2>
          <div className="flex space-x-8">
            <div className="text-center">
              <Image
                src="/haidar.jpg"
                alt="Haidar"
                width={120}
                height={210}
                className="rounded-full hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl"
              />
              <p className="mt-2 text-gray-700 font-bold hover:text-black transition-colors duration-300">
                Muhammad Haidar
              </p>
            </div>
            <div className="text-center">
              <Image
                src="/rizky.jpg"
                alt="Rizky"
                width={120}
                height={210}
                className="rounded-full hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl"
              />
              <p className="mt-2 text-gray-700 font-bold hover:text-black transition-colors duration-300">
                Muhammad Rizky
              </p>
            </div>
            <div className="text-center">
              <Image
                src="/andre.jpg"
                alt="Andre"
                width={120}
                height={210}
                className="rounded-full hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl"
              />
              <p className="mt-2 text-gray-700 font-bold hover:text-black transition-colors duration-300">
                Andre Wicaksono
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
