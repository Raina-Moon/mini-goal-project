"use client";

import TanstackQueryProvider from "@/providers/TanstackQueryProvider";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {

  return <TanstackQueryProvider>{children}</TanstackQueryProvider>;
};
export default Providers;
