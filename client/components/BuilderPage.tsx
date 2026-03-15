import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BuilderComponent, builder } from "@builder.io/react";

// Import builder config (registers components + API key)
import "@/builder-config";

interface BuilderPageProps {
  model?: string;
}

export default function BuilderPage({ model = "page" }: BuilderPageProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    builder
      .get(model, { url: location.pathname })
      .promise()
      .then((data) => {
        if (data) {
          setContent(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [location.pathname, model]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (notFound) {
    return null; // ไม่มี content จาก Builder.io → ไม่แสดงอะไร
  }

  return <BuilderComponent model={model} content={content} />;
}
