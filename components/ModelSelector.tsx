"use client";

import React from "react";

const availableModels = [
  { name: "GPT-4.1", value: "openai/gpt-4.1" },
  { name: "Grok-3", value: "xai/grok-3" },
  { name: "LLaMA-4 Scout", value: "meta/Llama-4-Scout-17B-16E-Instruct" },
  { name: "Phi-4 Reasoning", value: "microsoft/Phi-4" },
  { name: "Mistral Medium 2505", value: "mistral-ai/mistral-medium-2505" },
];

type Props = {
  model: string;
  setModel: (val: string) => void;
};

export default function ModelSelector({ model, setModel }: Props) {
  return (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value)}
      className="
        w-full
        bg-white/10
        text-white
        text-sm
        font-medium
        px-4
        py-2
        rounded-lg
        cursor-pointer
        appearance-none
        relative
      "
    >
      {availableModels.map((m) => (
        <option
          key={m.value}
          value={m.value}
          className="bg-[#212327] text-white"
        >
          {m.name}
        </option>
      ))}
    </select>
  );
}
