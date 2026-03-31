export default function Footer() {
  const version = require("../package.json").version;
  const buildId = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

  return (
    <footer className="bg-[#0a0a0c] border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center space-y-2">
        <p className="text-xs text-gray-500 italic max-w-xl mx-auto">
          This project is an independent initiative and has no official connection with Universiti Teknologi MARA (UiTM) or its affiliates. For official information, please visit
          {" "} <a href="https://www.uitm.edu.my" target="_blank" rel="noopener noreferrer" className="text-gray-400 underline hover:text-purple-400 transition">https://www.uitm.edu.my
          </a>.
        </p>
        <p className="text-sm text-gray-400">
          <a className="text-gray-300 hover:text-purple-400 transition" href="https://github.com/LewdHuTao">LewdHuTao</a>
          {" "}© {new Date().getFullYear()}{" "}
          <a className="text-gray-300 hover:text-purple-400 transition" href="https://github.com/LewdHuTao/UiTMView" target="_blank" rel="noopener noreferrer">
            UiTMView
          </a>
        </p>
        <p className="text-xs text-gray-600">Diploma Computer Science (CS110) - UiTM Kedah</p>
        <p className="text-xs text-gray-600">v{version} ({buildId})</p>
      </div>
    </footer>
  );
}
