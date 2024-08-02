import { useState } from "react";

const tiers = [
  { color: "bg-red-400", letter: "S" },
  { color: "bg-orange-300", letter: "A" },
  { color: "bg-yellow-200", letter: "B" },
  { color: "bg-lime-300", letter: "C" },
  { color: "bg-blue-300", letter: "D" },
  { color: "bg-violet-500", letter: "E" },
  { color: "bg-fuchsia-400", letter: "F" },
];

const flavours = [
  "triple_berry_bubly_bounce.png",
  "citrus_cherry_bubly_bounce.png",
  "raspberry.png",
  "peach.png",
  "grapefruit.png",
  "coconut_pineapple.png",
  "lime.png",
  "blueberry_pomegranate.png",
  "passionfruit.png",
  "pineapple.png",
  "mango.png",
  "watermelon.png",
  "cherry.png",
  "just_bubly.png",
  "blackberry.png",
  "watermelon_peach_ginger.png",
  "lemon_sorbet.png",
  "orange_cream.png",
  "strawberry.png",
  "blood_orange_grapefruit_bubly_bounce.png",
  "mango_passionfruit_bubly_bounce.png",
];

function formatFlavourName(flavourKey: string): string {
  return flavourKey
    .replace(/_/g, " ")
    .replace(".png", "")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function App() {
  const [flavourIndex, setFlavourIndex] = useState(0);
  const currentFlavour = flavours[flavourIndex];

  return (
    <main className="">
      <div className="border-black border-b-8 border-r-8 max-w-lg mx-auto m-4">
        {tiers.map((item, index) => (
          <div key={index} className="flex bg-black">
            <div
              className={`text-black ${item.color} py-6 px-8 mx-2 mt-2 font-extrabold`}
            >
              {item.letter}
            </div>
            <div className="bg-gray-800 flex-1 border-black border-t-8 border-l-0"></div>
          </div>
        ))}
      </div>
      <div className="mx-auto w-48 flex">
        <img
          className="flex-1 rounded-xl h-auto shadow-lg mb-16"
          src={`/bubbly/${currentFlavour}`}
          alt="flavour"
        />
        <div className="flex flex-col bg-black mb-auto p-2 m-2 space-y-2">
          {tiers.map((item) => (
            <div
              className={`text-black ${item.color} py-2 px-4 text-sm font-extrabold`}
            >
              {item.letter}
            </div>
          ))}
        </div>
        <div className="bg-black text-white text-center p-2 m-2">
          {formatFlavourName(currentFlavour)}
        </div>
      </div>
    </main>
  );
}

export default App;
