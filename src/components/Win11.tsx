import Image from "next/image";

export const Win11 = (props: any) => {
  return (
    <>
      <Image
        src="/win11.svg"
        alt="Windows 00"
        width={20}
        height={20}
        {...props}
      />
    </>
  );
};
