import React from "react";
import { useTailwindReady } from "../../../tailwind-cdn";
import Dashboard from "./Dashboard";

function CssLoading(): JSX.Element {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      Carregando estilos...
    </div>
  );
}

export default function AppBoot(): JSX.Element {
  const twReady = useTailwindReady();

  if (!twReady) {
    return <CssLoading />;
  }

  return <Dashboard />;
}