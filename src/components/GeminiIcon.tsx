import Image from "next/image";
export const GeminiIcon = (props: any) => {
  return (
    <Image
      src="/gemini.svg"
      alt="Gemini"
      width={40}
      height={40}
      {...props}
    ></Image>
  );
};
