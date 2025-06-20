import React, { useState, ChangeEvent } from "react";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const REGION = (import.meta.env.VITE_AWS_REGION || "").trim();
const BUCKET_NAME = (import.meta.env.VITE_BUCKET_NAME || "").trim();
const ACCESS_KEY_ID = (import.meta.env.VITE_AWS_ACCESS_KEY_ID || "").trim();
const SECRET_ACCESS_KEY = (
  import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ""
).trim();

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
    brandUrl: "",
    faqPath: "",
    privacyPath: "",
    position: "",
    persona: "",
    config: {
      welcome: {
        logoUrl: "",
        welcomeMessage: "",
      },
      conversation: {
        disclaimerText: "",
        thinkingAnimation: "",
      },
      prompts: {
        inputPlaceholder: "",
        suggestions: [],
      },
      placement: {
        offsetX: 0,
        offsetY: 0,
        sticky: false,
      },
    },
  });

  const [url, setUrl] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    path?: string[]
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (!path) {
        return { ...prev, [name]: type === "checkbox" ? checked : value };
      } else {
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
      };

      await s3Client.send(new PutObjectCommand(input));
      setUrl(
        `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/public/${filename}`
      );

      setForm({
        brandUrl: "",
        faqPath: "",
        privacyPath: "",
        position: "",
        persona: "",
        config: {
          welcome: {
            logoUrl: "",
            welcomeMessage: "",
          },
          conversation: {
            disclaimerText: "",
            thinkingAnimation: "",
          },
          prompts: {
            inputPlaceholder: "",
            suggestions: [],
          },
          placement: {
            offsetX: 0,
            offsetY: 0,
            sticky: false,
          },
        },
      });
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
          placeholder="Enter brand URL, e.g. https://example.com"
          value={form.brandUrl}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="faqPath"
          placeholder="faqPath, ex /faq"
          value={form.faqPath}
          onChange={handleChange}
          className="block w-full border p-2 mb-2"
        />
        <input
          name="privacyPath"
          placeholder="privacyPath, ex /privacy"
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
