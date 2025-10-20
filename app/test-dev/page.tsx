import * as React from "react";

interface TestDevProps {
  name: string;
}

export default function TestDev({ name }: TestDevProps) {
  return (
    <div>
      <h1>nama sya adalah {name}</h1>
    </div>
  );
}
