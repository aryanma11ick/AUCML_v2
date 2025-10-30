"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: input,
      });

      const data = response.data;

      // If backend generated an image
      if (data.triggered && data.image_base64) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || "Here's your image!",
            image: `data:image/png;base64,${data.image_base64}`,
          },
        ]);
      } else {
        // Normal text reply
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not get reply." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] space-y-3">
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={`p-3 rounded-xl mb-1 ${
                  m.role === "user"
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.content}
              </div>

              {/* Image display */}
              {m.image && (
                <div className="flex flex-col items-center mt-2">
                  <img
                    src={m.image}
                    alt="Generated"
                    className="rounded-xl shadow-md max-w-sm"
                  />
                  <a
                    href={m.image}
                    download="generated_ad.png"
                    className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Download image
                  </a>
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
        </div>

        {/* Input area */}
        <div className="flex space-x-2">
          <input
            className="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white transition ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
