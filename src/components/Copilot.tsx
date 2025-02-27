import Image from "next/image";

export const Copilot = (props: any) => {
  return (
    <>
      <Image
        src="/Microsoft_365_Copilot_Icon.svg"
        alt="Microsoft Copilot"
        width={20}
        height={20}
        {...props}
      />
    </>
  );
};
