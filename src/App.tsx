function App() {
  return (
    <main className="">
      <div className="border-black border-b-8 border-r-8 max-w-lg mx-auto m-4">
        {[
          { color: "bg-red-400", letter: "S" },
          { color: "bg-orange-300", letter: "A" },
          { color: "bg-yellow-200", letter: "B" },
          { color: "bg-lime-300", letter: "C" },
          { color: "bg-blue-300", letter: "D" },
          { color: "bg-violet-500", letter: "E" },
          { color: "bg-fuchsia-400", letter: "F" },
        ].map((item, index) => (
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
    </main>
  );
}

export default App;
