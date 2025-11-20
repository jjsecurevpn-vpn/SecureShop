import { CHECKOUT_SECTIONS } from "../constants";

export const HeaderSection = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2">
        {CHECKOUT_SECTIONS.PERSONAL_INFO}
      </h1>
      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
        {CHECKOUT_SECTIONS.PERSONAL_INFO_DESC}
      </p>
    </div>
  );
};