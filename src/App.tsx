import React, { useState, ChangeEvent } from "react";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const REGION = import.meta.env.VITE_AWS_REGION;
const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME;
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

type Suggestion = {
  label: string;
  iconUrl: string;
  color: string;
};

type FormData = {
  brandUrl: string;
  faqPath: string;
  privacyPath: string;
  position: string;
  persona: string;
  config: {
    welcome: {
      logoUrl: string;
      welcomeMessage: string;
    };
    conversation: {
      disclaimerText: string;
      thinkingAnimation: string;
    };
    prompts: {
      inputPlaceholder: string;
      suggestions: Suggestion[];
    };
    placement: {
      offsetX: number | string;
      offsetY: number | string;
      sticky: boolean;
    };
  };
};

export default function App() {
  const [form, setForm] = useState<FormData>({
    brandUrl: "https://www.mckissock.com",
    faqPath: "faq",
    privacyPath: "privacy-policy",
    position: "bottom-right",
    persona: "purchase_advisor",
    config: {
      welcome: {
        logoUrl:
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
        welcomeMessage: "Hello! How can I assist you today?",
      },
      conversation: {
        disclaimerText:
          "Rubi is an AI and may not always be 100% accurate. View full disclaimer or contact Academic Support.",
        thinkingAnimation: "pulse",
      },
      prompts: {
        inputPlaceholder: "Type your question here...",
        suggestions: [
          {
            label: "Licensing Info",
            iconUrl: "https://cdn-icons-png.flaticon.com/512/4201/4201987.png",
            color: "#3b82f6",
          },
          {
            label: "Payment Options",
            iconUrl: "https://cdn-icons-png.flaticon.com/512/484/484662.png",
            color: "#10b981",
          },
          {
            label: "Technical Support",
            iconUrl: "https://cdn-icons-png.flaticon.com/512/633/633759.png",
            color: "#f97316",
          },
        ],
      },
      placement: {
        offsetX: 30,
        offsetY: 40,
        sticky: true,
      },
    },
  });

  const [url, setUrl] = useState<string>("");

  // Atualizar campos gerais e aninhados
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    path?: string[]
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (!path) {
        // Campo raiz
        return { ...prev, [name]: type === "checkbox" ? checked : value };
      } else {
        // Atualizar objeto aninhado
        const updated = { ...prev };
        let obj: any = updated;
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }
        const lastKey = path[path.length - 1];
        obj[lastKey] = type === "checkbox" ? checked : value;
        return updated;
      }
    });
  };

  // Atualizar campos das sugestões
  const handleSuggestionChange = (
    index: number,
    field: keyof Suggestion,
    value: string
  ) => {
    setForm((prev) => {
      const newSuggestions = [...prev.config.prompts.suggestions];
      newSuggestions[index] = { ...newSuggestions[index], [field]: value };
      return {
        ...prev,
        config: {
          ...prev.config,
          prompts: {
            ...prev.config.prompts,
            suggestions: newSuggestions,
          },
        },
      };
    });
  };

  const upload = async () => {
    try {
      const filename = `branding-${Date.now()}.json`;
      const body = JSON.stringify(form);

      const input: PutObjectCommandInput = {
        Bucket: BUCKET_NAME,
        Key: `public/${filename}`,
        Body: body,
        ContentType: "application/json",
        ACL: "public-read",
      };

      await s3Client.send(new PutObjectCommand(input));
      setUrl(
        `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/public/${filename}`
      );
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed, check console");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Branding Configurator</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">General</h2>
        <input
          name="brandUrl"
          placeholder="brandUrl"
          value={form.brandUrl}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="faqPath"
          placeholder="faqPath"
          value={form.faqPath}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="privacyPath"
          placeholder="privacyPath"
          value={form.privacyPath}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="position"
          placeholder="position"
          value={form.position}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="persona"
          placeholder="persona"
          value={form.persona}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Welcome</h2>
        <input
          name="logoUrl"
          placeholder="logoUrl"
          value={form.config.welcome.logoUrl}
          onChange={(e) => handleChange(e, ["config", "welcome", "logoUrl"])}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="welcomeMessage"
          placeholder="welcomeMessage"
          value={form.config.welcome.welcomeMessage}
          onChange={(e) =>
            handleChange(e, ["config", "welcome", "welcomeMessage"])
          }
          className="block w-full border p-2 mb-2"
        />
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Conversation</h2>
        <input
          name="disclaimerText"
          placeholder="disclaimerText"
          value={form.config.conversation.disclaimerText}
          onChange={(e) =>
            handleChange(e, ["config", "conversation", "disclaimerText"])
          }
          className="block w-full border p-2 mb-2"
        />
        <input
          name="thinkingAnimation"
          placeholder="thinkingAnimation"
          value={form.config.conversation.thinkingAnimation}
          onChange={(e) =>
            handleChange(e, ["config", "conversation", "thinkingAnimation"])
          }
          className="block w-full border p-2 mb-2"
        />
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Prompts</h2>
        <input
          name="inputPlaceholder"
          placeholder="inputPlaceholder"
          value={form.config.prompts.inputPlaceholder}
          onChange={(e) =>
            handleChange(e, ["config", "prompts", "inputPlaceholder"])
          }
          className="block w-full border p-2 mb-2"
        />
        {form.config.prompts.suggestions.map((s, i) => (
          <div key={i} className="mb-4 border p-4 rounded">
            <input
              name="label"
              placeholder="Label"
              value={s.label}
              onChange={(e) =>
                handleSuggestionChange(i, "label", e.target.value)
              }
              className="block w-full border p-2 mb-2"
            />
            <input
              name="iconUrl"
              placeholder="Icon URL"
              value={s.iconUrl}
              onChange={(e) =>
                handleSuggestionChange(i, "iconUrl", e.target.value)
              }
              className="block w-full border p-2 mb-2"
            />
            <input
              name="color"
              placeholder="Color"
              value={s.color}
              onChange={(e) =>
                handleSuggestionChange(i, "color", e.target.value)
              }
              type="color"
              className="w-12 h-8 p-0 border mb-2"
            />
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Placement</h2>
        <input
          name="offsetX"
          placeholder="offsetX"
          value={form.config.placement.offsetX}
          onChange={(e) => handleChange(e, ["config", "placement", "offsetX"])}
          type="number"
          className="block w-full border p-2 mb-2"
        />
        <input
          name="offsetY"
          placeholder="offsetY"
          value={form.config.placement.offsetY}
          onChange={(e) => handleChange(e, ["config", "placement", "offsetY"])}
          type="number"
          className="block w-full border p-2 mb-2"
        />
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.config.placement.sticky}
            onChange={(e) =>
              handleChange(e as any, ["config", "placement", "sticky"])
            }
          />
          Sticky
        </label>
      </section>

      <button
        onClick={upload}
        className="bg-blue-600 text-white px-6 py-2 rounded mb-6"
      >
        Upload JSON
      </button>

      {url && (
        <div className="break-words bg-gray-100 p-4 rounded">
          <strong>JSON URL:</strong>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {url}
          </a>
        </div>
      )}
    </div>
  );
}
