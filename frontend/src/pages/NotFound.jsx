import { Link } from "react-router-dom";

const NotFound = () => {

  return (

    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-8xl font-black text-orange-500">
        404
      </h1>

      <h2 className="text-3xl font-bold mt-5">
        Page Not Found
      </h2>

      <p className="text-slate-500 mt-3">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-8 bg-slate-950 text-white px-7 py-3 rounded-xl font-bold"
      >
        Back to Homepage
      </Link>

    </div>

  );
};

export default NotFound;