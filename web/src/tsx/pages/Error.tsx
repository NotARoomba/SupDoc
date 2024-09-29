import { Link } from "react-router-dom";
import SmartBanner from "react-smartbanner";

export default function Error() {
  return (
    <div className="flex  flex-col h-[100vh] w-screen justify-center overflow-y-hidden bg-richer_black gap-12 my-auto ">
      <SmartBanner title={"SupDoc"} daysHidden={0} daysReminder={0} />
      <p className="text-center w-full text-9xl text-ivory font-bold mb-0 font-sans">
        404
      </p>
      <Link
        to="/"
        className="text-2xl text-center justify-center font-bold mx-auto bg-midnight_green text-ivory hover:bg-midnight_green/50 hover:cursor-pointer transition-all duration-300 p-3 px-5 min-w-56 w-56 rounded-xl"
      >
        Home
      </Link>
    </div>
  );
}
